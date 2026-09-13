const fs = require('fs');
const https = require('https');
const d3 = require('d3-geo');

const GEOJSON_URL = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-avec-outre-mer.geojson';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching GeoJSON...');
  const geojson = await fetchJson(GEOJSON_URL);

  const WIDTH = 800;
  const HEIGHT = 800;

  // Separate Metropole and DROM
  const dromCodes = ['971', '972', '973', '974', '976'];
  const metropoleFeatures = geojson.features.filter(f => !dromCodes.includes(f.properties.code));
  const dromFeatures = geojson.features.filter(f => dromCodes.includes(f.properties.code));

  // Metropole projection
  // Canvas width 800, height 800.
  // Reserve top-left and bottom-left for UI & insets.
  // Metropole occupies x: [140, 780], y: [30, 740]
  const metropoleCollection = { type: 'FeatureCollection', features: metropoleFeatures };
  
  const metroProjection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .parallels([44, 49])
    .fitExtent([[160, 40], [780, 750]], metropoleCollection);

  const metroPathGen = d3.geoPath().projection(metroProjection);

  const results = [];

  for (const feature of metropoleFeatures) {
    const d = metroPathGen(feature);
    const centroid = metroPathGen.centroid(feature);
    const bounds = metroPathGen.bounds(feature);

    results.push({
      code: feature.properties.code,
      nom: feature.properties.nom,
      path: d,
      centroid: [Math.round(centroid[0] * 10) / 10, Math.round(centroid[1] * 10) / 10],
      bounds: [
        [Math.round(bounds[0][0] * 10) / 10, Math.round(bounds[0][1] * 10) / 10],
        [Math.round(bounds[1][0] * 10) / 10, Math.round(bounds[1][1] * 10) / 10]
      ],
      isDrom: false
    });
  }

  // DROM Insets configurations
  // We place 5 neat inset cards on the left panel (x: 20 to 140)
  const insetsConfig = {
    '971': { label: 'Guadeloupe', x: 25, y: 350, w: 55, h: 55 },
    '972': { label: 'Martinique', x: 90, y: 350, w: 50, h: 55 },
    '973': { label: 'Guyane', x: 25, y: 440, w: 85, h: 85 },
    '974': { label: 'La Réunion', x: 25, y: 555, w: 55, h: 55 },
    '976': { label: 'Mayotte', x: 90, y: 555, w: 50, h: 55 },
  };

  for (const feature of dromFeatures) {
    const code = feature.properties.code;
    const cfg = insetsConfig[code];
    if (!cfg) continue;

    const pad = 4;
    const dromProj = d3.geoMercator()
      .fitExtent([[cfg.x + pad, cfg.y + pad], [cfg.x + cfg.w - pad, cfg.y + cfg.h - pad]], feature);
    
    const dromPathGen = d3.geoPath().projection(dromProj);
    const d = dromPathGen(feature);
    const centroid = dromPathGen.centroid(feature);
    const bounds = dromPathGen.bounds(feature);

    results.push({
      code,
      nom: feature.properties.nom,
      path: d,
      centroid: [Math.round(centroid[0] * 10) / 10, Math.round(centroid[1] * 10) / 10],
      bounds: [
        [Math.round(bounds[0][0] * 10) / 10, Math.round(bounds[0][1] * 10) / 10],
        [Math.round(bounds[1][0] * 10) / 10, Math.round(bounds[1][1] * 10) / 10]
      ],
      isDrom: true,
      insetBox: { x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h, label: cfg.label }
    });
  }

  // Sort by code
  results.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  console.log(`Generated paths for ${results.length} departments.`);

  const fileContent = `// Auto-generated SVG paths & centroids for French departments (800x800 viewBox)
export interface DepartmentMapPath {
  code: string;
  nom: string;
  path: string;
  centroid: [number, number];
  bounds: [[number, number], [number, number]];
  isDrom: boolean;
  insetBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
  };
}

export const FRANCE_MAP_WIDTH = 800;
export const FRANCE_MAP_HEIGHT = 800;

export const DEPARTMENT_MAP_PATHS: DepartmentMapPath[] = ${JSON.stringify(results, null, 2)};
`;

  fs.writeFileSync('src/data/franceMapPaths.ts', fileContent);
  console.log('Saved to src/data/franceMapPaths.ts');
}

run().catch(console.error);

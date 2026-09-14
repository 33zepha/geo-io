import { DEPARTMENTS_LIST, DEPARTMENTS } from '../data/departments';
import { REGIONS } from '../data/regions';
import { DEPARTMENT_MAP_PATHS, DepartmentMapPath } from '../data/franceMapPaths';
import { getDeptGrammar, getRegionGrammar } from '../data/departmentGrammar';
import { CULT_QUESTIONS } from '../data/cultQuestions';
import { 
  GameDifficulty, 
  MapClickTarget, 
  QcmQuestion, 
  EnqueteTerritoire,
  EnqueteClue,
} from '../types/game';
import { Department } from '../types/geo';

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

// Prominent, well-known departments for beginner tier
const BEGINNER_DEPT_CODES = [
  '75', '13', '69', '33', '31', '44', '59', '06', '67', '29',
  '35', '34', '74', '83', '2A', '2B', '92', '93', '94', '77',
  '78', '91', '95', '38', '42', '63', '21', '14', '76', '57',
];

// -------------------------------------------------------------
// 1. GENERATEUR: MODE POINTAGE SUR CARTE (CLIC CARTE)
// -------------------------------------------------------------
export function generateMapClickTargets(
  difficulty: GameDifficulty = 'intermediaire',
  count: number = 10,
  regionCode?: string
): MapClickTarget[] {
  const takePadded = <T,>(pool: T[], n: number): T[] => {
    if (pool.length === 0) return [];
    const out: T[] = [];
    let i = 0;
    const shuffled = shuffle(pool);
    while (out.length < n) {
      out.push(shuffled[i % shuffled.length]);
      i += 1;
      if (i >= shuffled.length * 3) break; // safety
    }
    return out;
  };

  const basePool = regionCode && REGIONS[regionCode]
    ? DEPARTMENTS_LIST.filter((d) => d.regionCode === regionCode)
    : DEPARTMENTS_LIST;

  if (regionCode && REGIONS[regionCode]) {
    return takePadded(basePool, count).map((d, idx) => {
      const g = getDeptGrammar(d.code);
      return {
        id: `click-reg-${d.code}-${idx}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: `Localise ${g.withArticle}`,
        subPrompt: `Préfecture : ${d.prefecture}`,
        hint: `${d.regionName} • n°${d.code}`,
      };
    });
  }

  if (difficulty === 'debutant') {
    const codes = takePadded(BEGINNER_DEPT_CODES, count);
    return codes.map((code, idx) => {
      const d = DEPARTMENTS[code];
      const g = getDeptGrammar(code);
      return {
        id: `click-beg-${code}-${idx}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: `Localise ${g.withArticle}`,
        subPrompt: `Chef-lieu : ${d.prefecture}`,
        hint: d.regionName,
      };
    }).filter(Boolean);
  }

  if (difficulty === 'expert') {
    const expertLandmarks = [
      { prompt: 'Où se trouve le mont Saint-Michel ?', targetCode: '50', hint: 'Manche (50)' },
      { prompt: 'Où se dresse la dune du Pilat ?', targetCode: '33', hint: 'Gironde (33)' },
      { prompt: 'Où se situe la préfecture de Saint-Lô ?', targetCode: '50', hint: 'Manche (50)' },
      { prompt: 'Où se trouve la préfecture de Quimper ?', targetCode: '29', hint: 'Finistère (29)' },
      { prompt: 'Où se situe la préfecture de Vannes ?', targetCode: '56', hint: 'Morbihan (56)' },
      { prompt: 'Où se situe la préfecture de Châlons-en-Champagne ?', targetCode: '51', hint: 'Marne (51)' },
      { prompt: 'Où se trouve la préfecture de Laon ?', targetCode: '02', hint: 'Aisne (02)' },
      { prompt: 'Où se situe la préfecture de Moulins ?', targetCode: '03', hint: 'Allier (03)' },
      { prompt: 'Où se situe le volcan du Puy de Sancy ?', targetCode: '63', hint: 'Puy-de-Dôme (63)' },
      { prompt: 'Où se trouvent les gorges du Verdon ?', targetCode: '04', hint: 'Alpes-de-Haute-Provence (04)' },
      { prompt: 'Où se situe le château de Chambord ?', targetCode: '41', hint: 'Loir-et-Cher (41)' },
      { prompt: 'Où la Loire prend-elle sa source ?', targetCode: '07', hint: 'Ardèche (07)' },
      { prompt: 'Où se trouve le Territoire de Belfort ?', targetCode: '90', hint: 'Code 90' },
      { prompt: 'Où se situe le gouffre de Padirac ?', targetCode: '46', hint: 'Lot (46)' },
      { prompt: 'Où se situe la pointe du Raz ?', targetCode: '29', hint: 'Finistère (29)' },
      { prompt: 'Où se dresse le Mont-Blanc ?', targetCode: '74', hint: 'Haute-Savoie (74)' },
      { prompt: 'Où se trouve la préfecture de Mont-de-Marsan ?', targetCode: '40', hint: 'Landes (40)' },
      { prompt: 'Où se situe la préfecture de Tulle ?', targetCode: '19', hint: 'Corrèze (19)' },
      { prompt: 'Où se trouve la cité de Carcassonne ?', targetCode: '11', hint: 'Aude (11)' },
      { prompt: 'Où se situe le massif du Pilat ?', targetCode: '42', hint: 'Loire (42)' },
      { prompt: 'Où se trouve le cap Gris-Nez ?', targetCode: '62', hint: 'Pas-de-Calais (62)' },
      { prompt: 'Où se situe la baie de Somme ?', targetCode: '80', hint: 'Somme (80)' },
      { prompt: 'Où se trouve le Cirque de Gavarnie ?', targetCode: '65', hint: 'Hautes-Pyrénées (65)' },
      { prompt: 'Où se situe le plateau des Glières ?', targetCode: '74', hint: 'Haute-Savoie (74)' },
      { prompt: 'Où se trouve la préfecture de Digne-les-Bains ?', targetCode: '04', hint: 'Alpes-de-Haute-Provence (04)' },
      { prompt: 'Où se situe la préfecture de Gap ?', targetCode: '05', hint: 'Hautes-Alpes (05)' },
      { prompt: 'Où se trouve le viaduc de Millau ?', targetCode: '12', hint: 'Aveyron (12)' },
      { prompt: 'Où se situe la Camargue « sauvage » ?', targetCode: '13', hint: 'Bouches-du-Rhône (13)' },
      { prompt: 'Où se trouve le bassin minier classé UNESCO ?', targetCode: '62', hint: 'Pas-de-Calais (62)' },
      { prompt: 'Où se situe le Marais poitevin ?', targetCode: '85', hint: 'Vendée (85)' },
    ];
    return takePadded(expertLandmarks, count).map((item, idx) => {
      const d = DEPARTMENTS[item.targetCode];
      return {
        id: `click-exp-${item.targetCode}-${idx}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: item.prompt,
        subPrompt: 'Clique le bon département (pas de timer de grâce)',
        hint: item.hint,
      };
    });
  }

  // Intermédiaire: localization without code in the prompt
  return takePadded(basePool, count).map((d, idx) => {
    const g = getDeptGrammar(d.code);
    return {
      id: `click-mid-${d.code}-${idx}`,
      code: d.code,
      name: d.name,
      prefecture: d.prefecture,
      regionName: d.regionName,
      prompt: `Localise ${g.withArticle}`,
      subPrompt: `Région ${d.regionName}`,
      hint: `Préfecture : ${d.prefecture} (${d.code})`,
    };
  });
}

export function generateQcmQuestions(
  difficulty: GameDifficulty = 'intermediaire',
  count: number = 10,
  regionCode?: string
): QcmQuestion[] {
  const questions: QcmQuestion[] = [];

  // If no specific region is requested and in Expert mode, use cult questions bank
  if (!regionCode && difficulty === 'expert') {
    const expertCult = shuffle(CULT_QUESTIONS.filter((q) => q.difficulty === 'expert' || q.difficulty === 'intermediaire'));
    for (const cq of expertCult.slice(0, count)) {
      questions.push({
        id: cq.id,
        title: cq.title,
        options: cq.options,
        correctIndex: cq.correctIndex,
        explanation: cq.explanation,
        targetCode: cq.targetCode,
        relatedCodes: [cq.targetCode],
      });
    }

    if (questions.length >= count) {
      return questions.slice(0, count);
    }
  }

  const remainingNeeded = count - questions.length;
  const basePool = regionCode && REGIONS[regionCode]
    ? DEPARTMENTS_LIST.filter((d) => d.regionCode === regionCode)
    : difficulty === 'debutant'
      ? shuffle(BEGINNER_DEPT_CODES).map((c) => DEPARTMENTS[c]).filter(Boolean)
      : DEPARTMENTS_LIST;

  const deptPool = shuffle(basePool);

  for (let i = 0; i < remainingNeeded && i < deptPool.length; i++) {
    const target = deptPool[i];
    const g = getDeptGrammar(target.code);
    const questionType = Math.floor(Math.random() * 4);

    if (questionType === 0) {
      // "Quelle est la préfecture du/de la X ?"
      const sameRegionDepts = DEPARTMENTS_LIST.filter(
        (d) => d.regionCode === target.regionCode && d.code !== target.code
      );
      const otherRegionDepts = DEPARTMENTS_LIST.filter(
        (d) => d.regionCode !== target.regionCode
      );

      const distractorTowns: string[] = [];
      for (const d of shuffle(sameRegionDepts)) {
        if (!distractorTowns.includes(d.prefecture) && d.prefecture !== target.prefecture) {
          distractorTowns.push(d.prefecture);
        }
        if (distractorTowns.length >= 3) break;
      }
      if (distractorTowns.length < 3) {
        for (const d of shuffle(otherRegionDepts)) {
          if (!distractorTowns.includes(d.prefecture) && d.prefecture !== target.prefecture) {
            distractorTowns.push(d.prefecture);
          }
          if (distractorTowns.length >= 3) break;
        }
      }

      const options = shuffle([target.prefecture, ...distractorTowns.slice(0, 3)]);
      questions.push({
        id: `qcm-pref-${target.code}-${i}`,
        title: `Quelle est la préfecture ${g.de} ?`,
        options,
        correctIndex: options.indexOf(target.prefecture),
        explanation: `${target.prefecture} est la préfecture ${g.de} (${target.code}), située ${getRegionGrammar(target.regionName).dans}.`,
        targetCode: target.code,
        relatedCodes: [target.code],
      });
    } else if (questionType === 1) {
      // "Dans quel département se situe la ville de X ?"
      const sameRegionDepts = DEPARTMENTS_LIST.filter((d) => d.code !== target.code && d.regionCode === target.regionCode);
      const otherDepts = DEPARTMENTS_LIST.filter((d) => d.code !== target.code && d.regionCode !== target.regionCode);

      const distractorDepts: string[] = [];
      for (const d of shuffle(sameRegionDepts)) {
        const dg = getDeptGrammar(d.code);
        distractorDepts.push(dg.withArticle);
        if (distractorDepts.length >= 3) break;
      }
      if (distractorDepts.length < 3) {
        for (const d of shuffle(otherDepts)) {
          const dg = getDeptGrammar(d.code);
          distractorDepts.push(dg.withArticle);
          if (distractorDepts.length >= 3) break;
        }
      }

      const options = shuffle([g.withArticle, ...distractorDepts.slice(0, 3)]);
      questions.push({
        id: `qcm-city-dept-${target.code}-${i}`,
        title: `Dans quel département se situe la ville de ${target.prefecture} ?`,
        options,
        correctIndex: options.indexOf(g.withArticle),
        explanation: `${target.prefecture} est la préfecture ${g.de} (${target.code}).`,
        targetCode: target.code,
        relatedCodes: [target.code],
      });
    } else if (questionType === 2) {
      // "Dans quelle région se trouve X ?"
      const correctReg = REGIONS[target.regionCode];
      const otherRegs = shuffle(Object.values(REGIONS).filter((r) => r.code !== target.regionCode)).slice(0, 3);
      const options = shuffle([correctReg.name, otherRegs[0].name, otherRegs[1].name, otherRegs[2].name]);

      questions.push({
        id: `qcm-reg-${target.code}-${i}`,
        title: `Dans quelle région se trouve ${g.withArticle} ?`,
        options,
        correctIndex: options.indexOf(correctReg.name),
        explanation: `${g.withArticle} (${target.code}, chef-lieu : ${target.prefecture}) est rattaché à ${getRegionGrammar(correctReg.name).withArticle}.`,
        targetCode: target.code,
        relatedCodes: correctReg.departments,
      });
    } else {
      // Spécialité / fait marquant
      const specs = (target.specialties || []).filter(Boolean);
      const correct = specs[0] || target.academicFact?.slice(0, 42) || target.prefecture;
      const otherSpecs: string[] = [];
      for (const d of shuffle(DEPARTMENTS_LIST)) {
        if (d.code === target.code) continue;
        for (const s of d.specialties || []) {
          if (s !== correct && !otherSpecs.includes(s)) otherSpecs.push(s);
          if (otherSpecs.length >= 3) break;
        }
        if (otherSpecs.length >= 3) break;
      }
      while (otherSpecs.length < 3) otherSpecs.push(`Repère ${otherSpecs.length + 1}`);
      const options = shuffle([correct, ...otherSpecs.slice(0, 3)]);
      questions.push({
        id: `qcm-spec-${target.code}-${i}`,
        title: `Quelle spécialité / signature est associée à ${getDeptGrammar(target.code).withArticle} ?`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `${getDeptGrammar(target.code).withArticle} (${target.code}) : ${specs.slice(0, 2).join(', ') || target.academicFact}`,
        targetCode: target.code,
        relatedCodes: [target.code],
      });
    }
  }

  return shuffle(questions).slice(0, count);
}

// -------------------------------------------------------------
// 3. GENERATEUR: SESSION DE RATTRAPAGE (POINTS FAIBLES)
// -------------------------------------------------------------
export function generateWeakPointsTargets(weakDeptCodes: string[], count: number = 10): MapClickTarget[] {
  const codes = weakDeptCodes.length > 0 ? weakDeptCodes : ['29', '33', '50', '63', '13'];
  const pool = shuffle(codes).slice(0, count);

  return pool.map((code) => {
    const d = DEPARTMENTS[code] || DEPARTMENTS['33'];
    const g = getDeptGrammar(d.code);
    return {
      id: `weak-click-${d.code}-${Math.random()}`,
      code: d.code,
      name: d.name,
      prefecture: d.prefecture,
      regionName: d.regionName,
      prompt: `Rattrapage : Localise ${g.withArticle} (${d.code})`,
      subPrompt: `Chef-lieu : ${d.prefecture} • ${d.regionName}`,
    };
  });
}

// -------------------------------------------------------------
// 4. GENERATEUR: MODE DÉFI SILHOUETTE ISOLÉE
// -------------------------------------------------------------
export interface SilhouetteRound {
  targetPath: DepartmentMapPath;
  targetDept: Department;
  options: Department[];
  correctIndex: number;
}

export function generateSilhouetteRounds(
  count: number = 10,
  regionCode?: string,
  difficulty: GameDifficulty = 'intermediaire'
): SilhouetteRound[] {
  const validPaths = regionCode && REGIONS[regionCode]
    ? DEPARTMENT_MAP_PATHS.filter((p) => REGIONS[regionCode].departments.includes(p.code))
    : DEPARTMENT_MAP_PATHS;

  const takePadded = <T,>(pool: T[], n: number): T[] => {
    if (pool.length === 0) return [];
    const out: T[] = [];
    const shuffled = shuffle(pool);
    let i = 0;
    while (out.length < n) {
      out.push(shuffled[i % shuffled.length]);
      i += 1;
      if (i > shuffled.length * 4) break;
    }
    return out;
  };

  const pool = takePadded(validPaths, count);
  const rounds: SilhouetteRound[] = [];

  for (const targetPath of pool) {
    const targetDept = DEPARTMENTS[targetPath.code];
    if (!targetDept) continue;

    const sameRegionPaths = DEPARTMENT_MAP_PATHS.filter(
      (p) => p.code !== targetPath.code && DEPARTMENTS[p.code]?.regionCode === targetDept.regionCode
    );
    const otherPaths = DEPARTMENT_MAP_PATHS.filter(
      (p) => p.code !== targetPath.code && DEPARTMENTS[p.code]?.regionCode !== targetDept.regionCode
    );

    const distractorDepts: Department[] = [];
    const sameFirst = difficulty === 'expert' ? 3 : difficulty === 'debutant' ? 1 : 2;
    for (const p of shuffle(sameRegionPaths)) {
      if (DEPARTMENTS[p.code]) distractorDepts.push(DEPARTMENTS[p.code]);
      if (distractorDepts.length >= sameFirst) break;
    }
    for (const p of shuffle(otherPaths)) {
      if (DEPARTMENTS[p.code] && !distractorDepts.some((d) => d.code === p.code)) {
        distractorDepts.push(DEPARTMENTS[p.code]);
      }
      if (distractorDepts.length >= 3) break;
    }

    const options = shuffle([targetDept, ...distractorDepts.slice(0, 3)]);
    rounds.push({
      targetPath,
      targetDept,
      options,
      correctIndex: options.indexOf(targetDept),
    });
  }

  return rounds;
}


const ENQUETES_LIST: EnqueteTerritoire[] = [
  {
    id: 'enquete-33',
    targetCode: '33',
    targetName: 'Gironde',
    regionName: 'Nouvelle-Aquitaine',
    prefecture: 'Bordeaux',
    clues: [
      {
        label: 'Hydrographie & Estuaire',
        text: 'Traversé par deux grands cours d\'eau formant le plus vaste estuaire d\'Europe occidentale.',
        category: 'physique',
      },
      {
        label: 'Façade maritime & Forêt',
        text: 'Bordé par l\'océan Atlantique et recouvert par le plus grand massif forestier artificiel d\'Europe.',
        category: 'amenagement',
      },
      {
        label: 'Métropole & Mobilité',
        text: 'Polarisé par une métropole millionnaire reliée à Paris en 2h04 par la ligne à grande vitesse.',
        category: 'urbain',
      },
      {
        label: 'Patrimoine mondial & Vignoble',
        text: 'Abrite la dune du Pilat et le vignoble de vins d\'AOC le plus renommé au monde.',
        category: 'terroir',
      },
    ],
    explanation: 'La Gironde (33) associe l\'estuaire de la Gironde (Garonne et Dordogne), le bassin d\'Arcachon, la dune du Pilat et la métropole de Bordeaux.',
  },
  {
    id: 'enquete-69',
    targetCode: '69',
    targetName: 'Rhône',
    regionName: 'Auvergne-Rhône-Alpes',
    prefecture: 'Lyon',
    clues: [
      {
        label: 'Confluence fluviale majeure',
        text: 'Marqué par la confluence entre un affluent pluvial venu du nord et un puissant fleuve alpino-glaciaire.',
        category: 'physique',
      },
      {
        label: 'Statut administratif unique',
        text: 'Abrite une collectivité territoriale à statut particulier créée en 2015 exerçant les compétences départementales.',
        category: 'amenagement',
      },
      {
        label: 'Carrefour européen & Réseaux',
        text: 'Deuxième agglomération économique de France, point de départ de la première ligne TGV en 1981.',
        category: 'urbain',
      },
      {
        label: 'Industrie & Gastronomie',
        text: 'Abrite la "Vallée de la Chimie" au sud, les monts du Beaujolais au nord et la capitale de la gastronomie.',
        category: 'terroir',
      },
    ],
    explanation: 'Le Rhône (69) et la Métropole de Lyon représentent le carrefour Saône-Rhône, pôle industriel et économique majeur.',
  },
  {
    id: 'enquete-29',
    targetCode: '29',
    targetName: 'Finistère',
    regionName: 'Bretagne',
    prefecture: 'Quimper',
    clues: [
      {
        label: 'Littoral record',
        text: 'Possède la plus longue façade littorale de France (1 200 km d\'abers, falaises et criques océaniques).',
        category: 'physique',
      },
      {
        label: 'Défense nationale & Océan',
        text: 'Abrite la base opérationnelle des sous-marins nucléaires lanceurs d\'engins (FOST) de l\'Île Longue.',
        category: 'amenagement',
      },
      {
        label: 'Armature urbaine atypique',
        text: 'Structure bipolaire partagée entre sa préfecture historique au sud et sa grande métropole portuaire au nord.',
        category: 'urbain',
      },
      {
        label: 'Bout du monde',
        text: 'Comprend la pointe du Raz, l\'île d\'Ouessant et le premier port de pêche artisanale de France.',
        category: 'terroir',
      },
    ],
    explanation: 'Le Finistère (29) constitue l\'extrémité occidentale de la Bretagne, partagé entre Quimper (préfecture) et Brest (métropole navale).',
  },
  {
    id: 'enquete-63',
    targetCode: '63',
    targetName: 'Puy-de-Dôme',
    regionName: 'Auvergne-Rhône-Alpes',
    prefecture: 'Clermont-Ferrand',
    clues: [
      {
        label: 'Volcanologie & UNESCO',
        text: 'Inscrit au patrimoine mondial pour son alignement tectono-volcanique de 80 volcans et sa faille de Limagne.',
        category: 'physique',
      },
      {
        label: 'Toit du Massif central',
        text: 'Culmine au sommet du Massif central (1 886 m) sur un stratovolcan démantelé par l\'érosion.',
        category: 'physique',
      },
      {
        label: 'Bassin industriel mondial',
        text: 'Berceau et siège mondial d\'un géant du pneumatique, polarisé par une métropole au pied des volcans.',
        category: 'urbain',
      },
      {
        label: 'Terroir & Eaux thermales',
        text: 'Berceau du fromage Saint-Nectaire AOP et des sources d\'eau minérale de Volvic.',
        category: 'terroir',
      },
    ],
    explanation: 'Le Puy-de-Dôme (63) accueille la Chaîne des Puys, le Puy de Sancy, Clermont-Ferrand et le siège de Michelin.',
  },
  {
    id: 'enquete-59',
    targetCode: '59',
    targetName: 'Nord',
    regionName: 'Hauts-de-France',
    prefecture: 'Lille',
    clues: [
      {
        label: 'Plaines de Flandre',
        text: 'Relief très bas de polders et de plaines alluviales drainées vers la mer du Nord.',
        category: 'physique',
      },
      {
        label: 'Record démographique',
        text: 'Département le plus peuplé de toute la France avec près de 2,6 millions d\'habitants.',
        category: 'urbain',
      },
      {
        label: 'Carrefour transfrontalier',
        text: 'Frontière directe avec la Belgique, au cœur du triangle ferroviaire Londres-Paris-Bruxelles.',
        category: 'amenagement',
      },
      {
        label: 'Reconversion & Batteries',
        text: 'Ancien bassin minier réinventé en "Vallée de la batterie électrique" et pôle mondial de la grande distribution.',
        category: 'terroir',
      },
    ],
    explanation: 'Le Nord (59) est le département le plus peuplé de France, structuré autour de Lille, Dunkerque et Valenciennes.',
  },
];


function buildAutoEnquetes(): EnqueteTerritoire[] {
  const preferred = [
    '75','13','69','33','31','44','59','06','67','29',
    '35','34','74','83','38','63','21','76','57','11',
    '30','34','40','64','85','14','22','56','2A','971',
  ];
  const seen = new Set<string>();
  const out: EnqueteTerritoire[] = [];

  const pushFromDept = (code: string) => {
    if (seen.has(code)) return;
    const d = DEPARTMENTS[code];
    if (!d) return;
    seen.add(code);
    const hydro = (d.hydrography || []).slice(0, 2).join(' / ') || 'réseau hydrographique local';
    const specs = (d.specialties || []).slice(0, 2).join(' et ') || 'activités territoriales marquantes';
    const fact = d.academicFact || `${d.name} occupe une place structurante dans ${d.regionName}.`;
    out.push({
      id: `enquete-auto-${code}`,
      targetCode: d.code,
      targetName: d.name,
      regionName: d.regionName,
      prefecture: d.prefecture,
      clues: [
        {
          label: 'Hydrographie',
          text: `Territoire structuré autour de : ${hydro}.`,
          category: 'physique',
        },
        {
          label: 'Spécialités',
          text: `On y reconnaît notamment ${specs}.`,
          category: 'terroir',
        },
        {
          label: 'Chef-lieu',
          text: `Sa préfecture est une ville-pivot du tissu régional (initiale « ${d.prefecture[0]} »).`,
          category: 'urbain',
        },
        {
          label: 'Fait universitaire',
          text: fact.length > 160 ? fact.slice(0, 157) + '…' : fact,
          category: 'amenagement',
        },
      ],
      explanation: `${d.name} (${d.code}) — préfecture ${d.prefecture}, région ${d.regionName}. ${fact}`,
    });
  };

  for (const code of preferred) pushFromDept(code);
  for (const d of shuffle(DEPARTMENTS_LIST)) {
    if (out.length >= 36) break;
    pushFromDept(d.code);
  }
  return out;
}

export function generateEnquetes(
  count: number = 5,
  difficulty: GameDifficulty = 'intermediaire',
  regionCode?: string
): EnqueteTerritoire[] {
  const auto = buildAutoEnquetes();
  let pool = [...ENQUETES_LIST, ...auto];

  // Deduplicate by targetCode (handmade first)
  const byCode = new Map<string, EnqueteTerritoire>();
  for (const e of pool) {
    if (!byCode.has(e.targetCode)) byCode.set(e.targetCode, e);
  }
  pool = Array.from(byCode.values());

  if (regionCode) {
    pool = pool.filter((e) => DEPARTMENTS[e.targetCode]?.regionCode === regionCode);
  }

  // Difficulty: shuffle clue order; expert starts vaguer (we'll reverse clues)
  pool = shuffle(pool).map((e) => {
    const clues = [...e.clues];
    if (difficulty === 'expert') {
      // put terroir/amenagement first (vaguer), urbaine last
      clues.sort((a, b) => {
        const rank = (c: EnqueteClue) =>
          c.category === 'terroir' ? 0 : c.category === 'amenagement' ? 1 : c.category === 'physique' ? 2 : 3;
        return rank(a) - rank(b);
      });
    } else if (difficulty === 'debutant') {
      clues.sort((a, b) => {
        const rank = (c: EnqueteClue) =>
          c.category === 'urbain' ? 0 : c.category === 'physique' ? 1 : 2;
        return rank(a) - rank(b);
      });
    }
    return { ...e, clues };
  });

  if (pool.length === 0) pool = shuffle(ENQUETES_LIST);
  const out: EnqueteTerritoire[] = [];
  let i = 0;
  while (out.length < count && pool.length > 0) {
    out.push(pool[i % pool.length]);
    i += 1;
    if (i > pool.length * 3) break;
  }
  return out;
}


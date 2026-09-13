import { DEPARTMENTS_LIST, DEPARTMENTS } from '../data/departments';
import { REGIONS } from '../data/regions';
import { DEPARTMENT_MAP_PATHS, DepartmentMapPath } from '../data/franceMapPaths';
import { getDeptGrammar, getRegionGrammar } from '../data/departmentGrammar';
import { CULT_QUESTIONS } from '../data/cultQuestions';
import { 
  GameDifficulty, 
  MapClickTarget, 
  QcmQuestion, 
  EnqueteTerritoire 
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
  '75', // Paris
  '13', // Bouches-du-Rhône (Marseille)
  '69', // Rhône (Lyon)
  '33', // Gironde (Bordeaux)
  '31', // Haute-Garonne (Toulouse)
  '44', // Loire-Atlantique (Nantes)
  '59', // Nord (Lille)
  '06', // Alpes-Maritimes (Nice)
  '67', // Bas-Rhin (Strasbourg)
  '29', // Finistère (Brest)
  '35', // Ille-et-Vilaine (Rennes)
  '34', // Hérault (Montpellier)
  '74', // Haute-Savoie (Annecy/Chamonix)
  '83', // Var (Toulon)
  '2A', // Corse-du-Sud (Ajaccio)
  '2B', // Haute-Corse (Bastia)
];

// -------------------------------------------------------------
// 1. GENERATEUR: MODE POINTAGE SUR CARTE (CLIC CARTE)
// -------------------------------------------------------------
export function generateMapClickTargets(
  difficulty: GameDifficulty = 'intermediaire',
  count: number = 10,
  regionCode?: string
): MapClickTarget[] {
  const targets: MapClickTarget[] = [];

  // Filter pool by region if selected
  const basePool = regionCode && REGIONS[regionCode]
    ? DEPARTMENTS_LIST.filter((d) => d.regionCode === regionCode)
    : DEPARTMENTS_LIST;

  if (regionCode && REGIONS[regionCode]) {
    // Specific Region Training (Grand Tour)
    const pool = shuffle(basePool).slice(0, count);
    for (const d of pool) {
      const g = getDeptGrammar(d.code);
      targets.push({
        id: `click-reg-${d.code}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: `Localise ${g.withArticle} (${d.code})`,
        subPrompt: `Préfecture : ${d.prefecture}`,
      });
    }
    return targets;
  }

  if (difficulty === 'debutant') {
    // Beginner: Prominent departments
    const pool = shuffle(BEGINNER_DEPT_CODES).slice(0, count);
    for (const code of pool) {
      const d = DEPARTMENTS[code];
      if (!d) continue;
      const g = getDeptGrammar(code);
      targets.push({
        id: `click-beg-${code}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: `Localise ${g.withArticle} (${d.prefecture})`,
        subPrompt: `Région ${d.regionName}`,
      });
    }
  } else if (difficulty === 'expert') {
    // Expert: Landmarks & Trick Prefectures (without giving the department name)
    const expertLandmarks = [
      { prompt: 'Où se trouve le mont Saint-Michel ?', targetCode: '50', hint: 'Dans la Manche' },
      { prompt: 'Où se dresse la dune du Pilat ?', targetCode: '33', hint: 'En Gironde (bassin d\'Arcachon)' },
      { prompt: 'Où se situe la préfecture de Saint-Lô ?', targetCode: '50', hint: 'Chef-lieu de la Manche' },
      { prompt: 'Où se trouve la préfecture de Quimper ?', targetCode: '29', hint: 'Chef-lieu du Finistère' },
      { prompt: 'Où se situe la préfecture de Vannes ?', targetCode: '56', hint: 'Chef-lieu du Morbihan' },
      { prompt: 'Où se situe la préfecture de Châlons-en-Champagne ?', targetCode: '51', hint: 'Chef-lieu de la Marne' },
      { prompt: 'Où se trouve la préfecture de Laon ?', targetCode: '02', hint: 'Chef-lieu de l\'Aisne' },
      { prompt: 'Où se situe la préfecture de Moulins ?', targetCode: '03', hint: 'Chef-lieu de l\'Allier' },
      { prompt: 'Où se situe le volcan du Puy de Sancy (1 886 m) ?', targetCode: '63', hint: 'Dans le Puy-de-Dôme' },
      { prompt: 'Où se trouvent les gorges du Verdon ?', targetCode: '04', hint: 'Dans les Alpes-de-Haute-Provence' },
      { prompt: 'Où se situe le château de Chambord ?', targetCode: '41', hint: 'En Loir-et-Cher' },
      { prompt: 'Où la Loire prend-elle sa source au mont Gerbier-de-Jonc ?', targetCode: '07', hint: 'En Ardèche' },
      { prompt: 'Où se trouve le Territoire de Belfort (90) ?', targetCode: '90', hint: 'Plus petit département métropolitain hors Paris' },
      { prompt: 'Où se situe le gouffre de Padirac ?', targetCode: '46', hint: 'Dans le Lot' },
      { prompt: 'Où se situe la pointe du Raz ?', targetCode: '29', hint: 'À l\'extrême ouest du Finistère' },
      { prompt: 'Où se dresse le sommet du Mont-Blanc (4 807 m) ?', targetCode: '74', hint: 'En Haute-Savoie' },
      { prompt: 'Où se trouve la préfecture de Mont-de-Marsan ?', targetCode: '40', hint: 'Chef-lieu des Landes' },
      { prompt: 'Où se situe la préfecture de Tulle ?', targetCode: '19', hint: 'Chef-lieu de la Corrèze' },
    ];

    const pool = shuffle(expertLandmarks).slice(0, count);
    for (const item of pool) {
      const d = DEPARTMENTS[item.targetCode];
      if (!d) continue;
      targets.push({
        id: `click-exp-${d.code}-${Math.random()}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: item.prompt,
        subPrompt: 'Clique directement sur le bon département',
      });
    }
  } else {
    // Intermédiaire: Full pool of 101 departments
    const pool = shuffle(basePool).slice(0, count);
    for (const d of pool) {
      const g = getDeptGrammar(d.code);
      targets.push({
        id: `click-mid-${d.code}`,
        code: d.code,
        name: d.name,
        prefecture: d.prefecture,
        regionName: d.regionName,
        prompt: `Localise ${g.withArticle} (${d.code})`,
        subPrompt: `Préfecture : ${d.prefecture} • ${d.regionName}`,
      });
    }
  }

  return targets;
}

// -------------------------------------------------------------
// 2. GENERATEUR: MODE QUIZ QCM NATUREL & INTELLIGENT
// -------------------------------------------------------------
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
    const questionType = Math.floor(Math.random() * 3);

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
    } else {
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

export function generateSilhouetteRounds(count: number = 10, regionCode?: string): SilhouetteRound[] {
  const validPaths = regionCode && REGIONS[regionCode]
    ? DEPARTMENT_MAP_PATHS.filter((p) => REGIONS[regionCode].departments.includes(p.code))
    : DEPARTMENT_MAP_PATHS;

  const pool = shuffle(validPaths).slice(0, count);
  const rounds: SilhouetteRound[] = [];

  for (const targetPath of pool) {
    const targetDept = DEPARTMENTS[targetPath.code];
    if (!targetDept) continue;

    // Pick 3 distractors
    const sameRegionPaths = DEPARTMENT_MAP_PATHS.filter(
      (p) => p.code !== targetPath.code && DEPARTMENTS[p.code]?.regionCode === targetDept.regionCode
    );
    const otherPaths = DEPARTMENT_MAP_PATHS.filter(
      (p) => p.code !== targetPath.code && DEPARTMENTS[p.code]?.regionCode !== targetDept.regionCode
    );

    const distractorDepts: Department[] = [];
    for (const p of shuffle(sameRegionPaths)) {
      if (DEPARTMENTS[p.code]) distractorDepts.push(DEPARTMENTS[p.code]);
      if (distractorDepts.length >= 2) break;
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

// -------------------------------------------------------------
// 5. ENQUÊTES TERRITORIALES
// -------------------------------------------------------------
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

export function generateEnquetes(count: number = 5): EnqueteTerritoire[] {
  return shuffle(ENQUETES_LIST).slice(0, count);
}

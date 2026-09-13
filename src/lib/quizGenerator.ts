import { DEPARTMENTS_LIST, DEPARTMENTS } from '../data/departments';
import { REGIONS } from '../data/regions';
import { LICENCE_QUESTIONS } from '../data/licenceQuestions';
import { QuizConfig, QuizQuestion, QuizTheme } from '../types/quiz';
import { Department } from '../types/geo';

// Helper to shuffle an array
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Physical geography specific pool
const RELIEF_HYDRO_BANK: Array<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  targetDeptCode?: string;
  relatedDeptCodes?: string[];
  concept: string;
}> = [
  {
    question: 'Quel est le plus long fleuve entièrement situé sur le territoire français (1 006 km) ?',
    options: ['La Loire', 'La Seine', 'Le Rhône', 'La Garonne'],
    correctIndex: 0,
    explanation: 'Avec ses 1 006 km prenant source au Mont Gerbier-de-Jonc (Ardèche) pour se jeter dans l\'Atlantique par l\'estuaire de Saint-Nazaire, la Loire est le plus long fleuve coulant entièrement en France.',
    targetDeptCode: '07',
    relatedDeptCodes: ['07', '43', '42', '71', '58', '45', '41', '37', '49', '44'],
    concept: 'Bassin ligérien',
  },
  {
    question: 'Dans quel massif montagneux culmine le point le plus haut de France et d\'Europe occidentale (Mont Blanc, 4 807 m) ?',
    options: ['Les Alpes du Nord', 'Les Pyrénées', 'Le Massif central', 'Le Jura'],
    correctIndex: 0,
    explanation: 'Le Mont Blanc (4 807 m) se dresse dans le massif du Mont-Blanc dans les Alpes du Nord, sur le département de la Haute-Savoie.',
    targetDeptCode: '74',
    relatedDeptCodes: ['74', '73'],
    concept: 'Orogenèse alpine',
  },
  {
    question: 'À quelle confluence majeure le fleuve Saône se jette-t-il dans le Rhône ?',
    options: ['À Lyon', 'À Avignon', 'À Valence', 'À Tournon-sur-Rhône'],
    correctIndex: 0,
    explanation: 'La confluence de la Saône (affluent droit à régime pluvial régulier) et du Rhône s\'opère au sud de la presqu\'île de Lyon (69), donnant naissance au puissant couloir rhodanien.',
    targetDeptCode: '69',
    relatedDeptCodes: ['69', '01', '38'],
    concept: 'Confluence fluviale',
  },
  {
    question: 'Quel est le point culminant du Massif central (1 886 m), d\'origine volcanique ?',
    options: ['Le Puy de Sancy', 'Le Plomb du Cantal', 'Le Puy Mary', 'Le Puy de Dôme'],
    correctIndex: 0,
    explanation: 'Le Puy de Sancy culmine à 1 886 m dans le département du Puy-de-Dôme. C\'est un stratovolcan complexe démantelé par l\'érosion glaciaire.',
    targetDeptCode: '63',
    relatedDeptCodes: ['63', '15'],
    concept: 'Volcanisme hercynien/cénozoïque',
  },
  {
    question: 'Lequel de ces fleuves français se jette dans la mer du Nord après avoir traversé la Belgique et les Pays-Bas ?',
    options: ['La Meuse', 'La Somme', 'L\'Escaut', 'La Moselle'],
    correctIndex: 0,
    explanation: 'La Meuse prend sa source au Châtelet-sur-Meuse (Haute-Marne), traverse les Ardennes, la Belgique puis les Pays-Bas pour rejoindre la mer du Nord dans le delta Rhin-Meuse.',
    targetDeptCode: '52',
    relatedDeptCodes: ['52', '55', '08'],
    concept: 'Bassin transfrontalier européen',
  },
  {
    question: 'Les célèbres "Gorges du Verdon", plus grand canyon d\'Europe, séparent principalement quels départements ?',
    options: ['Le Var (83) et les Alpes-de-Haute-Provence (04)', 'Les Bouches-du-Rhône (13) et le Vaucluse (84)', 'L\'Isère (38) et la Drôme (26)', 'L\'Ardèche (07) et la Lozère (48)'],
    correctIndex: 0,
    explanation: 'Creusées dans les calcaires préalpins par la rivière Verdon, ces gorges spectaculaires forment la frontière naturelle entre le Var et les Alpes-de-Haute-Provence.',
    targetDeptCode: '04',
    relatedDeptCodes: ['04', '83'],
    concept: 'Karst et érosion fluviatile',
  },
  {
    question: 'Où le fleuve Garonne prend-il sa source avant d\'entrer sur le sol français ?',
    options: ['Dans le Val d\'Aran (Pyrénées espagnoles)', 'Sur le plateau de Lannemezan', 'Au cirque de Gavarnie', 'Au col du Tourmalet'],
    correctIndex: 0,
    explanation: 'La Garonne naît dans les Pyrénées catalanes espagnoles (Val d\'Aran), s\'engouffre dans le Trou du Toro avant de reparaître sur le versant français au goueil de Jouéou.',
    targetDeptCode: '31',
    relatedDeptCodes: ['31', '65'],
    concept: 'Hydrographie pyrénéenne',
  },
  {
    question: 'Le seuil géologique de Naurouze (ou seuil du Lauragais) est célèbre pour constituer :',
    options: ['La ligne de partage des eaux entre Atlantique et Méditerranée empruntée par le Canal du Midi', 'Le point le plus bas du fossé rhénan', 'La frontière naturelle entre France et Italie', 'L\'estuaire commun de la Dordogne et de la Garonne'],
    correctIndex: 0,
    explanation: 'Situé à 189 m d\'altitude à la limite de la Haute-Garonne et de l\'Aude, le seuil de Naurouze est le point culminant du Canal du Midi conçu par Pierre-Paul Riquet pour relier les deux mers.',
    targetDeptCode: '11',
    relatedDeptCodes: ['11', '31'],
    concept: 'Partage des eaux et aménagement historique',
  },
];

export function generateQuizQuestions(config: QuizConfig): QuizQuestion[] {
  // 1. Filter department pool by region if selected
  let deptPool = DEPARTMENTS_LIST;
  if (config.regionScope !== 'all') {
    deptPool = DEPARTMENTS_LIST.filter((d) => d.regionCode === config.regionScope);
    // Fallback if pool is too small
    if (deptPool.length < 4) {
      deptPool = DEPARTMENTS_LIST;
    }
  }

  // Determine question count
  let targetCount = 10;
  if (config.format === 'standard_20') targetCount = 20;
  else if (config.format === 'survival_3_lives') targetCount = 40;

  const questions: QuizQuestion[] = [];
  const usedKeys = new Set<string>();

  // Determine which sub-generators to call
  const themesToUse: QuizTheme[] = [];
  if (config.theme === 'grand_mix') {
    themesToUse.push('prefectures', 'departements', 'regions', 'reliefs_fleuves', 'licence_geo');
  } else {
    themesToUse.push(config.theme);
  }

  let safetyCounter = 0;
  while (questions.length < targetCount && safetyCounter < 300) {
    safetyCounter++;
    const chosenTheme = themesToUse[Math.floor(Math.random() * themesToUse.length)];

    if (chosenTheme === 'prefectures') {
      const q = makePrefectureQuestion(deptPool, questions.length);
      if (q && !usedKeys.has(q.id)) {
        usedKeys.add(q.id);
        questions.push(q);
      }
    } else if (chosenTheme === 'departements') {
      const q = makeDepartmentCodeQuestion(deptPool, questions.length);
      if (q && !usedKeys.has(q.id)) {
        usedKeys.add(q.id);
        questions.push(q);
      }
    } else if (chosenTheme === 'regions') {
      const q = makeRegionQuestion(deptPool, questions.length);
      if (q && !usedKeys.has(q.id)) {
        usedKeys.add(q.id);
        questions.push(q);
      }
    } else if (chosenTheme === 'reliefs_fleuves') {
      const q = makeReliefQuestion(questions.length);
      if (q && !usedKeys.has(q.id)) {
        usedKeys.add(q.id);
        questions.push(q);
      }
    } else if (chosenTheme === 'licence_geo') {
      const q = makeLicenceQuestion(questions.length);
      if (q && !usedKeys.has(q.id)) {
        usedKeys.add(q.id);
        questions.push(q);
      }
    }
  }

  return questions;
}

// Sub-generator: Prefectures
function makePrefectureQuestion(pool: Department[], idx: number): QuizQuestion | null {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const isTypeA = Math.random() > 0.5;

  // Gather 3 distractors
  // Try to pick distractors from same region first for realistic challenge
  let regionalDistractors = pool.filter((d) => d.code !== target.code && d.regionCode === target.regionCode);
  if (regionalDistractors.length < 3) {
    regionalDistractors = DEPARTMENTS_LIST.filter((d) => d.code !== target.code);
  }
  const pickedDistractors = shuffle(regionalDistractors).slice(0, 3);

  if (isTypeA) {
    // "Quelle est la préfecture du Morbihan (56) ?"
    const options = shuffle([
      target.prefecture,
      pickedDistractors[0].prefecture,
      pickedDistractors[1].prefecture,
      pickedDistractors[2].prefecture,
    ]);
    return {
      id: `pref-a-${target.code}-${idx}`,
      theme: 'prefectures',
      title: `Quelle est la préfecture de : ${target.name} (${target.code}) ?`,
      subtitle: `Région : ${target.regionName}`,
      options,
      correctIndex: options.indexOf(target.prefecture),
      explanation: `${target.prefecture} est le chef-lieu (préfecture) du département de ${target.name} (${target.code}), situé dans la région ${target.regionName}.`,
      targetDepartmentCode: target.code,
      relatedDepartmentCodes: [target.code],
      contextTag: 'Préfecture',
    };
  } else {
    // "La ville de Pau est la préfecture de quel département ?"
    const options = shuffle([
      `${target.name} (${target.code})`,
      `${pickedDistractors[0].name} (${pickedDistractors[0].code})`,
      `${pickedDistractors[1].name} (${pickedDistractors[1].code})`,
      `${pickedDistractors[2].name} (${pickedDistractors[2].code})`,
    ]);
    const correctLabel = `${target.name} (${target.code})`;
    return {
      id: `pref-b-${target.code}-${idx}`,
      theme: 'prefectures',
      title: `La ville de ${target.prefecture} est la préfecture de quel département ?`,
      subtitle: `Région : ${target.regionName}`,
      options,
      correctIndex: options.indexOf(correctLabel),
      explanation: `La préfecture de ${target.prefecture} administre le département de ${target.name} (${target.code}).`,
      targetDepartmentCode: target.code,
      relatedDepartmentCodes: [target.code],
      contextTag: 'Ville & Département',
    };
  }
}

// Sub-generator: Department Code <-> Name
function makeDepartmentCodeQuestion(pool: Department[], idx: number): QuizQuestion | null {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const isTypeA = Math.random() > 0.5;

  const otherDepts = shuffle(DEPARTMENTS_LIST.filter((d) => d.code !== target.code)).slice(0, 3);

  if (isTypeA) {
    // "Quel département porte le numéro 29 ?"
    const options = shuffle([
      target.name,
      otherDepts[0].name,
      otherDepts[1].name,
      otherDepts[2].name,
    ]);
    return {
      id: `code-a-${target.code}-${idx}`,
      theme: 'departements',
      title: `Quel département correspond au numéro ${target.code} ?`,
      subtitle: `Préfecture : ${target.prefecture} • Région : ${target.regionName}`,
      options,
      correctIndex: options.indexOf(target.name),
      explanation: `Le numéro ${target.code} est attribué au département de ${target.name}, dont le chef-lieu est ${target.prefecture}.`,
      targetDepartmentCode: target.code,
      relatedDepartmentCodes: [target.code],
      contextTag: 'Numéro vers Nom',
    };
  } else {
    // "Quel est le numéro du département de la Lozère ?"
    const options = shuffle([
      target.code,
      otherDepts[0].code,
      otherDepts[1].code,
      otherDepts[2].code,
    ]);
    return {
      id: `code-b-${target.code}-${idx}`,
      theme: 'departements',
      title: `Quel est le numéro de département de : ${target.name} ?`,
      subtitle: `Préfecture : ${target.prefecture} • Région : ${target.regionName}`,
      options,
      correctIndex: options.indexOf(target.code),
      explanation: `${target.name} porte le code officiel géographique ${target.code}. Sa préfecture est ${target.prefecture}.`,
      targetDepartmentCode: target.code,
      relatedDepartmentCodes: [target.code],
      contextTag: 'Nom vers Numéro',
    };
  }
}

// Sub-generator: Regions
function makeRegionQuestion(pool: Department[], idx: number): QuizQuestion | null {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const correctRegion = REGIONS[target.regionCode];
  if (!correctRegion) return null;

  const otherRegions = shuffle(
    Object.values(REGIONS).filter((r) => r.code !== target.regionCode)
  ).slice(0, 3);

  const isTypeA = Math.random() > 0.4;

  if (isTypeA) {
    // "Dans quelle région se situe le département X (YY) ?"
    const options = shuffle([
      correctRegion.name,
      otherRegions[0].name,
      otherRegions[1].name,
      otherRegions[2].name,
    ]);
    return {
      id: `reg-a-${target.code}-${idx}`,
      theme: 'regions',
      title: `Dans quelle région se situe le département de : ${target.name} (${target.code}) ?`,
      subtitle: `Préfecture départementale : ${target.prefecture}`,
      options,
      correctIndex: options.indexOf(correctRegion.name),
      explanation: `${target.name} (${target.code}) fait partie de la région ${correctRegion.name}, dont le chef-lieu régional est ${correctRegion.prefecture}.`,
      targetDepartmentCode: target.code,
      relatedDepartmentCodes: correctRegion.departments,
      contextTag: 'Région administrative',
    };
  } else {
    // "Quelle est la préfecture régionale de la région X ?"
    const targetReg = Object.values(REGIONS)[Math.floor(Math.random() * Object.values(REGIONS).length)];
    const otherCities = shuffle(
      DEPARTMENTS_LIST.filter((d) => d.prefecture !== targetReg.prefecture).map((d) => d.prefecture)
    ).slice(0, 3);

    const options = shuffle([targetReg.prefecture, ...otherCities]);
    return {
      id: `reg-pref-${targetReg.code}-${idx}`,
      theme: 'regions',
      title: `Quelle est la préfecture régionale (chef-lieu) de la région : ${targetReg.name} ?`,
      subtitle: `${targetReg.departments.length} départements la composent`,
      options,
      correctIndex: options.indexOf(targetReg.prefecture),
      explanation: `${targetReg.prefecture} est la capitale administrative (préfecture de région) de ${targetReg.name}.`,
      relatedDepartmentCodes: targetReg.departments,
      contextTag: 'Capitale Régionale',
    };
  }
}

// Sub-generator: Physical geography
function makeReliefQuestion(idx: number): QuizQuestion | null {
  const q = RELIEF_HYDRO_BANK[Math.floor(Math.random() * RELIEF_HYDRO_BANK.length)];
  return {
    id: `relief-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    theme: 'reliefs_fleuves',
    title: q.question,
    subtitle: `Géographie physique • ${q.concept}`,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    targetDepartmentCode: q.targetDeptCode,
    relatedDepartmentCodes: q.relatedDeptCodes,
    contextTag: 'Relief & Hydrographie',
  };
}

// Sub-generator: Licence Géo Academic
function makeLicenceQuestion(idx: number): QuizQuestion | null {
  const item = LICENCE_QUESTIONS[Math.floor(Math.random() * LICENCE_QUESTIONS.length)];
  return {
    id: `licence-${item.id}-${idx}`,
    theme: 'licence_geo',
    title: item.question,
    subtitle: `${item.difficulty} • ${item.keyConcept}`,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
    targetDepartmentCode: item.relatedDepartmentCodes?.[0],
    relatedDepartmentCodes: item.relatedDepartmentCodes,
    contextTag: 'Culture Universitaire',
  };
}

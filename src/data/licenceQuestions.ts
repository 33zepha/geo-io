import { LicenceQuestion } from '../types/geo';

export const LICENCE_QUESTIONS: LicenceQuestion[] = [
  {
    id: 'lic-geo-001',
    category: 'physique',
    difficulty: 'Licence 1',
    question: 'Sur le plan géomorphologique, par quelle structure tectonique majeure la plaine d\'Alsace se caractérise-t-elle ?',
    options: [
      'Un fossé d\'effondrement (graben) bordé de failles normales',
      'Un pli synclinal perché issu de l\'orogenèse hercynienne',
      'Un plateau calcaire karstifié par la dissolution du Jurassique',
      'Une plaine d\'épandage morainique quaternaire exclusive'
    ],
    correctIndex: 0,
    explanation: 'La plaine d\'Alsace correspond à la partie occidentale du fossé rhénan, un graben cénozoïque issu de l\'extension crustale liée à la surrection des Alpes. Il est délimité par des failles normales majeures séparant le fossé effondré des horsts des Vosges et de la Forêt-Noire.',
    keyConcept: 'Fossé d\'effondrement (Graben)',
    relatedDepartmentCodes: ['67', '68']
  },
  {
    id: 'lic-geo-002',
    category: 'amenagement',
    difficulty: 'Licence 2',
    question: 'Quelle loi fondamentale de 1986 encadre l\'urbanisation des rivages maritimes et des plans d\'eau de plus de 1 000 hectares en France ?',
    options: [
      'La loi Montagne',
      'La loi Littoral',
      'La loi SRU (Solidarité et Renouvellement Urbains)',
      'La loi NOTRe'
    ],
    correctIndex: 1,
    explanation: 'La loi Littoral du 3 janvier 1986 impose le principe d\'inconstructibilité sur une bande de 100 mètres à compter de la limite haute du rivage, ainsi que l\'obligation d\'urbaniser en continuité des agglomérations et villages existants pour lutter contre le mitage et le bétonnage des côtes.',
    keyConcept: 'Loi Littoral (Préservation et Continuité Urbaine)',
    relatedDepartmentCodes: ['29', '33', '83', '17']
  },
  {
    id: 'lic-geo-003',
    category: 'economique',
    difficulty: 'Licence 1',
    question: 'Quel fleuve français accueille sur ses rives la plus forte concentration de réacteurs nucléaires civils et la "Vallée de la Chimie" ?',
    options: [
      'La Loire',
      'La Seine',
      'Le Rhône',
      'La Garonne'
    ],
    correctIndex: 2,
    explanation: 'Grâce à son débit puissant et régulier soutenu par un régime glacio-nival et pluvial, le Rhône concentre 4 centrales nucléaires majeures (Bugey, Saint-Alban, Cruas, Tricastin) et la Vallée de la Chimie au sud de Lyon (pétrochimie et chimie de spécialité).',
    keyConcept: 'Corridor énergétique et industriel rhodanien',
    relatedDepartmentCodes: ['69', '01', '38', '26', '07', '84', '13']
  },
  {
    id: 'lic-geo-004',
    category: 'littoral_drom',
    difficulty: 'Licence 2',
    question: 'Grâce à ses territoires d\'outre-mer (DROM-COM), à quel rang mondial se situe la Zone Économique Exclusive (ZEE) de la France ?',
    options: [
      'Au 1er rang mondial (devant les États-Unis)',
      'Au 2e rang mondial (juste derrière les États-Unis)',
      'Au 5e rang mondial (après la Russie et le Canada)',
      'Au 10e rang mondial'
    ],
    correctIndex: 1,
    explanation: 'Avec environ 11 millions de km² de ZEE (soit 20 fois la superficie de l\'Hexagone), la France possède le 2e domaine maritime mondial derrière les États-Unis. Plus de 96% de cette surface maritime provient de l\'outre-mer (Polynésie française, Nouvelle-Calédonie, TAAF, DROM).',
    keyConcept: 'ZEE et puissance maritime globale',
    relatedDepartmentCodes: ['971', '972', '973', '974', '976']
  },
  {
    id: 'lic-geo-005',
    category: 'physique',
    difficulty: 'Licence 2',
    question: 'Comment nomme-t-on le relief asymétrique caractéristique du Bassin parisien, formé d\'un front abrupt et d\'un revers à pente douce ?',
    options: [
      'Une reculée',
      'Un dyke',
      'Une cuesta (ou côte)',
      'Un synclinal perché'
    ],
    correctIndex: 2,
    explanation: 'Le Bassin parisien est un bassin sédimentaire s\'organisant en auréoles concentriques. L\'alternance de couches dures (calcaires) et tendres (argiles/sables) inclinées vers le centre du bassin donne des cuestas (Côte d\'Île-de-France, Côte de Champagne, Côtes de Meuse, Côte de Moselle).',
    keyConcept: 'Reliefs de cuesta et structure sédimentaire',
    relatedDepartmentCodes: ['51', '55', '54', '21']
  },
  {
    id: 'lic-geo-006',
    category: 'urbaine',
    difficulty: 'Licence 1',
    question: 'Quel concept géographique théorisé par Jean-François Gravier en 1947 dénonçait la disproportion écrasante de Paris par rapport au reste du territoire français ?',
    options: [
      'La métropolisation réticulaire',
      'La macrocéphalie urbaine ("Paris et le désert français")',
      'Le périurbain discontinu',
      'L\'archipel mégapolitain'
    ],
    correctIndex: 1,
    explanation: 'Dans son ouvrage fondateur "Paris et le désert français" (1947), le géographe Jean-François Gravier dénonçait la macrocéphalie de la capitale, qui vampirisait les ressources démographiques et économiques des provinces, incitant l\'État à créer la DATAR en 1963 et les métropoles d\'équilibre.',
    keyConcept: 'Macrocéphalie urbaine et décentralisation',
    relatedDepartmentCodes: ['75', '92', '93', '94', '77', '78', '91', '95']
  },
  {
    id: 'lic-geo-007',
    category: 'physique',
    difficulty: 'Licence 3 / Concours',
    question: 'Le seuil du Poitou constitue une charnière géologique et morphologique majeure en reliant :',
    options: [
      'Le Bassin aquitain et le Massif armoricain',
      'Le Bassin parisien et le Bassin aquitain',
      'Le Massif central et le graben rhodanien',
      'Les Pyrénées et le couloir audois'
    ],
    correctIndex: 1,
    explanation: 'Le seuil du Poitou est une selle sédimentaire jurassique séparant les deux grands bassins sédimentaires français (Bassin de Paris et Bassin d\'Aquitaine), resserrée entre les socles hercyniens cristallins du Massif armoricain au nord-ouest et du Massif central au sud-est.',
    keyConcept: 'Seuil structural et isthme de circulation',
    relatedDepartmentCodes: ['86', '79']
  },
  {
    id: 'lic-geo-008',
    category: 'economique',
    difficulty: 'Licence 2',
    question: 'Dans quelle commune ou zone portuaire des Hauts-de-France se concentre aujourd\'hui la "Vallée de la batterie" (Gigafactories européennes de véhicules électriques) ?',
    options: [
      'À Dunkerque et Douai',
      'À Boulogne-sur-Mer et Abbeville',
      'À Beauvais et Compiègne',
      'À Saint-Quentin et Laon'
    ],
    correctIndex: 0,
    explanation: 'La reconversion industrielle du bassin minier et de la façade maritime des Hauts-de-France s\'articule autour de la "Vallée de la batterie électrique" avec l\'implantation de 4 gigafactories (ACC à Douvrin, Envision AESC à Douai, Verkor et ProLogium à Dunkerque), profitant de l\'infrastructure portuaire et ferroviaire.',
    keyConcept: 'Réindustrialisation et transition décarbonée',
    relatedDepartmentCodes: ['59', '62']
  },
  {
    id: 'lic-geo-009',
    category: 'littoral_drom',
    difficulty: 'Licence 2',
    question: 'Pour quelle raison géographique primordiale le site de Kourou en Guyane a-t-il été sélectionné pour implanter le Centre Spatial Guyanais (CSG) en 1964 ?',
    options: [
      'La présence d\'un port en eau très profonde dans l\'estuaire de l\'Oyapock',
      'Sa proximité immédiate avec l\'équateur (5° Nord) et une ouverture maritime vers l\'est',
      'Une absence totale de couvert forestier facilitant la construction des pas de tir',
      'L\'altitude élevée du plateau des Guyanes limitant les turbulences atmosphériques'
    ],
    correctIndex: 1,
    explanation: 'Kourou présente deux atouts physiques incomparables : sa proximité avec l\'équateur (5,3° N) permet de bénéficier au maximum de la vitesse linéaire de rotation de la Terre ("effet de fronde", économisant jusqu\'à 20% de carburant par rapport à Baïkonour), et une façade océanique libre au nord et à l\'est sans survol habité en phase ascendante.',
    keyConcept: 'Avantage comparatif géo-spatial et sécurité balistique',
    relatedDepartmentCodes: ['973']
  },
  {
    id: 'lic-geo-010',
    category: 'amenagement',
    difficulty: 'Licence 3 / Concours',
    question: 'Quelle est la différence fondamentale de statut juridique et d\'usage entre un Parc National et un Parc Naturel Régional (PNR) en France ?',
    options: [
      'Le Parc National est créé par l\'UNESCO, le PNR par la région',
      'Le Parc National possède un cœur à haute protection réglementaire stricte, alors que le PNR repose sur une charte contractuelle de développement durable sans pouvoir réglementaire propre',
      'Les Parcs Nationaux n\'existent qu\'en haute montagne, tandis que les PNR ne concernent que les plaines céréalières',
      'Il n\'y a aucune différence, ce sont deux appellations purement sémantiques'
    ],
    correctIndex: 1,
    explanation: 'Le Parc National (loi de 1960 modernisée en 2006) institue un « cœur » sanctuarisé où s\'applique une réglementation stricte édictée par un établissement public d\'État. Le PNR (décret de 1967) est un syndicat mixte d\'initiative locale fondé sur une charte décennale consensuelle conciliant préservation paysagère et développement socio-économique.',
    keyConcept: 'Typologie des espaces protégés en droit de l\'environnement',
    relatedDepartmentCodes: ['05', '73', '06', '48', '52', '63']
  },
  {
    id: 'lic-geo-011',
    category: 'economique',
    difficulty: 'Licence 2',
    question: 'Le pôle de compétitivité mondial de la "Cosmetic Valley", premier écosystème parfumerie-cosmétique au monde, s\'étend principalement sur :',
    options: [
      'La région Centre-Val de Loire, la Normandie et l\'Île-de-France',
      'La région PACA autour de Grasse exclusivement',
      'L\'arc atlantique entre Nantes et Bordeaux',
      'L\'Alsace et la Lorraine'
    ],
    correctIndex: 0,
    explanation: 'Créé à l\'origine à Chartres (Eure-et-Loir), le réseau de la Cosmetic Valley s\'est déployé en un chapelet industriel englobant le Centre-Val de Loire (Orléans, Tours), l\'Eure normande et les sièges/laboratoires franciliens, regroupant des marques comme Dior, Guerlain, LVMH ou Shiseido.',
    keyConcept: 'District industriel et pôle de compétitivité (SPL)',
    relatedDepartmentCodes: ['28', '45', '37', '27', '75', '92']
  },
  {
    id: 'lic-geo-012',
    category: 'physique',
    difficulty: 'Licence 3 / Concours',
    question: 'Quel fleuve français présente la particularité d\'avoir un bassin versant asymétrique dit "en éventail", drainant à la fois les eaux pyrénéennes et du Massif central avant son estuaire ?',
    options: [
      'La Garonne',
      'La Loire',
      'La Meuse',
      'Le Rhin'
    ],
    correctIndex: 0,
    explanation: 'La Garonne draine au sud les torrents pyrénéens (Ariège, Neste, Salat) à régime nival/pluvio-nival, et reçoit au nord d\'imposants affluents issus du Massif central (Tarn, Aveyron, Lot, Dordogne) à régime pluvio-océanique, formant avec la Dordogne le plus vaste estuaire d\'Europe (la Gironde).',
    keyConcept: 'Hydrographie fluvio-estuarienne et régimes hydrologiques mixtes',
    relatedDepartmentCodes: ['31', '82', '47', '33']
  },
  {
    id: 'lic-geo-013',
    category: 'urbaine',
    difficulty: 'Licence 2',
    question: 'Qu\'appelle-t-on la "Diagonale des faibles densités" (autrefois appelée péjorativement "diagonale du vide") en géographie humaine française ?',
    options: [
      'Une bande allant des Ardennes aux Pyrénées en passant par le Massif central où les densités sont inférieures à 30 hab/km²',
      'Une ligne droite reliant Brest à Strasbourg traversant les plateaux forestiers',
      'Le littoral atlantique vidé de sa population lors de la saison hivernale',
      'Le pourtour des agglomérations lyonnaise et marseillaise'
    ],
    correctIndex: 0,
    explanation: 'S\'étirant de la frontière belge (Meuse, Haute-Marne) au sud-ouest (Creuse, Lozère, Gers) en traversant le Massif central, cette vaste diagonale se caractérise par des densités très basses, un vieillissement marqué, mais connaît un regain grâce à l\'attrait résidentiel pour la naturalité et l\'agriculture biologique.',
    keyConcept: 'Diagonale des faibles densités et hyper-ruralité',
    relatedDepartmentCodes: ['55', '52', '58', '23', '48', '12', '32']
  },
  {
    id: 'lic-geo-014',
    category: 'geopolitique',
    difficulty: 'Licence 1',
    question: 'Avec quel pays étranger la France partage-t-elle sa plus longue frontière terrestre continue ?',
    options: [
      'L\'Espagne (623 km)',
      'La Belgique (620 km)',
      'Le Brésil (730 km, en Guyane)',
      'La Suisse (572 km)'
    ],
    correctIndex: 2,
    explanation: 'La plus longue frontière terrestre de la République française est partagée avec le Brésil : 730 km le long du fleuve Oyapock en Guyane, devançant les frontières métropolitaines avec l\'Espagne (623 km le long des crêtes pyrénéennes) et la Belgique (620 km).',
    keyConcept: 'Frontière internationale et géopolitique transfrontalière',
    relatedDepartmentCodes: ['973']
  },
  {
    id: 'lic-geo-015',
    category: 'physique',
    difficulty: 'Licence 2',
    question: 'La faille géologique majeure de la Limagne, inscrite à l\'UNESCO avec la Chaîne des Puys, témoigne de :',
    options: [
      'L\'initiation avortée d\'un océan par rifting continental au Cénozoïque',
      'Une collision frontale de deux plaques continentales créant des nappes de charriage',
      'Une météorite ayant percuté le socle cristallin hercynien',
      'L\'érosion marine d\'un ancien golf jurassique'
    ],
    correctIndex: 0,
    explanation: 'La faille de Limagne (escarpement de 30 km avec plus de 3 000 m de rejet vertical cumulé) et les 80 volcans monogéniques de la Chaîne des Puys constituent l\'exemple type d\'un rift continental d\'effondrement intracontinental, consécutif à l\'orogenèse alpine.',
    keyConcept: 'Rifting continental et volcanisme de point chaud intraplaque',
    relatedDepartmentCodes: ['63', '03']
  }
];

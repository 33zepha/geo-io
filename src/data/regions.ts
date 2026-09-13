import { Region } from '../types/geo';

export const REGIONS: Record<string, Region> = {
  '84': {
    code: '84',
    name: 'Auvergne-Rhône-Alpes',
    prefecture: 'Lyon',
    departments: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
    description: 'Deuxième région économique de France. Charnière alpine et couloir rhodanien, articulant le puissant sillon alpin (Grenoble-Chambéry-Genève), la métropole lyonnaise et les moyennes montagnes volcaniques d\'Auvergne.',
    color: '#0284c7', // Sky
  },
  '27': {
    code: '27',
    name: 'Bourgogne-Franche-Comté',
    prefecture: 'Dijon',
    departments: ['21', '25', '39', '58', '70', '71', '89', '90'],
    description: 'Territoire de transition entre Bassin parisien, sillon rhodanien et frontière suisse. Forte tradition industrielle (Belfort-Montbéliard, plasturgie), terroirs viticoles réputés et reliefs karstiques jurassiens.',
    color: '#7c3aed', // Violet
  },
  '53': {
    code: '53',
    name: 'Bretagne',
    prefecture: 'Rennes',
    departments: ['22', '29', '35', '56'],
    description: 'Péninsule armoricaine marquée par un contraste fort entre l\'Armor (littoral attractif, tourisme, cultures légumières) et l\'Argoat (intérieur bocager et agro-industriel). Métropolisation dynamique de Rennes et Brest.',
    color: '#059669', // Emerald
  },
  '24': {
    code: '24',
    name: 'Centre-Val de Loire',
    prefecture: 'Orléans',
    departments: ['18', '28', '36', '37', '41', '45'],
    description: 'Cœur céréalier de la France (Beauce), traversé par le val de Loire classé à l\'UNESCO. Économie polarisée par la Cosmetic Valley et la pharmacie, sous forte influence du bassin d\'emploi francilien.',
    color: '#d97706', // Amber
  },
  '94': {
    code: '94',
    name: 'Corse',
    prefecture: 'Ajaccio',
    departments: ['2A', '2B'],
    description: 'Montagne dans la mer aux écosystèmes fragiles. Économie dominée par le tourisme estival et l\'agropastoralisme, confrontée aux enjeux d\'insularité, de préservation littorale et de gestion des ressources hydriques.',
    color: '#dc2626', // Red
  },
  '44': {
    code: '44',
    name: 'Grand Est',
    prefecture: 'Strasbourg',
    departments: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
    description: 'Carrefour rhénan et européen majeur. Espace frontalier multipolaire (Allemagne, Benelux, Suisse), marqué par la reconversion des bassins sidérurgiques et miniers lorrains, le massif vosgien et le vignoble champenois.',
    color: '#2563eb', // Blue
  },
  '32': {
    code: '32',
    name: 'Hauts-de-France',
    prefecture: 'Lille',
    departments: ['02', '59', '60', '62', '80'],
    description: 'Région la plus jeune de France métropolitaine. Ancien cœur minier et textile en mutation vers la logistique européenne, la gigafactory vallée de la batterie et l\'agriculture intensive de grande plaine.',
    color: '#0891b2', // Cyan
  },
  '11': {
    code: '11',
    name: 'Île-de-France',
    prefecture: 'Paris',
    departments: ['75', '77', '78', '91', '92', '93', '94', '95'],
    description: 'Mégapole mondiale concentrant près de 20% de la population française et 31% du PIB national. Rayonnement tertiaire supérieur, recherche de pointe et réseau de transport hyper-centralisé (Grand Paris Express).',
    color: '#e11d48', // Rose
  },
  '28': {
    code: '28',
    name: 'Normandie',
    prefecture: 'Rouen',
    departments: ['14', '27', '50', '61', '76'],
    description: 'Façade maritime et estuaire de la Seine (Axe Seine Le Havre-Rouen-Paris). Puissance portuaire (Haropa), industries pétrochimiques et énergétiques (nucléaire, éolien offshore), bocages d\'élevage d\'excellence.',
    color: '#16a34a', // Green
  },
  '75': {
    code: '75',
    name: 'Nouvelle-Aquitaine',
    prefecture: 'Bordeaux',
    departments: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
    description: 'Plus vaste région française. Grand contraste entre la façade atlantique et la métropole bordelaise attractives, la forêt des Landes artificielle, le vignoble et les espaces intérieurs ruraux du Limousin en déprise.',
    color: '#ca8a04', // Yellow
  },
  '76': {
    code: '76',
    name: 'Occitanie',
    prefecture: 'Toulouse',
    departments: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81'],
    description: 'Région bivalente entre le bassin aéronautique toulousain et l\'arc méditerranéen montpelliérain à forte croissance démographique. Barrière pyrénéenne et plateau des Causses marqués par le pastoralisme.',
    color: '#ea580c', // Orange
  },
  '52': {
    code: '52',
    name: 'Pays de la Loire',
    prefecture: 'Nantes',
    departments: ['44', '49', '53', '72', '85'],
    description: 'Dynamisme économique porté par la métropole Nantes-Saint-Nazaire (chantiers navals, aéronautique, port autonome), l\'agroalimentaire vendéen et la densité de PME industrielles en réseau.',
    color: '#0d9488', // Teal
  },
  '93': {
    code: '93',
    name: 'Provence-Alpes-Côte d\'Azur',
    prefecture: 'Marseille',
    departments: ['04', '05', '06', '13', '83', '84'],
    description: 'Forte dualité spatiale entre un littoral ultra-urbanisé et touristique (Aix-Marseille, Nice-Sophia Antipolis, pôle pétrochimique de Fos-sur-Mer) et un arrière-pays alpin alpin clairsemé et protégé.',
    color: '#9333ea', // Purple
  },
  '01': {
    code: '01',
    name: 'Guadeloupe',
    prefecture: 'Basse-Terre',
    departments: ['971'],
    description: 'Archipel antillais des Petites Antilles. Dualité morphologique entre Grande-Terre (calcaire, canne à sucre) et Basse-Terre (volcanique avec La Soufrière, forêt tropicale). Enjeux forts d\'insularité et d\'autonomie énergétique.',
    color: '#10b981',
  },
  '02': {
    code: '02',
    name: 'Martinique',
    prefecture: 'Fort-de-France',
    departments: ['972'],
    description: 'Île volcanique de l\'arc des Petites Antilles dominée par la Montagne Pelée. Économie agro-tertiaire tournée vers le tourisme, la banane et la canne, avec des enjeux cruciaux d\'aménagement du littoral face au recul du trait de côte.',
    color: '#14b8a6',
  },
  '03': {
    code: '03',
    name: 'Guyane',
    prefecture: 'Cayenne',
    departments: ['973'],
    description: 'Plus grand département français, couvert à plus de 90% par la forêt amazonienne. Centre Spatial Guyanais (Kourou), frontière fluviale avec le Brésil (Oyapock), explosion démographique et forte jeunesse de la population.',
    color: '#22c55e',
  },
  '04': {
    code: '04',
    name: 'La Réunion',
    prefecture: 'Saint-Denis',
    departments: ['974'],
    description: 'Île de l\'océan Indien au relief extrême (Piton de la Fournaise, Piton des Neiges). Littoralisation aiguë de la population et des activités, avec des micro-climats très contrastés entre côte sous le vent et côte au vent.',
    color: '#06b6d4',
  },
  '06': {
    code: '06',
    name: 'Mayotte',
    prefecture: 'Mamoudzou',
    departments: ['976'],
    description: '101e département français depuis 2011, dans le canal du Mozambique. Lagon exceptionnel ceinturé par une double barrière de corail. Défis démographiques, migratoires et d\'accès aux infrastructures primaires uniques en Europe.',
    color: '#3b82f6',
  },
};

export interface DeptGrammar {
  code: string;
  name: string;
  withArticle: string;
  de: string;
  dans: string;
}

export const DEPARTMENT_GRAMMAR: Record<string, DeptGrammar> = {
  '01': { code: '01', name: "Ain", withArticle: "l'Ain", de: "de l'Ain", dans: "dans l'Ain" },
  '02': { code: '02', name: "Aisne", withArticle: "l'Aisne", de: "de l'Aisne", dans: "dans l'Aisne" },
  '03': { code: '03', name: "Allier", withArticle: "l'Allier", de: "de l'Allier", dans: "dans l'Allier" },
  '04': { code: '04', name: "Alpes-de-Haute-Provence", withArticle: "les Alpes-de-Haute-Provence", de: "des Alpes-de-Haute-Provence", dans: "dans les Alpes-de-Haute-Provence" },
  '05': { code: '05', name: "Hautes-Alpes", withArticle: "les Hautes-Alpes", de: "des Hautes-Alpes", dans: "dans les Hautes-Alpes" },
  '06': { code: '06', name: "Alpes-Maritimes", withArticle: "les Alpes-Maritimes", de: "des Alpes-Maritimes", dans: "dans les Alpes-Maritimes" },
  '07': { code: '07', name: "Ardèche", withArticle: "l'Ardèche", de: "de l'Ardèche", dans: "en Ardèche" },
  '08': { code: '08', name: "Ardennes", withArticle: "les Ardennes", de: "des Ardennes", dans: "dans les Ardennes" },
  '09': { code: '09', name: "Ariège", withArticle: "l'Ariège", de: "de l'Ariège", dans: "en Ariège" },
  '10': { code: '10', name: "Aube", withArticle: "l'Aube", de: "de l'Aube", dans: "dans l'Aube" },
  '11': { code: '11', name: "Aude", withArticle: "l'Aude", de: "de l'Aude", dans: "dans l'Aude" },
  '12': { code: '12', name: "Aveyron", withArticle: "l'Aveyron", de: "de l'Aveyron", dans: "en Aveyron" },
  '13': { code: '13', name: "Bouches-du-Rhône", withArticle: "les Bouches-du-Rhône", de: "des Bouches-du-Rhône", dans: "dans les Bouches-du-Rhône" },
  '14': { code: '14', name: "Calvados", withArticle: "le Calvados", de: "du Calvados", dans: "dans le Calvados" },
  '15': { code: '15', name: "Cantal", withArticle: "le Cantal", de: "du Cantal", dans: "dans le Cantal" },
  '16': { code: '16', name: "Charente", withArticle: "la Charente", de: "de la Charente", dans: "en Charente" },
  '17': { code: '17', name: "Charente-Maritime", withArticle: "la Charente-Maritime", de: "de la Charente-Maritime", dans: "en Charente-Maritime" },
  '18': { code: '18', name: "Cher", withArticle: "le Cher", de: "du Cher", dans: "dans le Cher" },
  '19': { code: '19', name: "Corrèze", withArticle: "la Corrèze", de: "de la Corrèze", dans: "en Corrèze" },
  '2A': { code: '2A', name: "Corse-du-Sud", withArticle: "la Corse-du-Sud", de: "de Corse-du-Sud", dans: "en Corse-du-Sud" },
  '2B': { code: '2B', name: "Haute-Corse", withArticle: "la Haute-Corse", de: "de Haute-Corse", dans: "en Haute-Corse" },
  '21': { code: '21', name: "Côte-d'Or", withArticle: "la Côte-d'Or", de: "de la Côte-d'Or", dans: "en Côte-d'Or" },
  '22': { code: '22', name: "Côtes-d'Armor", withArticle: "les Côtes-d'Armor", de: "des Côtes-d'Armor", dans: "dans les Côtes-d'Armor" },
  '23': { code: '23', name: "Creuse", withArticle: "la Creuse", de: "de la Creuse", dans: "en Creuse" },
  '24': { code: '24', name: "Dordogne", withArticle: "la Dordogne", de: "de la Dordogne", dans: "en Dordogne" },
  '25': { code: '25', name: "Doubs", withArticle: "le Doubs", de: "du Doubs", dans: "dans le Doubs" },
  '26': { code: '26', name: "Drôme", withArticle: "la Drôme", de: "de la Drôme", dans: "dans la Drôme" },
  '27': { code: '27', name: "Eure", withArticle: "l'Eure", de: "de l'Eure", dans: "dans l'Eure" },
  '28': { code: '28', name: "Eure-et-Loir", withArticle: "l'Eure-et-Loir", de: "d'Eure-et-Loir", dans: "en Eure-et-Loir" },
  '29': { code: '29', name: "Finistère", withArticle: "le Finistère", de: "du Finistère", dans: "dans le Finistère" },
  '30': { code: '30', name: "Gard", withArticle: "le Gard", de: "du Gard", dans: "dans le Gard" },
  '31': { code: '31', name: "Haute-Garonne", withArticle: "la Haute-Garonne", de: "de Haute-Garonne", dans: "en Haute-Garonne" },
  '32': { code: '32', name: "Gers", withArticle: "le Gers", de: "du Gers", dans: "dans le Gers" },
  '33': { code: '33', name: "Gironde", withArticle: "la Gironde", de: "de la Gironde", dans: "en Gironde" },
  '34': { code: '34', name: "Hérault", withArticle: "l'Hérault", de: "de l'Hérault", dans: "dans l'Hérault" },
  '35': { code: '35', name: "Ille-et-Vilaine", withArticle: "l'Ille-et-Vilaine", de: "d'Ille-et-Vilaine", dans: "en Ille-et-Vilaine" },
  '36': { code: '36', name: "Indre", withArticle: "l'Indre", de: "de l'Indre", dans: "dans l'Indre" },
  '37': { code: '37', name: "Indre-et-Loire", withArticle: "l'Indre-et-Loire", de: "d'Indre-et-Loire", dans: "en Indre-et-Loire" },
  '38': { code: '38', name: "Isère", withArticle: "l'Isère", de: "de l'Isère", dans: "en Isère" },
  '39': { code: '39', name: "Jura", withArticle: "le Jura", de: "du Jura", dans: "dans le Jura" },
  '40': { code: '40', name: "Landes", withArticle: "les Landes", de: "des Landes", dans: "dans les Landes" },
  '41': { code: '41', name: "Loir-et-Cher", withArticle: "le Loir-et-Cher", de: "de Loir-et-Cher", dans: "en Loir-et-Cher" },
  '42': { code: '42', name: "Loire", withArticle: "la Loire", de: "de la Loire", dans: "dans la Loire" },
  '43': { code: '43', name: "Haute-Loire", withArticle: "la Haute-Loire", de: "de Haute-Loire", dans: "en Haute-Loire" },
  '44': { code: '44', name: "Loire-Atlantique", withArticle: "la Loire-Atlantique", de: "de Loire-Atlantique", dans: "en Loire-Atlantique" },
  '45': { code: '45', name: "Loiret", withArticle: "le Loiret", de: "du Loiret", dans: "dans le Loiret" },
  '46': { code: '46', name: "Lot", withArticle: "le Lot", de: "du Lot", dans: "dans le Lot" },
  '47': { code: '47', name: "Lot-et-Garonne", withArticle: "le Lot-et-Garonne", de: "de Lot-et-Garonne", dans: "en Lot-et-Garonne" },
  '48': { code: '48', name: "Lozère", withArticle: "la Lozère", de: "de la Lozère", dans: "en Lozère" },
  '49': { code: '49', name: "Maine-et-Loire", withArticle: "le Maine-et-Loire", de: "de Maine-et-Loire", dans: "en Maine-et-Loire" },
  '50': { code: '50', name: "Manche", withArticle: "la Manche", de: "de la Manche", dans: "dans la Manche" },
  '51': { code: '51', name: "Marne", withArticle: "la Marne", de: "de la Marne", dans: "dans la Marne" },
  '52': { code: '52', name: "Haute-Marne", withArticle: "la Haute-Marne", de: "de Haute-Marne", dans: "en Haute-Marne" },
  '53': { code: '53', name: "Mayenne", withArticle: "la Mayenne", de: "de la Mayenne", dans: "en Mayenne" },
  '54': { code: '54', name: "Meurthe-et-Moselle", withArticle: "la Meurthe-et-Moselle", de: "de Meurthe-et-Moselle", dans: "en Meurthe-et-Moselle" },
  '55': { code: '55', name: "Meuse", withArticle: "la Meuse", de: "de la Meuse", dans: "dans la Meuse" },
  '56': { code: '56', name: "Morbihan", withArticle: "le Morbihan", de: "du Morbihan", dans: "dans le Morbihan" },
  '57': { code: '57', name: "Moselle", withArticle: "la Moselle", de: "de la Moselle", dans: "en Moselle" },
  '58': { code: '58', name: "Nièvre", withArticle: "la Nièvre", de: "de la Nièvre", dans: "dans la Nièvre" },
  '59': { code: '59', name: "Nord", withArticle: "le Nord", de: "du Nord", dans: "dans le Nord" },
  '60': { code: '60', name: "Oise", withArticle: "l'Oise", de: "de l'Oise", dans: "dans l'Oise" },
  '61': { code: '61', name: "Orne", withArticle: "l'Orne", de: "de l'Orne", dans: "dans l'Orne" },
  '62': { code: '62', name: "Pas-de-Calais", withArticle: "le Pas-de-Calais", de: "du Pas-de-Calais", dans: "dans le Pas-de-Calais" },
  '63': { code: '63', name: "Puy-de-Dôme", withArticle: "le Puy-de-Dôme", de: "du Puy-de-Dôme", dans: "dans le Puy-de-Dôme" },
  '64': { code: '64', name: "Pyrénées-Atlantiques", withArticle: "les Pyrénées-Atlantiques", de: "des Pyrénées-Atlantiques", dans: "dans les Pyrénées-Atlantiques" },
  '65': { code: '65', name: "Hautes-Pyrénées", withArticle: "les Hautes-Pyrénées", de: "des Hautes-Pyrénées", dans: "dans les Hautes-Pyrénées" },
  '66': { code: '66', name: "Pyrénées-Orientales", withArticle: "les Pyrénées-Orientales", de: "des Pyrénées-Orientales", dans: "dans les Pyrénées-Orientales" },
  '67': { code: '67', name: "Bas-Rhin", withArticle: "le Bas-Rhin", de: "du Bas-Rhin", dans: "dans le Bas-Rhin" },
  '68': { code: '68', name: "Haut-Rhin", withArticle: "le Haut-Rhin", de: "du Haut-Rhin", dans: "dans le Haut-Rhin" },
  '69': { code: '69', name: "Rhône", withArticle: "le Rhône", de: "du Rhône", dans: "dans le Rhône" },
  '70': { code: '70', name: "Haute-Saône", withArticle: "la Haute-Saône", de: "de Haute-Saône", dans: "en Haute-Saône" },
  '71': { code: '71', name: "Saône-et-Loire", withArticle: "la Saône-et-Loire", de: "de Saône-et-Loire", dans: "en Saône-et-Loire" },
  '72': { code: '72', name: "Sarthe", withArticle: "la Sarthe", de: "de la Sarthe", dans: "dans la Sarthe" },
  '73': { code: '73', name: "Savoie", withArticle: "la Savoie", de: "de la Savoie", dans: "en Savoie" },
  '74': { code: '74', name: "Haute-Savoie", withArticle: "la Haute-Savoie", de: "de Haute-Savoie", dans: "en Haute-Savoie" },
  '75': { code: '75', name: "Paris", withArticle: "Paris", de: "de Paris", dans: "à Paris" },
  '76': { code: '76', name: "Seine-Maritime", withArticle: "la Seine-Maritime", de: "de Seine-Maritime", dans: "en Seine-Maritime" },
  '77': { code: '77', name: "Seine-et-Marne", withArticle: "la Seine-et-Marne", de: "de Seine-et-Marne", dans: "en Seine-et-Marne" },
  '78': { code: '78', name: "Yvelines", withArticle: "les Yvelines", de: "des Yvelines", dans: "dans les Yvelines" },
  '79': { code: '79', name: "Deux-Sèvres", withArticle: "les Deux-Sèvres", de: "des Deux-Sèvres", dans: "dans les Deux-Sèvres" },
  '80': { code: '80', name: "Somme", withArticle: "la Somme", de: "de la Somme", dans: "dans la Somme" },
  '81': { code: '81', name: "Tarn", withArticle: "le Tarn", de: "du Tarn", dans: "dans le Tarn" },
  '82': { code: '82', name: "Tarn-et-Garonne", withArticle: "le Tarn-et-Garonne", de: "de Tarn-et-Garonne", dans: "en Tarn-et-Garonne" },
  '83': { code: '83', name: "Var", withArticle: "le Var", de: "du Var", dans: "dans le Var" },
  '84': { code: '84', name: "Vaucluse", withArticle: "le Vaucluse", de: "du Vaucluse", dans: "dans le Vaucluse" },
  '85': { code: '85', name: "Vendée", withArticle: "la Vendée", de: "de la Vendée", dans: "en Vendée" },
  '86': { code: '86', name: "Vienne", withArticle: "la Vienne", de: "de la Vienne", dans: "dans la Vienne" },
  '87': { code: '87', name: "Haute-Vienne", withArticle: "la Haute-Vienne", de: "de Haute-Vienne", dans: "en Haute-Vienne" },
  '88': { code: '88', name: "Vosges", withArticle: "les Vosges", de: "des Vosges", dans: "dans les Vosges" },
  '89': { code: '89', name: "Yonne", withArticle: "l'Yonne", de: "de l'Yonne", dans: "dans l'Yonne" },
  '90': { code: '90', name: "Territoire de Belfort", withArticle: "le Territoire de Belfort", de: "du Territoire de Belfort", dans: "dans le Territoire de Belfort" },
  '91': { code: '91', name: "Essonne", withArticle: "l'Essonne", de: "de l'Essonne", dans: "en Essonne" },
  '92': { code: '92', name: "Hauts-de-Seine", withArticle: "les Hauts-de-Seine", de: "des Hauts-de-Seine", dans: "dans les Hauts-de-Seine" },
  '93': { code: '93', name: "Seine-Saint-Denis", withArticle: "la Seine-Saint-Denis", de: "de Seine-Saint-Denis", dans: "en Seine-Saint-Denis" },
  '94': { code: '94', name: "Val-de-Marne", withArticle: "le Val-de-Marne", de: "du Val-de-Marne", dans: "dans le Val-de-Marne" },
  '95': { code: '95', name: "Val-d'Oise", withArticle: "le Val-d'Oise", de: "du Val-d'Oise", dans: "dans le Val-d'Oise" },
  '971': { code: '971', name: "Guadeloupe", withArticle: "la Guadeloupe", de: "de la Guadeloupe", dans: "en Guadeloupe" },
  '972': { code: '972', name: "Martinique", withArticle: "la Martinique", de: "de la Martinique", dans: "en Martinique" },
  '973': { code: '973', name: "Guyane", withArticle: "la Guyane", de: "de la Guyane", dans: "en Guyane" },
  '974': { code: '974', name: "La Réunion", withArticle: "La Réunion", de: "de La Réunion", dans: "à La Réunion" },
  '976': { code: '976', name: "Mayotte", withArticle: "Mayotte", de: "de Mayotte", dans: "à Mayotte" },
};

export function getDeptGrammar(code: string): DeptGrammar {
  return DEPARTMENT_GRAMMAR[code] || {
    code,
    name: code,
    withArticle: code,
    de: `du ${code}`,
    dans: `dans le ${code}`,
  };
}

export function getRegionGrammar(regionName: string): { withArticle: string; dans: string; de: string } {
  switch (regionName) {
    case 'Auvergne-Rhône-Alpes':
      return { withArticle: "l'Auvergne-Rhône-Alpes", dans: "en Auvergne-Rhône-Alpes", de: "d'Auvergne-Rhône-Alpes" };
    case 'Bourgogne-Franche-Comté':
      return { withArticle: "la Bourgogne-Franche-Comté", dans: "en Bourgogne-Franche-Comté", de: "de Bourgogne-Franche-Comté" };
    case 'Bretagne':
      return { withArticle: "la Bretagne", dans: "en Bretagne", de: "de Bretagne" };
    case 'Centre-Val de Loire':
      return { withArticle: "le Centre-Val de Loire", dans: "en Centre-Val de Loire", de: "du Centre-Val de Loire" };
    case 'Corse':
      return { withArticle: "la Corse", dans: "en Corse", de: "de Corse" };
    case 'Grand Est':
      return { withArticle: "le Grand Est", dans: "dans le Grand Est", de: "du Grand Est" };
    case 'Hauts-de-France':
      return { withArticle: "les Hauts-de-France", dans: "dans les Hauts-de-France", de: "des Hauts-de-France" };
    case 'Île-de-France':
      return { withArticle: "l'Île-de-France", dans: "en Île-de-France", de: "d'Île-de-France" };
    case 'Normandie':
      return { withArticle: "la Normandie", dans: "en Normandie", de: "de Normandie" };
    case 'Nouvelle-Aquitaine':
      return { withArticle: "la Nouvelle-Aquitaine", dans: "en Nouvelle-Aquitaine", de: "de Nouvelle-Aquitaine" };
    case 'Occitanie':
      return { withArticle: "l'Occitanie", dans: "en Occitanie", de: "d'Occitanie" };
    case 'Pays de la Loire':
      return { withArticle: "les Pays de la Loire", dans: "dans les Pays de la Loire", de: "des Pays de la Loire" };
    case "Provence-Alpes-Côte d'Azur":
      return { withArticle: "la région Provence-Alpes-Côte d'Azur", dans: "en Provence-Alpes-Côte d'Azur", de: "de Provence-Alpes-Côte d'Azur" };
    default:
      return { withArticle: regionName, dans: `en ${regionName}`, de: `de ${regionName}` };
  }
}

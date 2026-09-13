const fs = require('fs');

// Full reference dataset for the 101 French departments
// Includes code, name, prefecture, region, regionCode, population, density, area, relief, hydro, specialties, academicFact
const DEPT_RAW = [
  {
    code: "01", name: "Ain", pref: "Bourg-en-Bresse", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 663200, density: 115, area: 5762,
    relief: "Plaine de la Bresse, plateau de la Dombes, faisceau du Jura méridional (Grand Colombier 1 534 m)",
    hydro: ["Rhône", "Ain", "Saône"],
    spec: ["Volaille de Bresse AOP", "Plasturgie (Oyonnax)", "Comté AOP"],
    fact: "Territoire carrefour combinant la haute valeur ajoutée de la Plastics Vallée d'Oyonnax, l'aviculture d'excellence en Bresse et la périurbanisation sous influence de la métropole lyonnaise et du pôle genevois."
  },
  {
    code: "02", name: "Aisne", pref: "Laon", region: "Hauts-de-France", regCode: "32",
    pop: 527000, density: 72, area: 7369,
    relief: "Plaines céréalières de Picardie, collines du Laonnois et contreforts boisés de Thiérache",
    hydro: ["Aisne", "Oise", "Marne"],
    spec: ["Betterave sucrière", "Blé", "Maroilles AOP", "Champagne de l'Aisne"],
    fact: "Espace tampon entre le Bassin parisien et les zones industrielles du Nord, la Thiérache illustre la transition vers le bocage herbager face à la prédominance de l'openfield céréalier dans le reste du département."
  },
  {
    code: "03", name: "Allier", pref: "Moulins", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 334800, density: 46, area: 7340,
    relief: "Bocage bourbonnais, plaine de la Limagne bourbonnaise et contreforts des Combrailles",
    hydro: ["Allier", "Cher", "Loire"],
    spec: ["Élevage charolais", "Thermalisme (Vichy)", "Chêne de Tronçais"],
    fact: "Constituant historique du Bourbonnais, l'Allier présente un réseau urbain tripolaire atypique sans primauté marquée entre Moulins (administrative), Montluçon (industrielle) et Vichy (touristique et thermale)."
  },
  {
    code: "04", name: "Alpes-de-Haute-Provence", pref: "Digne-les-Bains", region: "Provence-Alpes-Côte d'Azur", regCode: "93",
    pop: 165000, density: 24, area: 6925,
    relief: "Préalpes de Digne, plateau de Valensole, hautes vallées de l'Ubaye et du Verdon",
    hydro: ["Durance", "Verdon", "Bléone"],
    spec: ["Lavande", "Huile d'olive de Haute-Provence", "Énergie hydroélectrique"],
    fact: "Parangon de la moyenne montagne méditerranéenne en déprise agricole transformée par l'agritourisme, il abrite à Cadarache le réacteur expérimental international de fusion nucléaire ITER sur les rives de la Durance."
  },
  {
    code: "05", name: "Hautes-Alpes", pref: "Gap", region: "Provence-Alpes-Côte d'Azur", regCode: "93",
    pop: 141000, density: 25, area: 5549,
    relief: "Massif des Écrins (Barre des Écrins 4 102 m), Queyras, Dévoluy",
    hydro: ["Durance", "Drac", "Guil"],
    spec: ["Tourisme de sports d'hiver (Serre-Chevalier)", "Vergers de la Durance", "Pastoralisme"],
    fact: "Département le plus élevé de France en altitude moyenne, son organisation spatiale repose sur le corridor de la Durance, le barrage de Serre-Ponçon (château d'eau de la Provence) et une forte dépendance à l'or blanc."
  },
  {
    code: "06", name: "Alpes-Maritimes", pref: "Nice", region: "Provence-Alpes-Côte d'Azur", regCode: "93",
    pop: 1100000, density: 256, area: 4299,
    relief: "Plongeon des Alpes dans la mer Méditerranée, massif du Mercantour (Cime du Gélas 3 143 m)",
    hydro: ["Var", "Roya", "Siagne"],
    spec: ["Tourisme de luxe", "Technopole (Sophia Antipolis)", "Parfumerie (Grasse)"],
    fact: "Incarnation du gradient altitudinal extrême : en moins de 40 km, on passe d'une riviera sur-urbanisée et touristique à l'isolement des vallées alpines (Vésubie, Tinée, Roya) vulnérables aux épisodes méditerranéens intenses."
  },
  {
    code: "07", name: "Ardèche", pref: "Privas", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 328000, density: 59, area: 5529,
    relief: "Plateau basaltique du Coiron, Cévennes ardéchoises, gorges calcaires de l'Ardèche",
    hydro: ["Ardèche", "Rhône", "Chassezac"],
    spec: ["Châtaigne d'Ardèche AOP", "Tourisme spéléo/nature", "Bassin papetier d'Annonay"],
    fact: "Privas est la plus petite préfecture de France métropolitaine sans gare ferroviaire voyageurs. Le département oppose un haut-plateau rural et forestier à un bas-plateau karstique voué au tourisme de masse des gorges."
  },
  {
    code: "08", name: "Ardennes", pref: "Charleville-Mézières", region: "Grand Est", regCode: "44",
    pop: 268000, density: 51, area: 5229,
    relief: "Massif schisteux ardennais hercynien, méandres encaissés de la Meuse, plaine de Champagne crayeuse au sud",
    hydro: ["Meuse", "Aisne", "Semois"],
    spec: ["Métallurgie et fonderie de précision", "Bière ardennaise", "Sylviculture"],
    fact: "Vallée de la Meuse hautement industrialisée au XIXe siècle, les Ardennes affrontent de lourdes restructurations industrielles et illustrent la désindustrialisation des marges frontalières du nord-est."
  },
  {
    code: "09", name: "Ariège", pref: "Foix", region: "Occitanie", regCode: "76",
    pop: 154000, density: 31, area: 4890,
    relief: "Chaîne axiale pyrénéenne (Pique d'Estats 3 143 m), piémont du Plantaurel, grottes karstiques",
    hydro: ["Ariège", "Hers-Vif", "Salat"],
    spec: ["Talc de Luzenac (plus grande carrière mondiale)", "Pastoralisme", "Hydroélectricité"],
    fact: "Territoire de résistance rurale et de néo-ruralité marquée, structuré par la vallée industrielle de l'Ariège reliant Toulouse à l'Andorre et la carrière géante de talc de Trimouns."
  },
  {
    code: "10", name: "Aube", pref: "Troyes", region: "Grand Est", regCode: "44",
    pop: 311000, density: 52, area: 6004,
    relief: "Champagne crayeuse ondulée, collines du pays d'Othe et côte des Bar calcaire",
    hydro: ["Seine", "Aube", "Grands Lacs de la forêt d'Orient"],
    spec: ["Champagne (Côte des Bar)", "Maille et textile (magasins d'usine de Troyes)", "Chou à choucroute"],
    fact: "La Côte des Bar représente un quart de l'appellation Champagne. Les lacs-réservoirs d'Orient et du Der protègent la région parisienne des crues de la Seine tout en soutenant le débit d'étiage estival."
  },
  {
    code: "11", name: "Aude", pref: "Carcassonne", region: "Occitanie", regCode: "76",
    pop: 375000, density: 61, area: 6139,
    relief: "Couloir du sillon audois entre Massif central (Montagne Noire) et Pyrénées (Corbières)",
    hydro: ["Aude", "Fresquel", "Canal du Midi"],
    spec: ["Vins des Corbières et Minervois", "Tourisme patrimonial (Cité de Carcassonne)", "Parcs éoliens"],
    fact: "Le couloir du seuil de Naurouze / Carcassonne est le défilé venteux historique reliant Méditerranée et Atlantique, au cœur de l'éolien français et des flux de transport est-ouest."
  },
  {
    code: "12", name: "Aveyron", pref: "Rodez", region: "Occitanie", regCode: "76",
    pop: 279500, density: 32, area: 8735,
    relief: "Grands Causses calcaires, plateau volcanique de l'Aubrac, gorges du Tarn et de la Jonte",
    hydro: ["Lot", "Aveyron", "Tarn", "Truyère"],
    spec: ["Roquefort AOP", "Coutellerie de Laguiole", "Viaduc de Millau"],
    fact: "Cinquième plus vaste département de métropole, il illustre la réussite du modèle agricole familial coopératif (rayonnement mondial du Roquefort) et le désenclavement par l'A75 et le viaduc de Millau."
  },
  {
    code: "13", name: "Bouches-du-Rhône", pref: "Marseille", region: "Provence-Alpes-Côte d'Azur", regCode: "93",
    pop: 2050000, density: 403, area: 5087,
    relief: "Delta de Camargue, chaîne des Alpilles, massif de la Sainte-Victoire et calanques",
    hydro: ["Rhône (Grand et Petit Rhône)", "Durance", "Étang de Berre"],
    spec: ["Grand Port Maritime de Marseille-Fos", "Riz de Camargue", "Pétrochimie et logistique"],
    fact: "Concentration extrême d'enjeux territoriaux : zone industrialo-portuaire majeure d'Europe (Fos-Berre), deuxième métropole française en restructuration, et zone humide fragile protégée de Camargue."
  },
  {
    code: "14", name: "Calvados", pref: "Caen", region: "Normandie", regCode: "28",
    pop: 700000, density: 126, area: 5548,
    relief: "Plaine céréalière de Caen, bocage du pays d'Auge, Suisse normande et côte de Nacre",
    hydro: ["Orne", "Touques", "Dives"],
    spec: ["Élevage équin (haras de trotteurs/pur-sang)", "Fromages normands (Camembert, Livarot)", "Tourisme mémoriel 1944"],
    fact: "Articulé autour de la plaine de Caen reconstruite et de la Côte Fleurie touristique (Deauville), le Calvados est le leader mondial de la filière équine et de l'élevage des chevaux de course."
  },
  {
    code: "15", name: "Cantal", pref: "Aurillac", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 144000, density: 25, area: 5726,
    relief: "Plus grand stratovolcan d'Europe (Plomb du Cantal 1 855 m, Puy Mary 1 783 m), plateaux du Cézallier",
    hydro: ["Cère", "Alagnon", "Truyère"],
    spec: ["Fromage Cantal et Salers AOP", "Fabrication de parapluies (Aurillac)", "Viande Salers"],
    fact: "Modèle géographique de stratovolcan démantelé par l'érosion glaciaire en vallées radioconcentriques. Aurillac détient la moitié de la production française de parapluies."
  },
  {
    code: "16", name: "Charente", pref: "Angoulême", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 350000, density: 59, area: 5956,
    relief: "Plateaux calcaires angoumoisins, bassin viticole de Cognac, marges du Massif central",
    hydro: ["Charente", "Vienne", "Touvre"],
    spec: ["Cognac (export mondial)", "Bande dessinée et image numérique (Angoulême)", "Tuilerie et céramique"],
    fact: "Le vignoble de Cognac (Charente et Charente-Maritime) constitue l'un des premiers postes d'exportation agroalimentaire de France en valeur, principalement tourné vers les marchés américain et asiatique."
  },
  {
    code: "17", name: "Charente-Maritime", pref: "La Rochelle", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 660000, density: 96, area: 6864,
    relief: "Marais atlantiques (Marais poitevin), estuaire de la Gironde, îles de Ré, d'Oléron et d'Aix",
    hydro: ["Charente", "Sèvre Niortaise", "Gironde"],
    spec: ["Ostréiculture (Marennes-Oléron)", "Nautisme (La Rochelle)", "Tourisme balnéaire"],
    fact: "Deuxième département touristique de France métropolitaine sur l'Atlantique, il subit une forte pression littorale, des conflits d'usage sur l'eau (bassines dans le Marais poitevin) et le risque de submersion (tempête Xynthia)."
  },
  {
    code: "18", name: "Cher", pref: "Bourges", region: "Centre-Val de Loire", regCode: "24",
    pop: 300000, density: 41, area: 7235,
    relief: "Champagne berrichonne calcaire, collines du Sancerrois et bocage boisé du Boischaut",
    hydro: ["Cher", "Loire", "Yèvre"],
    spec: ["Vins de Sancerre", "Crottin de Chavignol", "Industrie d'armement et aéronautique (Bourges)"],
    fact: "Centre géographique de la France (Bruère-Allichamps), le Cher est marqué par la dualité entre l'agriculture céréalière de rente sur les riches terres calcaires et l'industrie de pointe liée à la défense nationale."
  },
  {
    code: "19", name: "Corrèze", pref: "Tulle", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 240000, density: 41, area: 5860,
    relief: "Plateau de Millevaches (« château d'eau »), gorges de la Dordogne, bassin sédimentaire de Brive",
    hydro: ["Dordogne", "Corrèze", "Vézère"],
    spec: ["Élevage bovin limousin", "Pomme du Limousin AOP", "Industrie mécanique et agroalimentaire"],
    fact: "Le bassin de Brive-la-Gaillarde contraste vivement avec la moyenne montagne granitique de Haute-Corrèze par son dynamisme logistique (croisement A20/A89) et son climat doux méridional."
  },
  {
    code: "2A", name: "Corse-du-Sud", pref: "Ajaccio", region: "Corse", regCode: "94",
    pop: 160000, density: 40, area: 4014,
    relief: "Arête granitique centrale, calanques de Piana, falaises calcaires de Bonifacio",
    hydro: ["Gravona", "Prunelli", "Taravo"],
    spec: ["Charcuterie corse AOP", "Tourisme nautique", "Agrumes"],
    fact: "Île-montagne marquée par l'hypertourisme estival et la saturation des infrastructures routières et portuaires, avec une concentration démographique majeure dans l'agglomération ajaccienne."
  },
  {
    code: "2B", name: "Haute-Corse", pref: "Bastia", region: "Corse", regCode: "94",
    pop: 182000, density: 39, area: 4666,
    relief: "Corse schisteuse au nord-est (Castagniccia), Cap Corse, plaine orientale alluviale, Monte Cinto (2 706 m)",
    hydro: ["Golo", "Tavignano"],
    spec: ["Vin de Patrimonio", "Clémentine de Corse IGP", "Châtaigneraie"],
    fact: "La plaine orientale constitue le principal grenier agricole de l'île (agrumes, kiwis, vignes) assaini au milieu du XXe siècle, tandis que la Castagniccia témoigne de l'ancienne surdensité rurale agroforestière."
  },
  {
    code: "21", name: "Côte-d'Or", pref: "Dijon", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 535000, density: 61, area: 8763,
    relief: "Seuil de Bourgogne, cuesta de la Côte viticole (Côte de Nuits et de Beaune), plateau de Langres",
    hydro: ["Saône", "Seine (sources)", "Ouche"],
    spec: ["Grands crus de Bourgogne (Climats UNESCO)", "Moutarde et cassis de Dijon", "Pôle agroalimentaire"],
    fact: "Ligne de partage des eaux majeure entre Méditerranée, Atlantique et Manche, la Côte-d'Or doit sa prospérité historique à ce rôle d'isthme européen et à la valorisation exceptionnelle de son terroir géologique viticole."
  },
  {
    code: "22", name: "Côtes-d'Armor", pref: "Saint-Brieuc", region: "Bretagne", regCode: "53",
    pop: 605000, density: 88, area: 6878,
    relief: "Plateau armoricain échancré de rias (abers), côte de Granit Rose, côte d'Émeraude",
    hydro: ["Rance", "Trieux", "Gouët"],
    spec: ["Élevage porcin et avicole", "Coquille Saint-Jacques de la baie de Saint-Brieuc", "Légumes de plein champ"],
    fact: "Premier pôle agro-industriel de l'élevage intensif français, le département est au centre des débats environnementaux sur les marées vertes provoquées par les rejets azotés dans les baies peu profondes."
  },
  {
    code: "23", name: "Creuse", pref: "Guéret", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 115000, density: 21, area: 5565,
    relief: "Pénéplaine granitique du Massif central, plateau de Millevaches, monts de Guéret",
    hydro: ["Creuse", "Gartempe", "Taurion"],
    spec: ["Élevage bovin allaitant (broutards limousins)", "Tapisserie d'Aubusson (UNESCO)", "Bois et forêt"],
    fact: "Symbole de la 'diagonale du vide' et du vieillissement démographique de l'hyper-ruralité française, la Creuse développe de nouvelles stratégies d'accueil fondées sur la qualité paysagère et le télétravail."
  },
  {
    code: "24", name: "Dordogne", pref: "Périgueux", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 415000, density: 46, area: 9060,
    relief: "Périgord calcaire karstique, vallées encaissées de la Dordogne et de la Vézère, Périgord vert bocager",
    hydro: ["Dordogne", "Vézère", "Isle"],
    spec: ["Truffe noire du Périgord", "Foie gras", "Tourisme préhistorique (Lascaux)"],
    fact: "Troisième département de métropole par la surface, la 'Vallée de l'Homme' concentre une densité inégalée au monde de sites paléolithiques inscrits au patrimoine mondial UNESCO."
  },
  {
    code: "25", name: "Doubs", pref: "Besançon", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 545000, density: 104, area: 5234,
    relief: "Plateaux jurassiens étagés, cluses karstiques, mont d'Or (1 463 m)",
    hydro: ["Doubs", "Ognon", "Loue"],
    spec: ["Horlogerie et microtechniques (Besançon)", "Automobile (Sochaux/Stellantis)", "Saucisse de Morteau"],
    fact: "Berceau industriel automobile (berceau de Peugeot à Sochaux-Montbéliard) adossé à un élevage laitier montbéliard d'élite pour la filière Comté, le Doubs bénéficie d'une forte manne frontalière avec la Suisse."
  },
  {
    code: "26", name: "Drôme", pref: "Valence", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 520000, density: 79, area: 6530,
    relief: "Couloir rhodanien, barrière calcaire du Vercors occidental, Baronnies provençales",
    hydro: ["Rhône", "Drôme", "Isère"],
    spec: ["Agriculture biologique (1er département bio de France)", "Nougat de Montélimar", "Nucléaire (Tricastin)"],
    fact: "Véritable frontière bioclimatique marquant le passage du tempéré au méditerranéen (l'olivier apparaît au sud de Valence), la Drôme est pionnière nationale de la transition agro-écologique."
  },
  {
    code: "27", name: "Eure", pref: "Évreux", region: "Normandie", regCode: "28",
    pop: 600000, density: 100, area: 6040,
    relief: "Plateaux de Saint-André et du Neubourg, boucles de la Seine et vallées encaissées",
    hydro: ["Seine", "Eure", "Risle"],
    spec: ["Culture du lin textile", "Industrie pharmaceutique (Cosmetic Valley)", "Plasturgie"],
    fact: "Principal producteur mondial de lin textile de haute qualité avec la Seine-Maritime, l'Eure combine d'immenses plateaux de limons fertiles et l'attraction logistique du couloir séquanien."
  },
  {
    code: "28", name: "Eure-et-Loir", pref: "Chartres", region: "Centre-Val de Loire", regCode: "24",
    pop: 432000, density: 73, area: 5880,
    relief: "Plaine de Beauce (le 'grenier de la France'), Perche vallonné et bocager",
    hydro: ["Eure", "Loir", "Huisne"],
    spec: ["Céréaliculture intensive", "Cosmetic Valley", "Pôle logistique francilien"],
    fact: "La cathédrale de Chartres s'érige comme un phare au milieu de l'immense openfield de Beauce, aujourd'hui confronté aux défis de la transition agro-industrielle et de la gestion des nappes d'eau profondes."
  },
  {
    code: "29", name: "Finistère", pref: "Quimper", region: "Bretagne", regCode: "53",
    pop: 915000, density: 135, area: 6733,
    relief: "Point culminant breton des Monts d'Arrée (Roc'h Ruz 385 m), pointe du Raz, presqu'île de Crozon",
    hydro: ["Aulne", "Odet", "Élorn"],
    spec: ["Pêche hauturière et artisanale", "Base navale des sous-marins nucléaires (Île Longue)", "Maraîchage"],
    fact: "Finis Terrae : plus longue façade maritime départementale de France (1 200 km de côtes). Brest y abrite le commandement de la Force Océanique Stratégique et le pôle mondial des sciences marines."
  },
  {
    code: "30", name: "Gard", pref: "Nîmes", region: "Occitanie", regCode: "76",
    pop: 750000, density: 128, area: 5853,
    relief: "Cévennes schisteuses (Mont Aigoual 1 565 m), garrigues nîmoises, plaine littorale de Petite Camargue",
    hydro: ["Rhône", "Gardon", "Cèze", "Vidourle"],
    spec: ["Oignon doux des Cévennes AOP", "Pont du Gard (UNESCO)", "Vignoble des Costières de Nîmes"],
    fact: "Territoire soumis aux redoutables 'épisodes cévenols', où des masses d'air marin chaud se heurtent au relief et déversent des centaines de millimètres de pluie en quelques heures sur les bassins des Gardons."
  },
  {
    code: "31", name: "Haute-Garonne", pref: "Toulouse", region: "Occitanie", regCode: "76",
    pop: 1435000, density: 227, area: 6309,
    relief: "Plaine alluviale de la Garonne, coteaux du Lauragais, haute chaîne pyrénéenne (Pic de Perdiguère 3 222 m)",
    hydro: ["Garonne", "Ariège", "Canal du Midi"],
    spec: ["Capitale européenne de l'aéronautique (Airbus)", "Spatial (CNES)", "Semences et céréales"],
    fact: "Modèle de macrocéphalie régionale : l'aire d'attraction toulousaine concentre l'essentiel de la démographie et de la création de valeur autour du pôle mondial aérospatial et de recherche universitaire."
  },
  {
    code: "32", name: "Gers", pref: "Auch", region: "Occitanie", regCode: "76",
    pop: 192000, density: 31, area: 6257,
    relief: "Coteaux de Gascogne en éventail, piémont pyrénéen (plateau de Lannemezan)",
    hydro: ["Baïse", "Gers", "Save"],
    spec: ["Canard gras et foie gras", "Armagnac", "Polyculture-élevage"],
    fact: "Cœur emblématique de la Gascogne rurale, structuré par les vallées radioconcentriques descendant du plateau de Lannemezan, le Gers affiche une longévité record et une forte identité gastronomique."
  },
  {
    code: "33", name: "Gironde", pref: "Bordeaux", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 1650000, density: 165, area: 10000,
    relief: "Plus vaste département de métropole (10 000 km²), massif forestier des Landes, dune du Pilat (106 m)",
    hydro: ["Garonne", "Dordogne", "Gironde (plus grand estuaire d'Europe)"],
    spec: ["Vins de Bordeaux (classement 1855)", "Sylviculture du pin maritime", "Aéronautique et laser"],
    fact: "L'estuaire de la Gironde, né de la confluence Garonne-Dordogne au bec d'Ambès, structure un géosystème unique entre vignobles de prestige (Médoc, Saint-Émilion) et le massif de pinède des Landes de Gascogne."
  },
  {
    code: "34", name: "Hérault", pref: "Montpellier", region: "Occitanie", regCode: "76",
    pop: 1200000, density: 196, area: 6101,
    relief: "Amphithéâtre descendant du Larzac et de l'Espinouse vers les étangs littoraux (Thau) et la Méditerranée",
    hydro: ["Hérault", "Orb", "Lez"],
    spec: ["Conchyliculture (huîtres de Bouzigues)", "Vignoble languedocien", "Pôle universitaire et high-tech"],
    fact: "Croissance démographique record de l'arc méditerranéen portée par l'héliotropisme et l'attractivité de Montpellier, posant des défis d'artificialisation des sols et de gestion de l'eau en milieu lagunaire."
  },
  {
    code: "35", name: "Ille-et-Vilaine", pref: "Rennes", region: "Bretagne", regCode: "53",
    pop: 1100000, density: 162, area: 6775,
    relief: "Bassin sédimentaire rennais cerné de plateaux schisteux, baie du Mont-Saint-Michel",
    hydro: ["Vilaine", "Ille", "Rance"],
    spec: ["Télécoms et cybersécurité", "Agroalimentaire", "Automobile"],
    fact: "Moteur économique breton, Rennes s'affirme comme capitale régionale de la tech et des télécoms tout en captant l'essentiel de la croissance de la population bretonne via la LGV Paris-Rennes en 1h25."
  },
  {
    code: "36", name: "Indre", pref: "Châteauroux", region: "Centre-Val de Loire", regCode: "24",
    pop: 218000, density: 32, area: 6791,
    relief: "Champagne berrichonne céréalière, pays des mille étangs de la Brenne, Boischaut sud",
    hydro: ["Indre", "Creuse", "Claise"],
    spec: ["Lentille verte du Berry", "Fromage Valençay AOP", "Aéroport de fret de Châteauroux"],
    fact: "Le Parc Naturel Régional de la Brenne compte plus de 3 000 étangs créés par les moines au Moyen Âge, constituant l'une des zones humides continentales les plus riches d'Europe pour l'avifaune."
  },
  {
    code: "37", name: "Indre-et-Loire", pref: "Tours", region: "Centre-Val de Loire", regCode: "24",
    pop: 610000, density: 100, area: 6127,
    relief: "Vallée de la Loire (tuffeau blanc), plateaux de Touraine, confluences majeures",
    hydro: ["Loire", "Cher", "Indre", "Vienne"],
    spec: ["Châteaux de la Loire", "Vins de Touraine (Chinon, Vouvray)", "Nucléaire (Chinon)"],
    fact: "Le 'jardin de la France' est le carrefour hydrographique de la Loire moyenne, où le fleuve royal reçoit le Cher, l'Indre et la Vienne, berceau des résidences royales Renaissance en tuffeau."
  },
  {
    code: "38", name: "Isère", pref: "Grenoble", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 1285000, density: 173, area: 7431,
    relief: "Massif de Belledonne, Vercors, Chartreuse, Oisans, plaine du Nord-Isère",
    hydro: ["Isère", "Drac", "Rhône"],
    spec: ["Nanotechnologies et semi-conducteurs (Crolles)", "Noix de Grenoble AOP", "Tourisme alpin"],
    fact: "Grenoble, capitale des Alpes, a transformé son héritage de l'hydroélectricité ('la houille blanche' d'Aristide Bergès) en premier écosystème européen de microélectronique et de recherche nucléaire civile."
  },
  {
    code: "39", name: "Jura", pref: "Lons-le-Saunier", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 260000, density: 52, area: 4999,
    relief: "Plateaux jurassiens étagés, reculées calcaires (Baume-les-Messieurs), Haut-Jura (Crêt Pela 1 495 m)",
    hydro: ["Ain", "Doubs", "Bienne"],
    spec: ["Vin jaune et Comté AOP", "Lunetterie (Morez)", "Jouet en bois"],
    fact: "Les 'reculées' jurassiennes sont des formes d'érosion karstique spectaculaires où des falaises abruptes entaillent le plateau calcaire pour donner naissance à des résurgences vauclusiennes majeures."
  },
  {
    code: "40", name: "Landes", pref: "Mont-de-Marsan", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 420000, density: 45, area: 9243,
    relief: "Plus vaste forêt cultivée d'Europe occidentale (pin maritime), côte d'Argent rectiligne, étangs rétro-littoraux",
    hydro: ["Adour", "Leyre", "Gave de Pau"],
    spec: ["Filière bois et papier", "Thermalisme (Dax)", "Canard gras et poulet de Saint-Sever"],
    fact: "Née de la loi d'assainissement de 1857 sous Napoléon III, la pinède landaise a transformé un marécage insalubre en premier massif forestier industriel français, aujourd'hui confronté aux mégafeux estivaux."
  },
  {
    code: "41", name: "Loir-et-Cher", pref: "Blois", region: "Centre-Val de Loire", regCode: "24",
    pop: 330000, density: 52, area: 6343,
    relief: "Plaine de Beauce au nord, vallée de la Loire, landes et étangs giboyeux de Sologne au sud",
    hydro: ["Loire", "Cher", "Loir"],
    spec: ["Château de Chambord", "Fromage de chèvre Selles-sur-Cher", "Fraisiculture en Sologne"],
    fact: "La Sologne, autrefois zone marécageuse pauvre, a été aménagée sous le Second Empire pour devenir le premier espace cynégétique et forestier privé de villégiature de l'élite économique française."
  },
  {
    code: "42", name: "Loire", pref: "Saint-Étienne", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 770000, density: 161, area: 4781,
    relief: "Gorges de la Loire, plaine du Forez, monts du Pilat (Crêt de la Perdrix 1 432 m)",
    hydro: ["Loire", "Furan", "Gier"],
    spec: ["Design et mécanique de pointe (Saint-Étienne Cité du Design)", "Fourme de Montbrison AOP", "Chocolat"],
    fact: "Ancienne capitale de l'arme, du ruban et du charbon (premier chemin de fer de France en 1827 reliant Saint-Étienne à Andrézieux), la métropole s'est réinventée en ville UNESCO de design."
  },
  {
    code: "43", name: "Haute-Loire", pref: "Le Puy-en-Velay", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 228000, density: 46, area: 4977,
    relief: "Plateaux volcaniques du Velay et du Mézenc (Mont Mézenc 1 753 m), pitons de basalte (dykes et necks)",
    hydro: ["Loire", "Allier"],
    spec: ["Lentille verte du Puy AOP", "Dentelle aux fuseaux", "Départ du pèlerinage de Compostelle"],
    fact: "Le site du Puy-en-Velay est un cas d'école mondial de géomorphologie volcanique avec ses cheminées d'anciens volcans (necks volcaniques de Saint-Michel d'Aiguilhe) dressées au cœur d'un bassin d'effondrement."
  },
  {
    code: "44", name: "Loire-Atlantique", pref: "Nantes", region: "Pays de la Loire", regCode: "52",
    pop: 1450000, density: 213, area: 6815,
    relief: "Estuaire de la Loire, marais salants de Guérande, lac de Grand-Lieu, presqu'île du Croisic",
    hydro: ["Loire", "Erdre", "Sèvre Nantaise"],
    spec: ["Construction navale (Chantiers de l'Atlantique)", "Sel de Guérande", "Vignoble du Muscadet"],
    fact: "La façade ligérienne Nantes-Saint-Nazaire forme le premier complexe portuaire et industriel de l'Atlantique français, capable d'assembler les plus grands paquebots de croisière et structures d'éolien en mer."
  },
  {
    code: "45", name: "Loiret", pref: "Orléans", region: "Centre-Val de Loire", regCode: "24",
    pop: 685000, density: 101, area: 6775,
    relief: "Val de Loire classé, forêt d'Orléans (plus grande forêt domaniale de France), plaine de Beauce",
    hydro: ["Loire", "Loiret (résurgence karstique)", "Loing"],
    spec: ["Cosmetic Valley", "Pôle pharmaceutique", "Pépinières et horticulture"],
    fact: "Le couloir Orléans-Paris constitue l'un des axes logistiques majeurs d'Europe, tandis que la source du Loiret au parc floral de la Source offre une résurgence spectaculaire des pertes de la Loire."
  },
  {
    code: "46", name: "Lot", pref: "Cahors", region: "Occitanie", regCode: "76",
    pop: 175000, density: 33, area: 5217,
    relief: "Causses du Quercy calcaires, méandres encaissés du Lot, falaises de Rocamadour",
    hydro: ["Lot", "Dordogne", "Célé"],
    spec: ["Vin de Cahors (Malbec)", "Rocamadour AOP", "Agneau du Quercy"],
    fact: "Le 'triangle noir du Quercy' bénéficie de l'un des ciels nocturnes les moins pollués par la lumière artificielle en France, au-dessus de paysages karstiques sillonnés par des résurgences gouffres (Padirac)."
  },
  {
    code: "47", name: "Lot-et-Garonne", pref: "Agen", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 335000, density: 63, area: 5361,
    relief: "Vallée fertile de la Garonne, coteaux de Guyenne et de Gascogne, pays de Serres",
    hydro: ["Garonne", "Lot", "Baïse"],
    spec: ["Pruneau d'Agen IGP", "Tomate de Marmande", "Fruits et légumes"],
    fact: "Véritable verger et potager de la France, la moyenne vallée de la Garonne valorise des alluvions exceptionnellement fertiles grâce à l'irrigation et une tradition maraîchère héritée des migrations italiennes."
  },
  {
    code: "48", name: "Lozère", pref: "Mende", region: "Occitanie", regCode: "76",
    pop: 76500, density: 15, area: 5167,
    relief: "Département le moins peuplé de France. Mont Lozère (1 699 m), causse Méjean, gorges du Tarn, Aubrac",
    hydro: ["Lot", "Tarn", "Allier"],
    spec: ["Pastoralisme (transhumance)", "Bois de résineux", "Parc National des Cévennes"],
    fact: "Avec seulement 15 habitants au km², la Lozère est le parangon de la faible densité européenne, abritant le seul parc national métropolitain habité en son cœur (Cévennes, inscrit à l'UNESCO)."
  },
  {
    code: "49", name: "Maine-et-Loire", pref: "Angers", region: "Pays de la Loire", regCode: "52",
    pop: 825000, density: 115, area: 7166,
    relief: "Val d'Anjou, ardoisières de Trélazé, vignobles des coteaux du Layon, confluences du Maine",
    hydro: ["Loire", "Maine (Mayenne + Sarthe)", "Layon"],
    spec: ["Horticulture et végétal spécialisé (Végépolys)", "Vins d'Anjou et Saumur", "Industrie de la chaussure"],
    fact: "Angers est le premier pôle européen du végétal spécialisé (pôle de compétitivité Végépolys, siège de l'Office communautaire des variétés végétales de l'Union européenne)."
  },
  {
    code: "50", name: "Manche", pref: "Saint-Lô", region: "Normandie", regCode: "28",
    pop: 495000, density: 83, area: 5938,
    relief: "Presqu'île du Cotentin, falaises de la Hague, baie du Mont-Saint-Michel",
    hydro: ["Vire", "Sée", "Sélune"],
    spec: ["Nucléaire (EPR de Flamanville, usine de retraitement d'Orano la Hague)", "Élevage laitier", "Bulots"],
    fact: "Le Cotentin concentre la plus forte densité d'installations nucléaires civiles au monde (retraitement à La Hague, centrale et EPR à Flamanville, construction des sous-marins nucléaires à Cherbourg)."
  },
  {
    code: "51", name: "Marne", pref: "Châlons-en-Champagne", region: "Grand Est", regCode: "44",
    pop: 565000, density: 69, area: 8162,
    relief: "Champagne crayeuse, Montagne de Reims viticole, côte des Blancs, massif de l'Argonne",
    hydro: ["Marne", "Vesle", "Aisne"],
    spec: ["Champagne (Reims et Épernay)", "Céréales et betteraves", "Bioraffinerie de Bazancourt-Pomacle"],
    fact: "Sous le sol crayeux se cachent des centaines de kilomètres de caves gallo-romaines (les crayères de Reims). Le département héberge l'un des plus grands complexes de bioraffinerie agro-industrielle d'Europe."
  },
  {
    code: "52", name: "Haute-Marne", pref: "Chaumont", region: "Grand Est", regCode: "44",
    pop: 170000, density: 27, area: 6211,
    relief: "Plateau de Langres (sources de la Meuse et de la Marne), forêts de Der et d'Auberive",
    hydro: ["Marne", "Meuse", "Aube", "Lac du Der-Chantecoq"],
    spec: ["Métallurgie et coutellerie (Nogent)", "Fonderie d'art", "Parc National de Forêts"],
    fact: "Le plateau de Langres est le grand château d'eau du nord-est français, d'où divergent la Seine, la Meuse et les affluents du Rhône. Il accueille le 11e parc national français dédié aux forêts feuillues de plaine."
  },
  {
    code: "53", name: "Mayenne", pref: "Laval", region: "Pays de la Loire", regCode: "52",
    pop: 307000, density: 60, area: 5175,
    relief: "Massif armoricain oriental, mont des Avaloirs (416 m, point culminant du Grand Ouest), bocage",
    hydro: ["Mayenne", "Oudon", "Ernée"],
    spec: ["Lactalis (1er groupe laitier mondial)", "Réalité virtuelle (Laval Virtual)", "Élevage bovin"],
    fact: "Bordée de haies bocagères préservées, Laval est devenue la capitale mondiale de la réalité virtuelle et le siège planétaire du géant laitier Lactalis, illustrant le succès des PME agro-industrielles de l'Ouest."
  },
  {
    code: "54", name: "Meurthe-et-Moselle", pref: "Nancy", region: "Grand Est", regCode: "44",
    pop: 733000, density: 140, area: 5246,
    relief: "Côtes de Meuse et côtes de Moselle, plateau lorrain, plaine du Woëvre",
    hydro: ["Moselle", "Meurthe", "Chiers"],
    spec: ["Art nouveau (École de Nancy)", "Bassin sidérurgique en reconversion", "Chimie du sel"],
    fact: "Né du traité de Francfort de 1871 regroupant les fractions non annexées de la Meurthe et de la Moselle, le département a été le cœur battant de la minette lorraine et de la sidérurgie européenne."
  },
  {
    code: "55", name: "Meuse", pref: "Bar-le-Duc", region: "Grand Est", regCode: "44",
    pop: 182000, density: 29, area: 6211,
    relief: "Côtes de Meuse calcaires, plaine argileuse de la Woëvre, forêt d'Argonne",
    hydro: ["Meuse", "Aire", "Ornain"],
    spec: ["Brie de Meuse", "Confiture de groseilles épépinées à la plume d'oie", "Projet CIGÉO (Bure)"],
    fact: "Marquée par les stigmates de la bataille de Verdun de 1916 (forêt de guerre et zones rouges), la Meuse accueille à Bure le laboratoire souterrain de stockage réversible profond des déchets radioactifs."
  },
  {
    code: "56", name: "Morbihan", pref: "Vannes", region: "Bretagne", regCode: "53",
    pop: 765000, density: 112, area: 6823,
    relief: "Petite mer intérieure (Golfe du Morbihan), presqu'île de Quiberon, alignements mégalithiques de Carnac",
    hydro: ["Blavet", "Oust", "Vilaine"],
    spec: ["Pôle de course au large (Lorient La Base)", "Tourisme insulaire (Belle-Île)", "Mégalithes"],
    fact: "Le Golfe du Morbihan est un écosystème paralique unique abritant plus de 40 îles, tandis que l'ancienne base de sous-marins de Lorient a été reconvertie en 'Sailing Valley', Mecque mondiale des trimarans Ultims."
  },
  {
    code: "57", name: "Moselle", pref: "Metz", region: "Grand Est", regCode: "44",
    pop: 1045000, density: 168, area: 6216,
    relief: "Plateau lorrain, boutonnière du Warndt, côtes de Moselle viticoles, pays de Bitche vosgien",
    hydro: ["Moselle", "Sarre", "Seille"],
    spec: ["Sidérurgie haut de gamme", "Nucléaire (Cattenom)", "Travail transfrontalier vers le Luxembourg"],
    fact: "Bénéficiant du droit local alsacien-mosellan, la Moselle est traversée par un flux quotidien de plus de 100 000 travailleurs frontaliers vers le Luxembourg, transformant le nord du département en banlieue dortoir."
  },
  {
    code: "58", name: "Nièvre", pref: "Nevers", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 202000, density: 30, area: 6814,
    relief: "Massif granitique du Morvan (Haut-Folin 901 m), val de Loire nivernais, plaines du Bazois",
    hydro: ["Loire", "Allier", "Yonne"],
    spec: ["Vin Pouilly-Fumé", "Faïence de Nevers", "Élevage charolais"],
    fact: "Le Morvan servait jadis à approvisionner Paris en bois de chauffage grâce au spectaculaire 'flottage à bûches perdues' sur les affluents de l'Yonne et de la Seine entre le XVIe et le XIXe siècle."
  },
  {
    code: "59", name: "Nord", pref: "Lille", region: "Hauts-de-France", regCode: "32",
    pop: 2610000, density: 454, area: 5743,
    relief: "Plaine de Flandre maritime, monts de Flandre (Mont Cassel 176 m), bassin minier, bocage de l'Avesnois",
    hydro: ["Escaut", "Deûle", "Lys", "Sambre"],
    spec: ["Grand port maritime de Dunkerque", "Gigafactories de batteries", "Vente à distance et grande distribution"],
    fact: "Département le plus peuplé de France (2,6 millions d'habitants), ancien cœur du charbon et du textile, le Nord s'est converti en un carrefour logistique et industriel européen majeur adossé au port de Dunkerque."
  },
  {
    code: "60", name: "Oise", pref: "Beauvais", region: "Hauts-de-France", regCode: "32",
    pop: 830000, density: 141, area: 5860,
    relief: "Plateaux picards limoneux fertiles, forêts de Compiègne, de Chantilly et d'Ermenonville",
    hydro: ["Oise", "Aisne", "Thérain"],
    spec: ["Aéroport de Beauvais-Tillé", "Grande culture céréalière", "Château de Chantilly et monde du cheval"],
    fact: "Sous forte influence francilienne (bassin d'emploi de Roissy-Charles-de-Gaulle), le sud de l'Oise accueille des résidences de navetteurs tout en préservant d'immenses massifs forestiers princiers."
  },
  {
    code: "61", name: "Orne", pref: "Alençon", region: "Normandie", regCode: "28",
    pop: 278000, density: 45, area: 6103,
    relief: "Collines du Perche normand, forêt d'Écouves, mont des Avaloirs, Suisse normande",
    hydro: ["Orne", "Sarthe", "Huisne"],
    spec: ["Camembert de Normandie AOP", "Dentelle au point d'Alençon (UNESCO)", "Haras national du Pin"],
    fact: "Le Haras National du Pin, surnommé le 'Versailles du cheval', symbolise l'excellence mondiale de l'Orne dans la sélection génétique et l'entraînement des chevaux de selle et de course."
  },
  {
    code: "62", name: "Pas-de-Calais", pref: "Arras", region: "Hauts-de-France", regCode: "32",
    pop: 1465000, density: 219, area: 6671,
    relief: "Cap Blanc-Nez et Gris-Nez (détroit du Pas de Calais face à Douvres), collines d'Artois, terrils du bassin minier",
    hydro: ["Canche", "Authie", "Aa"],
    spec: ["Port de Calais (1er port de voyageurs de France)", "Tunnel sous la Manche", "Endive et pomme de terre"],
    fact: "Le détroit du Pas-de-Calais est l'un des goulets maritimes les plus fréquentés au monde (rail maritime montant et descendant), doublé du lien fixe transmanche reliant le continent aux îles Britanniques."
  },
  {
    code: "63", name: "Puy-de-Dôme", pref: "Clermont-Ferrand", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 665000, density: 83, area: 7970,
    relief: "Chaîne des Puys (faille de Limagne, faille classée UNESCO), massif du Sancy (1 886 m, toit du Massif central)",
    hydro: ["Allier", "Dordogne", "Sioule"],
    spec: ["Michelin (siège mondial)", "Eaux minérales (Volvic)", "Saint-Nectaire AOP"],
    fact: "L'alignement tectono-volcanique de la Chaîne des Puys et de la faille de Limagne est inscrit au patrimoine mondial de l'UNESCO comme un modèle planétaire d'ouverture d'un rift continental."
  },
  {
    code: "64", name: "Pyrénées-Atlantiques", pref: "Pau", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 690000, density: 90, area: 7645,
    relief: "Pays basque vallonné (La Rhune), haute montagne béarnaise (Pic du Midi d'Ossau 2 884 m), côte basque",
    hydro: ["Adour", "Gave de Pau", "Gave d'Oloron"],
    spec: ["Jambon de Bayonne", "Chimie fine et gaz (bassin de Lacq)", "Surf et tourisme balnéaire (Biarritz)"],
    fact: "Dualité culturelle et spatiale entre Béarn pyrénéen et Pays Basque littoral. Le gisement de gaz de Lacq a propulsé l'essor de la chimie française d'après-guerre et se reconvertit dans les énergies décarbonées."
  },
  {
    code: "65", name: "Hautes-Pyrénées", pref: "Tarbes", region: "Occitanie", regCode: "76",
    pop: 230000, density: 51, area: 4464,
    relief: "Cirque glaciaire de Gavarnie (UNESCO), Pic du Midi de Bigorre (observatoire), Vignemale (3 298 m)",
    hydro: ["Adour", "Gave de Pau", "Neste"],
    spec: ["Lourdes (2e pôle hôtelier de France)", "Porc noir de Bigorre AOP", "Construction ferroviaire (Alstom Tarbes)"],
    fact: "Lourdes concentre une capacité hôtelière colossale pour un pèlerinage planétaire, tandis que le cirque de Gavarnie constitue un exemple mondial d'amphithéâtre d'érosion glaciaire calcaire."
  },
  {
    code: "66", name: "Pyrénées-Orientales", pref: "Perpignan", region: "Occitanie", regCode: "76",
    pop: 485000, density: 118, area: 4116,
    relief: "Massif du Canigou (2 784 m, montagne sacrée des Catalans), plaine du Roussillon, Côte Vermeille schisteuse",
    hydro: ["Têt", "Tech", "Agly"],
    spec: ["Grand marché d'importation de fruits et légumes (Saint-Charles International)", "Vins doux naturels (Banyuls)", "Anchois de Collioure"],
    fact: "Perpignan abrite la plateforme Saint-Charles International, premier centre européen d'éclatement et de commercialisation de fruits et légumes en provenance d'Espagne et du Maroc."
  },
  {
    code: "67", name: "Bas-Rhin", pref: "Strasbourg", region: "Grand Est", regCode: "44",
    pop: 1150000, density: 242, area: 4755,
    relief: "Graben rhénan, massif des Vosges gréseuses du Nord, plaine d'Alsace",
    hydro: ["Rhin", "Ill", "Moder"],
    spec: ["Capitale européenne (Parlement européen)", "Vins d'Alsace", "Brasseurs de bière"],
    fact: "Le fossé d'effondrement rhénan est bordé par le fleuve le plus fréquenté d'Europe (Rhin). Strasbourg incarne la vocation binationale et européenne par ses institutions et son euro-métropole transfrontalière."
  },
  {
    code: "68", name: "Haut-Rhin", pref: "Colmar", region: "Grand Est", regCode: "44",
    pop: 770000, density: 218, area: 3525,
    relief: "Hautes-Vosges cristallines (Grand Ballon 1 424 m), colline de sous-Vosges viticoles, plaine d'Alsace",
    hydro: ["Rhin", "Ill", "Thur"],
    spec: ["Automobile (Stellantis Mulhouse)", "Cité du Train et Musée de l'Automobile", "Grands crus alsaciens"],
    fact: "Mulhouse, la 'Manchester française', pionnière du textile et de la mécanique, forme avec Bâle (Suisse) et Fribourg (Allemagne) l'Eurodistrict trinational de l'espace rhénan supérieur."
  },
  {
    code: "69", name: "Rhône & Métropole de Lyon", pref: "Lyon", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 1890000, density: 584, area: 3231,
    relief: "Confluence Saône-Rhône, coteaux du Beaujolais, monts du Lyonnais",
    hydro: ["Rhône", "Saône"],
    spec: ["Capitale gastronomique", "Vallée de la Chimie", "Biotechnologies et vaccins (Sanofi)"],
    fact: "La Métropole de Lyon dispose d'un statut de collectivité territoriale à statut particulier unique en France, séparée du département du Rhône depuis 2015, moteur économique articulé sur le couloir rhodanien."
  },
  {
    code: "70", name: "Haute-Saône", pref: "Vesoul", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 235000, density: 44, area: 5360,
    relief: "Plateau des Mille Étangs (surnommé la petite Finlande), Vosges saônoises (Ballon de Servance 1 216 m)",
    hydro: ["Saône", "Ognon"],
    spec: ["Filière bois et ameublement", "Fougerolles (Kirsch AOP)", "Chapelle Le Corbusier de Ronchamp"],
    fact: "Le plateau des Mille Étangs, façonné par les glaciers quaternaires dans les Vosges du Sud, offre une mosaïque d'eaux et de tourbières protégées au cœur d'un territoire très boisé."
  },
  {
    code: "71", name: "Saône-et-Loire", pref: "Mâcon", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 550000, density: 64, area: 8575,
    relief: "Bocage charolais, monts du Mâconnais, plaine de la Bresse bourguignonne, bassin industriel du Creusot",
    hydro: ["Saône", "Loire", "Doubs"],
    spec: ["Bœuf Charolais AOP", "Nucléaire civil (cuves de réacteurs Framatome Le Creusot)", "Vins de Mâcon et Pouilly-Fuissé"],
    fact: "Le Creusot et la dynastie Schneider ont été le creuset de la révolution industrielle française (marteau-pilon). Aujourd'hui, le site forge les composants lourds des centrales nucléaires EPR."
  },
  {
    code: "72", name: "Sarthe", pref: "Le Mans", region: "Pays de la Loire", regCode: "52",
    pop: 566000, density: 91, area: 6206,
    relief: "Transition entre Bassin parisien et Massif armoricain, Alpes mancelles, forêt de Bercé",
    hydro: ["Sarthe", "Huisne", "Loir"],
    spec: ["Course des 24 Heures du Mans", "Rillettes du Mans", "Volaille de Loué"],
    fact: "Carrefour ferroviaire et autoroutier stratégique à 55 minutes de Paris en TGV, Le Mans accueille la plus prestigieuse course d'endurance automobile mondiale et la filière avicole labellisée de Loué."
  },
  {
    code: "73", name: "Savoie", pref: "Chambéry", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 440000, density: 73, area: 6028,
    relief: "Massif de la Vanoise (Grande Casse 3 855 m), vallées de la Tarentaise et de la Maurienne, lac du Bourget",
    hydro: ["Isère", "Arc", "Arly"],
    spec: ["Plus grand domaine skiable interconnecté au monde (3 Vallées, Paradiski)", "Beaufort AOP", "Tunnel ferroviaire Lyon-Turin"],
    fact: "La Maurienne et la Tarentaise incarnent la 'métropolisation de la montagne' : vallées ultra-industrialisées au fond (électrométallurgie) supportant sur leurs versants les stations de ski les plus rentables du globe."
  },
  {
    code: "74", name: "Haute-Savoie", pref: "Annecy", region: "Auvergne-Rhône-Alpes", regCode: "84",
    pop: 840000, density: 191, area: 4388,
    relief: "Toit de l'Europe occidentale avec le Mont Blanc (4 807 m), lac Léman, vallée de l'Arve, lac d'Annecy",
    hydro: ["Arve", "Rhône", "Fier"],
    spec: ["Décolletage industriel (Vallée de l'Arve)", "Fromage Reblochon AOP", "Alpinisme et tourisme (Chamonix)"],
    fact: "La vallée de l'Arve réalise les deux tiers du décolletage français (usinage de précision pour automobile/médical). Le département subit une explosion foncière due à la proximité immédiate de la Suisse."
  },
  {
    code: "75", name: "Paris", pref: "Paris", region: "Île-de-France", regCode: "11",
    pop: 2130000, density: 20285, area: 105,
    relief: "Bassin sédimentaire parisien, buttes témoins (Montmartre 130 m, Belleville)",
    hydro: ["Seine", "Canal Saint-Martin", "Canal de l'Ourcq"],
    spec: ["Ville mondiale de premier rang", "Tourisme international (musées, mode, luxe)", "Finance et sièges du CAC 40"],
    fact: "Plus forte densité de population d'Europe (plus de 20 000 hab/km²), Paris concentre le commandement politique, économique et culturel national au prix d'une ségrégation socio-spatiale accrue avec ses banlieues."
  },
  {
    code: "76", name: "Seine-Maritime", pref: "Rouen", region: "Normandie", regCode: "28",
    pop: 1255000, density: 199, area: 6278,
    relief: "Plateau crayeux du pays de Caux, falaises d'Étretat, estuaire de la Seine",
    hydro: ["Seine", "Béthune", "Yères"],
    spec: ["Grand Port Maritime du Havre (Haropa)", "Raffinage pétrolier et chimie", "Éolien offshore"],
    fact: "Le Havre est le premier port français pour le trafic de conteneurs, pensé par Auguste Perret (classé UNESCO), et le terminal maritime essentiel de l'Axe Seine approvisionnant le bassin de consommation francilien."
  },
  {
    code: "77", name: "Seine-et-Marne", pref: "Melun", region: "Île-de-France", regCode: "11",
    pop: 1430000, density: 242, area: 5915,
    relief: "Occupe la moitié orientale de l'Île-de-France. Plaine de Brie, forêt de Fontainebleau",
    hydro: ["Seine", "Marne", "Grand Morin"],
    spec: ["Disneyland Paris (1ère destination touristique d'Europe)", "Brie de Meaux et de Melun", "Plateformes logistiques géantes"],
    fact: "Département de contrastes extrêmes : premier pôle d'attraction touristique privée d'Europe (Val d'Europe/Disneyland), villes nouvelles (Marne-la-Vallée, Sénart) et immenses exploitations céréalières de Brie."
  },
  {
    code: "78", name: "Yvelines", pref: "Versailles", region: "Île-de-France", regCode: "11",
    pop: 1450000, density: 635, area: 2284,
    relief: "Plateau de Saint-Quentin-en-Yvelines, vallée de la Seine, massif forestier de Rambouillet",
    hydro: ["Seine", "Oise", "Bièvre"],
    spec: ["Château de Versailles", "Constructeurs automobiles (Renault Guyancourt, Stellantis Poissy)", "Pôle de défense"],
    fact: "Le Technocentre Renault de Guyancourt rassemble plus de 10 000 ingénieurs sur un site unique. Les Yvelines marient le prestige historique monarchique à la pointe de l'ingénierie automobile française."
  },
  {
    code: "79", name: "Deux-Sèvres", pref: "Niort", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 375000, density: 62, area: 5999,
    relief: "Seuil du Poitou, Gâtine bocagère granitique, Marais poitevin (la 'Venise verte')",
    hydro: ["Sèvre Niortaise", "Sèvre Nantaise", "Thouet"],
    spec: ["Capitale des mutuelles d'assurance (Niort)", "Fromage de chèvre (chabichou)", "Marais poitevin"],
    fact: "Niort est la quatrième place financière française en flux d'argent en raison de la concentration des sièges historiques des géants mutualistes d'assurance (MAIF, MACIF, SMACL)."
  },
  {
    code: "80", name: "Somme", pref: "Amiens", region: "Hauts-de-France", regCode: "32",
    pop: 570000, density: 92, area: 6170,
    relief: "Plaines crayeuses ondulées de Picardie, baie de Somme (estuaire préservé et phoques)",
    hydro: ["Somme", "Authie", "Avre"],
    spec: ["Baie de Somme (Grand Site de France)", "Cathédrale d'Amiens (plus vaste de France)", "Hortillonnages d'Amiens"],
    fact: "Les Hortillonnages d'Amiens forment un réseau de jardins flottants de 300 hectares cultivés depuis le Moyen Âge dans les marais de la Somme au cœur même de la trame urbaine."
  },
  {
    code: "81", name: "Tarn", pref: "Albi", region: "Occitanie", regCode: "76",
    pop: 390000, density: 68, area: 5758,
    relief: "Monts de Lacaune, rochers granitiques du Sidobre, cité épiscopale d'Albi en brique rouge",
    hydro: ["Tarn", "Agout", "Dadou"],
    spec: ["Granit du Sidobre", "Ail rose de Lautrec Label Rouge", "Vins de Gaillac"],
    fact: "Le Sidobre est le premier centre français de production et d'extraction de granit, tandis qu'Albi déploie sa cathédrale forteresse Sainte-Cécile en brique cuite rouge, inscrite à l'UNESCO."
  },
  {
    code: "82", name: "Tarn-et-Garonne", pref: "Montauban", region: "Occitanie", regCode: "76",
    pop: 263000, density: 71, area: 3718,
    relief: "Basses plaines fertiles de la confluence Tarn-Garonne, coteaux de Lomagne et du Quercy",
    hydro: ["Garonne", "Tarn", "Aveyron"],
    spec: ["Raisin Chasselas de Moissac AOP", "Arboriculture (pommes, melons)", "Centrale nucléaire de Golfech"],
    fact: "Créé en 1808 par décret de Napoléon Ier en prélevant des cantons aux départements voisins, ce territoire carrefour est l'un des premiers producteurs fruitiers de l'arc garonnais."
  },
  {
    code: "83", name: "Var", pref: "Toulon", region: "Provence-Alpes-Côte d'Azur", regCode: "93",
    pop: 1090000, density: 182, area: 5973,
    relief: "Massif des Maures et massif de l'Esterel (roches rouges volcaniques), rade de Toulon, îles d'Hyères (Porquerolles)",
    hydro: ["Argens", "Verdon"],
    spec: ["Base navale de Toulon (porte-avions Charles de Gaulle)", "Vins Côtes de Provence (rosé)", "Tourisme balnéaire (Saint-Tropez)"],
    fact: "Toulon abrite la plus grande base navale de Méditerranée et le port d'attache de la majorité de la flotte de la Marine nationale. Le Var est le premier producteur mondial de vin rosé d'appellation."
  },
  {
    code: "84", name: "Vaucluse", pref: "Avignon", region: "Provence-Alpes-Côte d'Azur", regCode: "93",
    pop: 565000, density: 158, area: 3567,
    relief: "Mont Ventoux (le 'Géant de Provence' 1 912 m), massif du Luberon, plateau de Vaucluse karstique",
    hydro: ["Rhône", "Durance", "Sorgue"],
    spec: ["Festival d'Avignon", "Fontaine-de-Vaucluse (plus puissante résurgence de France)", "Vins des Côtes du Rhône (Châteauneuf-du-Pape)"],
    fact: "Fontaine-de-Vaucluse est la plus puissante source karstique de France (5e mondiale en débit), drainant les pluies de l'immense plateau calcaire pour alimenter le réseau ramifié de la Sorgue."
  },
  {
    code: "85", name: "Vendée", pref: "La Roche-sur-Yon", region: "Pays de la Loire", regCode: "52",
    pop: 695000, density: 103, area: 6720,
    relief: "Côte de Lumière sableuse, Marais poitevin vendéen, bocage vendéen des hauteurs du Haut-Bocage",
    hydro: ["Sèvre Nantaise", "Vendée", "Lay"],
    spec: ["Puy du Fou", "Vendée Globe (départ des Sables d'Olonne)", "Modèle économique vendéen (Bénéteau, Fleury Michon)"],
    fact: "Parangon du 'miracle économique vendéen' : un tissu dense de PME indépendantes et de groupes familiaux leaders, un des plus faibles taux de chômage de France et un fort attachement territorial."
  },
  {
    code: "86", name: "Vienne", pref: "Poitiers", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 440000, density: 63, area: 6990,
    relief: "Seuil du Poitou (couloir sédimentaire entre Bassin parisien et Bassin aquitain)",
    hydro: ["Vienne", "Clain", "Charente"],
    spec: ["Futuroscope", "Nucléaire (Centrale de Civaux)", "Mélange agronomique céréales/élevage"],
    fact: "Le seuil du Poitou est l'isthme stratégique historique majeur entre le nord et le sud-ouest de la France, lieu de passage obligé des armées (batailles de 507 et 732) et aujourd'hui de la LGV Atlantique."
  },
  {
    code: "87", name: "Haute-Vienne", pref: "Limoges", region: "Nouvelle-Aquitaine", regCode: "75",
    pop: 372000, density: 67, area: 5520,
    relief: "Monts d'Ambazac, monts de Blond, plateau de Millevaches occidental",
    hydro: ["Vienne", "Gartempe", "Briance"],
    spec: ["Porcelaine de Limoges (IGP)", "Émail et cuir de luxe", "Filière bovine limousine"],
    fact: "Le kaolin découvert à Saint-Yrieix-la-Perche a donné naissance à l'industrie prestigieuse de la porcelaine de Limoges, complétée aujourd'hui par un pôle mondial de céramiques techniques industrielles."
  },
  {
    code: "88", name: "Vosges", pref: "Épinal", region: "Grand Est", regCode: "44",
    pop: 360000, density: 61, area: 5874,
    relief: "Hautes-Vosges cristallines et ballons (Hohneck 1 363 m), plateau vosgien boisé",
    hydro: ["Moselle", "Meurthe", "Saône (source à Vioménil)"],
    spec: ["Imagerie d'Épinal", "Industrie papetière et bois", "Thermalisme (Vittel, Contrexéville)"],
    fact: "Les Vosges hébergent l'un des premiers bassins papetiers et forestiers de France, alimenté par la pureté de ses eaux de grès qui ont également fondé l'essor d'empires d'eaux minérales embouteillées."
  },
  {
    code: "89", name: "Yonne", pref: "Auxerre", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 335000, density: 45, area: 7427,
    relief: "Plateaux calcaires jurassiques, vignoble du Chablisien, nord du massif du Morvan",
    hydro: ["Yonne", "Armançon", "Serein"],
    spec: ["Vin de Chablis", "Basilique de Vézelay (UNESCO)", "Céréaliculture et escargots de Bourgogne"],
    fact: "Chablis repose sur un sous-sol sédimentaire kimméridgien unique composé de micro-fossiles d'huîtres, conférant à son chardonnay une minéralité mondialement renommée."
  },
  {
    code: "90", name: "Territoire de Belfort", pref: "Belfort", region: "Bourgogne-Franche-Comté", regCode: "27",
    pop: 140000, density: 230, area: 609,
    relief: "Trouée de Belfort (seuil géologique entre Vosges et Jura), Ballon d'Alsace (1 247 m)",
    hydro: ["Savoureuse", "Allaine"],
    spec: ["TGV et turbines Alstom/GE Vernova", "Lion de Belfort de Bartholdi", "Pôle hydrogène"],
    fact: "Plus petit département de métropole hors Île-de-France (609 km²), né du refus des habitants d'être rattachés à l'Allemagne en 1871 grâce à la résistance héroïque du colonel Denfert-Rochereau."
  },
  {
    code: "91", name: "Essonne", pref: "Évry-Courcouronnes", region: "Île-de-France", regCode: "11",
    pop: 1310000, density: 726, area: 1804,
    relief: "Plateau de Saclay, vallées de l'Essonne, de la Juine et de l'Orge, Hurepoix",
    hydro: ["Seine", "Essonne", "Orge"],
    spec: ["Cluster scientifique Paris-Saclay (15% de la recherche française)", "Génopole (biotechnologies)", "Aéronautique (Safran)"],
    fact: "Le plateau de Saclay est conçu comme la 'Silicon Valley française', regroupant le CNRS, l'Université Paris-Saclay, Polytechnique et des centres de R&D privés majeurs sur un pôle d'innovation mondial."
  },
  {
    code: "92", name: "Hauts-de-Seine", pref: "Nanterre", region: "Île-de-France", regCode: "11",
    pop: 1630000, density: 9261, area: 176,
    relief: "Boucles de la Seine, plateau de Meudon, colline de La Défense",
    hydro: ["Seine"],
    spec: ["Quartier d'affaires de La Défense (1er quartier d'affaires d'Europe)", "Sièges de multinationales", "Médias et tech"],
    fact: "La Défense déploie 3,7 millions de m² de bureaux et accueille plus de 180 000 salariés quotidiens, faisant des Hauts-de-Seine l'un des départements les plus riches d'Europe par habitant."
  },
  {
    code: "93", name: "Seine-Saint-Denis", pref: "Bobigny", region: "Île-de-France", regCode: "11",
    pop: 1660000, density: 7033, area: 236,
    relief: "Plaine Saint-Denis, buttes de Romainville et Montreuil, canal de l'Ourcq",
    hydro: ["Seine", "Canal Saint-Denis", "Canal de l'Ourcq"],
    spec: ["Stade de France et héritage Paris 2024", "Basilique Saint-Denis (nécropole des rois)", "Économie créative et audiovisuelle"],
    fact: "Département le plus jeune de France métropolitaine, ancien bastion ouvrier de la banlieue rouge, au cœur de la régénération urbaine la plus intense d'Europe (sites olympiques 2024 et gares du Grand Paris Express)."
  },
  {
    code: "94", name: "Val-de-Marne", pref: "Créteil", region: "Île-de-France", regCode: "11",
    pop: 1415000, density: 5775, area: 245,
    relief: "Confluence Seine-Marne, plateau de Villejuif, coteaux de la Marne et plaine de Rungis",
    hydro: ["Seine", "Marne", "Yerres"],
    spec: ["Marché International de Rungis (1er marché de produits frais au monde)", "Aéroport Paris-Orly", "Pôle d'oncologie de Villejuif"],
    fact: "Rungis s'étend sur 234 hectares et nourrit plus de 18 millions de consommateurs, constituant un chef-d'œuvre de logistique alimentaire connecté en continu aux productions agricoles françaises et mondiales."
  },
  {
    code: "95", name: "Val-d'Oise", pref: "Cergy", region: "Île-de-France", regCode: "11",
    pop: 1260000, density: 1011, area: 1246,
    relief: "Plaine de France, Vexin français (parc naturel préservé), boucle d'Oise de Cergy",
    hydro: ["Oise", "Seine", "Epte"],
    spec: ["Aéroport Paris-Charles de Gaulle (1er aéroport d'Europe)", "Ville nouvelle de Cergy-Pontoise", "Château de La Roche-Guyon"],
    fact: "Roissy-CDG constitue le principal hub aéroportuaire européen pour le fret et les passagers internationaux, générant un écosystème logistique colossal aux portes de l'openfield céréalier du Vexin."
  },
  {
    code: "971", name: "Guadeloupe", pref: "Basse-Terre", region: "Guadeloupe", regCode: "01",
    pop: 384000, density: 236, area: 1628,
    relief: "Île papillon : Basse-Terre volcanique (La Soufrière 1 467 m) et Grande-Terre calcaire tabulaire",
    hydro: ["Rivière Salée (bras de mer séparant les deux ailes)", "Grand Cul-de-Sac Marin"],
    spec: ["Banane de Guadeloupe", "Rhum agricole AOC", "Tourisme et réserve de biosphère"],
    fact: "L'archipel guadeloupéen associe une île haute volcanique pluvieuse et une île basse calcaire sèche, illustrant l'étagement des milieux bioclimatiques tropicaux et la fragilité des récifs coralliens."
  },
  {
    code: "972", name: "Martinique", pref: "Fort-de-France", region: "Martinique", regCode: "02",
    pop: 360000, density: 320, area: 1128,
    relief: "Montagne Pelée (1 397 m, volcan actif, forêt inscrite UNESCO), Pitons du Carbet, presqu'île de la Caravelle",
    hydro: ["Lézarde", "Rivière Blanche", "Rivière Capot"],
    spec: ["Seul Rhum agricole AOC au monde", "Banane", "Économie maritime et tourisme"],
    fact: "L'éruption cataclysmique de la Montagne Pelée en 1902 rasa Saint-Pierre en quelques minutes ('nuée ardente'), fondant la volcanologie moderne tout en déplaçant la capitale vers Fort-de-France."
  },
  {
    code: "973", name: "Guyane", pref: "Cayenne", region: "Guyane", regCode: "03",
    pop: 295000, density: 3.5, area: 83534,
    relief: "Plus vaste département français (1/6e de la métropole). Pénéplaine amazonienne granitique, inselbergs",
    hydro: ["Maroni", "Oyapock", "Approuague"],
    spec: ["Centre Spatial Guyanais (Kourou)", "Forêt équatoriale amazonienne", "Orpaillage et biodiversité"],
    fact: "Kourou bénéficie d'une situation idéale à 5° nord de l'équateur (effet de fronde de la rotation terrestre maximal). La Guyane est frontalière du Brésil et du Suriname, avec 95% de couverture forestière primaire."
  },
  {
    code: "974", name: "La Réunion", pref: "Saint-Denis", region: "La Réunion", regCode: "04",
    pop: 870000, density: 347, area: 2504,
    relief: "Piton de la Fournaise (l'un des volcans les plus actifs du globe), Piton des Neiges (3 070 m, toit de l'océan Indien), cirques de Cilaos, Mafate et Salazie",
    hydro: ["Rivière des Galets", "Rivière du Mât", "Rivière d'Abord"],
    spec: ["Canne à sucre et sucre roux", "Vanille Bourbon IGP", "Nouvelle Route du Littoral (viaduc maritime)"],
    fact: "Les trois cirques naturels (inscrits à l'UNESCO) sont d'immenses caldeiras d'effondrement érodées. Mafate est le seul lieu habité de France entièrement inaccessible par la route, ravitaillé à pied ou par hélicoptère."
  },
  {
    code: "976", name: "Mayotte", pref: "Mamoudzou", region: "Mayotte", regCode: "06",
    pop: 310000, density: 828, area: 374,
    relief: "Grande-Terre et Petite-Terre (Dzaoudzi), mont Choungui (593 m), mont Bénara (660 m)",
    hydro: ["Nombreux cours d'eau temporaires ('les rivières')", "Lac Dziani (cratère volcanique)"],
    spec: ["Culture de l'ylang-ylang (parfumerie)", "Vanille", "Lagon d'exception (double barrière de corail)"],
    fact: "101e département français depuis 2011, Mayotte possède l'un des plus grands lagons fermés du monde avec une double barrière récifale rare, confronté à la plus forte densité et croissance démographique d'outre-mer."
  }
];

// Generate TS code
let output = `import { Department } from '../types/geo';

export const DEPARTMENTS: Record<string, Department> = {
`;

for (const d of DEPT_RAW) {
  output += `  '${d.code}': {
    code: '${d.code}',
    name: ${JSON.stringify(d.name)},
    prefecture: ${JSON.stringify(d.pref)},
    subPrefectures: [],
    regionCode: '${d.regCode}',
    regionName: ${JSON.stringify(d.region)},
    population: ${d.pop},
    density: ${d.density},
    area: ${d.area},
    relief: ${JSON.stringify(d.relief)},
    hydrography: ${JSON.stringify(d.hydro)},
    specialties: ${JSON.stringify(d.spec)},
    academicFact: ${JSON.stringify(d.fact)}
  },
`;
}

output += `};

export const DEPARTMENTS_LIST: Department[] = Object.values(DEPARTMENTS);
`;

fs.writeFileSync('src/data/departments.ts', output);
console.log('Saved 101 departments to src/data/departments.ts');

// Les noms des variables:

// datapilot = les données du pilote de l'enquête Panel Suisse de Ménages 2017 - 2018
// DV1 = la variable de la participation au questionnaire de ménage.
// DV2 = la variable de la participation au questionnaire de ménage et au questionnaire individuel.
// dpdv1 = data pilot DV1
// dpdv2 = data pilot DV2
// colorDV1 = couleurs associées à la variable DV1.
// colorDV2 = couleurs associées à la variable DV2.

// déclaration des variables: 

var datapilot, dpdv1, dpdv2 , colorDV1, colorDV2 = null;

function getDV1DV2() {
// lire les valeurs de la colonne DV1 (variable DV1 du dataset data pilot) dans dpdv1.
  dpdv1 = datapilot.map(function(d,i) {
      return {
        value: +d.DV1_participation_percent,
        index: i    
      }
    });
// lire les valeurs de la colonne DV2 (variable DV2 du dataset data pilot) dans dpdv2.
  dpdv2 = datapilot.map(function(d,i) {
      return {
        value : +d.DV2_participation_percent,
        index: i    
      }
  });
}

// Visualisation de la variable DV1 = participation de la personne de référence du ménage au questionnaire de ménage.

function displayMapDV1(){ 
  var width = 960,
      height = 500;

  var path = d3.geoPath() ; // projection est nulle par défaut.

  var mapDV1 = d3.select("#mapDV1").append("svg")   // création de la svg pour contenir la carte DV1.
      .attr("width", width)
      .attr("height", height);      

// d'abord c'est la lécture de ch.json (par d3.json) et par la suite (then) la création de la carte suisse.

   d3.json("swiss-maps-master/topo/ch.json").then(function(ch) {
    mapDV1.append("g")
        .attr("class", "feature feature--canton")
      .selectAll("path")
        .data(topojson.feature(ch, ch.objects.cantons).features)
      .enter().append("path")
        .attr("d", path)
      .style("fill", function(d){ return colorDV1(datapilot.find(dp=> dp['RegionsID']==d.id).DV1_participation_percent)})
      .append("title").text(d => `${datapilot.find(dp=> dp['RegionsID']==d.id).CANTON17nom}, ${datapilot.find(dp=> dp['RegionsID']==d.id).DV1_participation_percent} % `);

    mapDV1.append("g")
        .attr("class", "feature feature--lake")
      .selectAll("path")
        .data(topojson.feature(ch, ch.objects.lakes).features)
      .enter().append("path")
        .attr("d", path);

    mapDV1.append("path")
        .datum(topojson.mesh(ch, ch.objects.cantons, function(a, b) { return a !== b; }))
        .attr("class", "boundary boundary--cantons")
        .style("stroke-width", "1px")
        .attr("d", path);    
  
    mapDV1.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");

    var lg = legend({
  
      color : d3.scaleThreshold([20,30,40,50,60,70,80,90,100], d3.schemeGnBu[9]),
      title: "Taux de participation en %"     
    
    });
   
    d3.select(".legendQuant").node().appendChild(lg)
     
  });
}

// Visualisation de la variable DV2 = participation de la personne de référence du ménage au questionnaires de ménage et au questionnaire individuel.

function displayMapDV2(){ 
var width = 960,
    height = 500;

var path = d3.geoPath() ; // projection est nulle par défaut.

var mapDV2 = d3.select("#mapDV2").append("svg") // création de la svg pour contenir la carte DV2.
    .attr("width", width)
    .attr("height", height);

// d'abord c'est la lécture de ch.json (par d3.json) et par la suite (then) la création de la carte suisse.

 d3.json("swiss-maps-master/topo/ch.json").then(function( ch) {
  mapDV2.append("g")
      .attr("class", "feature feature--canton")
    .selectAll("path")
      .data(topojson.feature(ch, ch.objects.cantons).features)
    .enter().append("path")
      .attr("d", path)
    .style("fill", function(d){ return colorDV2(datapilot.find(dp=> dp['RegionsID']==d.id).DV2_participation_percent)})
    .append("title").text(d => `${datapilot.find(dp=> dp['RegionsID']==d.id).CANTON17nom} , ${datapilot.find(dp=> dp['RegionsID']==d.id).DV2_participation_percent} % `);
    
  mapDV2.append("g")
      .attr("class", "feature feature--lake")
    .selectAll("path")
      .data(topojson.feature(ch, ch.objects.lakes).features)
    .enter().append("path")
      .attr("d", path);

  mapDV2.append("path")
      .datum(topojson.mesh(ch, ch.objects.cantons, function(a, b) { return a !== b; }))
      .attr("class", "boundary boundary--cantons")
      .style("stroke-width", "1px")
      .attr("d", path); 

  mapDV2.append("g")
      .attr("class", "legendQuantDV2")
      .attr("transform", "translate(20,20)");
      
  var lg = legend({

    color : d3.scaleThreshold([20,30,40,50,60,70,80,90,100], d3.schemeGnBu[9]),
    title: "Taux de participation en %"     
  
  });
  d3.select(".legendQuantDV2").node().appendChild(lg)

});
}


function readCSV_Original() {
  // la lecture du fichier datapilot.csv
  d3.csv("datapilot.csv", 
  // la lecture de ce fichier se fait avec la fonction ci-dessous:
  function(d) {    
    return {
      RegionsID: +d.RegionsID, // + c'est pour convertir "RegionsID" colonne aux chiffres.
      CANTON17nom: d.CANTON17nom,
      DV1_participation_percent: d.DV1_participation_percent,
      DV2_participation_percent: d.DV2_participation_percent
    };
  }).then(function(d){
    // la partie then est appelée après la lecture par d3.csv et l'extraction des données envoyées dans le dataset (d).
    datapilot = d;
  
    // calcul des colonnes DV1 et DV2: 

    getDV1DV2();

    // calcul des couleurs pour la carte de la variable DV1 et pour la carte de la variable DV2.
    // https://github.com/d3/d3-scale-chromatic

    colorDV1 = d3.scaleQuantize(
      [10,100],
      d3.schemeGnBu[9]);       

    colorDV2 = d3.scaleQuantize(
      [10,100],
      d3.schemeGnBu[9]);

    // création et affichage des deux cartes.    
  
    displayMapDV1();
    displayMapDV2();

  });
}

  // SOURCES UTILISEES POUR LE DEVELOPPEMENT DE PROJET:

  // JSON Suisse: https://bl.ocks.org/mbostock/raw/10024231/3ad08272674371b4a4bec221d97d7a5fbf20525e/ch.json
  // Swiss Cantons & Lakes: https://bl.ocks.org/mbostock/10024231
  // USA Area Choropleth: https://bl.ocks.org/mbostock/4206573
  // ID cantons suisses: https://www.bfs.admin.ch/bfs/fr/home/statistiques/catalogues-banques-donnees/cartes.assetdetail.453856.html
  // Téléchargement de swiss topojson: https://github.com/greenore/swiss-maps
  // 
  // d3 create object without appending: https://stackoverflow.com/questions/25516078/d3-create-object-without-appending/25517076
  // Adding an SVG Element: https://www.dashingd3js.com/adding-an-svg-element
  // How to render [object SVGSVGElement]: https://stackoverflow.com/questions/55572033/how-to-render-object-svgsvgelement
  // d3: https://github.com/d3/d3
  //
  // Echelles: https://github.com/d3/d3-scale#quantile-scales
  // Choropleth Scales: https://blockbuilder.org/SpaceActuary/69e7f74035787955bcf9
  // Choropleth III: https://bl.ocks.org/martgnz/56664c7ea8efef56f93ca948ef855d06
  //
  // d3-legend: https://cdnjs.com/libraries/d3-legend
  // Color Legend: https://observablehq.com/@d3/color-legend
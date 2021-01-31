///////////////////////////////////////////////////////////////////////////////////////////
// Earthquake Activity Map with Tetonic Plates
///////////////////////////////////////////////////////////////////////////////////////////

// url of earthquake activity and tetonic plate data
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var tetonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//retrieve json data and execute createMap function
d3.json(quakeURL, function(data) {
  var quakeData = data.features;
  
  d3.json(tetonicURL, function(data) {
    // Store plate tectonic JSON response object into variable
    var tetonicData = data.features;

    createMap(quakeData, tetonicData);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
//  create map function plots the earthquake and tetonic plate data
///////////////////////////////////////////////////////////////////////////////////////////

function createMap(quakeData,tetonicData) {       
  
  ///////////////////////////////////////////////////////////////////////////////////////////
  // map and map layers
  ///////////////////////////////////////////////////////////////////////////////////////////
  
  // create quake activity layer
  var quakeLayer = L.geoJson(quakeData, {
    pointToLayer: function(feature, location) {
      return L.circleMarker(location);
    },
    style: getStyle,
    onEachFeature: function(feature, layer) {

      var propertyTime = new Date(feature.properties.time);
      var quakeTime = propertyTime.toUTCString();
      // format first charater in string to be capitalized
      var initCapPlace = feature.properties.place.charAt(0).toUpperCase() + feature.properties.place.slice(1);

      layer.bindPopup("Place: " + initCapPlace + "<br>Time: " + quakeTime + "<br>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2]);
    }

  });

  // create tetonic plates layer
  tetonicLayer = L.geoJSON(tetonicData, {
    onEachFeature: makePolyline,
      style: {
        color: 'grey',
        opacity: 0.9
      }
  });

  // create street map layer
  var streetLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });  

  // create dark map layer
  var darkLayer = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
  });

  // create light map layer
  var lightLayer = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
  });

  // create satellite map layer
  var satelliteLayer = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: API_KEY
  });


  // generate the tetonic plate polyline
  function makePolyline(feature, layer){
    L.polyline(feature.geometry.coordinates);
  }
  
  // create overlay maps
  var overlayMaps = {
    Earthquakes: quakeLayer,
    Plates : tetonicLayer
  };

  // Create and center map
  var myMap = L.map("map", {
    center: [19, -6],
    zoom: 1.5,
    layers: [quakeLayer,streetLayer]
  });

  // create base map variable
  var baseMaps = {
    "Street Map": streetLayer,
    "Dark Map": darkLayer, 
    "Light Map": lightLayer, "Satellite Layer" : satelliteLayer
  };

  ///////////////////////////////////////////////////////////////////////////////////////////
  // set color and size of markers 
  ///////////////////////////////////////////////////////////////////////////////////////////

  // returns the style for the markers
  function getStyle(feature) {

    markerStyle = {
      opacity: 0.75,
      fillOpacity: 1,      
      color: "black",
      stroke: true,
      weight: 0.75,
      // set fillcolor by passing quake depth to getColor function
      fillColor: getColor(feature.geometry.coordinates[2]),
      // set radius by passing quake magnitude to quakeRadius function
      radius: quakeRadius(feature.properties.mag),

    };
    return markerStyle
  }
  
  // set quake radius based on the quake magnitude
  function quakeRadius(magnitude) {
    radius = ((magnitude === 0) ? (1) : magnitude * 5)
    return radius;
  }

  // getColor function returns colors based on quake depth
  function getColor(depth) {
    var color = ((depth >= 100) ? ("#EE0000") : ((depth >= 80) ? ("#FF6333") : ((depth >= 60) ? ("#FFA500") : ((depth >= 40) ? ("#FFCC11"):  ((depth >= 20) ? ("#FFEE00"):"#ABCD00")))))
    return color;
}
  ///////////////////////////////////////////////////////////////////////////////////////////
  // create legend 
  ///////////////////////////////////////////////////////////////////////////////////////////

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(myMap) {
    var legend_div = L.DomUtil.create("div", "legend box"),
    buckets = [0, 20, 40, 60, 80, 100];     

    // legend scale and text
    for (var i = 0; i < buckets.length; i++) {
      legend_div.innerHTML +=
        '<i style="background:' + getColor(buckets[i] + 1) + '"></i> ' + buckets[i] + (buckets[i + 1] ? '&ndash;' + buckets[i + 1] + '<br>' : '+');

    }
    return legend_div;
    };

    legend.addTo(myMap);


  ///////////////////////////////////////////////////////////////////////////////////////////
  // add layer control 
  ///////////////////////////////////////////////////////////////////////////////////////////
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

  
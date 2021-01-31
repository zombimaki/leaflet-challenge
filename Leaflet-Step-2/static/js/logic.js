///////////////////////////////////////////////////////////////////////////////////////////
// All-Day Earthquake Map
///////////////////////////////////////////////////////////////////////////////////////////

// url of earthquake and tetonic plate data
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var tetonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"



// use d3.json to read in the api data
d3.json(quakeURL, function(data) {
  var quakeData = data.features;
  
  d3.json(tetonicURL, function(data) {
    // Store plate tectonic JSON response object into variable
    var tetonicData = data.features;

    createMap(quakeData, tetonicData);

  });
});


///////////////////////////////////////////////////////////////////////////////////////////
//  crerate map function plot the earthquake tetonic plate data
///////////////////////////////////////////////////////////////////////////////////////////

function createMap(quakeData,tetonicData) {     

    
    // function returns the stlye for the markers
  function getStyle(feature) {

    markerStyle = {
      opacity: 0.75,
      fillOpacity: 1,      
      color: "black",
      stroke: true,
      weight: 0.75,
      // set fillcolor by passing quake depth to getColor
      fillColor: getColor(feature.geometry.coordinates[2]),
      // set radius by passing quake magnitude to quakeRadius
      radius: quakeRadius(feature.properties.mag),

    };
    return markerStyle
  }

  // add comment
  function makePolyline(feature, layer){
    L.polyline(feature.geometry.coordinates);
  }

  
  ///////////////////////////////////////////////////////////////////////////////////////////
  // map layers
  ///////////////////////////////////////////////////////////////////////////////////////////

  
  // quake layer 
  var quakeLayer = L.geoJson(quakeData, {
    pointToLayer: function(feature, location) {
      return L.circleMarker(location);
    },
    style: getStyle,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Place: " + feature.properties.place+ "<br>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2]);
    }

  });

  // tetonic plates layer
  tetonicLayer = L.geoJSON(tetonicData, {
    onEachFeature: makePolyline,
      style: {
        color: 'red',
        opacity: 0.9
      }
  });

  // streetmap layer
  var streetLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });  
  
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

  var baseMaps = {
    "Street Map": streetLayer,
    // "Dark Map": darkmap
  };

  ///////////////////////////////////////////////////////////////////////////////////////////
  // set color and size of markers 
  ///////////////////////////////////////////////////////////////////////////////////////////
  

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

  
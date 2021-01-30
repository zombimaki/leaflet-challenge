// url of earthquake data
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

 // Create and center map
 var myMap = L.map("map", {
  center: [45.52, -122.67],
  zoom: 3
});

// set streetmap layer
streetLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });
  
// add streetlayer to map
streetLayer.addTo(myMap);


//  GET color radius call to the query URL
d3.json(quakeURL, function(data) {

  // set radiuss from magnitude
  function quakeRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 5;
  }

  function getStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: quakeRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
  
  // set different color from magnitude
    function getColor(depth) {

      var color = (depth > 100) ? ("#EE0000") : ((depth > 80) ? ("#FF6333") : ((depth > 60) ? ("#FFA500") : ((depth > 40) ? ("#FFCC11"):  ((depth > 20) ? ("#FFEE00"):"#ABCD00"))))
     
      return color;

   // }
  }
  
    // create layer of quak locations
    quakeLayer = L.geoJson(data, {

      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
      },
      style: getStyle,
      onEachFeature: function(feature, layer) {
        layer.bindPopup("Place: " + feature.properties.place+ "<br>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2]);
      }
    });
    
    quakeLayer.addTo(myMap);
  
    // create legend object 
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap) {
      var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 20, 40, 60, 80, 100],
      labels = [];

  // Create legend
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
  };

  legend.addTo(myMap);

  });
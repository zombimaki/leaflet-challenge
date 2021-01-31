///////////////////////////////////////////////////////////////////////////////////////////
// All-Day Earthquake Map
///////////////////////////////////////////////////////////////////////////////////////////

// url of earthquake data
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var tetonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

 // Create and center map
 var myMap = L.map("map", {
  center: [45.52, -122.67],
  zoom: 3
});

d3.json(quakeURL, function(data) {
  quakeData = data.features;
  createMap(quakeData);
});

function createMap(quakeData) {
  // set streetmap layer
  streetLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
    
  // add the streetlayer to map
  streetLayer.addTo(myMap);

  ///////////////////////////////////////////////////////////////////////////////////////////
  //  plot the earthquake data from the quakeURL geojson data
  ///////////////////////////////////////////////////////////////////////////////////////////

    
    // set quake radius based on the quake magnitude
    function quakeRadius(magnitude) {
      radius = ((magnitude === 0) ? (1) : magnitude * 5)
      return radius;
    }

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
    
    // getColor function returns colors based on quake depth
      function getColor(depth) {

        var color = ((depth >= 100) ? ("#EE0000") : ((depth >= 80) ? ("#FF6333") : ((depth >= 60) ? ("#FFA500") : ((depth >= 40) ? ("#FFCC11"):  ((depth >= 20) ? ("#FFEE00"):"#ABCD00")))))
      
        return color;
    }
      ///////////////////////////////////////////////////////////////////////////////////////////
      // create layer of quake location layer latlng
      ///////////////////////////////////////////////////////////////////////////////////////////

      quakeLayer = L.geoJson(quakeData, {

        pointToLayer: function(feature, location) {
          return L.circleMarker(location);
        },
        style: getStyle,

        onEachFeature: function(feature, layer) {
          layer.bindPopup("Place: " + feature.properties.place+ "<br>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2]);
        }

      });
      
      quakeLayer.addTo(myMap);

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

}
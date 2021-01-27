function createMap(bikeStations) {

    // Create the tile layer that will be the background of our map
      var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      });
    
  
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {"Street Map": lightmap};
  
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {"Earthquakes": bikeStations};
    
    // Create the map object with options
    var myMap = L.map("map", {
      center: [45.52, -122.67],
      zoom: 3,
      layers: [lightmap, bikeStations]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  }
  

  // Create the createMarkers function
function createMarkers(response) {

  // Pull the "stations" property off of response.data
  var quakes = response.features;

  // Initialize an array to hold bike markers
  var bikeMarkers = [];

  // // Loop through the stations array
  for (var index = 0; index < quakes.length; index++) {
    
  //   // For each station, create a marker and bind a popup with the station's name    
    var quake = quakes[index];

    var geometry = quake['geometry']


    var coordinates = geometry['coordinates']

   

    var bikeMarker = L.marker([coordinates[1], coordinates[0]])
        .bindPopup("<h3>" + coordinates[2] + "</h3>");

    //console.log(bikeMarker)
  //   // Add the marker to the bikeMarkers array
     bikeMarkers.push(bikeMarker);
     console.log(bikeMarkers) 
}

  // Create a layer group made from the bike markers array, pass it into the createMap function
createMap(L.layerGroup(bikeMarkers));

}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", createMarkers);
// Set URL for USGS Earthquake GeoJSON as a variable. I chose to plot all earthquakes in the past day.
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// Set other variables
var earthquakeLayer = new L.layerGroup();
var overlay = { Earthquakes: earthquakeLayer };

// Add tile background layer
var backgroundLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var baseLayer = { Outdoor: backgroundLayer };

// Create the map object + control layers
var earthquakeMap = L.map("map", {
    center: [37.6000, -95.6650],
    zoom: 2.5,
    layers: [backgroundLayer, earthquakeLayer]
});

L.control.layers(baseLayer, overlay, {
    collapse: false
}).addTo(earthquakeMap);

// Fetching the colors for the circles based on depth
function colorFetch(depth) {
    return depth >= 90 ? '#800026' :
        depth < 90 && depth >= 70 ? '#BD0026' :
            depth < 70 && depth >= 50 ? '#E31A1C' :
                depth < 50 && depth >= 30 ? '#FC4E2A' :
                    depth < 30 && depth >= 10 ? '#FD8D3C' :
                        '#FFEDA0';
}

// Draw the circles
function circleArtist(point, latlng) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(latlng, {
        fillOpacity: 0.35,
        color: colorFetch(depth),
        fillColor: colorFetch(depth),
        radius: mag * 20000
    });
}

// Include popups that provide additional information about the earthquake when its associated marker is clicked.
function bindPopup(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

// Get the data from our GeoJSON url and create a map layer with it
d3.json(url).then((data) => {
    var features = data.features;
    L.geoJSON(features, {
        pointToLayer: circleArtist,
        onEachFeature: bindPopup,
    }).addTo(earthquakeLayer);

    // Create Legend
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend');
        depths = [-10, 10, 30, 50, 70, 90]; // Corrected depths array

        for (var i = 0; i < depths.length; i++) { 
            var color = colorFetch(depths[i] + 1);
            var depthRange = depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+');

            div.innerHTML +=
                '<i style="background:' + color + '"></i>' +
                '<span style="margin-left: 5px;">' + depthRange + '</span><br>';
        }
        return div;
    };

    legend.addTo(earthquakeMap);
});
document.addEventListener('DOMContentLoaded', () => {
    const layer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    const map = new ol.Map({
        target: 'map',
        layers: [layer],
        view: new ol.View({
            center: ol.proj.fromLonLat([-0.1276, 51.5074]), 
            zoom: 10
        })
    });

    document.getElementById('consult').addEventListener('click', () => {
        const location = document.getElementById('location').value;
        const option = document.getElementById('options').value;
        console.log(`Location: ${location}, Option: ${option}`);
    });
});
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
        const apiKey = '97dceee882d90161667aebab74971875';

        // URL da API do OpenWeather
        const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${apiKey}`;
        console.log(apiUrl);
        // Faz a requisição à API usando fetch
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const latitude = data[0].lat;
                const longitude = data[0].lon;

                map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
                map.getView().setZoom(12);

                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });
    
});
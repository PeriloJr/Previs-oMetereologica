document.addEventListener('DOMContentLoaded', () => {
    class City {
        constructor(name, lat, lon) {
          this.name = name;
          this.lat = lat;
          this.lon = lon;
        }
      }
    
    const _moonIconUrl = "https://assets.hgbrasil.com/weather/icons/moon/";
    const _weatherType = "https://assets.hgbrasil.com/weather/icons/conditions/";
    const _errorPopup = document.getElementById('error-popup');


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
    
    function displayErrorMessage(message) {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = message;
        _errorPopup.style.display = 'block';
    }

    _errorPopup.addEventListener('mousemove', function() {
        _errorPopup.style.display = 'none';
    });
    
    const BuildApiUrl = (isGeoLocationUrl) =>{
        const location = document.getElementById('location').value;
        let apiUrl = "";

        if(isGeoLocationUrl){
            const apiKey = '97dceee882d90161667aebab74971875';
            apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${apiKey}`;
        }else{
            apiUrl = `https://api.hgbrasil.com/weather?city_name=${location}`;
        }

        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        return proxyUrl + apiUrl;
    }

    const SetMapLocation = (latitude, longitude) =>{
        map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
        map.getView().setZoom(12);
    }

    const CallAPIInformations = async (apiUrl) => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Problema de comunicação com API');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    const OpenModalInformations = () =>{
        var modal = document.getElementById("myModal");
        modal.style.display = "block";
        return modal
    }

    const FillDataInformations = (WeatherInformations) =>{
        console.log(WeatherInformations.results);
        const cityName = document.getElementById('cityName');
        cityName.textContent = `Cidade: ${WeatherInformations.results.city}`;

        const weatherType = document.getElementById('weatherTypeLabel');
        weatherType.textContent = `Tipo do clima: `;

        const weatherTypeIcon = document.getElementById('weatherTypeIcon');
        weatherTypeIcon.src = `${_weatherType}${WeatherInformations.results.condition_slug}.svg`;

        const maxTemperature = document.getElementById('maxTemperature');
        maxTemperature.textContent = `Temperatura maxima: ${WeatherInformations.results.forecast[0].max} ºC`;

        const minTemperature = document.getElementById('minTemperature');
        minTemperature.textContent = `Temperatura minima: ${WeatherInformations.results.forecast[0].min} ºC`;

        const moonFase = document.getElementById('moonPhaseLabel');
        moonFase.textContent = `Fase da lua: `;

        const moonPhaseIcon = document.getElementById('moonPhaseIcon');
        moonPhaseIcon.src = `${_moonIconUrl}${WeatherInformations.results.moon_phase}.png`;
    }

    document.getElementById('consult').addEventListener('click', async () => {
        const geoLocationUrl = BuildApiUrl(true);
        const weatherUrl = BuildApiUrl(false);
        try{
            const CityInformations = await CallAPIInformations(geoLocationUrl);
            const city = new City(CityInformations[0].name, CityInformations[0].lat, CityInformations[0].lon)
            SetMapLocation(city.lat, city.lon);
            
            const WeatherInformations = await CallAPIInformations(weatherUrl);
            
            modal = OpenModalInformations();
            
            FillDataInformations(WeatherInformations);

        }catch(error){
            displayErrorMessage(error.message);
            console.error('Erro ao buscar cidade:', error);
        }

        var span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            modal.style.display = "none";
        }
    
        window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
            }}
        
    });
});
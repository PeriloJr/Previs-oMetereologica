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
    const _DUMMY = "dummy";

    const layer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    /* Inicialização do mapa OpenLayers e centralição do mesmo em coordenadas fixas com zoom 10 */
    const map = new ol.Map({
        target: 'map',
        layers: [layer],
        view: new ol.View({
            center: ol.proj.fromLonLat([-0.1276, 51.5074]), 
            zoom: 10
        })
    });
    
    /*Funcionalidade para aparecer mensagem de erro encontrado */
    function displayErrorMessage(message) {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = message;
        _errorPopup.style.display = 'block';
    }

    /*Ao mover o mouse sobre o popup de erro ele será ocultado*/
    _errorPopup.addEventListener('mousemove', function() {
        _errorPopup.style.display = 'none';
    });
    
    /* Funcionalidade para criação de Urls para chamadas de API */
    const BuildApiUrl = ( location, isGeoLocationUrl) =>{
        const woeid = "455912";
        let apiUrl = "";

        if(isGeoLocationUrl){
            const apiKey = '97dceee882d90161667aebab74971875';
            apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${apiKey}`;
        }else{
            apiUrl = `https://api.hgbrasil.com/weather?woeid=${woeid}`;
            console.log(apiUrl)
        }

        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        return proxyUrl + apiUrl;
    }

    /* Funcionalidade para inserir coordenadas geográficas no mapa*/
    const SetMapLocation = (latitude, longitude) =>{
        map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
        map.getView().setZoom(12);
    }

    /* Método de chamadas de API, importante destacar por ser um método assíncrono */
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

    /* Função onde o modal com informações de clima é aberto */
    const OpenModalInformations = () =>{
        var modal = document.getElementById("myModal");
        modal.style.display = "block";
        return modal
    }

    /* Método para preenchimento de informações no modal*/
    const FillDataInformations = (WeatherInformations) =>{
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

    /* Formatação de texto removendo acentos e diacríticos e convertendo todos os caracteres para minúsculas */
    const normalizeText = (text) => {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    /* Avaliação se já há algum valor duplicado inserido no selectBox */
    const isDuplicate = (value, selectedCities)  => {
        const normalizedValue = normalizeText(value);
        for (let i = 0; i < selectedCities.options.length; i++) {
            if (normalizeText(selectedCities.options[i].text) === normalizedValue) {
                return true;
            }
        }
        return false;
    }

    /* Validações do input do usuário */
    const ValidValidInput = () =>{
        const location = document.getElementById("location").value;
        const selectedCities = document.getElementById("options")

        const emptySelect = selectedCities.value == _DUMMY;

        if (!location.trim().match(/.+/) && emptySelect)
            throw new Error("Campo vazio!")

        if(!emptySelect)
            return selectedCities.value;

        if(!isDuplicate(location, selectedCities) && emptySelect){
            const newOption = document.createElement('option');
            newOption.value = location;
            newOption.text = location;
            selectedCities.add(newOption);
        }

        return location;
    }

    /* Evento clique */
    document.getElementById('consult').addEventListener('click', async () => {
        try{
            /* Valida e obtem qual informação será pesquisada, textbox ou selectbox */
            const location = ValidValidInput();

            /* Criação de Urls de requisições */
            const geoLocationUrl = BuildApiUrl(location, true);
            const weatherUrl = BuildApiUrl(location, false);

            /* Chamada da OpenWeatherApi */
            /* Instrução await para aguardar as informações importantes para prosseguimento da função */
            const CityInformations = await CallAPIInformations(geoLocationUrl);

            /* Criação do objeto cidade  */
            const city = new City(CityInformations[0].name, CityInformations[0].lat, CityInformations[0].lon)
            
            /* Direcionamento no map até a coordenada geográfica obtida */
            SetMapLocation(city.lat, city.lon);
            
            /* Busca por informações de clima */
            const WeatherInformations = await CallAPIInformations(weatherUrl);
            
            /* Abertura do modal para visualização de dados obtidos */
            modal = OpenModalInformations();
            
            /* Preenchimento de informações no modal */
            FillDataInformations(WeatherInformations);

        }catch(error){
            /* Em caso de erro será exibido um popup de erro */
            displayErrorMessage(error.message);
            console.error('Erro ao buscar cidade:', error);
        }

        /* Funções para fechar o modal de informações */
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
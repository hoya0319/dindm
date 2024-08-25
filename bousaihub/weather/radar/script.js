var h = window.innerHeight;
document.getElementById('map').style.height = h - 48 + 'px'
var map = L.map('map').setView([38.26, 135.59], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '© OpenStreetMap, © 気象庁(일본 기상청)',
}).addTo(map);

function roundToNearestFiveMinutes(date) {
    const ms = 1000 * 60 * 5; 
    return new Date(Math.floor(date.getTime() / ms) * ms);
}

function formatTime(date) {
    const pad = num => String(num).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` + `${pad(date.getHours())}${pad(date.getMinutes())}00`;
}
function getUTC(dateInUTC9) {
    const utcDate = new Date(dateInUTC9.getTime() - 9 * 60 * 60 * 1000);
    return formatTime(utcDate);
}

const now = new Date();
const baseTime = roundToNearestFiveMinutes(new Date(now.getTime() - 5 * 60 * 1000));

const sliderMin = -36; 
const sliderMax = 12;  
const sliderStep = 1;  

const timeSlider = document.getElementById('time-slider');
timeSlider.min = sliderMin;
timeSlider.max = sliderMax;
timeSlider.value = 0; 

var lightning = L.icon({
    iconUrl : './light.png',
    iconSize : [32,32]
});
async function loadGeoJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const geojsonData = await response.json();
        return geojsonData;
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
        return null;
    }
}
var radar, lightLayer;
let lightLayerVisible = false;

function getRadar(base, nowTime, future){
    if (radar) {
        map.removeLayer(radar);
    }
    var time = getUTC(nowTime)
    base = getUTC(base)
    var url
    if(future == false){
        url = `https://www.jma.go.jp/bosai/jmatile/data/nowc/${time}/none/${time}/surf/hrpns/{z}/{x}/{y}.png`;
        document.getElementById('time-display').textContent += ' 현재'
    }else{
        url = `https://www.jma.go.jp/bosai/jmatile/data/nowc/${base}/none/${time}/surf/hrpns/{z}/{x}/{y}.png`
        document.getElementById('time-display').textContent += ' 예측'
    }
    radar = L.tileLayer(url, {
        maxZoom: 10,
        attribution: '© OpenStreetMap, © 気象庁(일본 기상청)',
    }).addTo(map);
}
function getLight(nowTime, future) {
    var time = getUTC(nowTime);
    if (lightLayer) {
        map.removeLayer(lightLayer);
    }
    if(future == false && lightLayerVisible != false){
        var url = `https://www.jma.go.jp/bosai/jmatile/data/nowc/${time}/none/${time}/surf/liden/data.geojson?id=liden`
        loadGeoJSON(url).then(geojsonData => {
            if (!geojsonData) return;
            lightLayer = L.geoJSON(geojsonData, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, { icon: lightning });
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(feature.properties.name);
                    }
                }
            }).addTo(map);
        });
    }
}
function updateDisplayedTime() {
    const minutesOffset = timeSlider.value * 5; 
    const selectedTime = new Date(baseTime.getTime() + minutesOffset * 60 * 1000);
    const base = new Date(baseTime.getTime())
    var nowTime = formatTime(selectedTime);
    document.getElementById('time-display').textContent = `${nowTime.slice(6,8)}일 ${nowTime.slice(8,10)}시 ${nowTime.slice(10,12)}분`
    var future = false;
    if(minutesOffset > 0){
        future = true
    }
    getRadar(base, selectedTime, future)
    getLight(selectedTime, future)
}

timeSlider.addEventListener('input', updateDisplayedTime);
updateDisplayedTime();

document.getElementById('light_toggle').addEventListener('click', function () {
    if (lightLayerVisible) {
        map.removeLayer(lightLayer);
        lightLayerVisible = false;
        document.getElementById('light_toggle').style = 'background-color: white'
    } else {
        lightLayerVisible = true;
        updateDisplayedTime()
        document.getElementById('light_toggle').style = 'background-color: rgba(0,0,0,0.6)'
    }
});
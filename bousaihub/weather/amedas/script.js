function mon_day(time){
    return `${time.slice(4,6)}월 ${time.slice(6,8)}일 ${time.slice(8,10)}시 ${time.slice(10,12)}분`
}

var map = L.map('map').setView([35.6, 136.7], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    minZoom: 4,
    attribution: '© OpenStreetMap, © 気象庁(일본 기상청)'
}).addTo(map);


var station_icon = L.icon({
    iconUrl: '/bousaihub/weather/amedas/icons/station.svg',
    iconSize: [15, 15]
})
function dirToKr(dir){
    var data
    if(dir == 1){
        data = '남남서쪽'
    }else if(dir == 2){
        data = '남서쪽'
    }else if(dir == 3){
        data = '서남서쪽'
    }else if(dir == 4){
        data = '서쪽'
    }else if(dir == 5){
        data = '서북서쪽'
    }else if(dir == 6){
        data = '북서쪽'
    }else if(dir == 7){
        data = '북북서쪽'
    }else if(dir == 8){
        data = '북쪽'
    }else if(dir == 9){
        data = '북북동쪽'
    }else if(dir == 10){
        data = '북동쪽'
    }else if(dir == 11){
        data = '동북동쪽'
    }else if(dir == 12){
        data = '동쪽'
    }else if(dir == 13){
        data = '동남동쪽'
    }else if(dir == 14){
        data = '남동쪽'
    }else if(dir == 15){
        data = '남남동쪽'
    }else if(dir == 16 || dir == 0){
        data = '남쪽'
    }else{
        data = dir
    }
    return data
}
function clear(){
    document.getElementById('legend_temp').style.display = 'none'
    document.getElementById('legend_pre1h').style.display = 'none'
    document.getElementById('legend_pre10m').style.display = 'none'
    document.getElementById('legend_pre3h').style.display = 'none'
    document.getElementById('legend_pre24h').style.display = 'none'
    document.getElementById('legend_wind').style.display = 'none'
    document.getElementById('legend_humid').style.display = 'none'
    document.getElementById('legend_sun1h').style.display = 'none'
}
function getLegend(type){
    clear()
    switch(type){
        case 'temp':
            document.getElementById('legend_temp').style.display = 'flex';
            break;
        case 'precipitation10m':
            document.getElementById('legend_pre10m').style.display = 'flex';
            break;
        case 'precipitation1h':
            document.getElementById('legend_pre1h').style.display = 'flex';
            break;
        case 'precipitation3h':
            document.getElementById('legend_pre3h').style.display = 'flex';
            break;
        case 'precipitation24h':
            document.getElementById('legend_pre24h').style.display = 'flex';
            break;
        case 'wind':
            document.getElementById('legend_wind').style.display = 'flex';
            break;
        case 'humidity':
            document.getElementById('legend_humid').style.display = 'flex';
            break;
        case 'sun1h':
            document.getElementById('legend_sun1h').style.display = 'flex';
            break;
    }
}
function getIcon(type, value){
    if(type == 'precipitation10m'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value >= 30){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain1.svg',iconSize: [12, 12]})
        }else if(value >= 20){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain2.svg',iconSize: [12, 12]})
        }else if(value >= 15){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain3.svg',iconSize: [12, 12]})
        }else if(value >= 10){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain4.svg',iconSize: [12, 12]})
        }else if(value >= 5){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain5.svg',iconSize: [12, 12]})
        }else if(value >= 3){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain6.svg',iconSize: [12, 12]})
        }else if(value >= 1){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain7.svg',iconSize: [12, 12]})
        }else if(value > 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain8.svg',iconSize: [12, 12]})
        }else if(value == 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }
    }else if(type == 'precipitation1h'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value >= 80){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain1.svg',iconSize: [12, 12]})
        }else if(value >= 50){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain2.svg',iconSize: [12, 12]})
        }else if(value >= 30){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain3.svg',iconSize: [12, 12]})
        }else if(value >= 20){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain4.svg',iconSize: [12, 12]})
        }else if(value >= 10){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain5.svg',iconSize: [12, 12]})
        }else if(value >= 5){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain6.svg',iconSize: [12, 12]})
        }else if(value >= 1){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain7.svg',iconSize: [12, 12]})
        }else if(value > 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain8.svg',iconSize: [12, 12]})
        }else if(value == 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }
    }else if(type == 'precipitation3h'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value >= 150){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain1.svg',iconSize: [12, 12]})
        }else if(value >= 120){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain2.svg',iconSize: [12, 12]})
        }else if(value >= 100){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain3.svg',iconSize: [12, 12]})
        }else if(value >= 80){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain4.svg',iconSize: [12, 12]})
        }else if(value >= 60){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain5.svg',iconSize: [12, 12]})
        }else if(value >= 40){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain6.svg',iconSize: [12, 12]})
        }else if(value >= 20){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain7.svg',iconSize: [12, 12]})
        }else if(value > 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain8.svg',iconSize: [12, 12]})
        }else if(value == 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }
    }else if(type == 'precipitation24h'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value >= 300){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain1.svg',iconSize: [12, 12]})
        }else if(value >= 250){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain2.svg',iconSize: [12, 12]})
        }else if(value >= 200){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain3.svg',iconSize: [12, 12]})
        }else if(value >= 150){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain4.svg',iconSize: [12, 12]})
        }else if(value >= 100){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain5.svg',iconSize: [12, 12]})
        }else if(value >= 80){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain6.svg',iconSize: [12, 12]})
        }else if(value >= 50){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain7.svg',iconSize: [12, 12]})
        }else if(value > 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain8.svg',iconSize: [12, 12]})
        }else if(value == 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }
    }else if(type == 'temp'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value >= 35){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp1.svg',iconSize: [12, 12]})
        }else if(30 <= value && value < 35){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp2.svg',iconSize: [12, 12]})
        }else if(25 <= value && value < 30){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp3.svg',iconSize: [12, 12]})
        }else if(20 <= value && value < 25){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp4.svg',iconSize: [12, 12]})
        }else if(15 <= value && value < 20){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp5.svg',iconSize: [12, 12]})
        }else if(10 <= value && value < 15){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp6.svg',iconSize: [12, 12]})
        }else if(5 <= value && value < 10){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp7.svg',iconSize: [12, 12]})
        }else if(0 <= value && value < 5){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp8.svg',iconSize: [12, 12]})
        }else if(-5 <= value && value < 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp9.svg',iconSize: [12, 12]})
        }else if(value < -5){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/temp10.svg',iconSize: [12, 12]})
        }else{
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [12, 12]})
        }
    }else if(type == 'humidity'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value == 100){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum1.svg',iconSize: [12, 12]})
        }else if(value >= 90){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum2.svg',iconSize: [12, 12]})
        }else if(value >= 80){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum3.svg',iconSize: [12, 12]})
        }else if(value >= 70){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum4.svg',iconSize: [12, 12]})
        }else if(value >= 60){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum5.svg',iconSize: [12, 12]})
        }else if(value >= 50){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum6.svg',iconSize: [12, 12]})
        }else if(value >= 40){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum7.svg',iconSize: [12, 12]})
        }else if(value >= 30){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum8.svg',iconSize: [12, 12]})
        }else if(value >= 20){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum9.svg',iconSize: [12, 12]})
        }else if(value >= 10){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum10.svg',iconSize: [12, 12]})
        }else if(value >= 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/hum11.svg',iconSize: [12, 12]})
        }else if(value == 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }
    }else if(type == 'sun1h'){
        if(value == null){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
        }else if(value == 1){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain1.svg',iconSize: [12, 12]})
        }else if(value >= 0.8){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain2.svg',iconSize: [12, 12]})
        }else if(value >= 0.6){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain3.svg',iconSize: [12, 12]})
        }else if(value >= 0.4){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain4.svg',iconSize: [12, 12]})
        }else if(value >= 0.2){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain6.svg',iconSize: [12, 12]})
        }else if(value > 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/rain5.svg',iconSize: [12, 12]})
        }else if(value == 0){
            return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [12, 12]})
        }
    }else{
        return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [12, 12]})
    }
}
function getWindIcon(type, value, dir){
    var windIcon, iconSize
    if(value == null){
        return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [4, 4]})
    }else if(value >= 25){
        windIcon = '<img src="./icons/wind1.png"/>';
        iconSize = [12, 12]
    }else if(value >= 20){
        windIcon = '<img src="./icons/wind2.png"/>';
        iconSize = [12, 12]
    }else if(value >= 15){
        windIcon = '<img src="./icons/wind3.png"/>';
        iconSize = [12, 12]
    }else if(value >= 10){
        windIcon = '<img src="./icons/wind4.png"/>';
        iconSize = [12, 12]
    }else if(value >= 5){
        windIcon = '<img src="./icons/wind5.png"/>';
        iconSize = [12, 12]
    }else if(value >= 3){
        windIcon = '<img src="./icons/wind6.png"/>';
        iconSize = [12, 12]
    }else if(value >= 1){
        windIcon = '<img src="./icons/wind7.png"/>';
        iconSize = [12, 12]
    }else if(value > 0){
        windIcon = '<img src="./icons/wind8.png"/>';
        iconSize = [12, 12]
    }else if(value == 0){
        return L.icon({iconUrl: '/bousaihub/weather/amedas/icons/station.svg',iconSize: [8, 8]})
    }
    var rotation = dir * 22.5 + 180
    return L.divIcon({
        html: `<div style="transform: rotate(${rotation}deg) translate(-50%);  background-color: rgba(0,0,0,0);">${windIcon}<div>`,
        className: '',
        iconSize: iconSize
    })
}
var weatherData, locations
var markers = []
async function getData(){
    await fetch('http://localhost:3000/jp_amedas')
        .then(response => response.json())
        .then(data => {
            weatherData = data;
            getStation();
        })
        .catch(error => console.error('Error fetching weather data:', error));
    
}
function getStation(){
    fetch('http://localhost:3000/jp_amedas_station')
        .then(response => response.json())
        .then(data => {
            locations = data;
            updateMarkers(getCurrentDataType());
        })
        .catch(error => console.error('Error fetching location data:', error));
}
function getCurrentDataType() {
    const urlParams = new URLSearchParams(window.location.search);
    var par = urlParams.get('type') || 'temp'; 
    getLegend(par)
    document.getElementById(`${par}-button`).classList.add('now_clicked')
    return par 
}

function updateMarkers(dataType) {
    // 지도에서 기존 마커 제거
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    console.log(weatherData)
    document.getElementById('time').textContent = `${weatherData[0].slice(4,6)}월 ${weatherData[0].slice(6,8)}일 ${weatherData[0].slice(8,10)}시 ${weatherData[0].slice(10,12)}분 현재`
    for (var key in locations) {
        if (locations.hasOwnProperty(key)) {
            var loc = locations[key];
            var lat = loc.lat[0] + loc.lat[1] / 60;
            var lon = loc.lon[0] + loc.lon[1] / 60;
            var data = weatherData[1][key];

            if (data && (!dataType || data[dataType] && data[dataType][0] !== undefined)) {
                var type = dataType || 'temp';
                var stationIcon
                if(type == 'wind'){
                    stationIcon = getWindIcon(type, data[type][0], data.windDirection[0])
                }else{
                    stationIcon = getIcon(type, data[type][0]);
                }

                var marker = L.marker([lat, lon], { icon: stationIcon }).addTo(map);
                
                marker.on('click', function(e) {
                    var clickedLat = e.latlng.lat;
                    var clickedLng = e.latlng.lng;
                    var clickedKey = Object.keys(locations).find(key => {
                        var loc = locations[key];
                        var markerLat = loc.lat[0] + loc.lat[1] / 60;
                        var markerLng = loc.lon[0] + loc.lon[1] / 60;
                        return Math.abs(clickedLat - markerLat) < 0.0001 && Math.abs(clickedLng - markerLng) < 0.0001;
                    });
                    
                    var matchedData = weatherData[1][clickedKey];
                    var infoDiv = document.getElementById('info');

                    while (infoDiv.firstChild) {
                        infoDiv.removeChild(infoDiv.firstChild);
                    }

                    var title = document.createElement('h2');
                    title.textContent = locations[clickedKey].enName;
                    infoDiv.appendChild(title);

                    var jptitle = document.createElement('p');
                    jptitle.textContent = `${locations[clickedKey].kjName} (${locations[clickedKey].knName})`;
                    jptitle.className = 'jp jpname'
                    infoDiv.appendChild(jptitle);

                    if (matchedData) {
                        var table = document.createElement('table');
                        var tableBody = document.createElement('tbody');

                        function createDataRow(label, value) {
                            if (value !== 'N/A') {
                                var row = document.createElement('tr');
                                var cellLabel = document.createElement('th');
                                cellLabel.textContent = label;
                                var cellValue = document.createElement('td');
                                cellValue.textContent = value;
                                row.appendChild(cellLabel);
                                row.appendChild(cellValue);
                                tableBody.appendChild(row);
                            }
                        }
                        try{
                            createDataRow('기온', matchedData.temp + '°C' ? matchedData.temp[0] + '°C': 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('10분 강수량', matchedData.precipitation10m + 'mm' ? matchedData.precipitation10m[0] + 'mm' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('1시간 강수량', matchedData.precipitation1h + 'mm' ? matchedData.precipitation1h[0] + 'mm' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('3시간 강수량', matchedData.precipitation3h + 'mm' ? matchedData.precipitation3h[0] + 'mm' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('24시간 강수량', matchedData.precipitation24h + 'mm' ? matchedData.precipitation24h[0] + 'mm' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('습도', matchedData.humidity+ '%' ? matchedData.humidity[0]+ '%' : 'N/A');
                        }catch(err){}
                        try{
                            var windDirection = matchedData.windDirection ? dirToKr(matchedData.windDirection[0]) : 'N/A';
                            var windSpeed = matchedData.wind ? `${matchedData.wind[0]}m/s` : 'N/A';
                            createDataRow('바람', windDirection !== 'N/A' || windSpeed !== 'N/A' ? `${windDirection}  ${windSpeed}` : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('일조시간', matchedData.sun1h + '시간' ? matchedData.sun1h[0] + '시간' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('시정', matchedData.visibility+ 'm' ? matchedData.visibility[0] + 'm' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('현지기압', matchedData.pressure+ 'hPa' ? matchedData.pressure[0] + 'hPa' : 'N/A');
                        }catch(err){}
                        try{
                            createDataRow('해면기압', matchedData.normalPressure+ 'hPa' ? matchedData.normalPressure[0] + 'hPa' : 'N/A');
                        }catch(err){}
                        table.appendChild(tableBody);
                        infoDiv.appendChild(table);
                    } else {
                        var noData = document.createElement('p');
                        noData.textContent = '데이터 없음. 이 현상이 반복된다면 오른쪽 아래 버튼을 이용해 신고해주세요.';
                        infoDiv.appendChild(noData);
                    }
                    
                    var text = document.createElement('p');
                    text.textContent = '관측점 정보'
                    text.className = 'station_info_title'
                    infoDiv.appendChild(text)

                    var altitude = document.createElement('p');
                    altitude.textContent = `고도: ${locations[clickedKey].alt}m`;
                    altitude.className = 'station_info'
                    infoDiv.appendChild(altitude);
                    var type = document.createElement('p');
                    type.className = 'station_info'
                    type.textContent = `관측점 종류: ${locations[clickedKey].type}`;
                    infoDiv.appendChild(type);
                });

                markers.push(marker);
            }
        }
    }
}

document.getElementById('precipitation10m-button').addEventListener('click', function() {
    const type = 'precipitation10m';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('precipitation1h-button').addEventListener('click', function() {
    const type = 'precipitation1h';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('precipitation3h-button').addEventListener('click', function() {
    const type = 'precipitation3h';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('precipitation24h-button').addEventListener('click', function() {
    const type = 'precipitation24h';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('temp-button').addEventListener('click', function() {
    const type = 'temp';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('wind-button').addEventListener('click', function() {
    const type = 'wind';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('humid-button').addEventListener('click', function() {
    const type = 'humidity';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});
document.getElementById('sun1h-button').addEventListener('click', function() {
    const type = 'sun1h';
    getLegend(type)
    updateMarkers(type);
    updateURLParam('type', type);
});

function updateURLParam(param, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}
const items = document.querySelectorAll('.amedas_button');
items.forEach((item)=>{
    item.addEventListener('click',()=>{
        items.forEach((e)=>{
            e.classList.remove('now_clicked');
        })
        item.classList.add('now_clicked');
    })
})
getData();
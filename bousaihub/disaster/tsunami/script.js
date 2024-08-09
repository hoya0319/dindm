import mon_day from '../../../../src/time.js'
var map = L.map('map').setView([35.6, 136.7], 5);

let id = ''
const searchParams = new URLSearchParams(location.search);
for (const param of searchParams) {
    id = param[1];
}
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 8,
    minZoom: 4,
    attribution: '© OpenStreetMap, © 気象庁(일본 기상청)'
}).addTo(map);
var tsunamiData, area, station
function getTsunamiData(){
    fetch(`http://localhost:3000/jp_tsunami?id=${id}`)
    .then(response => response.json())
    .then(data => {
        tsunamiData = data;
        try{
            getTsunamiArea(tsunamiData.body.tsunami.forecasts)
            getTsunamiPara()
        }catch(err){
            document.getElementById('stationName').textContent = '현재 발표 중인 해일정보는 없습니다.';
            document.getElementById('headline').style.display = 'none'
            document.getElementById('earthquakeInfo').style.display = 'none'
            document.getElementById('tsunamiTextBox').style.display = 'none'
            document.getElementById('tsunamiSetsumei').style.display = 'none'
        }
    })
    .catch(error => console.error('Error fetching weather data:', error));
}
function getTsunamiArea(data){
    var tsunamiForecastArea = ''
    for(var i = 0; i < data.length ; i++){
        var nowData = data[i]
        tsunamiForecastArea += `${nowData.code},`
    }
    console.log(tsunamiForecastArea.slice(0,-1))
    fetch(`http://localhost:3000/jp_tsunamiArea?id=${tsunamiForecastArea.slice(0,-1)}`)
    .then(response => response.json())
    .then(data => {
        area = data
        draw()
    })
    .catch(error => console.error('Error fetching weather data:', error));
}
function getTsunamiPara(){
    fetch(`http://localhost:3000/jp_tsunamiPara`)
    .then(response => response.json())
    .then(data => {
        station = data;
    })
    .catch(error => console.error('Error fetching weather data:', error));
}
function getStyle(kind) {
    switch(kind) {
        case '대해일경보':
            return { color: 'rgb(200,0,255)', weight: 8 };
        case '대해일경보 : 발표':
            return { color: 'rgb(200,0,255)', weight: 8 };
        case '해일경보':
            return { color: 'rgb(255,40,0)', weight: 5 };
        case '해일주의보':
            return { color: 'rgb(250,245,0)', weight: 5 };
        case '해일예보':
            return { color: '#66ffff', weight: 5 };
        case '해일예보(약간의 해수면변동)':
            return { color: '#66ffff', weight: 5 };
        case '해일주의보 해제':
            return { color: '#6e6e6e', weight: 5 };
        default:
            return { color: 'blue', weight: 5 };
    }
}
var epicenter = L.icon({
    iconUrl: '/src/images/epicenter.png',
    iconSize: [25, 25]
})
function getCoordinate(coord){
    const regex = /([+-]?\d+\.\d+)([+-]\d+\.\d+)/;
    const match = coord.match(regex);
    if(match){
        var lat = parseFloat(match[1]);
        var lon = parseFloat(match[2]);
        if(lon < 0){
            lon += 360;
        }

        return [lat, lon]
    }else{
        console.error('잘못된 좌표 형식');
        return null
    }
}
function getClassStyle(type){
    if(type == '대해일경보 : 발표' || type == '대해일경보'){
        return 'border: 1px solid rgb(200,0,255); background-color: rgb(200,0,255); color: white;'
    }else if(type == '해일경보'){
        return 'border: 1px solid rgb(255,40,0); background-color: rgb(255,40,0); color: white;'
    }else if(type == '해일주의보'){
        return 'border: 1px solid rgb(250,245,0); background-color: rgb(250,245,0);'
    }else if(type == '해일예보' || type == '해일예보(약간의 해수면변동)'){
        return 'border: 1px solid #66ffff; background-color: #66ffff;'
    }else if(type == '해일주의보 해제'){
        return 'border: 1px solid #6e6e6e; background-color: #6e6e6e; color:white;'
    }
}
function draw(){
    console.log(tsunamiData)
    console.log(area)

    //예보
    var forecasts = tsunamiData.body.tsunami.forecasts
    // console.log(forecasts)
    document.getElementById('time').textContent = mon_day(tsunamiData.reportDateTime) + ' 발표';
    if((tsunamiData.validDateTime).length != 0){
        document.getElementById('time').textContent += `\n${mon_day(tsunamiData.validDateTime)} 까지 유효`
    }
    var headline = tsunamiData.headline
    if(headline == '해일의 관측치를 공지합니다.'){
        headline = `${(mon_day(tsunamiData.targetDateTime)).slice(4,)}의 해일의 관측치를 공지합니다.`
    }
    document.getElementById('headline').textContent = headline;
    document.getElementById('tsunamiText').textContent = tsunamiData.body.comments;
    //지진정보 부분
    var quakeDiv = document.getElementById('earthquakeInfo');
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
    for(var i = 0; i < (tsunamiData.body.earthquakes).length; i++){
        L.marker(getCoordinate(tsunamiData.body.earthquakes[i].hypocenter.coordinate), { icon: epicenter }).addTo(map);
        createDataRow('발생시각', mon_day(tsunamiData.body.earthquakes[i].originTime))
        createDataRow('진원지', tsunamiData.body.earthquakes[i].hypocenter.name)
        createDataRow('깊이', tsunamiData.body.earthquakes[i].hypocenter.depth)
        createDataRow('규모', tsunamiData.body.earthquakes[i].magnitude)
        var source = tsunamiData.body.earthquakes[i].source;
        if(source != ''){
            createDataRow('소스', source)
        }
        table.appendChild(tableBody);
    }
    var p = document.createElement('h4')
    p.textContent = '지진 정보'
    quakeDiv.appendChild(p)
    quakeDiv.appendChild(table);

    var linesArray = [];
    function addGeoJsonToMap(geojson, forecastData) {
        L.geoJSON(geojson, {
            style: function(feature) {
                var forecast = forecastData.find(f => f.code === feature.properties.code);
                return forecast ? getStyle(forecast.kind) : { color: 'blue', weight: 5 };
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function() {
                    var forecast = forecastData.find(f => f.code === feature.properties.code);
                    // console.log(forecast)
                    if (forecast) {
                        var infoDiv = document.getElementById('info');
                        while (infoDiv.firstChild) {
                            infoDiv.removeChild(infoDiv.firstChild);
                        }

                        var title = document.createElement('h2');
                        title.textContent = forecast.name;
                        infoDiv.appendChild(title);

                        var con = document.createElement('div');
                        con.className = 'conditionBox'
                        if(forecast.maxHeight.condition){
                            var condition = document.createElement('p');
                            condition.textContent = forecast.maxHeight.condition;
                            condition.className = 'condition'
                            con.appendChild(condition);
                        }if(forecast.maxHeight.revise){
                            var condition = document.createElement('p');
                            condition.textContent = forecast.maxHeight.revise;
                            condition.className = 'revise'
                            con.appendChild(condition);
                        }
                        infoDiv.appendChild(con)

                        var kind = document.createElement('p');
                        kind.textContent = forecast.kind;
                        kind.style = getClassStyle(forecast.kind)
                        kind.className = 'tsunamiClassBox'
                        infoDiv.appendChild(kind);

                        if(forecast.maxHeight.height){
                            var maxHeight = document.createElement('p');
                            maxHeight.textContent = `예상 높이: ${forecast.maxHeight.height}`;
                            infoDiv.appendChild(maxHeight);
                        }

                        var arrivalTime = document.createElement('p');
                        // console.log((forecast.arrivalTime).length)
                        if((forecast.arrivalTime).length == 25){
                            arrivalTime.textContent = `도달 예상 시각: ${(mon_day(forecast.arrivalTime)).slice(4,)}`
                        }else{
                            arrivalTime.textContent = `${forecast.arrivalTime}`;
                        }
                        infoDiv.appendChild(arrivalTime);
                        
                        if(forecast.kind != '' && forecast.lastkind != '해일 없음' && forecast.kind != forecast.lastkind){
                            var lastKind = document.createElement('p');
                            lastKind.textContent = `'${forecast.lastkind}'가 '${forecast.kind}'로 전환`;
                            lastKind.className = 'infoBoxLastKind'
                            infoDiv.appendChild(lastKind);
                        }
                    }
                });
            }
        }).addTo(map);
    }

    // area 배열에서 각 geoJSON 객체를 지도에 추가
    area.forEach(geojson => {
        addGeoJsonToMap(geojson, forecasts);
    });
    tsunamiObserved();

    // console.log(forecasts)
    forecasts.forEach(data => {
        var container
        if(data.kind == '대해일경보 : 발표' || data.kind == '대해일경보'){
            document.getElementById('majorWarning').style.display = 'block';
            container = document.getElementById('majorWarning');
        }else if(data.kind == '해일경보'){
            document.getElementById('warning').style.display = 'block';
            container = document.getElementById('warning');
        }else if(data.kind == '해일주의보'){
            document.getElementById('advisory').style.display = 'block';
            container = document.getElementById('advisory');
        }else if(data.kind == '해일예보' || data.kind == '해일예보(약간의 해수면변동)'){
            document.getElementById('watch').style.display = 'block';
            container = document.getElementById('watch');
        }else if(data.kind == '해일주의보 해제'){
            document.getElementById('clear').style.display = 'block';
            container = document.getElementById('clear');
        }
        const divBox = document.createElement('div')

        const area = document.createElement('h4');
        area.className = 'forecastArea'
        area.textContent = data.name;
        divBox.appendChild(area);

        var timeCont
        if((data.arrivalTime).length == 25){
            timeCont = (mon_day(data.arrivalTime)).slice(4,)
        }else{
            timeCont = data.arrivalTime
        }
        
        const time = document.createElement('h4');
        time.className = 'forecastTime'
        time.textContent = timeCont;
        divBox.appendChild(time);

        const height = document.createElement('h4');
        height.className = 'forecastHeight'
        height.textContent = data.maxHeight.height;
        divBox.appendChild(height);

        container.appendChild(divBox)
    })
}
function getObColor(val){
    if(val < 0.2){
        return 'rgb(0, 255, 255)'
    }else if(val < 1){
        return 'rgb(255, 238, 0)'
    }else if(val < 3){
        return 'rgb(217, 29, 0)'
    }else if(val >= 3){
        return 'rgb(191, 0, 255)'
    }else{
        return 'gray'
    }
}
function tsunamiObserved(){
    console.log(tsunamiData.body.tsunami.observation)
    console.log(station)
    const observation = tsunamiData.body.tsunami.observation;

    observation.forEach(region => {
        region.stations.forEach(stationData => {
            const matchedStation = station.find(st => st.code === stationData.code);

            if (matchedStation) {
                try{
                    const [latStr, lonStr] = matchedStation.latlon;
                    const lat = parseFloat(latStr);
                    const lon = parseFloat(lonStr);
                    let height = parseFloat(stationData.maxHeight.height.height);
                    var textHeight = stationData.maxHeight.height.height

                    if (isNaN(height)) {
                        height = 0.5;
                        textHeight = stationData.maxHeight.height.condition
                    } else if (height < 0.5) {
                        height = 0.5;
                    } else if (height > 10) {
                        height = 10;
                    }

                    const rectangle = L.rectangle([
                        [lat, lon - 0.05],
                        [lat + (height / 5), lon + 0.05]
                    ], {
                        color: getObColor(parseFloat(stationData.maxHeight.height.height)),
                        fillOpacity: 1,
                        lineCap: 'round'
                    }).addTo(map);
                    var ar = stationData.firstHeight.arrivalTime
                    if(ar == ''){
                        ar = '제1파 식별 불능'
                    }else{
                        ar = mon_day(ar).slice(4,)
                    }
                    var mx = stationData.maxHeight.dateTime
                    if(mx == ''){
                        mx = '식별 불능'
                    }else{
                        mx = mon_day(mx).slice(4,)
                    }
                    var ini =''
                    if(stationData.firstHeight.initial != ''){
                        ini = `(${stationData.firstHeight.initial})`
                    }

                    rectangle.bindPopup(`
                    <h4 style="font-family: 'Pretendard-Regular'; text-align: center;">${matchedStation.name}</h4>
                    <table style="font-family: 'Pretendard-Regular'">
                        <tr>
                            <th style='text-align: center;'>제1파 도달시각</th>
                            <td>${ar} ${ini}</td>
                        </tr>
                        <tr>
                            <th style='text-align: center;'>최대파 도달시각</th>
                            <td>${mx}</td>
                        </tr>
                        <tr>
                            <th style='text-align: center;'>최대파의 높이</th>
                            <td>${textHeight}</td>
                        </tr>
                    </table>
                `);
                }catch(error){
                    console.log(error)
                }
            }
        });
    });
}
getTsunamiData()
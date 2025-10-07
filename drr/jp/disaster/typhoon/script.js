import mon_day, {mon_day_year} from '../../../../src/time.js'
var map = L.map('map', { zoomControl: false }).setView([30, 140], 3);

const searchParams = new URLSearchParams(location.search);
let id = ''
for (const param of searchParams) {
    id = param[1];
}
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 8,
    minZoom: 3,
    attribution: `© OpenStreetMap, © <span class="jp">気象庁</span>(일본 기상청)`
}).addTo(map);

function getCoordinate(cord) {
    var centerCord
    if (cord.length == 12) {
        centerCord = [cord.slice(1, 5), cord.slice(6, -1)]
    } else if (cord.length == 11) {
        centerCord = [cord.slice(1, 4), cord.slice(5, -1)]
    }
    return centerCord
};
function toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}
var now_typhoon_center = L.icon({
    iconUrl: '/drr/jp/disaster/typhoon_past/typhoon.svg',
    iconSize: [25, 25]
});


function toggleCircleVisibility(circle) {
    var radius = circle.getRadius();

    if (radius < 100) {
        circle.setStyle({ opacity: 0, fillOpacity: 0 });
    } else {
        circle.setStyle({ opacity: 1, fillOpacity: 0.2 });
    }
};

function calculateNewCoords(lat, lon, distance, direction) {
    const R = 6371;

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const distanceRad = distance / R;

    let newLatRad, newLonRad;

    const directionAngles = {
        '북': 0,
        '북동': 45,
        '동': 90,
        '남동': 135,
        '남': 180,
        '남서': 225,
        '서': 270,
        '북서': 315
    };

    const angle = directionAngles[direction] * Math.PI / 180;

    newLatRad = latRad + distanceRad * Math.cos(angle);
    newLonRad = lonRad + distanceRad * Math.sin(angle) / Math.cos(latRad);

    const newLat = newLatRad * 180 / Math.PI;
    const newLon = newLonRad * 180 / Math.PI;

    return [newLat, newLon];
};
function calculateCircleParams(directions, distances, center) {
    var distancesNum = distances.map(Number);
    var centerLat = Number(center[0]);
    var centerLon = Number(center[1]);

    var averageDistance = (distancesNum[0] + distancesNum[1]) / 2;
    var longerDirection = distancesNum[0] > distancesNum[1] ? directions[0] : directions[1];
    var offsetDistance = Math.abs(distancesNum[0] - averageDistance);

    var [newCenterLat, newCenterLon] = calculateNewCoords(centerLat, centerLon, offsetDistance, longerDirection);

    return {
        center: [newCenterLat, newCenterLon],
        radius: averageDistance * 1000
    };
};
const typhoonLayers = {
    windCircles: [],
    forecast: [],
    warningCircles: [],
    centerLines: [],
    centerDots: [],
    divIcons: []
};
const suiteiLayers = []

function toggleLayerGroup(layers, suiteiLayers) {
    if (layers.length === 0) return;

    if (map.hasLayer(layers[0])) {
        layers.forEach(layer => map.removeLayer(layer));
        suiteiLayers.forEach(layer => layer.addTo(map));
    } else {
        layers.forEach(layer => layer.addTo(map));
        suiteiLayers.forEach(layer => map.removeLayer(layer));
    }
}
function mapDraw(data) {
    const centerCoord = getCoordinate(data.body.info.now.center.coordinate);

    var mark = L.marker(centerCoord, { icon: now_typhoon_center }).addTo(map);
    typhoonLayers.divIcons.push(mark);
    function createWindCircle(color, fillColor, directions, distances, centerWind) {
        const { center, radius } = calculateCircleParams(directions, distances, centerWind);
        const circle = L.circle(center, {
            color,
            fillColor,
            radius
        }).addTo(map);

        toggleCircleVisibility(circle);

        // 팝업 이벤트 바인딩
        circle.on('click', () => {
            const popupContent = `
                <div>
                    <p style="font-family: 'Pretendard Variable'; text-align: center; font-weight:bold; font-size:1rem; margin:0">
                        ${data.body.info.now.classification.category} - ${data.body.typhoon.name.text}
                    </p>
                    <p style="font-family: 'Pretendard Variable'; text-align: center; font-size:0.8rem; margin:-5px">
                        ${mon_day(data.body.info.now.dateTime).slice(3, -3)} 현재
                    </p>
                    <table style="font-family: 'Pretendard Variable'">
                        <tr>
                            <th style='text-align: center;'>중심기압</th>
                            <td>${data.body.info.now.center.pressure}hPa</td>
                        </tr>
                        <tr>
                            <th style='text-align: center;'>최대풍속</th>
                            <td>${data.body.info.now.wind.average}m/s</td>
                        </tr>
                        <tr>
                            <th style='text-align: center;'>최대순간풍속</th>
                            <td>${data.body.info.now.wind.instantaneous}m/s</td>
                        </tr>
                    </table>
                </div>
            `;
            L.popup()
                .setLatLng(centerCoord)
                .setContent(popupContent)
                .openOn(map);
        });
        typhoonLayers.windCircles.push(circle);

        return circle;
    }

    createWindCircle(
        'yellow',
        '#ffff00e6',
        data.body.info.now.wind.area.strong.direction,
        data.body.info.now.wind.area.strong.radius,
        centerCoord
    );

    createWindCircle(
        'red',
        '#ff0000e6',
        data.body.info.now.wind.area.storm.direction,
        data.body.info.now.wind.area.storm.radius,
        centerCoord
    );

    let forecastLines = [];
    function mapForecast(data) {
        const forecasts = data.body.info.forecast;

        // 공통 팝업 생성 함수
        function bindPopup(layer, forecastData, coordinates, label) {
            layer.on('click', () => {
                const popupContent = `
                <div>
                    <p style="font-family: 'Pretendard Variable'; text-align: center; font-weight:bold; font-size:1rem; margin:0">
                        ${forecastData.classification.category}
                    </p>
                    <p style="font-family: 'Pretendard Variable'; text-align: center; font-size:0.8rem; margin:-5px">
                        ${mon_day(forecastData.dateTime).slice(3, -3)} ${label}
                    </p>
                    <table style="font-family: 'Pretendard Variable'">
                        <tr>
                            <th style='text-align: center;'>중심기압</th>
                            <td>${forecastData.center.pressure}hPa</td>
                        </tr>
                        <tr>
                            <th style='text-align: center;'>최대풍속</th>
                            <td>${forecastData.wind.average}m/s</td>
                        </tr>
                        <tr>
                            <th style='text-align: center;'>최대순간풍속</th>
                            <td>${forecastData.wind.instantaneous}m/s</td>
                        </tr>
                    </table>
                </div>
            `;
                L.popup()
                    .setLatLng(coordinates)
                    .setContent(popupContent)
                    .openOn(map);
            });
        }

        for (let j = forecasts.length - 1; j >= 0; j--) {
            const forecastData = forecasts[j];
            if (forecastData.isSuitei){
                console.log('asdfadf')
                console.log(forecastData)
                const suiteiCoordinates = getCoordinate(forecastData.center.coordinate);
                var mark = L.marker(suiteiCoordinates, { icon: now_typhoon_center }).addTo(map);
                suiteiLayers.push(mark);

                var suiwind = createWindCircle(
                    'yellow',
                    '#ffff00e6',
                    forecastData.wind.area.strong.direction,
                    forecastData.wind.area.strong.radius,
                    getCoordinate(forecastData.center.coordinate)
                );
                var suistorm = createWindCircle(
                    'red',
                    '#ff0000e6',
                    forecastData.wind.area.storm.direction,
                    forecastData.wind.area.storm.radius,
                    getCoordinate(forecastData.center.coordinate)
                )
                suiteiLayers.push(suiwind);
                suiteiLayers.push(suistorm);

                suiteiLayers.forEach(layer => map.removeLayer(layer));

                continue;
            }

            const forecastCoordinates = getCoordinate(forecastData.center.probabilityCircle.baseCoordinate);
            forecastLines.push(forecastCoordinates);

            const posibilityCircle = L.circle(forecastCoordinates, {
                color: 'white',
                weight: 3,
                fillColor: '#00ff0000',
                radius: forecastData.center.probabilityCircle.radius * 1000
            }).addTo(map);

            bindPopup(posibilityCircle, forecastData, forecastCoordinates, "예보");

            
            typhoonLayers.forecast.push(posibilityCircle);

            const yohoTimeIcon = L.divIcon({
                className: 'yoho_time_icon',
                html: `<div class="yoho_time_icon_label" style="font-family: 'Pretendard Variable';width:max-content; margin-left: -25px;">
                       ${mon_day(forecastData.dateTime).slice(3, -3)} 예보
                   </div>`
            });
            const [lat, lon] = forecastCoordinates;
            var divIcon = L.marker([parseFloat(lat) - 0.1, lon], { icon: yohoTimeIcon }).addTo(map);
            typhoonLayers.divIcons.push(divIcon);

            // ---------------------------
            // 3. 폭풍 경계 원
            // ---------------------------
            const { center: warningCenter, radius: warningRadius } = calculateCircleParams(
                forecastData.wind.area.stormWarning.direction,
                forecastData.wind.area.stormWarning.radius,
                forecastCoordinates
            );

            const warningCircle = L.circle(warningCenter, {
                color: 'red',
                fillColor: '#00ff0000',
                radius: warningRadius
            }).addTo(map);
            typhoonLayers.warningCircles.push(warningCircle); 

            toggleCircleVisibility(warningCircle);
            bindPopup(warningCircle, forecastData, forecastCoordinates, "예보");
        }
    }
    mapForecast(data);
    try {
        function mapPast(data) {
            const pastInfo = data.body.info.past;

            // 1. 과거 좌표 경로 라인
            const latlngs = pastInfo.map(p => getCoordinate(p.coord));
            L.polyline(latlngs, { color: 'blue', weight: 2 }).addTo(map);

            // 2. 강도(str) → 색상 매핑 함수
            function getColor(pastData) {
                switch (pastData.str) {
                    case '맹렬한': return 'rgb(195,0,255)';
                    case '매우강': return 'red';
                    case '강': return 'yellow';
                    default:
                        const windValue = parseInt(pastData.maxwind.slice(0, 2));
                        if (isNaN(windValue) || windValue < 18 || pastData.maxwind === 'm/s') {
                            return 'rgb(131, 131, 131)';
                        }
                        return 'white';
                }
            }

            // 3. 팝업 HTML 생성 함수
            function createPopup(pastData) {
                return `
                    <div>
                        <p style="font-family: 'Pretendard Variable'; text-align: center; font-weight:bold; margin:0; font-size:0.9rem;">
                            ${mon_day(pastData.time)}
                        </p>
                        <table style="font-family: 'Pretendard Variable'">
                            <tr>
                                <th style='text-align: center;'>종류</th>
                                <td>${pastData.class}</td>
                            </tr>
                            <tr>
                                <th style='text-align: center;'>중심기압</th>
                                <td>${pastData.press}</td>
                            </tr>
                            <tr>
                                <th style='text-align: center;'>최대풍속</th>
                                <td>${pastData.maxwind}</td>
                            </tr>
                            <tr>
                                <th style='text-align: center;'>강도</th>
                                <td>${pastData.str}</td>
                            </tr>
                        </table>
                    </div>
                `;
            }

            // 4. 각 지점에 원 추가 + 팝업 바인딩
            pastInfo.slice(0, -1).forEach(pastData => {
                const latlng = getCoordinate(pastData.coord);
                const circle = L.circle(latlng, {
                    color: getColor(pastData),
                    fillOpacity: 1,
                    radius: 1000
                }).addTo(map);

                circle.bindPopup(createPopup(pastData)).setLatLng(latlng);
            });
        }
        mapPast(data)
    }catch(error){
        var lines=[]
        var pastCen = (data.body.info.past).map(getCoordinate)
        var line = L.polyline(pastCen, { color: 'blue', weight: 2 }).addTo(map)
        lines.push(line);
    
        pastCen.pop();
        pastCen.forEach(function (coord) {
            L.circle(coord, {
                color: 'blue',
                fillOpacity: 1,
                radius: 500
            }).addTo(map);
        });
        console.log('태풍정보 v1.0.0 버전입니다. 태풍 경로 정보에 미대응.')
    }
    
    const centerLines = [];
    forecastLines.push(getCoordinate(data.body.info.now.center.coordinate))
    const forecastLine = L.polyline(forecastLines, { color: 'white', dashArray: '5, 5', dashOffset: '0', weight: 2 }).addTo(map);
    centerLines.push(forecastLine)
    forecastLines.slice(0,-1).forEach(function (coord) {
        var centerDot = L.circle(coord, {
            color: 'white',
            fillColor: 'white',
            fillOpacity: 1,
            radius: 1000
        }).addTo(map);
        typhoonLayers.centerDots.push(centerDot);
        typhoonLayers.centerLines.push(forecastLine);
    });
    
    const toggleBtn = document.getElementById("suiteiON");

    // 버튼 클릭 이벤트 등록
    toggleBtn.addEventListener("click", () => {
        toggleLayerGroup([
            ...typhoonLayers.windCircles,
            ...typhoonLayers.forecast,
            ...typhoonLayers.warningCircles,
            ...typhoonLayers.centerLines,
            ...typhoonLayers.centerDots,
            ...typhoonLayers.divIcons
        ], suiteiLayers);
    });
}
function info(data){
    function getSize(size){
        var box = document.getElementById('now_size');
        switch(size){
            case '대형':
                box.style = 'display:block; background-color: red; color: white;';
                box.textContent = '대형';
                break;
            case '초대형':
                box.style = 'display:block; background-color: rgb(195, 0, 255); color: white';
                box.textContent = '초대형';
                break;
            default:
                box.style = 'display:none';
        }
    }
    function getStrength(str){
        var box = document.getElementById('now_strength');
        switch(str){
            case '맹렬한':
                box.style = 'display:block; background-color: rgb(195,0,255); color:white';
                box.textContent = '맹렬한';
                break;
            case '매우강':
                box.style = 'display:block; background-color: red; color: white;';
                box.textContent = '매우강';
                break;
            case '강':
                box.style = 'display:block; background-color: yellow; color:black';
                box.textContent = '강';
                break;
            default:
                box.style = 'display:none';
        }
    }
    function area_check(data) {
        // console.log(data)
        if (data.radius[0] == '') {
            return '--'
        } else if (data.radius[0] == data.radius[1]) {
            return `반경 ${data.radius[0]}km`
        } else {
            return `${data.direction[0]}쪽 ${data.radius[0]}km\n${data.direction[1]}쪽 ${data.radius[1]}km`
        }
    }
    document.getElementById('typ_info').style = 'display:block';
    if(data.body.typhoon.name.number.length > 1){
        document.getElementById('typ_name').textContent = `태풍 제${data.body.typhoon.name.number.slice(2)}호 - ${data.body.typhoon.name.text}`;
    }else{
        document.getElementById('typ_name').textContent = `발달중인 열대저기압`;
    }
    document.getElementById('typ_reportTime').textContent = mon_day_year(data.reportDateTime) + ' 발표';
    getSize(data.body.info.now.classification.size)
    getStrength(data.body.info.now.classification.intensity);
    if(data.body.typhoon.outline){
        if((data.body.typhoon.remark).includes('소멸')){
            document.getElementById('typ_outline').textContent = `${data.body.typhoon.remark}`;
        }else{
            document.getElementById('typ_outline').textContent = `${data.body.typhoon.outline}\n${data.body.typhoon.remark}`;
        }
    }else{
        document.getElementById('typ_outline').textContent = `${data.body.typhoon.remark}`;
    }
    document.getElementById('targetTime').textContent = mon_day(data.targetDateTime) + ' 현재';
    document.getElementById('center_hPa').textContent = data.body.info.now.center.pressure;
    document.getElementById('center_speed').textContent = data.body.info.now.wind.average;
    document.getElementById('center_instwind_speed').textContent = data.body.info.now.wind.instantaneous + 'm/s';
    var movdir = '';
    if(data.body.info.now.center.movement.direction){
        movdir = `${data.body.info.now.center.movement.direction}쪽`
    }
    var movspd = data.body.info.now.center.movement.speed;
    console.log(data.body.info.now.center)
    if(movspd != '느림' && movspd != '거의 정체') {
        movspd += 'km/h'
    }
    document.getElementById('center_movement').textContent = `${movdir} ${movspd}`;
    document.getElementById('storm_area').textContent = area_check(data.body.info.now.wind.area.storm);
    document.getElementById('strong_area').textContent = area_check(data.body.info.now.wind.area.strong);
    var coord = getCoordinate(data.body.info.now.center.coordinate)
    document.getElementById('center_coord').textContent = `${coord[0]}N ${coord[1]}E`;
    document.getElementById('center_acc').textContent = data.body.info.now.center.condition

    var forecastData = data.body.info.forecast;
    var forecastBox = document.getElementById('forecastBox');
    for(var i = 0; i < forecastData.length; i++){
        var nowData = forecastData[i];
        console.log(nowData)
        var mainBox = document.createElement('div');
        mainBox.className = 'forecast_mainBox';

        function createBox(title, content){
            var box = document.createElement('div');
            box.className = 'forecast_spe_box';

            var box_title = document.createElement('p');
            box_title.className = 'forecast_spe_box_title';
            box_title.textContent = title;
            box.appendChild(box_title);

            var box_content = document.createElement('h4');
            box_content.className = 'forecast_spe_box_content';
            box_content.textContent = content;
            box.appendChild(box_content);

            table.appendChild(box);
        }

        if(nowData.isSuitei == false){
            var time = document.createElement('h4');
            time.className = 'forecast_time';
            time.textContent = `예보 - ${toHalfWidth(nowData.elapsedTime.slice(3,-3))}시간 후 (${mon_day(nowData.dateTime).slice(0,-4)})`;
            mainBox.appendChild(time);
            var movdir = nowData.center.movement.direction;
            if(movdir){
                movdir = `${movdir}쪽 `
            }else{
                movdir = ''
            }
            var movspd = nowData.center.movement.speed;
            console.log(nowData.center)
            console.log(movspd)
            if(movspd != '느림' && movspd != '거의 정체') {
                movspd += 'km/h'
            }

            var table = document.createElement('div');
            table.className = 'forecast_spe';
            createBox('중심기압', nowData.center.pressure + 'hPa')
            createBox('종류', nowData.classification.category)
            createBox('최대풍속', nowData.wind.average+'m/s')
            createBox('최대순간풍속', nowData.wind.instantaneous+'m/s')
            createBox('강도', nowData.classification.intensity)
            createBox('이동방향・속도', `${movdir}${movspd}`)
            createBox('예보원', `반경 ${nowData.center.probabilityCircle.radius}km`)
            createBox('폭풍경계역', `${area_check(nowData.wind.area.stormWarning)}`)
            mainBox.appendChild(table);
            // 중심기압 종류 | 최대풍속 최대순간풍속 | 강도 이동방향・속도 | 예보원 폭풍경계역
        }else{
            document.getElementById('suiteiON').style = 'display:block';
            var time = document.createElement('h4');
            time.className = 'forecast_time';
            time.textContent = `추정 - 1시간 후 (${mon_day(nowData.dateTime).slice(0,-4)})`;
            mainBox.appendChild(time);
        }
        forecastBox.appendChild(mainBox);
    }
}

fetch(`http://localhost:3000/jp_typhoon?id=${id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data); // JSON 데이터 사용
        console.log(data.length)
        if (data.length == 0) {
            // 현재 발생중인 태풍은 없습니다.
            var box = document.getElementById('typ_list');
            var noData = document.createElement('h4');
            noData.textContent = '현재 발생중인 태풍은 없습니다.';
            box.appendChild(noData);
            document.getElementById('notyp').style = 'display:block';
            document.getElementById('typ_all').style = 'display:none';
        } else if (data.length == 1) {
            //info + draw
            mapDraw(data[0]);
            map.setView(getCoordinate(data[0].body.info.now.center.coordinate), 6);
            document.getElementById('clickit').style = 'display:none';
            info(data[0]);
            if(id == ''){
                document.getElementById('typ_all').style = 'display:none';
            }
        } else {
            // draw
            var typ_list_box = document.getElementById('typ_list');
            const bounds = L.latLngBounds(); // 지도 경계
            for (var i = 0; i < data.length; i++) {
                const typhoon = data[i];   // ← 미리 복사
                console.log(typhoon);
                mapDraw(typhoon);
                const centerCoord = getCoordinate(typhoon.body.info.now.center.coordinate);
                bounds.extend(centerCoord);

                console.log(typhoon.eventID)
                var typ_list = document.createElement('div')
                var typ_list_title = document.createElement('h4');
                if(typhoon.body.typhoon.name.number.length > 1){
                    typ_list_title.textContent = `태풍 ${typhoon.body.typhoon.name.number.slice(2)}호 ${typhoon.body.typhoon.name.text}`
                }else{
                    typ_list_title.textContent = `발달중인 열대저기압`
                }
                typ_list.appendChild(typ_list_title);

                var typ_list_time = document.createElement('p');
                typ_list_time.textContent = `${mon_day(typhoon.reportDateTime)} 발표`
                typ_list_time.className = 'typ_list_time'
                typ_list.appendChild(typ_list_time);

                var typ_list_out = document.createElement('p');
                if(typhoon.body.typhoon.outline){
                    if((typhoon.body.typhoon.remark).includes('소멸')){
                        typ_list_out.textContent = `${typhoon.body.typhoon.remark}`;
                    }else{
                        typ_list_out.textContent = `${typhoon.body.typhoon.outline}\n${typhoon.body.typhoon.remark}`;
                    }
                }else{
                    typ_list_out.textContent = `${typhoon.body.typhoon.remark}`;
                }
                typ_list_out.className = 'typ_list_out'
                typ_list.appendChild(typ_list_out);

                typ_list.addEventListener('click', () => {
                    var protocal = window.location.protocol;
                    var hostname = window.location.host;
                    var url = protocal + '//' + hostname + `/drr/jp/disaster/typhoon/?id=${typhoon.eventID}`;
                    window.location.href = url;
                });
                typ_list_box.appendChild(typ_list);
            }
            map.fitBounds(bounds);
        }

    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
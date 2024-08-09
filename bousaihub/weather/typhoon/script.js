import mon_day from '../../../../src/time.js'
var h = window.innerHeight;
document.getElementById('map').style.height = h - 48 + 'px'
const searchParams = new URLSearchParams(location.search);
let id = ''
for (const param of searchParams) {
    id = param[1];
}
var map = L.map('map').setView([26, 140], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '© OpenStreetMap, © 気象庁(일본 기상청)'
}).addTo(map);

function getCoordinate(cord) {
    var centerCord
    if (cord.length == 12) {
        centerCord = [cord.slice(1, 5), cord.slice(6, -1)]
    } else if (cord.length == 11) {
        centerCord = [cord.slice(1, 4), cord.slice(5, -1)]
    }
    return centerCord
}
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
}

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
}
function toggleCircleVisibility(circle) {
    var radius = circle.getRadius();

    if (radius < 100) {
        circle.setStyle({ opacity: 0, fillOpacity: 0 });
    } else {
        circle.setStyle({ opacity: 1, fillOpacity: 0.2 });
    }
}

function getSize(size) {
    if (size == '대형') {
        document.getElementById('now_size').style = 'display:block; background-color: red; color: white;';
        document.getElementById('now_size').textContent = '대형'
    } else if (size == '초대형') {
        document.getElementById('now_size').style = 'display:block; background-color: rgb(195, 0, 255); color: white';
        document.getElementById('now_size').textContent = '초대형'
    } else {
        document.getElementById('now_size').style = 'display:none;'
    }
}

function getStrength(str) {
    if (str == '강') {
        document.getElementById('now_strength').style = 'display:block; background-color: yellow; color:black'
        document.getElementById('now_strength').textContent = '강'
    } else if (str == '매우강') {
        document.getElementById('now_strength').style = 'display:block; background-color: red; color: white;';
        document.getElementById('now_strength').textContent = '매우강'
    } else if (str == '맹렬한') {
        document.getElementById('now_strength').style = 'display:block; background-color: rgb(195,0,255); color:white';
        document.getElementById('now_strength').textContent = '맹렬한'
    } else {
        document.getElementById('now_strength').style = 'display:none'
    }
}

var now_typhoon_center = L.icon({
    iconUrl: '/bousaihub/weather/typhoon/typhoon.svg',
    iconSize: [25, 25]
})

const centerLines = [];
function draw(nowData) {
    //과거 경로
    var pastCen = (nowData.body.info.past).map(getCoordinate)
    const centerLine = L.polyline(pastCen, { color: 'blue', weight: 2 }).addTo(map)
    centerLines.push(centerLine);

    pastCen.pop();
    pastCen.forEach(function (coord) {
        L.circle(coord, {
            color: 'blue',
            fillOpacity: 1,
            radius: 500
        }).addTo(map);
    });

    //현재
    const nowCenter = L.marker(getCoordinate(nowData.body.info.now.center.coordinate), { icon: now_typhoon_center }).addTo(map);
    //폭풍역
    var red_directions = nowData.body.info.now.wind.area.storm.direction;
    var red_distances = nowData.body.info.now.wind.area.storm.radius;
    var red_center = getCoordinate(nowData.body.info.now.center.coordinate);
    var red_data = calculateCircleParams(red_directions, red_distances, red_center);
    var red_circleCenter = red_data.center
    var red_radius = red_data.radius
    const red_circle = L.circle(red_circleCenter, {
        color: 'red',
        fillColor: '#00ff0000',
        radius: red_radius
    }).addTo(map);
    toggleCircleVisibility(red_circle)

    //강풍역
    var yellow_directions = nowData.body.info.now.wind.area.strong.direction;
    var yellow_distances = nowData.body.info.now.wind.area.strong.radius;
    var yellow_center = getCoordinate(nowData.body.info.now.center.coordinate);
    var yellow_data = calculateCircleParams(yellow_directions, yellow_distances, yellow_center);
    var yellow_circleCenter = yellow_data.center
    var yellow_radius = yellow_data.radius
    const yellow_circle = L.circle(yellow_circleCenter, {
        color: 'yellow',
        fillColor: '#00ff0000',
        radius: yellow_radius
    }).addTo(map);
    toggleCircleVisibility(yellow_circle)

    //예보
    var forecastLines = [getCoordinate(nowData.body.info.now.center.coordinate)];
    for (var j = 0; j < (nowData.body.info.forecast).length; j++) {
        var forecastData = nowData.body.info.forecast[j]
        if (forecastData.isSuitei == false) {
            // console.log(forecastData)
            forecastLines.push(getCoordinate(forecastData.center.probabilityCircle.baseCordinate));
            const posibility_Circle = L.circle(getCoordinate(forecastData.center.probabilityCircle.baseCordinate), {
                color: 'white',
                weight: 3,
                fillColor: '#00ff0000',
                radius: forecastData.center.probabilityCircle.radius * 1000
            }).addTo(map)
            var yohoTimeIcon = L.divIcon({
                className: 'yoho_time_icon',
                html: `<div class="yoho_time_icon_label" style="font-family: 'Pretendard-Regular';width:max-content; margin-left: -25px;">${mon_day(forecastData.dateTime).slice(3, -3)} 예보</div>`
            });
            var [lat, lon] = getCoordinate(forecastData.center.probabilityCircle.baseCordinate)
            L.marker([parseFloat(lat) - 0.1, lon], { icon: yohoTimeIcon }).addTo(map)

            //폭풍경계역
            var warning_directions = forecastData.wind.area.stormWarning.direction
            var warning_distances = forecastData.wind.area.stormWarning.radius
            var warning_center = getCoordinate(forecastData.center.probabilityCircle.baseCordinate);
            var warning_data = calculateCircleParams(warning_directions, warning_distances, warning_center);
            var warning_circleCenter = warning_data.center
            var warning_radius = warning_data.radius
            const warning_circle = L.circle(warning_circleCenter, {
                color: 'red',
                fillColor: '#00ff0000',
                radius: warning_radius
            }).addTo(map);
            toggleCircleVisibility(warning_circle)
        }
    }

    const forecastLine = L.polyline(forecastLines, { color: 'white', dashArray: '5, 5', dashOffset: '0', weight: 2 }).addTo(map);
    centerLines.push(forecastLine)
    forecastLines.slice(1).forEach(function (coord) {
        L.circle(coord, {
            color: 'white',
            fillColor: 'white',
            fillOpacity: 1,
            radius: 1000
        }).addTo(map);
    });
    var bounds = L.latLngBounds();
    centerLines.forEach(line => {
        line.getLatLngs().forEach(latlng => bounds.extend(latlng));
    });

    // 지도를 경계에 맞게 조정
    map.fitBounds(bounds);
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
function info(nowData) {
    document.getElementById('spe').style.display = 'block'
    var num = nowData.body.typhoon.name.number;
    if (num == '') {
        document.getElementById('typNum').style.display = 'none'
    }
    document.getElementById('typNum').textContent = `20${(nowData.body.typhoon.name.number).slice(0, 2)}년 제${(nowData.body.typhoon.name.number).slice(2,)}호 태풍`
    document.getElementById('typName').textContent = nowData.body.typhoon.name.text;
    document.getElementById('reportTime').textContent = mon_day(nowData.reportDateTime) + ' 발표';

    document.getElementById('remark').textContent = nowData.body.typhoon.remark;
    document.getElementById('now_time').textContent = mon_day(nowData.body.info.now.dateTime) + ' 현재';
    document.getElementById('now_class').textContent = nowData.body.info.now.classification.category;
    getSize(nowData.body.info.now.classification.size)
    getStrength(nowData.body.info.now.classification.intensity);
    document.getElementById('center_hpa').textContent = nowData.body.info.now.center.pressure;
    document.getElementById('center_max_wind_speed').textContent = nowData.body.info.now.wind.average;
    document.getElementById('acc').textContent = nowData.body.info.now.center.condition;
    document.getElementById('center_max_shun_wind_speed').textContent = nowData.body.info.now.wind.instantaneous + ' m/s';
    document.getElementById('mov_dir').textContent = nowData.body.info.now.center.movement.direction;
    var movspd = nowData.body.info.now.center.movement.speed;
    if (movspd == '느림' || movspd == "거의 정체") {
        document.getElementById('mov_tan').style.display = 'none'
    }
    document.getElementById('mov_spd').textContent = movspd;
    document.getElementById('strong_area').textContent = area_check(nowData.body.info.now.wind.area.strong)
    document.getElementById('storm_area').textContent = area_check(nowData.body.info.now.wind.area.storm)

    const container = document.getElementById('infoBox');
    for (var i = 0; i < (nowData.body.info.forecast).length; i++) {
        var data = nowData.body.info.forecast[i];
        if (data.isSuitei == false) {
            const divelement = document.createElement('div');
            divelement.className = 'yoho_box';

            const nowClass = document.createElement('h4');
            nowClass.textContent = data.classification.category;
            nowClass.className = 'now_class';
            divelement.appendChild(nowClass);

            const nowTime = document.createElement('p');
            nowTime.textContent = mon_day(data.dateTime) + ' 예보';
            nowTime.className = 'now_time';
            divelement.appendChild(nowTime);

            const divBox = document.createElement('div');
            divBox.className = 'under';

            const divHPa = document.createElement('div');
            divHPa.className = 'under_box';
            const titleHPa = document.createElement('p');
            titleHPa.textContent = '중심기압';
            divHPa.appendChild(titleHPa);
            const infoHPa = document.createElement('h4');
            infoHPa.textContent = data.center.pressure + ' hPa'
            divHPa.appendChild(infoHPa)
            divBox.appendChild(divHPa)

            const divMaxWind = document.createElement('div');
            divMaxWind.className = 'under_box';
            const titleMaxWind = document.createElement('p');
            titleMaxWind.textContent = '최대풍속';
            divMaxWind.appendChild(titleMaxWind);
            const infoMaxWind = document.createElement('h4');
            infoMaxWind.textContent = data.wind.average + ' m/s'
            divMaxWind.appendChild(infoMaxWind)
            divBox.appendChild(divMaxWind)

            const divInt = document.createElement('div');
            divInt.className = 'under_box';
            const titleInt = document.createElement('p');
            titleInt.textContent = '강도';
            divInt.appendChild(titleInt);
            const infoInt = document.createElement('h4');
            var int = data.classification.intensity;
            if (int == '') {
                int = '--'
            }
            infoInt.textContent = int
            divInt.appendChild(infoInt)
            divBox.appendChild(divInt)

            const divInsWind = document.createElement('div');
            divInsWind.className = 'under_box';
            const titleInsWind = document.createElement('p');
            titleInsWind.textContent = '최대순간풍속';
            divInsWind.appendChild(titleInsWind);
            const infoInsWind = document.createElement('h4');
            infoInsWind.textContent = data.wind.instantaneous + ' m/s'
            divInsWind.appendChild(infoInsWind)
            divBox.appendChild(divInsWind)

            const divMove = document.createElement('div');
            divMove.className = 'under_box';
            const titleMove = document.createElement('p');
            titleMove.textContent = '이동방향';
            divMove.appendChild(titleMove);
            const infoMove = document.createElement('h4');
            infoMove.textContent = data.center.movement.direction
            divMove.appendChild(infoMove)
            divBox.appendChild(divMove)

            const divSpd = document.createElement('div');
            divSpd.className = 'under_box';
            const titleSpd = document.createElement('p');
            titleSpd.textContent = '이동속도';
            divSpd.appendChild(titleSpd);
            const infoSpd = document.createElement('h4');
            var spd = data.center.movement.speed
            if (spd == '느림' || spd == '거의 정체') { } else {
                spd = spd + ' km/h'
            }
            infoSpd.textContent = spd
            divSpd.appendChild(infoSpd)
            divBox.appendChild(divSpd)

            const divCir = document.createElement('div');
            divCir.className = 'under_box';
            const titleCir = document.createElement('p');
            titleCir.textContent = '예보원 반경';
            divCir.appendChild(titleCir);
            const infoCir = document.createElement('h4');
            infoCir.textContent = '반경 ' + data.center.probabilityCircle.radius + ' km'
            divCir.appendChild(infoCir)
            divBox.appendChild(divCir)

            const divWarn = document.createElement('div');
            divWarn.className = 'under_box';
            const titleWarn = document.createElement('p');
            titleWarn.textContent = '폭풍경계역';
            divWarn.appendChild(titleWarn);
            const infoWarn = document.createElement('h4');
            infoWarn.textContent = area_check(data.wind.area.stormWarning)
            divWarn.appendChild(infoWarn)
            divBox.appendChild(divWarn)


            divelement.appendChild(divBox)

            container.append(divelement)
        } else {
            const divelement = document.createElement('div');
            divelement.className = 'yoho_box';

            const nowClass = document.createElement('h4');
            nowClass.textContent = data.classification.category;
            nowClass.className = 'now_class';
            divelement.appendChild(nowClass);

            const nowTime = document.createElement('p');
            nowTime.textContent = mon_day(data.dateTime) + ' 추정';
            nowTime.className = 'now_time';
            divelement.appendChild(nowTime);

            const divBox = document.createElement('div');
            divBox.className = 'under';

            const divHPa = document.createElement('div');
            divHPa.className = 'under_box';
            const titleHPa = document.createElement('p');
            titleHPa.textContent = '중심기압';
            divHPa.appendChild(titleHPa);
            const infoHPa = document.createElement('h4');
            infoHPa.textContent = data.center.pressure + ' hPa'
            divHPa.appendChild(infoHPa)
            divBox.appendChild(divHPa)

            const divMaxWind = document.createElement('div');
            divMaxWind.className = 'under_box';
            const titleMaxWind = document.createElement('p');
            titleMaxWind.textContent = '최대풍속';
            divMaxWind.appendChild(titleMaxWind);
            const infoMaxWind = document.createElement('h4');
            infoMaxWind.textContent = data.wind.average + ' m/s'
            divMaxWind.appendChild(infoMaxWind)
            divBox.appendChild(divMaxWind)

            const divInt = document.createElement('div');
            divInt.className = 'under_box';
            const titleInt = document.createElement('p');
            titleInt.textContent = '강도';
            divInt.appendChild(titleInt);
            const infoInt = document.createElement('h4');
            var int = data.classification.intensity;
            if (int == '') {
                int = '--'
            }
            infoInt.textContent = int
            divInt.appendChild(infoInt)
            divBox.appendChild(divInt)

            const divInsWind = document.createElement('div');
            divInsWind.className = 'under_box';
            const titleInsWind = document.createElement('p');
            titleInsWind.textContent = '최대순간풍속';
            divInsWind.appendChild(titleInsWind);
            const infoInsWind = document.createElement('h4');
            infoInsWind.textContent = data.wind.instantaneous + ' m/s'
            divInsWind.appendChild(infoInsWind)
            divBox.appendChild(divInsWind)

            const divMove = document.createElement('div');
            divMove.className = 'under_box';
            const titleMove = document.createElement('p');
            titleMove.textContent = '이동방향';
            divMove.appendChild(titleMove);
            const infoMove = document.createElement('h4');
            infoMove.textContent = data.center.movement.direction
            divMove.appendChild(infoMove)
            divBox.appendChild(divMove)

            const divSpd = document.createElement('div');
            divSpd.className = 'under_box';
            const titleSpd = document.createElement('p');
            titleSpd.textContent = '이동속도';
            divSpd.appendChild(titleSpd);
            const infoSpd = document.createElement('h4');
            var spd = data.center.movement.speed
            if (spd == '느림' || spd == '거의 정체') { } else {
                spd = spd + ' km/h'
            }
            infoSpd.textContent = spd
            divSpd.appendChild(infoSpd)
            divBox.appendChild(divSpd)

            const divCir = document.createElement('div');
            divCir.className = 'under_box';
            const titleCir = document.createElement('p');
            titleCir.textContent = '강풍역';
            divCir.appendChild(titleCir);
            const infoCir = document.createElement('h4');
            infoCir.textContent = area_check(data.wind.area.strong)
            divCir.appendChild(infoCir)
            divBox.appendChild(divCir)

            const divWarn = document.createElement('div');
            divWarn.className = 'under_box';
            const titleWarn = document.createElement('p');
            titleWarn.textContent = '폭풍역';
            divWarn.appendChild(titleWarn);
            const infoWarn = document.createElement('h4');
            infoWarn.textContent = area_check(data.wind.area.storm)
            divWarn.appendChild(infoWarn)
            divBox.appendChild(divWarn)


            divelement.appendChild(divBox)

            container.append(divelement)
        }
    }
}
var click = 0
document.getElementById('spe').addEventListener('click', function () {
    click += 1
    if (click % 2 == 1) {
        document.getElementById('infoBox').style.display = 'block'
        document.getElementById('spe').textContent = '숨기기'
    } else {
        document.getElementById('infoBox').style.display = 'none'
        document.getElementById('spe').textContent = '상세보기'
    }
})
fetch(`http://localhost:3000/jp_typhoon?id=${id}`)
    .then(response => response.json())
    .then(res => {
        console.log(res)
        if (res.length == 0) {
            document.getElementById('noTyp').style.display = 'block'
        } else {
            const ids = []
            for (var i = 0; i < res.length; i++) {
                ids.push(res[i].eventID);
                const nowData = res[i]
                const button = document.createElement('p');
                button.textContent = `태풍 ${(nowData.body.typhoon.name.number).slice(2,)}호 ${nowData.body.typhoon.name.text}`;
                button.addEventListener('click', () => {
                    var protocal = window.location.protocol;
                    var hostname = window.location.host;
                    var url = protocal + '//' + hostname + `/bousaihub/weather/typhoon/?id=${nowData.eventID}`
                    window.location.href = url;
                });
                document.getElementById('buttonContainer').appendChild(button);
            }
            var index = ids.indexOf(id)
            if (index == -1) {
                for (var i = 0; i < res.length; i++) {
                    const nowData = res[i]
                    draw(nowData)
                }
            } else {
                draw(res[index])
                info(res[index])
            }
            const button = document.createElement('p');
            button.textContent = `전체보기`;
            button.addEventListener('click', () => {
                var protocal = window.location.protocol;
                var hostname = window.location.host;
                var url = protocal + '//' + hostname + `/bousaihub/weather/typhoon/`
                window.location.href = url;
            });
            document.getElementById('buttonContainer').appendChild(button);
        }
    })
    .catch(error => console.error('Error:', error));
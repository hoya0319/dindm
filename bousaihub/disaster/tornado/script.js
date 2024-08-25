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

var geojson

function getTornado() {
    fetch('http://localhost:3000/jp_tornado')
        .then(response => response.json())
        .then(data => {
            console.log(data); // JSON 데이터 사용
            console.log(geojson);

            // Create sets of codes
            const infoCodes = new Set();
            const occurCodes = new Set();

            data.forEach(entry => {
                entry.body.info.forEach(info => {
                    infoCodes.add(info.code);
                });
                entry.body.occur.forEach(occur => {
                    occurCodes.add(occur.code);
                });
            });

            // Function to determine color based on feature properties
            function getColor(code) {
                if (occurCodes.has(code)) return 'red'; // If in occur, color is red
                if (infoCodes.has(code)) return 'yellow'; // If only in info, color is yellow
                return 'transparent'; // If not in either, make it transparent
            }

            // Create a new GeoJSON layer with styling based on the codes
            L.geoJSON(geojson, {
                filter: function (feature) {
                    return infoCodes.has(feature.properties.code); // Only include features in info
                },
                style: function (feature) {
                    return {
                        color: getColor(feature.properties.code),
                        weight: 2,
                        fillOpacity: 0.5
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function () {
                        const info = data.flatMap(entry => entry.body.info).find(info => info.code === feature.properties.code);
                        if (info) {
                            var now, spec
                            var occur = false
                            for(var i = 0; i < data.length; i++){
                                for(var j = 0; j < (data[i].body.info).length; j++)
                                if(info.code == (data[i].body.info[j]).code){
                                    spec = data[i].body
                                    now = data[i]
                                    if((spec.occur).length != 0){
                                        for(var z = 0; z < (spec.occur).length; z++){
                                            if(spec.occur[z].code == info.code){
                                                occur = true;
                                            }
                                        }
                                    }
                                }
                            }
                            console.log(now)
                            console.log(info)
                            console.log(occur)
                            var container = document.getElementById('info')
                            while (container.firstChild) {
                                container.removeChild(container.firstChild);
                            }

                            var title = document.createElement('h2');
                            title.textContent = `${info.name}\n토네이도주의정보`
                            container.appendChild(title);

                            var time = document.createElement('p');
                            time.textContent = `${mon_day(now.reportDateTime)} 발표\n${mon_day(now.validDateTime)} 까지 유효`;
                            time.className = 'info_time'
                            container.appendChild(time);
                            var text =''
                            if(occur == true){
                                text = `${info.name}에서 토네이도 등의 격렬한 돌풍이 발생했다고 보여집니다.\n\n${info.name}에서는 토네이도 등의 격렬한 돌풍이 발생할 우려가 매우 높아지고 있습니다. \n\n하늘의 모습에 주의하십시오.\n번개나 갑작스러운 바람의 변화 등 적란운이 다가올 징조가 있는 경우에는 튼튼한 건물 내로 이동하는 등, 안전 확보에 힘써 주십시오.\n낙뢰, 우박, 갑작스러운 강한 비에도 주의하십시오.`
                            }else{
                                text = `${info.name}에서는 토네이도 등의 격렬한 돌풍이 발생하기 쉬운 기상 상황이 이어지고 있습니다.\n\n하늘의 모습에 주의하십시오.\n번개나 갑작스러운 바람의 변화 등 적란운이 다가올 징조가 있는 경우에는 튼튼한 건물 내로 이동하는 등, 안전 확보에 힘써 주십시오.\n낙뢰, 우박, 갑작스러운 강한 비에도 주의하십시오.`
                            }
                            var textcont = document.createElement('p');
                            textcont.textContent = text;
                            // textcont.className = 'info_time'
                            container.appendChild(textcont);
                        } else {
                            document.getElementById('info').innerHTML = '정보 없음';
                        }
                    });
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

fetch('http://localhost:3000/jp_class10s')
    .then(response => response.json())
    .then(data => {
        // console.log(data); // JSON 데이터 사용
        geojson = data;
        getTornado()
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
function convertToKST(utcString) {
    const date = new Date(utcString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초`;
}
const occur = L.icon({
    iconUrl: '/drs/images/occur.svg',
    iconSize: [30, 30]
})
const occur_bf = L.icon({
    iconUrl: '/drs/images/occur_bf.svg',
    iconSize: [30, 30]
})
const danger = L.icon({
    iconUrl: '/drs/images/danger.svg',
    iconSize: [30, 30]
})
const diff = L.icon({
    iconUrl: '/drs/images/diff.svg',
    iconSize: [30, 30]
})
const norm = L.icon({
    iconUrl: '/drs/images/norm.svg',
    iconSize: [30, 30]
})
const reportMarkers = [];
const pastMarkers = [];
function getSituationColor(type){
    var color = ''
    switch(type){
        case '재해 발생':
            color = '#d000ff';
            break;
        case '재해 발생 임박':
            color = '#f44336';
            break;
        case '위험 감지':
            color = '#ffeb3b';
            break;
        case '평소와 다름':
            color = '#00d9ff';
            break;
        case '평소':
            color = '#dbdbdb';
            break;
        default:
            color = 'white';
            break;
    }
    return color
}
function getSituationTextColor(type){
    if(type == '위험 감지'){
        return '#333'
    }else{
        return 'white'
    }
}
function getMap(data) {
    console.log(data)
    const [lat, lng] = data.location;

    map.setView([lat, lng], 14); 

    let text = '';
    data.disasterType.forEach(type => {
        text += `${type} `;
    });

    document.getElementById('info').style.display = 'block'
    document.getElementById('info_title').textContent = `${data.name}님의 보고`
    document.getElementById('info_box_title').textContent = text.slice(0,-1)
    document.getElementById('info_box_time').textContent = `${convertToKST(data.reportTime).slice(6,)} 등록`
    document.getElementById('info_box_situation').textContent = data.situation;
    document.getElementById('info_box_situation').style = `border : 1px solid ${getSituationColor(data.situation)}; background-color: ${getSituationColor(data.situation)}; color: ${getSituationTextColor(data.situation)}`
    var comment = ''
    console.log(data.comment)
    if(data.comment == ''){
        comment = '등록된 내용이 없습니다.'
    }else{
        comment = data.comment
    }
    document.getElementById('info_text').textContent = comment
}
function removeReportMarkers() {
    reportMarkers.forEach(marker => {
        map.removeLayer(marker); // 각 마커를 지도에서 제거
    });
    reportMarkers.length = 0; // 배열을 비워줌
}
var isData = false;
fetch(`http://localhost:3000/drs/get`)
    .then(response => response.json())
    .then(res => {
        if(res.length == 0){
            document.getElementById('no_data').style.display = 'block'
        }else{
            isData = true;
            res = res.reverse()
            const container = document.getElementById('list');
            res.forEach(data => {
                const box = document.createElement('div');
                box.className = 'list_box';
                
                const box_left = document.createElement('div');
                box_left.className = 'list_box_left';
                
                const boxtitle = document.createElement('h4');
                boxtitle.textContent = data.situation;
                boxtitle.className = 'list_box_title';
                boxtitle.style.color = getSituationColor(data.situation)
                box_left.appendChild(boxtitle);
                
                let text = '';
                data.disasterType.forEach(type => {
                    text += `${type} `;
                });
                
                const boxtext = document.createElement('p');
                boxtext.textContent = text;
                boxtext.className = 'list_box_text';
                box_left.appendChild(boxtext);
                
                const boxtime = document.createElement('p');
                boxtime.textContent = convertToKST(data.reportTime);
                boxtime.className = 'list_box_time';
                box_left.appendChild(boxtime);
                
                const box_right = document.createElement('img');
                box_right.className = 'list_box_right';
                box_right.src = '/src/images/link.svg';
                box_right.alt = '링크';
    
                box.addEventListener('click', () => {
                    getMap(data); 
                });
                
                box.appendChild(box_left);
                box.appendChild(box_right);
                container.appendChild(box);
    
                const [lat, lng] = data.location;
                var marker
                if(data.situation == '재해 발생'){
                    marker = L.marker([lat, lng], { icon: occur }).addTo(map);
                }else if(data.situation == '재해 발생 임박'){
                    marker = L.marker([lat, lng], { icon: occur_bf }).addTo(map);
                }else if(data.situation == '위험 감지'){
                    marker = L.marker([lat, lng], { icon: danger }).addTo(map);
                }else if(data.situation == '평소와 다름'){
                    marker = L.marker([lat, lng], { icon: diff }).addTo(map);
                }else if(data.situation == '평소'){
                    marker = L.marker([lat, lng], { icon: norm }).addTo(map);
                }
                reportMarkers.push(marker)
                marker.on('click', () => {
                    getMap(data);
                });
            });
        }
    })

function noSeeInfo(){
    document.getElementById('info').style.display = 'none';
    document.getElementById('list').style.display = 'none';
    document.getElementById('no_data').style.display = 'none';
    document.getElementById('past_info').style.display = 'block';
    reportMarkers.forEach(marker => {
        marker.remove()
    });
    pastMarkers.forEach(marker => {
        marker.remove()
    });
    pastMarkers.length = 0;
}
function seeInfo(){
    removeFireArea()
    document.getElementById('list').style.display = 'block';
    document.getElementById('past_info').style.display = 'none';
    if(isData == true) {
        document.getElementById('no_data').style.display = 'none';
    }else{
        document.getElementById('no_data').style.display = 'block';
    }
    reportMarkers.forEach(marker => {
        marker.addTo(map)
    });
    pastMarkers.forEach(marker => {
        marker.remove()
    });
    pastMarkers.length = 0;
}
document.getElementById('goInfo').addEventListener("click", function(){
    seeInfo()
})
function legend(data){
    document.getElementById('legend_red').textContent = data[0]
    document.getElementById('legend_orange').textContent = data[1]
    document.getElementById('legend_yellow').textContent = data[2]
    document.getElementById('legend_green').textContent = data[3]
    document.getElementById('legend_blue').textContent = data[4]
    document.getElementById('legend_gray').textContent = data[5]
}
var fireAreaLayer
function fireArea(data) {
    fireAreaLayer = L.geoJSON(data, {
        style: function (feature) {
            return { color: "red", weight: 2, fillOpacity: 0.5 };
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function () {
                var popupContent = `
                <div>
                    <p style="font-family: 'Pretendard Variable'; text-align: center; font-weight:bold; font-size:1rem; margin:0">${feature.properties.name}</p>
                <table style="font-family: 'Pretendard Variable'">
                    <tr>
                        <th style='text-align: center;'>발생기간</th>
                        <td>${feature.properties.duration}</td>
                    </tr>
                    <tr>
                        <th style='text-align: center;'>피해</th>
                        <td>${feature.properties.area}</td>
                    </tr>
                </table>
            </div>
                `;

                var popup = L.popup()
                    .setLatLng(layer.getBounds().getCenter()) 
                    .setContent(popupContent)
                    .openOn(map);
            });
        }
    });
    fireAreaLayer.addTo(map)
}
function removeFireArea(){
    try{
        fireAreaLayer.remove()
    }catch(e){}
}
function getPast(data){
    console.log(data.id)
    var isFireLayerVisible = false;
    const red = L.icon({
        iconUrl: '/drs/images/red.svg',
        iconSize: [20, 20]
    })
    const orange = L.icon({
        iconUrl: '/drs/images/orange.svg',
        iconSize: [20, 20]
    })
    const yellow = L.icon({
        iconUrl: '/drs/images/yellow.svg',
        iconSize: [20, 20]
    })
    const green = L.icon({
        iconUrl: '/drs/images/green.svg',
        iconSize: [20, 20]
    })
    const blue = L.icon({
        iconUrl: '/drs/images/blue.svg',
        iconSize: [20, 20]
    })
    const gray = L.icon({
        iconUrl: '/drs/images/gray.svg',
        iconSize: [20, 20]
    })
    const epicenter = L.icon({
        iconUrl: '/src/images/epicenter.png',
        iconSize: [30, 30],
        className: 'leaflet_no_white'
    })
    fetch(`http://localhost:3000/drs/past/report?id=${data.id}`)
        .then(response => response.json())
        .then(res =>{
            console.log(res)
            
            noSeeInfo()
            var intensity = '';
            removeFireArea()
            if(res.type == '폭우'){
                intensity = '강수량';
                legend(['완전 침수', '절반 정도 침수', '부분 침수', '피해 발생', '약간의 피해', '피해 없음']);
            }else if(res.type == '지진'){
                intensity = '진도';
                var epi = L.marker(res.location.coord, { icon: epicenter }).addTo(map);
                pastMarkers.push(epi)
                legend(['설 수 없을 정도로 흔들림', '격렬하게 흔들림', '강하게 흔들림', '약하게 흔들림', '흔들린 것 같은 느낌', '흔들리지 않음'])
            }else if(res.type == '산불'){
                intensity = '피해 면적';
                legend(['전소', '일부 소실', '약간 소실', '다량의 연기', '약간의 연기', '피해 없음']);
                var fireGeoJsonData = res.fireArea;
                console.log(fireGeoJsonData)
                fireArea(fireGeoJsonData)
                
            }
            document.getElementById('past_info_title').textContent = res.name;
            document.getElementById('past_info_box_time').textContent = res.time + ' 발생';
            document.getElementById('past_info_box_type').textContent = res.type;
            document.getElementById('past_info_box_type_val').textContent = res.value;
            document.getElementById('past_info_intensity4').textContent = intensity;
            document.getElementById('past_info_intensity').textContent = res.intensity;
            document.getElementById('past_info_human4').textContent = '인명・재산 피해';
            document.getElementById('past_info_human').textContent = res.human;
            document.getElementById('past_info_free4').textContent = '비고';
            document.getElementById('past_info_free').textContent = res.free;
            document.getElementById('goPast').href = `/drs/convey/?id=${res.id}`
            
            console.log(res.location)
            map.setView(res.location.coord, res.location.zoom);

            for(var i = 0; i < res.report.length; i++){
                var now = res.report[i]
                console.log(now.felt)
                var pastMarker
                if(now.felt == 'red'){
                    pastMarker = L.marker(now.location, { icon: red }).addTo(map);
                }else if(now.felt == 'orange'){
                    pastMarker = L.marker(now.location, { icon: orange }).addTo(map);
                }else if(now.felt == 'yellow'){
                    pastMarker = L.marker(now.location, { icon: yellow }).addTo(map);
                }else if(now.felt == 'green'){
                    pastMarker = L.marker(now.location, { icon: green }).addTo(map);
                }else if(now.felt == 'blue'){
                    pastMarker = L.marker(now.location, { icon: blue }).addTo(map);
                }else if(now.felt == 'gray'){
                    pastMarker = L.marker(now.location, { icon: gray }).addTo(map);
                }
                pastMarkers.push(pastMarker)
            }
        })
}

fetch(`http://localhost:3000/drs/past`)
    .then(response => response.json())
    .then(res => {
        console.log(res)
        res = res.reverse()
        const container = document.getElementById('past_list');
        res.forEach(data => {
            var box = document.createElement('a');
            box.href = '#past_info_title'
            box.className = 'past_list_box'

            var title = document.createElement('h4');
            title.textContent = `${data.type} | ${data.name}`;
            title.className = 'past_list_title';

            var time = document.createElement('span');
            time.textContent = data.time;
            time.className = 'past_list_time';

            box.appendChild(title)
            box.appendChild(time)
            box.addEventListener('click', () => {
                getPast(data); 
            });

            container.appendChild(box)
        })
    })
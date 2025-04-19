var loc = []
document.getElementById('now_safe').addEventListener('click', function(){
    document.getElementById('check').style.display = 'none'
    document.getElementById('box').style.display = 'block'
    const map = L.map('map').setView([36.5, 127.5], 7); // 서울 중심 좌표
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: `© OpenStreetMap`
    }).addTo(map);


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            map.setView([userLat, userLng], 13);
            const loc = L.icon({
                iconUrl: './location.svg',
                iconSize: [25, 25]
            })
            L.marker([userLat, userLng], {icon:loc}).addTo(map)
        }, function() {
            alert('위치를 가져올 수 없습니다. 기본 위치로 설정됩니다.');
        });
    } else {
        alert('브라우저가 위치 서비스를 지원하지 않습니다.');
    }
    const locMarker = L.layerGroup().addTo(map)
    function onMapClick(e) {
        locMarker.clearLayers();
        var latitude = e.latlng.lat.toFixed(6);
        var longitude = e.latlng.lng.toFixed(6);
    
        var now_loc = L.icon({
            iconUrl: './ping.svg',
            iconSize: [25, 25]
        })
        var now_loc_marker = L.marker([parseFloat(latitude) + 0.00001, longitude], { icon: now_loc }).addTo(map)
        locMarker.addLayer(now_loc_marker)
        loc = [latitude, longitude]
    }
    map.on('click', onMapClick);
})

const disasterItems = document.querySelectorAll('.disaster');
disasterItems.forEach(item => {
    item.addEventListener('click', function() {
        item.classList.toggle('clicked');
    });
});
const situationItems = document.querySelectorAll('.situation');
situationItems.forEach(item => {
    item.addEventListener('click', function() {
        situationItems.forEach(i => i.classList.remove('sit_clicked'));
        item.classList.add('sit_clicked');
    });
});

document.getElementById('send').addEventListener('click', async function() {
    const name = document.getElementById('name').value
    const selectedDisasters = [];
    document.querySelectorAll('.disaster.clicked').forEach(clickedItem => {
        selectedDisasters.push(clickedItem.textContent);
    });
    var selectedSituation = '';
    document.querySelectorAll('.situation.sit_clicked').forEach(clickedItem => {
        selectedSituation = clickedItem.textContent;
    });
    const text = document.getElementById('message').value;
    if(name.length == 0){
        alert('이름을 입력해주세요');
        return;
    }
    if(loc.length == 0){
        alert('위치를 선택해주세요');
        return;
    }
    if(selectedDisasters.length == 0){
        alert('재해 종류를 선택해주세요');
        return;
    }if(selectedSituation.length == 0){
        alert('재해 상황을 선택해주세요');
        return;
    }
    var data = {
        "name": name,
        "reportTime" : new Date(),
        "location" : loc,
        "disasterType" : selectedDisasters,
        "situation" : selectedSituation,
        "comment" : text
    }
    console.log(data)
    try {
        const response = await fetch('http://localhost:3000/drs/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('데이터 등록에 성공했습니다.');
            var protocal = window.location.protocol;
            var hostname = window.location.host;
            var url = protocal+ '//'  + hostname + '/drs/'
            
            window.location.href = url;
        }
    } catch (error) {
        alert('에러발생 새로고침후 다시 시도해주세요: ', error);
    }
})

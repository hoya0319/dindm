var h = window.innerHeight;
document.getElementById('map').style.height = h - 48 + 'px'
// document.getElementById('right-down').style.minHeight = h - 48 + 'px'
document.getElementById('right-down').style.height = h - 48 + 'px'
var w = window.innerWidth
if (w > 800) {
    var wid = w - 400;
    // console.log(wid);
    document.getElementById('map').style.width = wid + "px";
}else{
    document.getElementById('map').style.width = 100 + "vw";
}
window.addEventListener('resize', function () {
    var wasdf = window.innerWidth
    if (wasdf > 800) {
        var wid = wasdf - 400;
        // console.log(wid);
        document.getElementById('map').style.width = wid + "px";
    } else if (wasdf <= 800) {
        document.getElementById('map').style.width = 100 + "vw";
    }
});
// URL에서 lat과 long 매개변수 값을 가져오는 함수
function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 기본 중심 좌표와 줌 레벨 설정
var defaultLat = 36.5;
var defaultLong = 127.5;
var defaultZoom = 7;

// URL에서 lat과 long 매개변수 값을 가져옴
var userLat = getParameterByName('lat');
var userLong = getParameterByName('lon');
var userZoom = getParameterByName('zoom');

// 사용자 입력값이 있는 경우 해당 위치로 지도의 중심을 설정
// 입력값이 없는 경우 기본값으로 설정
var centerLat = userLat ? parseFloat(userLat) : defaultLat;
var centerLong = userLong ? parseFloat(userLong) : defaultLong;
var zoomLevel = userZoom ? parseFloat(userZoom) : defaultZoom

// 지도 생성 및 중심 위치 설정
var map = L.map('map').setView([centerLat, centerLong], zoomLevel);
// URL에서 기존 좌표값 가져오기
var lat = parseFloat(getParameterByName('lat'));
var lon = parseFloat(getParameterByName('lon'));
var zoom = parseInt(getParameterByName('zoom'));

// 지도 이동 이벤트 핸들러
function onMapMove(e) {
    var center = map.getCenter();
    var currentUrl = window.location.href;
    var newUrl;

    // URL에 lat, lon, zoom 매개변수가 있는지 확인
    var hasQueryParams = currentUrl.indexOf('?') !== -1;
    if (hasQueryParams) {
        // 기존의 매개변수를 유지하면서 lat, lon, zoom 값을 갱신
        var urlParams = currentUrl.split('?')[1];
        var paramsArray = urlParams.split('&');
        var updatedParamsArray = paramsArray.map(function (param) {
            if (param.startsWith('lat=')) {
                return 'lat=' + center.lat.toFixed(6);
            } else if (param.startsWith('lon=')) {
                return 'lon=' + center.lng.toFixed(6);
            } else if (param.startsWith('zoom=')) {
                return 'zoom=' + map.getZoom();
            }
            return param;
        });

        newUrl = currentUrl.split('?')[0] + '?' + updatedParamsArray.join('&');
    } else {
        // URL에 매개변수가 없는 경우 새로 추가
        newUrl = currentUrl + '?lat=' + center.lat.toFixed(6) + '&lon=' + center.lng.toFixed(6) + '&zoom=' + map.getZoom();
    }

    window.history.pushState({ path: newUrl }, '', newUrl);
}

// 지도 이동 이벤트 등록
map.on('moveend', onMapMove);

// 기존 좌표값이 있는 경우 해당 좌표로 지도 중심 이동
if (!isNaN(lat) && !isNaN(lon)) {
    map.setView([lat, lon], zoom || 7);
}
// 타일 레이어 추가
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 2,
    attribution: `© OpenStreetMap`
}).addTo(map);

document.addEventListener('DOMContentLoaded', function () {
    const draggableBox = document.getElementById('right-down');
    let startY = 0;
    let currentY = 0;
    let startTop = 0;

    const topPositions = {
        initial: '90%',
        middle: '60%',
        topMax: '48px'
    };

    draggableBox.addEventListener('touchstart', function (e) {
        startY = e.touches[0].clientY;
        startTop = parseInt(window.getComputedStyle(draggableBox).top); // 현재 top 값 가져오기
    });

    draggableBox.addEventListener('touchmove', function (e) {
        currentY = e.touches[0].clientY;
        let diffY = currentY - startY; // 손가락이 이동한 거리

        let newTop = startTop + diffY;

        // 최대와 최소 top 값을 설정하여 박스가 화면 밖으로 나가지 않도록 제한
        if (newTop < 48) {
            newTop = 48; // top 48px 이상으로 올라가지 않게
        } else if (newTop > window.innerHeight * 0.9) {
            newTop = window.innerHeight * 0.9; // top 90% 이상으로 내려가지 않게
        }

        draggableBox.style.top = newTop + 'px'; // 드래그 중 실시간으로 top 값 변경
    });

    draggableBox.addEventListener('touchend', function () {
        const boxTop = parseInt(window.getComputedStyle(draggableBox).top);
        const screenHeight = window.innerHeight;

        const initialTop = screenHeight * 0.9;
        const middleTop = screenHeight * 0.6;
        const topMax = 48;

        const distanceToInitial = Math.abs(boxTop - initialTop);
        const distanceToMiddle = Math.abs(boxTop - middleTop);
        const distanceToTop = Math.abs(boxTop - topMax);

        let closestPosition = topPositions.initial;
        if (distanceToMiddle < distanceToInitial && distanceToMiddle < distanceToTop) {
            closestPosition = topPositions.middle;
        } else if (distanceToTop < distanceToMiddle && distanceToTop < distanceToInitial) {
            closestPosition = topPositions.topMax;
        }

        draggableBox.style.transition = 'top 0.3s ease';
        draggableBox.style.top = closestPosition;

        draggableBox.addEventListener('transitionend', function () {
            draggableBox.style.transition = '';
        }, { once: true });
    });
});
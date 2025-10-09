import mon_day_year from '../../../../src/time.js'
var map = L.map('map', { zoomControl: false }).setView([35.6, 136.7], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    attribution: `© OpenStreetMap, © <span class="jp">気象庁</span>(일본 기상청)`
}).addTo(map);

const container = document.getElementById('dateButtons');
const today = new Date();
let startDate = new Date(today);
const geoCache = {}; // ✅ 캐시 저장소
let allFeatures = []; // 전체 데이터 저장
let currentDateKey = '';

(async function init() {
    for (let i = 0; i < 7; i++) {
        const testDate = new Date(today);
        testDate.setDate(today.getDate() - i);

        const yyyy = testDate.getFullYear();
        const mm = String(testDate.getMonth() + 1).padStart(2, '0');
        const dd = String(testDate.getDate()).padStart(2, '0');
        const formatted = `${yyyy}${mm}${dd}`;
        const url = `https://www.jma.go.jp/bosai/hypo/data/${yyyy}/${mm}/hypo${formatted}.geojson`;

        const res = await fetch(url);
        if (res.ok) {
            startDate = testDate;
            const data = await res.json();
            geoCache[formatted] = data;
            currentDateKey = formatted;
            updateMapWithInfo(yyyy, mm, formatted, data);
            break;
        }
    }

    for (let i = 0; i < 9; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() - i);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formatted = `${yyyy}${mm}${dd}`;
        const url = `https://www.jma.go.jp/bosai/hypo/data/${yyyy}/${mm}/hypo${formatted}.geojson`;

        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        geoCache[formatted] = data;

        const button = document.createElement('p');
        button.textContent = `${mm}월 ${dd}일`;
        button.className = 'dateBtn';
        button.addEventListener('click', () => {
            currentDateKey = formatted;
            updateMapWithInfo(yyyy, mm, formatted, data);
            document.getElementById('timeSlider').value = 24;
        });

        container.appendChild(button);
    }
})();

function updateMapWithInfo(y, m, ymd, data) {
    document.getElementById('nowDate').textContent = `${y}년 ${m}월 ${ymd.slice(6)}일`;
    allFeatures = data.features || [];
    const count = allFeatures.length;
    updateMap(allFeatures);
    document.getElementById('nowTime').textContent = `전체 (${count}회 발생)`;
}

function updateMap(features) {
    if (window.featureLayer) map.removeLayer(window.featureLayer);

    const geoJsonLayer = L.geoJSON(features, {
        pointToLayer: (feature, latlng) => {
            const coords = feature.geometry.coordinates;
            if (!coords || coords.length < 2) return null;

            const lon = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);
            const dep = parseFloat(feature.properties.dep);
            const mag = parseFloat(feature.properties.mag);

            if (isNaN(lat) || isNaN(lon)) {
                console.warn('잘못된 좌표:', coords);
                return null;
            }
            var rad = 2 + (isNaN(mag) ? 0 : mag * 2)
            if(rad < 2.5){
                rad = 2.5
            }

            return L.circleMarker([lat, lon], {
                radius: rad,
                fillColor: getDepthColor(dep),
                color: '#000',
                weight: 0.5,
                fillOpacity: 0.8
            });
        },

        onEachFeature: (feature, layer) => {
            const p = feature.properties;
            const c = feature.geometry.coordinates;
            var ints = ''
            if(p.si == ' '){
                ints = '--'
            }else{
                ints = p.si
            }
            const infoHtml = `
                <h4 style="font-family: 'Pretendard Variable'; text-align:center;font-size:1rem;">${p.place || '지진 정보'}</h4>
                <table style="font-family: 'Pretendard Variable'">
                        <tbody><tr>
                            <th style="text-align: center; padding-right:0.3rem;">발생시각</th>
                            <td>${(p.date).slice(5,7)}월 ${(p.date).slice(8,10)}일 ${(p.date).slice(11)}</td>
                        </tr>
                        <tr>
                            <th style="text-align: center; padding-right:0.3rem;">규모</th>
                            <td>M${p.mag || '-'}</td>
                        </tr>
                        <tr>
                            <th style="text-align: center; padding-right:0.3rem;">최대진도</th>
                            <td>${ints}</td>
                        </tr>
                        <tr>
                            <th style="text-align: center; padding-right:0.3rem;">깊이</th>
                            <td>${p.dep} km</td>
                        </tr>
                    </tbody></table>
            `;
            layer.bindPopup(infoHtml);
        }
    }).addTo(map);

    window.featureLayer = geoJsonLayer;
}
function getDepthColor(dep) {
    if (dep == null || isNaN(dep)) return '#999999';

    const scale = [
        { d: 0, c: [139, 0, 0] },
        { d: 10, c: [255, 0, 0] },
        { d: 20, c: [255, 128, 0] },
        { d: 30, c: [255, 255, 0] },
        { d: 50, c: [173, 255, 47] },
        { d: 100, c: [0, 200, 0] },
        { d: 200, c: [100, 200, 255] },
        { d: 500, c: [0, 0, 255] },
        { d: 700, c: [0, 0, 139] }
    ];

    if (dep <= scale[0].d) return `rgb(${scale[0].c.join(',')})`;
    if (dep >= scale[scale.length - 1].d) return `rgb(${scale[scale.length - 1].c.join(',')})`;

    for (let i = 0; i < scale.length - 1; i++) {
        const a = scale[i], b = scale[i + 1];
        if (dep >= a.d && dep <= b.d) {
            const t = (dep - a.d) / (b.d - a.d);
            const r = Math.round(a.c[0] + (b.c[0] - a.c[0]) * t);
            const g = Math.round(a.c[1] + (b.c[1] - a.c[1]) * t);
            const bcol = Math.round(a.c[2] + (b.c[2] - a.c[2]) * t);
            return `rgb(${r},${g},${bcol})`;
        }
    }
}

document.getElementById('timeSlider').addEventListener('input', (e) => {
    const hour = parseInt(e.target.value);
    if (hour === 24) {
        updateMap(allFeatures);
        document.getElementById('nowTime').textContent = `전체 (${allFeatures.length}회 발생)`;
        return;
    }

    const filtered = allFeatures.filter(f => {
        const dateStr = f.properties.date; // 예: "2025/10/08.00:13"
        const h = parseInt(dateStr.split('.')[1].split(':')[0]);
        return h === hour;
    });

    updateMap(filtered);
    document.getElementById('nowTime').textContent = `${String(hour).padStart(2, '0')}시 ~ ${String(hour + 1).padStart(2, '0')}시 (${filtered.length}회 발생)`;
});

document.getElementById('allTimeBtn').addEventListener('click', () => {
    updateMap(allFeatures);
    document.getElementById('timeSlider').value = 24;
    document.getElementById('nowTime').textContent = `전체 (${allFeatures.length}회 발생)`;

});

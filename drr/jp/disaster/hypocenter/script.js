import mon_day_year from '../../../../src/time.js'
var map = L.map('map', { zoomControl: false }).setView([35.6, 136.7], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    attribution: `© OpenStreetMap, © <span class="jp">気象庁</span>(일본 기상청)`
}).addTo(map);

const container = document.getElementById('dateButtons');
const today = new Date();
let startDate = new Date(today);
let geoLayer = null;
let allFeatures = [];

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
            await loadGeoData(yyyy, mm, formatted);
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
        if (!res.ok) continue; // 데이터 없으면 skip

        const button = document.createElement('p');
        button.textContent = `${mm}월 ${dd}일`;
        button.className = 'dateBtn';
        button.addEventListener('click', async () => {
            console.log(formatted);
            await loadGeoData(yyyy, mm, formatted);
        });

        container.appendChild(button);
        container.appendChild(document.createTextNode(' '));
    }
})();

async function loadGeoData(y, m, ymd) {
    try {
        document.getElementById('nowDate').textContent = `${y}년 ${m}월 ${ymd.slice(6)}일 `;
        const url = `https://www.jma.go.jp/bosai/hypo/data/${y}/${m}/hypo${ymd}.geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch 실패: ' + res.status);

        const data = await res.json();

        allFeatures = Array.isArray(data.features)
            ? data.features
            : (data && data.type === 'FeatureCollection' ? data.features : []);
        updateMap(allFeatures);
        document.getElementById('nowTime').textContent = `전체`;
    } catch (e) {
        console.error('데이터 불러오기 오류', e);
        alert('데이터 로드 실패: ' + e.message);
    }
}
function getDepthColor(dep) {
    if (dep == null || isNaN(dep)) return '#999999';

    const scale = [
        { d: 0,   c: [139, 0, 0] },
        { d: 10,  c: [255, 0, 0] },
        { d: 20,  c: [255, 128, 0] },
        { d: 30,  c: [255, 255, 0] },
        { d: 50,  c: [173, 255, 47] },
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

function updateMap(features) {
    if (geoLayer) geoLayer.remove();

    const fc = Array.isArray(features) ? { type: 'FeatureCollection', features } : features;
    if (!fc || !fc.features || fc.features.length === 0) {
        geoLayer = L.layerGroup().addTo(map);
        return;
    }

    geoLayer = L.geoJSON(fc, {
        pointToLayer: (feature, latlng) => {
            const mag = parseFloat(String(feature.properties.mag).trim());
            let dep = parseFloat(String(feature.properties.dep).trim());
            if (Number.isNaN(dep)) dep = null;

            const radius = Number.isFinite(mag) ? Math.max(3, mag * 3) : 3;
            const color = getDepthColor(dep)

            return L.circleMarker(latlng, {
                radius,
                fillColor: color,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            }).bindPopup(`
            <b>${feature.properties.place || ''}</b><br>
            ${feature.properties.date || ''}<br>
            규모: ${feature.properties.mag} / 깊이: ${feature.properties.dep}km
            `);
        }
    }).addTo(map);

    // try {
    //     map.fitBounds(geoLayer.getBounds(), { maxZoom: 8 });
    // } catch (e) {

    // }
}

const slider = document.getElementById('hourSlider');
const label = document.getElementById('nowTime');

slider.addEventListener('input', () => {
const hour = parseInt(slider.value, 10);
label.textContent = `${hour}시`;

const filtered = allFeatures.filter(f => {
    const dateStr = f.properties && f.properties.date;
    if (!dateStr) return false;

    const m = dateStr.match(/(\d{1,2}):(\d{2})/);
    if (!m) return false;
    const hh = parseInt(m[1], 10);
    return hh === hour;
});

updateMap(filtered);
});

// 전체시간 버튼
document.getElementById('allTimeBtn').addEventListener('click', () => {
label.textContent = '전체';
slider.value = 0;
updateMap(allFeatures);
});
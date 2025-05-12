import mon_day from '../../../../src/time.js'
const map = L.map('map').setView([36.5, 137.9], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    attribution: `© OpenStreetMap, © <span class="jp">気象庁</span>(일본 기상청)`
}).addTo(map);

let id = '';
const searchParams = new URLSearchParams(location.search);
if (searchParams.has('id')) {
    id = searchParams.get('id');
}

function getEarthquakeData() {
    fetch(`http://192.168.45.190:3000/jp_earthquake?id=${id}`)
        .then(response => response.json())
        .then(data => {
            displayEarthquake(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
function getCoordinate(coord) {
    const regex = /([+-]?\d+\.\d+)([+-]\d+\.\d+)/;
    const match = coord.match(regex);
    if (match) {
        var lat = parseFloat(match[1]);
        var lon = parseFloat(match[2]);
        if (lon < 0) {
            lon += 360;
        }

        return [lat, lon]
    } else {
        console.error('잘못된 좌표 형식');
        return null
    }
}

const int1 = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int1.png', iconSize: [20, 20] });
const int2 = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int2.png', iconSize: [20, 20] });
const int3 = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int3.png', iconSize: [20, 20] });
const int4 = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int4.png', iconSize: [20, 20] });
const int5minus = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int5minus.png', iconSize: [20, 20] });
const int5plus = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int5plus.png', iconSize: [20, 20] });
const int6minus = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int6minus.png', iconSize: [20, 20] });
const int6plus = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int6plus.png', iconSize: [20, 20] });
const int7 = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/int7.png', iconSize: [20, 20] });
const unknown = L.icon({ iconUrl: '/drr/jp/disaster/earthquake/images/unknown.png', iconSize: [20, 20] });

const intensityMap = {
    '1': int1,
    '2': int2,
    '3': int3,
    '4': int4,
    '5-': int5minus,
    '5+': int5plus,
    '6-': int6minus,
    '6+': int6plus,
    '7': int7,
    '진도 5약 이상으로 추정' : unknown
};

function getZIndexFromIntensity(intensity) {
    const rank = {
        "7": 1000,
        "6+": 900,
        "6-": 800,
        "5+": 700,
        "5-": 600,
        "4": 500,
        "3": 400,
        "2": 300,
        "1": 200,
        "0": 100
    };
    return rank[intensity] || 0;
}

function getColor(int) {
    switch (int) {
        case '1': return ['#46646e', '#FFFFFF'];
        case '2': return ['#b3eaed', '#000000'];
        case '3': return ['#0041ff', '#FFFFFF'];
        case '4': return ['#fae696', '#000000'];
        case '5-': return ['#ffe600', '#000000'];
        case '5+': return ['#ff9900', '#FFFFFF'];
        case '6-': return ['#ff2800', '#FFFFFF'];
        case '6+': return ['#a50021', '#FFFFFF'];
        case '7': return ['#b40068', '#FFFFFF'];
        default: return ['rgb(0,0,0,0)', '#000000'];
    }
}

let geoJsonData = null;
let geoJsonLayer = null;
let markerLayerGroup = L.layerGroup().addTo(map);
let currentEarthquakeData = null;
let currentParaList = null;

fetch('http://192.168.45.190:3000/jp_earthquakeClass')
    .then(response => response.json())
    .then(data => {
        geoJsonData = data;
    })
    .catch(error => console.error('GeoJSON 불러오기 실패:', error));

function getAreaMaxIntensity(code) {
    if (!currentEarthquakeData) return null;
    const areas = currentEarthquakeData.body.intensity.observations;
    for (const obs of areas) {
        for (const area of obs.area) {
            if (area.code === code) {
                return area.maxIntensity;
            }
        }
    }
    return null;
}
function getAreaName(code){
    if (!currentEarthquakeData) return null;
    const areas = currentEarthquakeData.body.intensity.observations;
    for (const obs of areas) {
        for (const area of obs.area) {
            if (area.code === code) {
                return area.name;
            }
        }
    }
    return null;
}

function markStationsOnMap(earthquakeData, paraList) {
    console.log(earthquakeData)
    console.log(paraList)
    markerLayerGroup.clearLayers();
    const observations = earthquakeData.body.intensity.observations;
    observations.forEach(obs => {
        obs.area.forEach(area => {
            area.city.forEach(city => {
                city.stations.forEach(station => {
                    const stationCode = station.code;
                    const found = paraList.find(p => p.code === stationCode);

                    if (found && found.latlon?.length === 2) {
                        const lat = parseFloat(found.latlon[0]);
                        const lon = parseFloat(found.latlon[1]);
                        const icon = intensityMap[station.int];
                        if (!icon) return;

                        const zIndex = getZIndexFromIntensity(station.int);
                        const marker = L.marker([lat, lon], {
                            icon,
                            zIndexOffset: zIndex
                        }).bindPopup(`
                            <strong style="font-family: 'Noto Sans JP', Pretendard">${station.name}</strong><br><span style="font-family: 'Pretendard Variable', Pretendard">진도: ${station.int}</span>`);

                        markerLayerGroup.addLayer(marker);
                    }
                });
            });
        });
    });
}

document.getElementById('areaBtn').addEventListener('click', () => {
    if (!geoJsonData) return;

    markerLayerGroup.clearLayers();

    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }
    document.getElementById('areaBtn').style.backgroundColor = 'rgb(0,123,255)';
    document.getElementById('areaBtn').style.color = 'white';
    document.getElementById('stationBtn').style.backgroundColor = 'white';
    document.getElementById('stationBtn').style.color = 'black';
    geoJsonLayer = L.geoJSON(geoJsonData, {
        style: feature => {
            const int = getAreaMaxIntensity(feature.properties.code);
            const colorInfo = getColor(int || '');
            return {
                fillColor: colorInfo[0],
                fillOpacity: 0.8,
                color: '#555',
                weight: 1
            };
        },
        onEachFeature: (feature, layer) => {
            const code = feature.properties.code;
            const name = getAreaName(code);
            const intensity = getAreaMaxIntensity(code) || '0';
        
            if (name) {
                layer.bindPopup(`<span style="font-family: 'Pretendard Variable', Pretendard" style="font-size:1.3rem; font-weight: bold">${name}: 진도 ${intensity}</span>`);
            }
        }
    }).addTo(map);

    renderByArea();
});

document.getElementById('stationBtn').addEventListener('click', () => {
    document.getElementById('stationBtn').style.backgroundColor = 'rgb(0,123,255)';
    document.getElementById('stationBtn').style.color = 'white';
    document.getElementById('areaBtn').style.backgroundColor = 'white';
    document.getElementById('areaBtn').style.color = 'black';
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    markStationsOnMap(currentEarthquakeData, currentParaList);
    renderByCity();
});

function displayEarthquake(data) {
    currentEarthquakeData = data;
    const coordStr = data.body.earthquake.hypocenter.coord.coordinate;
    const coord = getCoordinate(coordStr);
    map.setView(coord, 7);

    const epicenter = L.icon({
        iconUrl: '/src/images/epicenter.png',
        iconSize: [35, 35]
    });

    fetch('http://192.168.45.190:3000/jp_earthquakePara')
        .then(response => response.json())
        .then(paraData => {
            currentParaList = paraData;
            markStationsOnMap(data, paraData);
            L.marker(coord, { icon: epicenter, zIndexOffset: 2000 }).addTo(map);
        })
        .catch(error => console.error('jp_earthquakePara 요청 실패:', error));

    const maxIntRaw = data.body.intensity.maxIntensity;
    const [bg, fg] = getColor(maxIntRaw);
    document.getElementById('intmag').style = `background-color: ${bg}; color: ${fg}`;

    let maxIntText = maxIntRaw;
    if (maxIntRaw === '5-') maxIntText = '5약';
    else if (maxIntRaw === '5+') maxIntText = '5강';
    else if (maxIntRaw === '6-') maxIntText = '6약';
    else if (maxIntRaw === '6+') maxIntText = '6강';
    else if (maxIntRaw === '') maxIntText = '-';

    const magnitude = data.body.earthquake.hypocenter.magnitude;
    if (magnitude.includes('규모') || magnitude.includes('불명')) {
        document.getElementById('magType').style.display = 'none';
        document.getElementById('magValue').textContent = magnitude;
    } else {
        if (magnitude.length === 5) {
            document.getElementById('magType').textContent = magnitude.slice(0, 2);
            document.getElementById('magValue').textContent = magnitude.slice(2);
        } else {
            document.getElementById('magType').textContent = magnitude.slice(0, 3);
            document.getElementById('magValue').textContent = magnitude.slice(3);
        }
    }
    if(data.status != '통상'){
        document.getElementById('title').textContent = `[${data.status}] ${data.title}`;
    }else{
        document.getElementById('title').textContent = data.title;
    }
    if(data.title == '현저한 지진의 진원 요소 갱신'){
        document.getElementById('reportDateTime').textContent = `${mon_day(data.reportDateTime)} 발표`;
    }else{
        document.getElementById('reportDateTime').textContent = `${mon_day(data.reportDateTime)} 발표 (제${data.serial}보)`;
    }
    document.getElementById('intValue').textContent = maxIntText;
    document.getElementById('originTime').textContent = mon_day(data.body.earthquake.originTime) + ' 발생';
    document.getElementById('epicenter').textContent = data.body.earthquake.hypocenter.area;
    document.getElementById('depth').textContent = '깊이 ' + data.body.earthquake.hypocenter.coord.depth;
    document.getElementById('forcastComment').textContent = data.body.comments.forecastComment;

    
    if(data.body.lngIntensity){
        function getLngColor(int) {
            switch (int) {
                case '1' :
                    return ['#0041ff', '#FFFFFF'];
                case '2' :
                    return ['#ffe600', '#000000'];
                case '3' :
                    return ['#ff2800', '#FFFFFF'];
                case '4' :
                    return ['#a50021', '#FFFFFF'];
                default: return '';
            }
        }
        const divBox = document.getElementById('earthquakeInfo');
        const lngInfo = document.createElement('a');
        const max = data.body.lngIntensity.maxIntensity
        lngInfo.href = `/drr/jp/disaster/lngint/?id=${data.eventId}`;
        lngInfo.textContent = `장주기지진동 계급 ${max} 관측 >`;
        lngInfo.style.backgroundColor = getLngColor(max)[0];
        lngInfo.style.color = getLngColor(max)[1];
        lngInfo.className = 'lngInfo';
        divBox.appendChild(lngInfo);
    }
    
    if (data.body.comments.forecastComment.includes('해일경보')) {
        const divBox = document.getElementById('earthquakeInfo');
        const tsunamiInfo = document.createElement('a');
        tsunamiInfo.href = `/drr/jp/disaster/tsunami/?id=${data.eventId}`;
        tsunamiInfo.textContent = '해일정보 발표 >';
        tsunamiInfo.className = 'tsunamiInfo';
        tsunamiInfo.style.backgroundColor = '#ff2800';
        tsunamiInfo.style.color = '#FFFFFF';
        divBox.appendChild(tsunamiInfo);
    }else if (data.body.comments.forecastComment.includes('약간의 해수면 변동')) {
        const divBox = document.getElementById('earthquakeInfo');
        const tsunamiInfo = document.createElement('a');
        tsunamiInfo.href = `/drr/jp/disaster/tsunami/?id=${data.eventId}`;
        tsunamiInfo.textContent = '해일정보 발표 >';
        tsunamiInfo.className = 'tsunamiInfo';
        tsunamiInfo.style.backgroundColor = '#66ffff';
        tsunamiInfo.style.color = '#000000';
        divBox.appendChild(tsunamiInfo);

    }

    currentEarthquakeData = data;
    renderByCity();

    if(data.body.etc){
        const etcData = data.body.etc;
        etcData.forEach(item => {
            const box = document.getElementById('etcInfo');
            const div = document.createElement('div');
            div.className = 'etcInfoBox';

            const title = document.createElement('h4');
            title.textContent = item.title;
            div.appendChild(title);

            const text = document.createElement('p');
            text.textContent = item.text;
            div.appendChild(text);

            const link = document.createElement('a');
            link.href = item.link;
            link.textContent = item.linkTitle;
            link.target = '_blank';
            link.style.color = 'blue';
            div.appendChild(link);

            box.appendChild(div);
        })
    }
}

function groupByPrefAndIntensity(items) {
    const result = {};
    items.forEach(({ pref, name, int }) => {
        if (!result[int]) result[int] = {};
        if (!result[int][pref]) result[int][pref] = [];
        result[int][pref].push(name);
    });
    return result;
}
function groupByIntensity(items) {
    const result = {};
    items.forEach(({ name, int }) => {
        if (!result[int]) result[int] = {};
        if (!result[int]['']) result[int][''] = [];
        result[int][''].push(name);
    });
    return result;
}

function renderTable(grouped) {
    const intensityOrder = ['7', '6+', '6-', '5+', '5-', '4', '3', '2', '1'];
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    intensityOrder.forEach(intensity => {
        if (grouped[intensity]) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = `진도${intensity}`;
            const [bg, fg] = getColor(intensity);
            th.style.backgroundColor = bg;
            th.style.color = fg;
            th.style.padding = '5px';
            th.style.border = '1px solid #ccc';
            th.style.borderRight = 'none';
            th.style.width = '10%';
            tr.appendChild(th);

            const td = document.createElement('td');
            td.style.padding = '5px';
            td.style.border = '1px solid #ccc';

            Object.entries(grouped[intensity]).forEach(([pref, cities]) => {
                if(pref != ''){
                    const prefTitle = document.createElement('div');
                    prefTitle.style.fontWeight = 'bold';
                    prefTitle.textContent = `[${pref}]`;
                    td.appendChild(prefTitle);
                }

                const cityList = document.createElement('div');
                cities.forEach((city, index) => {
                    const span = document.createElement('span');
                    span.textContent = city;
                    cityList.appendChild(span);
                    if (index !== cities.length - 1) {
                        cityList.appendChild(document.createTextNode(', '));
                    }
                });
                cityList.style.margin = '0.3rem 0';
                td.appendChild(cityList);
            });

            tr.appendChild(td);
            table.appendChild(tr);
        }
    });

    const container = document.getElementById('intensityList');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(table);
}

function renderByCity() {
    map.setMaxZoom(18);
    const items = [];
    currentEarthquakeData.body.intensity.observations.forEach(obs => {
        const pref = obs.pref;
        obs.area.forEach(area => {
            area.city.forEach(city => {
                items.push({ pref, name: city.name, int: city.maxIntensity });
            });
        });
    });
    const grouped = groupByPrefAndIntensity(items);
    renderTable(grouped);
}

function renderByArea() {
    map.setMaxZoom(9);
    const items = [];
    currentEarthquakeData.body.intensity.observations.forEach(obs => {
        obs.area.forEach(area => {
            items.push({ name: area.name, int: area.maxIntensity });
        });
    });
    const grouped = groupByIntensity(items);
    renderTable(grouped);
}

getEarthquakeData();

fetch('http://192.168.45.190:3000/jp_earthquakeList')
    .then(response => response.json())
    .then(data => {
        const listBox = document.getElementById('earthquakeListBox');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        const itemsPerPage = 10;
        let currentPage = 1;

        function renderPage(page) {
            // 기존 내용 제거
            while (listBox.firstChild) {
                listBox.removeChild(listBox.firstChild);
            }

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['발생 시각', '진원지', '진도', '규모'];

            headers.forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.borderBottom = '1px solid #ccc';
                th.style.padding = '8px';
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const sliced = data.slice(start, end);

            sliced.forEach(item => {
                const row = document.createElement('tr');
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    window.location.href = `/drr/jp/disaster/earthquake/?id=${item.eventId}`;
                });

                const dateCell = document.createElement('td');
                dateCell.textContent = `${item.originTime.slice(5, 7)}/${item.originTime.slice(8, 10)} ${item.originTime.slice(11, 13)}:${item.originTime.slice(14, 16)}`
                dateCell.style.padding = '8px';
                dateCell.style.width = '30%';

                const hypoCell = document.createElement('td');
                hypoCell.textContent = item.hypocenter;
                hypoCell.style.padding = '8px'; 
                hypoCell.style.width = '50%';

                const intCell = document.createElement('td');
                intCell.textContent = item.maxIntensity || '-';
                intCell.style.padding = '8px';
                intCell.style.textAlign = 'center';
                intCell.style.backgroundColor = getColor(item.maxIntensity)[0];
                intCell.style.color = getColor(item.maxIntensity)[1];
                intCell.style.width = '10%';

                const magCell = document.createElement('td');
                magCell.textContent = (item.magnitude).slice(-3,);
                magCell.style.padding = '8px';
                magCell.style.textAlign = 'center';
                magCell.style.width = '10%';

                row.appendChild(dateCell);
                row.appendChild(hypoCell);
                row.appendChild(intCell);
                row.appendChild(magCell);

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            listBox.appendChild(table);

            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = end >= data.length;
        }

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
            }
        });

        nextBtn.addEventListener('click', () => {
            if ((currentPage * itemsPerPage) < data.length) {
                currentPage++;
                renderPage(currentPage);
            }
        });

        renderPage(currentPage);
    })
    .catch(error => {
        console.error('jp_earthquakeList 요청 실패:', error);
    });
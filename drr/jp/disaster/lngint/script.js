import mon_day from '../../../../src/time.js'
const map = L.map('map', { zoomControl: false }).setView([36.5, 137.9], 6);

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
    fetch(`http://localhost:3000/jp_lngearthquake?id=${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
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

const int1 = L.icon({ iconUrl: '/drr/jp/disaster/lngint/images/1.png', iconSize: [20, 20] });
const int2 = L.icon({ iconUrl: '/drr/jp/disaster/lngint/images/2.png', iconSize: [20, 20] });
const int3 = L.icon({ iconUrl: '/drr/jp/disaster/lngint/images/3.png', iconSize: [20, 20] });
const int4 = L.icon({ iconUrl: '/drr/jp/disaster/lngint/images/4.png', iconSize: [20, 20] });

function getLngIntIconUrl(lngInt) {
    const intensityMap = {
        '1': '/drr/jp/disaster/lngint/images/1.png',
        '2': '/drr/jp/disaster/lngint/images/2.png',
        '3': '/drr/jp/disaster/lngint/images/3.png',
        '4': '/drr/jp/disaster/lngint/images/4.png',
    };
    return intensityMap[lngInt] || null;
}

function getZIndexFromIntensity(intensity) {
    const rank = {
        "4": 500,
        "3": 400,
        "2": 300,
        "1": 200,
        "0": 100
    };
    return rank[intensity] || 0;
}

let geoJsonData = null;
let geoJsonLayer = null;
let markerLayerGroup = L.layerGroup().addTo(map);
let currentEarthquakeData = null;
let currentParaList = null;

fetch('http://localhost:3000/jp_earthquakeClass')
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
                return area.maxLngIntensity;
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
        default: return ['rgb(0,0,0,0)', '#000000'];
    }
}
function markStationsOnMap(earthquakeData, paraData) {
    markerLayerGroup.clearLayers();

    earthquakeData.body.intensity.observations.forEach(prefecture => {
        prefecture.area.forEach(area => {
            area.stations.forEach(station => {
                const stationCode = station.code;
                const lngInt = station.lngInt;

                const matched = paraData.find(p => p.code === stationCode);

                if (matched) {
                    const lat = parseFloat(matched.latlon[0]);
                    const lon = parseFloat(matched.latlon[1]);

                    const iconUrl = getLngIntIconUrl(lngInt);

                    const icon = L.icon({
                        iconUrl,
                        iconSize: [20, 20]
                    });

                    const marker = L.marker([lat, lon], { icon })
                        .bindPopup(`
                            <div>
                            <p style="font-family: 'Pretendard Variable'; text-align: center; font-weight:bold; font-size:1rem; margin:0">[계급 ${lngInt}][진도 ${station.int}] <span style="font-family: 'Noto Sans JP'">${station.name}<span></p>
                            <p style="font-family: 'Pretendard Variable'; text-align: center; font-size:0.9rem; margin:0">최대 Sva : ${station.sva}</p>
                            <div style="font-family: 'Pretendard Variable'; display:flex; margin:0; justify-content: center;">
                                <div>
                                    <p style="font-family: 'Pretendard Variable'; font-size:0.85rem; margin:0; text-align: center;">주기별 Sva 및 계급</p>
                                    <table style="font-family: 'Pretendard Variable'">
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[0].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[0].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[0].value}</td>
                                        </tr>
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[1].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[1].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[1].value}</td>
                                        </tr>
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[2].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[2].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[2].value}</td>
                                        </tr>
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[3].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[3].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[3].value}</td>
                                        </tr>
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[4].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[4].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[4].value}</td>
                                        </tr>
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[5].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[5].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[5].value}</td>
                                        </tr>
                                        <tr>
                                            <th style='text-align: center;'>${station.lngIntPerPeriod[6].periodBand}초대</th>
                                            <td style='padding:0 1rem; text-align: center;'>${station.svaPerPeriod[6].value}cm/s</td>
                                            <td>계급 ${station.lngIntPerPeriod[6].value}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            `);
                    markerLayerGroup.addLayer(marker);
                } else {
                    console.warn('좌표를 찾을 수 없음:', stationCode, station.name);
                }
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
            const colorInfo = getLngColor(int || '');
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
                layer.bindPopup(`<span style="font-family: 'Pretendard Variable', Pretendard" style="font-size:1.3rem; font-weight: bold">${name}: 계급 ${intensity}</span>`);
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

    fetch('http://localhost:3000/jp_earthquakePara')
        .then(response => response.json())
        .then(paraData => {
            currentParaList = paraData;
            markStationsOnMap(data, paraData);
            L.marker(coord, { icon: epicenter, zIndexOffset: 2000 }).addTo(map);
        })
        .catch(error => console.error('jp_earthquakePara 요청 실패:', error));
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
        var maxIntRaw = data.body.intensity.maxLngIntensity;
        document.getElementById('intValue').textContent =maxIntRaw;
        document.getElementById('originTime').textContent = mon_day(data.body.earthquake.originTime) + ' 발생';
        document.getElementById('epicenter').textContent = data.body.earthquake.hypocenter.area;
        document.getElementById('depth').textContent = '깊이 ' + data.body.earthquake.hypocenter.coord.depth;
        const [bg, fg] = getLngColor(maxIntRaw);
        document.getElementById('intmag').style = `background-color: ${bg}; color: ${fg}`;
        document.getElementById('earthquakeInfoLink').href = `/drr/jp/disaster/earthquake/?id=${data.eventId}`;

    currentEarthquakeData = data;
    renderByCity();
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
    const intensityOrder = ['4', '3', '2', '1'];
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    intensityOrder.forEach(intensity => {
        if (grouped[intensity]) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = `계급 ${intensity}`;
            const [bg, fg] = getLngColor(intensity);
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
                    span.style = 'font-family: "Noto Sans JP", "Pretendard Variable";';
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
            area.stations.forEach(data => {
                items.push({ pref, name: data.name, int: data.lngInt });
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
            items.push({ name: area.name, int: area.maxLngIntensity });
        });
    });
    const grouped = groupByIntensity(items);
    renderTable(grouped);
}

getEarthquakeData();

// fetch('http://localhost:3000/jp_earthquakeList')
//     .then(response => response.json())
//     .then(data => {
//         const listBox = document.getElementById('earthquakeListBox');
//         const prevBtn = document.getElementById('prevBtn');
//         const nextBtn = document.getElementById('nextBtn');

//         const itemsPerPage = 5;
//         let currentPage = 1;

//         function renderPage(page) {
//             // 기존 내용 제거
//             while (listBox.firstChild) {
//                 listBox.removeChild(listBox.firstChild);
//             }

//             const table = document.createElement('table');
//             table.style.width = '100%';
//             table.style.borderCollapse = 'collapse';

//             const thead = document.createElement('thead');
//             const headerRow = document.createElement('tr');
//             const headers = ['발생 시각', '진원지', '진도', '규모'];

//             headers.forEach(text => {
//                 const th = document.createElement('th');
//                 th.textContent = text;
//                 th.style.borderBottom = '1px solid #ccc';
//                 th.style.padding = '8px';
//                 headerRow.appendChild(th);
//             });

//             thead.appendChild(headerRow);
//             table.appendChild(thead);

//             const tbody = document.createElement('tbody');
//             const start = (page - 1) * itemsPerPage;
//             const end = start + itemsPerPage;
//             const sliced = data.slice(start, end);

//             sliced.forEach(item => {
//                 const row = document.createElement('tr');
//                 row.style.cursor = 'pointer';
//                 row.addEventListener('click', () => {
//                     window.location.href = `/drr/jp/disaster/earthquake/?id=${item.eventId}`;
//                 });

//                 const dateCell = document.createElement('td');
//                 dateCell.textContent = `${item.originTime.slice(5, 7)}/${item.originTime.slice(8, 10)} ${item.originTime.slice(11, 13)}:${item.originTime.slice(14, 16)}`
//                 dateCell.style.padding = '8px';
//                 dateCell.style.width = '30%';

//                 const hypoCell = document.createElement('td');
//                 hypoCell.textContent = item.hypocenter;
//                 hypoCell.style.padding = '8px'; 
//                 hypoCell.style.width = '50%';

//                 const intCell = document.createElement('td');
//                 intCell.textContent = item.maxIntensity || '-';
//                 intCell.style.padding = '8px';
//                 intCell.style.textAlign = 'center';
//                 intCell.style.backgroundColor = getLngColor(item.maxIntensity)[0];
//                 intCell.style.color = getLngColor(item.maxIntensity)[1];
//                 intCell.style.width = '10%';

//                 const magCell = document.createElement('td');
//                 magCell.textContent = (item.magnitude).slice(-3,);
//                 magCell.style.padding = '8px';
//                 magCell.style.textAlign = 'center';
//                 magCell.style.width = '10%';

//                 row.appendChild(dateCell);
//                 row.appendChild(hypoCell);
//                 row.appendChild(intCell);
//                 row.appendChild(magCell);

//                 tbody.appendChild(row);
//             });

//             table.appendChild(tbody);
//             listBox.appendChild(table);

//             prevBtn.disabled = currentPage === 1;
//             nextBtn.disabled = end >= data.length;
//         }

//         prevBtn.addEventListener('click', () => {
//             if (currentPage > 1) {
//                 currentPage--;
//                 renderPage(currentPage);
//             }
//         });

//         nextBtn.addEventListener('click', () => {
//             if ((currentPage * itemsPerPage) < data.length) {
//                 currentPage++;
//                 renderPage(currentPage);
//             }
//         });

//         renderPage(currentPage);
//     })
//     .catch(error => {
//         console.error('jp_earthquakeList 요청 실패:', error);
//     });
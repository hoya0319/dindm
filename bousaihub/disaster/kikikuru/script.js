
var h = window.innerHeight;
document.getElementById('map').style.height = h - 48 + 'px'
var map = L.map('map').setView([38.26, 135.59], 6);

function getNearest10MinuteUTC() {
    const now = new Date();
    // 현재 시각에서 20분을 뺍니다.
    now.setUTCMinutes(now.getUTCMinutes() - 20);
    
    const utcMinutes = now.getUTCMinutes();
    const utcHours = now.getUTCHours();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    // 10분 단위로 조정합니다.
    const roundedMinutes = Math.floor(utcMinutes / 10) * 10;

    const adjustedDate = new Date(Date.UTC(
        utcYear,
        utcMonth,
        utcDate,
        utcHours,
        roundedMinutes
    ));

    const year = adjustedDate.getUTCFullYear();
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const hour = String(adjustedDate.getUTCHours()).padStart(2, '0');
    const minute = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
    const second = String(adjustedDate.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
}
function getNearest10MinuteUTC30() {
    const now = new Date();
    // 현재 시각에서 20분을 뺍니다.
    now.setUTCMinutes(now.getUTCMinutes() - 30);
    
    const utcMinutes = now.getUTCMinutes();
    const utcHours = now.getUTCHours();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    // 10분 단위로 조정합니다.
    const roundedMinutes = Math.floor(utcMinutes / 10) * 10;

    const adjustedDate = new Date(Date.UTC(
        utcYear,
        utcMonth,
        utcDate,
        utcHours,
        roundedMinutes
    ));

    const year = adjustedDate.getUTCFullYear();
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const hour = String(adjustedDate.getUTCHours()).padStart(2, '0');
    const minute = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
    const second = String(adjustedDate.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
}
function UTCyyyymmddhhmmss(yyyymmddhhmmss) {
    const year = yyyymmddhhmmss.substring(0, 4);
    const month = yyyymmddhhmmss.substring(4, 6);
    const day = yyyymmddhhmmss.substring(6, 8);
    const hour = yyyymmddhhmmss.substring(8, 10);
    const minute = yyyymmddhhmmss.substring(10, 12);
    console.log(year, month, day, hour, minute)

    const utcDate = new Date(Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10)
    ));

    const koreaOffset = 9 * 60; 
    const koreaDate = new Date(utcDate.getTime() + koreaOffset * 60 * 1000);

    const koreaMonth = String(koreaDate.getUTCMonth() + 1).padStart(2, '0');
    const koreaDay = String(koreaDate.getUTCDate()).padStart(2, '0');
    const koreaHour = String(koreaDate.getUTCHours()).padStart(2, '0');
    const koreaMinute = String(koreaDate.getUTCMinutes()).padStart(2, '0');

    return `${koreaMonth}월 ${koreaDay}일 ${koreaHour}시 ${koreaMinute}분`;
}
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '© OpenStreetMap, © 気象庁(일본 기상청)',
}).addTo(map);

var time = getNearest10MinuteUTC()
var nowtile
var url = `https://www.jma.go.jp/bosai/jmatile/data/risk/${time}/immed0/${time}/surf/land/{z}/{x}/{y}.png`

nowtile = L.tileLayer(url, {
    maxZoom: 10,
    attribution: '© OpenStreetMap, © 気象庁(일본 기상청)',
}).addTo(map);

function layer(id) {
    if (nowtile) {
        map.removeLayer(nowtile);
    }

    var time = id === 'flood' ? getNearest10MinuteUTC30() : getNearest10MinuteUTC();
    document.getElementById('time').textContent = `${UTCyyyymmddhhmmss(time)} 현재`;
    
    var url;
    if (id == 'landslide') {
        url = `https://www.jma.go.jp/bosai/jmatile/data/risk/${time}/immed0/${time}/surf/land/{z}/{x}/{y}.png`;
        document.getElementById('time').textContent += ' [토사]'
    } else if (id == 'inund') {
        url = `https://www.jma.go.jp/bosai/jmatile/data/risk/${time}/immed0/${time}/surf/inund/{z}/{x}/{y}.png`;
        document.getElementById('time').textContent += ' [침수]'
    } else if (id == 'flood') {
        url = `https://www.jma.go.jp/bosai/jmatile/data/risk/${time}/immed0/${time}/surf/flood_mesh/{z}/{x}/{y}.png`;
        document.getElementById('time').textContent += ' [홍수]'
    }

    nowtile = L.tileLayer(url, {
        maxZoom: 10,
        attribution: '© OpenStreetMap, © 気象庁(일본 기상청)',
    }).addTo(map);

}

document.getElementById('kikikuru').addEventListener('input', function() {
    let option = this.options[this.selectedIndex];
    let id = option.id;
    layer(id)
});
function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}
let para = getURLParameter('layer') || 'landslide';
layer(para)
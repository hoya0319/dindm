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
var time = getNearest10MinuteUTC()
var nowtile 
var url = `https://www.jma.go.jp/bosai/himawari/data/satimg/${time}/fd/${time}/B13/TBB/{z}/{x}/{y}.jpg`

nowtile = L.tileLayer(url, {
    maxZoom: 5,
    minZoom: 3,
    attribution: `© OpenStreetMap, © <span class="jp">気象庁</span>(일본 기상청)`
}).addTo(map);

L.tileLayer('https://www.jma.go.jp/tile/jma/sat/{z}/{x}/{y}.png', {
    maxZoom: 5,
    minZoom: 3,
    attribution: `© OpenStreetMap, © <span class="jp">気象庁</span>(일본 기상청)`
}).addTo(map);
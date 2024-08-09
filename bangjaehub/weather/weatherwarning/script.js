function mon_day(time){
    return `${time.slice(4,6)}월 ${time.slice(6,8)}일 ${time.slice(8,10)}시 ${time.slice(10,12)}분`
}

var map = L.map('map').setView([36, 127.7], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    minZoom: 6,
    attribution: '© OpenStreetMap, © 기상청'
}).addTo(map);
map.setMaxBounds([[27, 120], [44, 135]]);

function getStyle(warn, level){
    if(warn == '강풍'){
        if(level == '경보'){
            return 'border: #0dde1f solid 1px; background-color:#0dde1f; display:block;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #0dde1f solid 1px; background-color:#0dde1f; display:block; background-image: linear-gradient(-45deg,#66fa73 25%,transparent 25%,transparent 50%,#66fa73 50%,#66fa73 75%,transparent 75%,transparent);'
        }else{
            return 'display:none;'
        }
    }else if(warn == '호우'){
        if(level == '경보'){
            return 'border: #070bf7 solid 1px; background-color:#070bf7; display:block; color:white;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #070bf7 solid 1px; background-color:#070bf7; display:block; background-image: linear-gradient(-45deg,#696bff 25%,transparent 25%,transparent 50%,#696bff 50%,#696bff 75%,transparent 75%,transparent); color:white;'
        }else{
            return 'display:none;'
        }
    }else if(warn == '한파'){
        if(level == '경보'){
            return 'border: #079ff7 solid 1px; background-color:#079ff7; display:block;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #079ff7 solid 1px; background-color:#079ff7; display:block; background-image: linear-gradient(-45deg,#62c4fc 25%,transparent 25%,transparent 50%,#62c4fc 50%,#62c4fc 75%,transparent 75%,transparent);'
        }else{
            return 'display:none;'
        }
    }else if(warn == '건조'){
        if(level == '경보'){
            return 'border:#f09102 solid 1px; background-color:#f09102; display:block;'
        }else if(level == '주의보' || level == '주의'){
            return 'border:#f09102 solid 1px; background-color:#f09102; display:block;background-image: linear-gradient(-45deg,#fab957 25%,transparent 25%,transparent 50%,#fab957 50%,#fab957 75%,transparent 75%,transparent);'
        }else{
            return 'display:none;'
        }
    }else if(warn == '폭풍해일' || warn == '해일'){
        if(level == '경보'){
            return 'border: #a39d93 solid 1px; background-color:#a39d93; display:block; color:white;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #a39d93 solid 1px; background-color:#a39d93; display:block;background-image: linear-gradient(-45deg,#b8b3ab 25%,transparent 25%,transparent 50%,#b8b3ab 50%,#b8b3ab 75%,transparent 75%,transparent); color:white;'
        }else{
            return 'display:none;'
        }
    }else if(warn == '풍랑'){
        if(level == '경보'){
            return 'border: #12dfe3 solid 1px; background-color:#12dfe3; display:block;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #12dfe3 solid 1px; background-color:#12dfe3; display:block;background-image: linear-gradient(-45deg,#96f8fa 25%,transparent 25%,transparent 50%,#96f8fa 50%,#96f8fa 75%,transparent 75%,transparent)'
        }else{
            return 'display:none;'
        }
    }else if(warn == '태풍'){
        if(level == '경보'){
            return 'border: #ff0000 solid 1px; background-color:#ff0000; display:block; color:white;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #ff0000 solid 1px; background-color:#ff0000; display:block;background-image: linear-gradient(-45deg,#ff6161    25%,transparent 25%,transparent 50%,#ff6161    50%,#ff6161    75%,transparent 75%,transparent); color:white;'
        }else{
            return 'display:none;'
        }
    }else if(warn == '대설'){
        if(level == '경보'){
            return 'border: #fc17e9 solid 1px; background-color:#fc17e9; display:block;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #fc17e9 solid 1px; background-color:#fc17e9; display:block;background-image: linear-gradient(-45deg,#fc79f2 25%,transparent 25%,transparent 50%,#fc79f2 50%,#fc79f2 75%,transparent 75%,transparent);'
        }else{
            return 'display:none;'
        }
    }else if(warn == '황사'){
        if(level == '경보'){
            return 'border: #c9c959 solid 1px; background-color:#c9c959; display:block;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #c9c959 solid 1px; background-color:#c9c959; display:block;background-image: linear-gradient(-45deg,#eded00 25%,transparent 25%,transparent 50%,#eded00 50%,#eded00 75%,transparent 75%,transparent);'
        }else{
            return 'display:none;'
        }
    }else if(warn == '폭염'){
        if(level == '경보'){
            return 'border: #c500e3 solid 1px; background-color:#c500e3; display:block;color:white;'
        }else if(level == '주의보' || level == '주의'){
            return 'border: #c500e3 solid 1px; background-color:#c500e3; display:block;background-image: linear-gradient(-45deg,#e56ff7 25%,transparent 25%,transparent 50%,#e56ff7 50%,#e56ff7 75%,transparent 75%,transparent);color:white'
        }else{
            return 'display:none;'
        }
    }else{
        console.log(warn, level)
        return 'display:none;'
    }
}
function getLevel(data){
    var level = ''
    if(data == '주의'){
        level = '주의보'
    }else{
        level = data
    }
    return level
}
function draw(geojsonData) {
    fetch(`http://localhost:3000/kr_weatherWarning`)
        .then(response => response.json())
        .then(res => {

            function getColor(areaWarnings) {
                var hasWarning = false;
                var hasAlert = false;

                areaWarnings.warning.forEach(warning => {
                    if (warning.level === '주의') hasWarning = true;
                    if (warning.level === '경보') hasAlert = true;
                });

                if (hasWarning && hasAlert) {
                    return 'red';
                } else if (hasAlert) {
                    return 'red';
                } else if (hasWarning) {
                    return 'yellow';
                } else {
                    return 'rgba(0,0,0,0)';
                }
            }

            function style(feature) {
                var areaInfo = res.find(data => data.areaID === feature.properties.regid);
                var color = areaInfo ? getColor(areaInfo) : 'rgba(0,0,0,0)';
                return {
                    fillColor: color,
                    weight: 1,
                    opacity: 1,
                    color: 'black',
                    fillOpacity: 0.7
                };
            }

            L.geoJSON(geojsonData, {
                style: style,
                onEachFeature: function (feature, layer) {
                    layer.on('click', function() {
                        const warn_box = document.getElementById('warn_info');
                        while (warn_box.firstChild) {
                            warn_box.removeChild(warn_box.firstChild);
                        }
                        var areaInfo = res.find(data => data.areaID === feature.properties.regid);
                        if (areaInfo) {
                            document.getElementById('warn_area').textContent = areaInfo.area;
                            document.getElementById('warn_date').textContent = `${mon_day(areaInfo.warning[(areaInfo.warning).length - 1].TM_FC)} 발표\n${mon_day(areaInfo.warning[(areaInfo.warning).length - 1].TM_EF)} 발효`;
                            areaInfo.warning.forEach(warning => {
                                var p = document.createElement('p');
                                var level = getLevel(warning.level)
                                p.textContent = `${warning.class}${level}`;
                                p.style = getStyle(warning.class, warning.level);
                                p.classList.add('levelbox')
                                warn_box.appendChild(p);
                            });
                        } else {
                            document.getElementById('warn_area').textContent = feature.properties.regko_fullname;
                            document.getElementById('warn_date').textContent = '';
                            var text = document.createElement('p');
                            text.textContent = `현재 발효중인 특보는 없습니다.`;
                            text.className = 'warn_text';
                            warn_box.appendChild(text);
                        }
                    });
                }
            }).addTo(map);

            const groupedData = {};

            res.forEach(data => {
                data.warning.forEach(warn => {
                    const key = `${warn.class}${getLevel(warn.level)}`;
                    if (!groupedData[key]) {
                        groupedData[key] = [];
                    }
                    groupedData[key].push(data.area);
                });
            });

            const textbox = document.getElementById('textbox');
            while (textbox.firstChild) {
                textbox.removeChild(textbox.firstChild);
            }

            for (const key in groupedData) {
                if (groupedData.hasOwnProperty(key)) {
                    const h3 = document.createElement('h3');
                    h3.textContent = key;
                    textbox.appendChild(h3);

                    const p = document.createElement('p');
                    p.textContent = groupedData[key].join(', ');
                    textbox.appendChild(p);
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

fetch(`http://localhost:3000/kr_weatherWarningArea`)
    .then(response => response.json())
    .then(res => {
        draw(res)
    })
    .catch(error => console.error('Error:', error));

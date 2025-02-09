const urlParams = new URL(location.href).searchParams;
const id = urlParams.get('id')
function allclear() {
    document.getElementById('red').style = "background-color:white; color:black";
    document.getElementById('orange').style = "background-color:white; color:black";
    document.getElementById('yellow').style = "background-color:white; color:black";
    document.getElementById('green').style = "background-color:white; color:black";
    document.getElementById('blue').style = "background-color:white; color:black";
    document.getElementById('gray').style = "background-color:white; color:black";
}
function text(data){
    document.getElementById('red').textContent = data[0];
    document.getElementById('orange').textContent = data[1];
    document.getElementById('yellow').textContent = data[2];
    document.getElementById('green').textContent = data[3];
    document.getElementById('blue').textContent = data[4];
    document.getElementById('gray').textContent = data[5];
}
var clicked = ''
document.getElementById('red').addEventListener('click', function () {
    allclear()
    this.style = 'background-color:red;color:white;'
    clicked = 'red';
})
document.getElementById('orange').addEventListener('click', function () {
    allclear()
    this.style = 'background-color:orange;color:white;'
    clicked = 'orange';
})
document.getElementById('yellow').addEventListener('click', function () {
    allclear()
    this.style = 'background-color:yellow;color:black;'
    clicked = 'yellow';
})
document.getElementById('green').addEventListener('click', function () {
    allclear()
    this.style = 'background-color:green;color:black;'
    clicked = 'green';
})
document.getElementById('blue').addEventListener('click', function () {
    allclear()
    this.style = 'background-color:blue;color:white;'
    clicked = 'blue';
})
document.getElementById('gray').addEventListener('click', function () {
    allclear()
    this.style = 'background-color:rgb(211, 211, 211);color:black;'
    clicked = 'gray';
})
fetch(`http://localhost:3000/drs/past/report?id=${id}`)
    .then(response => response.json())
    .then(res => {
        console.log(res)
        document.getElementById('question').textContent = `${res.name} 당시 어떠했나요?`

        if(res.type == '지진'){
            text(['설 수 없을 정도로 흔들림', '격렬하게 흔들림', '강하게 흔들림', '약하게 흔들림', '흔들린것 같은 느낌', '흔들리지 않음'])
        }else if(res.type == '폭우'){
            text(['완전 침수', '절반 정도 침수', '부분 침수', '피해 발생', '약간의 피해', '피해 없음'])
        }

        var coord = []
        document.getElementById('get_position').addEventListener("click", function(){
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude.toFixed(4);
                        const longitude = position.coords.longitude.toFixed(4);
                        coord = [latitude, longitude]
                        document.getElementById('now_position').textContent = `${latitude}, ${longitude}`
                    },
                    (error) => {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                console.error('사용자가 위치 정보 수집 권한을 거부했습니다.');
                                alert('위치정보 수집에 실패했습니다. 다시 시도해주세요.')
                                document.getElementById('lat').textContent = '-'
                                document.getElementById('lon').textContent = '-'
                                break;
                            case error.POSITION_UNAVAILABLE:
                                console.error('위치 정보를 사용할 수 없습니다.');
                                alert('위치정보 수집에 실패했습니다. 다시 시도해주세요.')
                                break;
                            case error.TIMEOUT:
                                console.error('위치 정보 수집이 시간 초과되었습니다.');
                                alert('위치정보 수집에 실패했습니다. 다시 시도해주세요.')
                                break;
                            default:
                                console.error('알 수 없는 오류가 발생했습니다.');
                                alert('위치정보 수집에 실패했습니다. 다시 시도해주세요.')
                                break;
                        }
                        document.getElementById('now_position').textContent = error
                    }
                );
            } else {
                console.error('브라우저가 위치 정보 수집을 지원하지 않습니다.');
            }
        })
        document.getElementById('submit').addEventListener("click", async function(){
            var data = {
                "id" : res.id,
                "data" : {
                    "location" : coord,
                    "felt" : clicked
                }
            }
            try {
                const response = await fetch('http://localhost:3000/drs/past/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    alert('데이터 등록에 성공했습니다. 참여해주셔서 감사합니다.');
                    var protocal = window.location.protocol;
                    var hostname = window.location.host;
                    var url = protocal+ '//'  + hostname + '/drs/'
                    
                    window.location.href = url;
                }
            } catch (error) {
                alert('에러발생 새로고침후 다시 시도해주세요: ', error);
            }
        })
    })
    .catch(error => {
        alert('잘못된 접근입니다.');
        
        var protocal = window.location.protocol;
        var hostname = window.location.host;
        var url = protocal+ '//'  + hostname + '/drs/'
        
        window.location.href = url;
    })
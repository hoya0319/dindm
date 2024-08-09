const toolsDiv = document.getElementById('tools');

const pageUpDiv = document.createElement('div');
pageUpDiv.className = 'tool';
pageUpDiv.id = 'pageUp'

const pageUp = document.createElement('img');
pageUp.src = '/src/images/pageUp.svg'
pageUpDiv.appendChild(pageUp);

const shareDiv = document.createElement('div');
shareDiv.className = 'tool';
shareDiv.id = 'share'

const share = document.createElement('img');
share.src = '/src/images/share.svg'
shareDiv.appendChild(share);


const reportDiv = document.createElement('div');
reportDiv.className = 'tool';
reportDiv.id = 'report'

const report = document.createElement('img');
report.src = '/src/images/report.svg'
reportDiv.appendChild(report);

toolsDiv.append(pageUpDiv)
toolsDiv.append(shareDiv)
toolsDiv.append(reportDiv)

document.getElementById('pageUp').addEventListener("click", function(){
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
})

document.getElementById('share').addEventListener("click", function(){
    var currentUrl = window.location.href;

    var tempInput = document.createElement('input');
    tempInput.setAttribute('value', currentUrl);
    document.body.appendChild(tempInput);

    tempInput.select();
    document.execCommand('copy');

    document.body.removeChild(tempInput);
    alert('현재 페이지의 링크가 복사되었습니다')
})

document.getElementById('report').addEventListener("click", function(){
    var protocal = window.location.protocol;
    var hostname = window.location.host;
    var url = protocal+ '//'  + hostname + '/report/'
    var nowUrl = window.location.href;
    console.log(url, nowUrl)

    localStorage.setItem('error_url', nowUrl)
    window.location.href = url;
})
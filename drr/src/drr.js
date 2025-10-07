var path = window.location.pathname
var url
if(path.includes('drr/jp/')){
    url = '/drr/jp/src/menu.json'
}else if(path.includes('drr/kr/')){
    url = '/drr/kr/src/menu.json'
}
fetch(url)
    .then(response => response.json())
    .then(jsonData => {
        console.log(jsonData)
        const contentsBox = document.getElementById('contents');
        jsonData.contents.forEach(element => {
            console.log(element)
            var contentBox = document.createElement('div');
            contentBox.className = 'drrContentBox'

            var contentTopBox = document.createElement('div');
            contentTopBox.className = 'drrContentTopBox';

            var contentTitle = document.createElement('h3');
            contentTitle.textContent = element.title;
            contentTitle.className = 'drrContentTitle';
            contentTopBox.appendChild(contentTitle);

            var contentMoveBox = document.createElement('div');
            var leftImg = document.createElement('img');
            leftImg.src = '/drr/img/arrow_back.svg';
            leftImg.alt = '왼쪽으로';
            contentMoveBox.appendChild(leftImg)
            var rightImg = document.createElement('img');
            rightImg.src = '/drr/img/arrow_forward.svg';
            rightImg.alt = '오른쪽으로';
            contentMoveBox.appendChild(rightImg);
            contentTopBox.appendChild(contentMoveBox);

            contentBox.appendChild(contentTopBox);

            var contentSpeBox = document.createElement('div');
            contentSpeBox.className = 'drrContentSpeBox';
            element.items.forEach(item => {
                var speBox = document.createElement('a');
                speBox.href = item.href;
                speBox.className = 'drrContentSpe';

                var speImg = document.createElement('img');
                speImg.src = item.img;
                speImg.alt = item.title;
                speImg.className = 'drrContentSpeImg'
                speBox.appendChild(speImg);

                var speTitle = document.createElement('h4');
                speTitle.textContent = item.title;
                speTitle.className = 'drrContentSpeTitle';
                speBox.appendChild(speTitle)
                
                var speDes = document.createElement('p');
                speDes.textContent = item.description;
                speDes.className = 'drrContentSpeDes'
                speBox.appendChild(speDes)

                contentSpeBox.appendChild(speBox)
            })
            const scrollAmount = 200
            contentBox.appendChild(contentSpeBox)
            leftImg.addEventListener('click', () => {
                contentSpeBox.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });

            rightImg.addEventListener('click', () => {
                contentSpeBox.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });

            contentsBox.appendChild(contentBox)
        });
    })
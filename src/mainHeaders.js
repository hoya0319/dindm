const header_container = document.getElementById('mainHeader');

const divElement = document.createElement('div');
divElement.className = 'mainHeaderBox';

const menu = document.createElement('div');
menu.className = 'mainHeaderMenuBox';
menu.setAttribute('id', 'mainHeaderMenuBox')
const menuIcon = document.createElement('img');
menuIcon.src = '/src/images/menu.svg';
menuIcon.className = 'mainHeaderMenuIcon';
menuIcon.alt = "메뉴"
menuIcon.setAttribute('id', 'mainHeaderMenuIcon')
menu.appendChild(menuIcon);
const menuText = document.createElement('span');
menuText.className = 'mainHeaderMenuText';
menuText.textContent = '메뉴';
menuText.setAttribute('id', 'mainHeaderMenuText')
menu.appendChild(menuText);

divElement.appendChild(menu);

const logoBox = document.createElement('a');
logoBox.className = 'mainHeaderLogoBox';
logoBox.href = '/';

const logo = document.createElement('h1');
logo.className = 'mainHeaderLogoTitle';
logo.textContent = 'YAAID';
logoBox.appendChild(logo);
divElement.appendChild(logoBox);

header_container.append(divElement);

var mainMenuBox = document.getElementById('mainMenuBox');
fetch('/src/mainHeaders.json')
    .then(response => response.json())
    .then(jsonData => {
        var menu = jsonData.contents;
        menu.forEach(element => {
            var menuBox = document.createElement('div');
            menuBox.className = 'menuBox'

            var title = document.createElement('h2');
            title.textContent = element.title;
            menuBox.appendChild(title)

            var contentBox = document.createElement('div');
            contentBox.className = 'menuContentBox';
            (element.items).forEach(item => {
                if (item.items) {
                    var contentItemsBox = document.createElement('div')
                    var contentTitleBox = document.createElement('div');
                    contentTitleBox.className = 'contentTitleBox';

                    var contentTitle = document.createElement('p');
                    contentTitle.textContent = item.title;
                    contentTitleBox.appendChild(contentTitle)

                    var plus = document.createElement('img')
                    plus.src = '/src/images/plus.svg';
                    plus.alt = '더보기'
                    contentTitleBox.appendChild(plus)

                    contentItemsBox.appendChild(contentTitleBox)

                    var speBox = document.createElement('div');
                    speBox.className = 'menuSpeBox';

                    (item.items).forEach(spe => {
                        var speTitle = document.createElement('a');
                        speTitle.className = 'menuSpeTitle';
                        speTitle.textContent = spe.title;
                        speTitle.href = spe.href;
                        speBox.appendChild(speTitle)
                    })

                    contentItemsBox.appendChild(speBox)
                    contentBox.appendChild(contentItemsBox)

                    contentTitleBox.addEventListener('click', () => {
                        const isOpen = speBox.style.display === 'flex';

                        document.querySelectorAll('.menuSpeBox').forEach(box => {
                            box.style.display = 'none';
                        });

                        if (!isOpen) {
                            speBox.style.display = 'flex';
                        }
                    });
                } else {
                    var content = document.createElement('a');
                    content.href = item.href;
                    content.textContent = item.title

                    contentBox.appendChild(content)
                }
            })
            menuBox.appendChild(contentBox)
            mainMenuBox.appendChild(menuBox)
        });
    })
    .catch(error => {
        console.error('JSON 불러오기 실패:', error);
    });

var clickCount = 0;
menu.addEventListener("click", function () {
    clickCount++;
    if (clickCount % 2 == 0) {
        document.getElementById('mainMenuBox').style = "display: none";
        document.getElementById('mainHeaderMenuIcon').src = '/src/images/menu.svg';
        document.getElementById('mainHeaderMenuText').textContent = '메뉴';
        document.getElementById('mainHeaderMenuBox').style = "background-color: none;"
    } else {
        document.getElementById('mainMenuBox').style = "display: block";
        document.getElementById('mainHeaderMenuIcon').src = '/src/images/close.svg';
        document.getElementById('mainHeaderMenuText').textContent = '닫기';
        document.getElementById('mainHeaderMenuBox').style = "background-color: #e2e2e2ff; border-radius: 10px;"
    }
})
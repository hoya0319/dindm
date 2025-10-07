const mainBox = document.getElementById('drrMenuBox')

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
        var goMain = document.createElement('a');
        goMain.textContent = jsonData.title;
        goMain.className = 'drrMenuTop';
        goMain.href = '/drr/jp/';

        mainBox.appendChild(goMain)

        var menu = jsonData.contents;
        const dropDownContainer = document.getElementById('dropDownContainer');

        var drrMenuMainBox = document.createElement('div');
        drrMenuMainBox.className = 'drrMenuMainBox';
        menu.forEach(item => {
            var menuBox = document.createElement('div')
            menuBox.className = 'drrMenuBox';

            var menuText = document.createElement('a')
            menuText.textContent = item.title;
            menuText.href = item.href;
            menuText.className = 'drrMenuTitle';
            menuBox.appendChild(menuText)

            var menuIcon = document.createElement('img')
            menuIcon.src = '/drr/img/dropDown.svg';
            menuIcon.alt = '상세보기';
            menuIcon.className = 'drrMenuIcon';
            menuBox.appendChild(menuIcon)
            function clear() {
                const dropDownContainer = document.getElementById('dropDownContainer');

                while (dropDownContainer.firstChild) {
                    dropDownContainer.removeChild(dropDownContainer.firstChild);
                }
                dropDownContainer.style.display = 'none';
                menuBox.style = 'background-color: '

                document.querySelectorAll('.drrMenuIcon').forEach(icon => {
                    icon.src = '/drr/img/dropDown.svg';
                    icon.style.backgroundColor = '';
                });
            }
            menuIcon.addEventListener('click', () => {
                if (document.getElementById('dropDownContainer').style.display === 'block' && menuIcon.src.includes('dropUp.svg')) {
                    clear();
                } else {
                    clear()
                    document.getElementById('dropDownContainer').style = 'display:block;'
                    menuIcon.src = '/drr/img/dropUp.svg';
                    menuIcon.style = 'background-color:#c4c4c4;'
                    menuBox.style = 'background-color: rgba(0,0,0,0.05);'

                    if (item.items) {
                        var dropDownBox = document.createElement('div');
                        dropDownBox.className = 'dropDownBox';

                        var title = document.createElement('h2');
                        title.textContent = item.title;
                        dropDownBox.appendChild(title);

                        var description = document.createElement('p');
                        description.textContent = item.description;
                        dropDownBox.appendChild(description)

                        var linkBox = document.createElement('div');
                        linkBox.className = 'drrLinkBox';
                        item.items.forEach(sub => {
                            var subLink = document.createElement('a');
                            subLink.href = sub.href;
                            subLink.textContent = sub.title;

                            var icon;
                            if (sub.out_site == true) {
                                icon = '/drr/img/target_blank.svg';
                                subLink.target = '_blank'
                            } else {
                                icon = '/drr/img/arrow_forward.svg'
                            }
                            var iconBox = document.createElement('img');
                            iconBox.src = icon;
                            subLink.appendChild(iconBox)

                            linkBox.appendChild(subLink)
                        });
                        dropDownBox.appendChild(linkBox)
                        dropDownContainer.appendChild(dropDownBox);
                    }
                }
            })
            dropDownContainer.addEventListener('mouseenter', () => {
                // 들어오면 유지
                clearTimeout(dropDownContainer.leaveTimer);
            });

            dropDownContainer.addEventListener('mouseleave', (e) => {
                dropDownContainer.leaveTimer = setTimeout(() => {
                    if (!dropDownContainer.contains(e.relatedTarget)) {
                        clear();
                    }
                }, 200);
            });

            drrMenuMainBox.appendChild(menuBox)
        });

        const leftBtn = document.createElement('img');
        leftBtn.alt = '왼쪽으로';
        leftBtn.src = '/drr/img/arrow_back.svg';
        leftBtn.classList.add('drrMenuArrow', 'drrMenuArrowLeft')

        const rightBtn = document.createElement('img');
        rightBtn.alt = '오른쪽으로';
        rightBtn.src = '/drr/img/arrow_forward.svg';
        rightBtn.classList.add('drrMenuArrow', 'drrMenuArrowRight')

        mainBox.appendChild(leftBtn)
        mainBox.appendChild(drrMenuMainBox)
        mainBox.appendChild(rightBtn)

        const scrollAmount = 140;

        leftBtn.addEventListener('click', () => {
            drrMenuMainBox.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        rightBtn.addEventListener('click', () => {
            drrMenuMainBox.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    })
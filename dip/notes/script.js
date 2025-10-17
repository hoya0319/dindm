// window.addEventListener('load', () => {
//     setTimeout(() => {
//         document.getElementById('notesbanner').style = "background-image: url('/dip/notes/src/banner/second.png')"
//         document.getElementById('bannertitle').textContent = '평소와는 다른 풍경'
//         document.getElementById('bannertext').textContent = '지금 재해가 발생해도,\n당신은 괜찮나요?'
//         document.getElementById('bannertitle').style = 'color:#ff7d7d'
//         document.getElementById('bannertext').style = 'color:#ff7d7d'
//     }, 2000);
// });

fetch('/dip/notes/src/contents.json')
    .then(response => response.json())
    .then(data => {
        var mainBox = document.getElementById('contents');

        console.log(data);

        data.contents.forEach(element => {
            console.log(element);

            var contentBox = document.createElement('div');
            contentBox.className = 'contentBox';

            var titlebox = document.createElement('div');
            titlebox.className = 'contentBoxTitle'
            var icon = document.createElement('img');
            icon.src = `/dip/notes/src/icons/${element.id}.svg`;
            icon.alt = element.id;
            titlebox.appendChild(icon);
            var title = document.createElement('h2');
            title.textContent = element.title;
            titlebox.appendChild(title)
            contentBox.appendChild(titlebox)

            var boxdiv = document.createElement('div');
            boxdiv.classList.add("contentboxDiv");

            if (element.id == 'earthquake' || element.id == 'rain') {
                element.items.forEach(item => {
                    var box = document.createElement('a');
                    box.href = item.href;
                    box.classList.add('itemBox', element.class, `bg-${element.id}`);

                    var boxdivTitle = document.createElement('h3');
                    boxdivTitle.textContent = item.title;
                    box.appendChild(boxdivTitle)

                    var text = document.createElement('p');
                    text.textContent = item.description;
                    text.className = 'itemBoxP'
                    box.appendChild(text)

                    boxdiv.appendChild(box)
                })
            } else if (element.id == 'else') {
                element.items.forEach(item => {
                    console.log(item)
                    var box = document.createElement('a');
                    box.href = item.href;
                    box.classList.add('itemBox', 'itemBoxElse', element.class, `bg-${element.id}`);

                    var itemicon = document.createElement('img');
                    itemicon.src = `/dip/notes/src/icons/${item.id}.svg`;
                    itemicon.alt = item.id;
                    box.appendChild(itemicon);

                    var text = document.createElement('h4');
                    text.textContent = item.title;
                    box.appendChild(text)

                    boxdiv.appendChild(box)
                });
            } else if (element.id == 'start' || element.id == 'tips') {
                element.items.forEach(item => {
                    var box = document.createElement('a');
                    box.href = item.href;
                    box.classList.add('itemBox', element.class, `bg-${element.id}`);

                    var boxdivTitleBox = document.createElement('div');
                    boxdivTitleBox.className = 'itemBoxIconBox'

                    var boxdivTitleIcon = document.createElement('img');
                    boxdivTitleIcon.src = `/dip/notes/src/icons/${item.id}.svg`;
                    boxdivTitleIcon.alt = item.id;
                    boxdivTitleBox.appendChild(boxdivTitleIcon)

                    var boxdivTitle = document.createElement('h3');
                    boxdivTitle.textContent = item.title;
                    boxdivTitleBox.appendChild(boxdivTitle)
                    box.appendChild(boxdivTitleBox)

                    var text = document.createElement('p');
                    text.textContent = item.description;
                    text.className = 'itemBoxP'
                    box.appendChild(text)

                    boxdiv.appendChild(box)
                })
            }
            contentBox.appendChild(boxdiv)


            mainBox.appendChild(contentBox)
        });
    })

var alertbox = document.getElementById('alert');
var data = window.localStorage.getItem('checklist_store');
data = JSON.parse(data || '{}');
if (data) {
    console.log(data)
    function getDateOnly(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date;
    }

    function classifyAllPersonalDates(data) {
        const today = getDateOnly(new Date().toISOString().split('T')[0]);
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

        const classified = {
            passed: [],   //과거
            soon: [],      // 오늘, 하루 남음
            lots: []   // 그 이상 남음 (이틀 이상 남음)
        };

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const item = data[key];
                if (item.checked === false) {
                    continue; 
                }
                const itemTitle = item.title || key;

                item.personal.forEach(pItem => {
                    const targetDateString = pItem.date;
                    const targetDate = getDateOnly(targetDateString);

                    const timeDifference = targetDate.getTime() - today.getTime();

                    const dayDifference = Math.round(timeDifference / oneDayInMilliseconds);

                    const classifiedItem = {
                        key: key,
                        title: itemTitle,
                        date: targetDateString,
                        memo: pItem.memo
                    };

                    if (dayDifference < 0) {
                        classified.passed.push(classifiedItem);
                    } else if (dayDifference >= 0 && dayDifference <= 3) {
                        classified.soon.push(classifiedItem);
                    } else {
                        classified.lots.push(classifiedItem);
                    }
                });
            }
        }

        return classified;
    }
    function date(date){
        return `${date.slice(0,4)}년 ${date.slice(5,7)}월 ${date.slice(8,10)}일`
    }
    const result = classifyAllPersonalDates(data);
    result.passed.forEach(item => {
        console.log(item)
        var box = document.createElement('div');
        box.className = 'alertItem passed';
        var title = document.createElement('p');
        title.textContent = `[${item.title} - ${item.memo}]의 유통기한이 지났습니다\n(${date(item.date)})`;
        box.appendChild(title);
        var icon = document.createElement('img');
        icon.src = '/dip/notes/src/icons/close.svg';
        icon.alt = 'close';
        box.appendChild(icon);
        alertbox.appendChild(box);
        icon.addEventListener('click', () => {
            box.remove()
        })
        title.addEventListener('click', () => {
            location.href = '/dip/notes/start/checklist/store/';
        });
    })
    result.soon.forEach(item => {
        console.log(item)
        var box = document.createElement('div');
        box.className = 'alertItem soon';
        var title = document.createElement('p');
        title.textContent = `[${item.title} - ${item.memo}]의 유통기한이 얼마 남지 않았습니다\n(${date(item.date)})`;
        box.appendChild(title);
        var icon = document.createElement('img');
        icon.src = '/dip/notes/src/icons/close.svg';
        icon.alt = 'close';
        box.appendChild(icon);
        alertbox.appendChild(box);
        icon.addEventListener('click', () => {
            box.remove()
        })
        title.addEventListener('click', () => {
            location.href = '/dip/notes/start/checklist/store/';
        });
    })
    // console.log('=== 분류 결과 (오늘 날짜: 2025-10-17) ===');
    // console.log('\n[1. 오늘 또는 과거]');
    // result.todayOrPassed.forEach(item => {
    //     console.log(`- ${item.title} (${item.key}): ${item.date} (${item.memo})`);
    // });

    // console.log('\n[2. 하루 남음]');
    // result.oneDayLeft.forEach(item => {
    //     console.log(`- ${item.title} (${item.key}): ${item.date} (${item.memo})`);
    // });

    // console.log('\n[3. 그 이상 남음]');
    // result.moreThanOneDay.forEach(item => {
    //     console.log(`- ${item.title} (${item.key}): ${item.date} (${item.memo})`);
    // });
}
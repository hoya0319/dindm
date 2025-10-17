import { gzip,ungzip } from 'https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm';
const id = window.location.href.split('/')[7];
const storageKey = `checklist_${id}`;
const main = document.getElementById('checklistbox');

// 기존 데이터 불러오기
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

fetch(`/dip/notes/start/checklist/base.json`)
    .then(response => response.json())
    .then(data => {
        const target = data[id];
        if (!target) {
            console.warn(`"${id}" 키를 base.json에서 찾을 수 없습니다.`);
            return;
        }

        target.contents.forEach(section => {
            const checklistBox = document.createElement('div');
            checklistBox.classList.add('contentBox', 'checklistBox');

            const title = document.createElement('h2');
            title.textContent = section.title;
            checklistBox.appendChild(title);

            const box = document.createElement('div');
            box.className = 'checklistItems';

            section.items.forEach(category => {
                const boxtitle = document.createElement('h3');
                boxtitle.textContent = category.type;
                box.appendChild(boxtitle);

                const itembox = document.createElement('div');
                itembox.className = 'checklistItemBox';

                category.item.forEach(entry => {
                    const item = document.createElement('div');
                    item.className = 'checklistItem';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = entry.id;
                    checkbox.checked = saved[entry.id]?.checked || entry.checked || false;

                    const label = document.createElement('label');
                    label.setAttribute('for', entry.id);
                    label.textContent = entry.name;

                    const desc = document.createElement('p');
                    desc.className = 'checklistDesc';
                    desc.textContent = entry.description || '';

                    // 메모+날짜 세트 영역
                    const memoArea = document.createElement('div');
                    memoArea.className = 'memoArea';

                    // 기존 personal 불러오기
                    const personalData =
                        saved[entry.id]?.personal ||
                        entry.personal ||
                        [{ memo: '', date: '' }];

                    personalData.forEach((p, i) =>
                        addMemoSet(memoArea, entry.id, p.memo, p.date, i)
                    );

                    // + 버튼
                    const addBtn = document.createElement('button');
                    addBtn.textContent = '+';
                    addBtn.className = 'addMemoBtn';
                    addBtn.addEventListener('click', () => {
                        addMemoSet(memoArea, entry.id, '', '', personalData.length);
                        saveState(entry.id, {
                            title : entry.name,
                            checked: checkbox.checked,
                            personal: collectPersonal(memoArea),
                        });
                    });

                    // 체크박스 이벤트
                    checkbox.addEventListener('change', () => {
                        saveState(entry.id, {
                            title : entry.name,
                            checked: checkbox.checked,
                            personal: collectPersonal(memoArea),
                        });
                    });
                    var leftbox = document.createElement('div')
                    leftbox.className = 'checklistItemLeftBox'
                    var rightbox = document.createElement('div')
                    rightbox.className = 'checklistItemrightBox'
                    leftbox.appendChild(checkbox)
                    leftbox.appendChild(label);
                    leftbox.appendChild(desc);
                    rightbox.appendChild(memoArea);
                    rightbox.appendChild(addBtn);
                    item.appendChild(leftbox);
                    item.appendChild(rightbox);

                    itembox.appendChild(item);
                });

                box.appendChild(itembox);
            });

            checklistBox.appendChild(box);
            main.appendChild(checklistBox);
        });
    })
    .catch(err => console.error('체크리스트 로드 실패:', err));

// 메모+날짜 세트 추가 함수
function addMemoSet(container, id, memoText = '', dateText = '', index = 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'memoSet';

    const memo = document.createElement('input');
    memo.type = 'text';
    memo.placeholder = '메모';
    memo.value = memoText;

    const date = document.createElement('input');
    date.type = 'date';
    date.value = dateText;

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'delMemoBtn';
    delBtn.addEventListener('click', () => {
        wrapper.remove();
        saveState(id, { personal: collectPersonal(container) });
    });

    memo.addEventListener('input', () => {
        saveState(id, { personal: collectPersonal(container) });
    });
    date.addEventListener('change', () => {
        saveState(id, { personal: collectPersonal(container) });
    });

    wrapper.appendChild(memo);
    wrapper.appendChild(date);
    wrapper.appendChild(delBtn);
    container.appendChild(wrapper);
}

// personal 배열 수집
function collectPersonal(container) {
    const sets = container.querySelectorAll('.memoSet');
    return Array.from(sets).map(set => {
        const memo = set.querySelector('input[type="text"]').value;
        const date = set.querySelector('input[type="date"]').value;
        return { memo, date };
    });
}

// 상태 저장
function saveState(id, state) {
    saved[id] = { ...saved[id], ...state };
    localStorage.setItem(storageKey, JSON.stringify(saved));
}

document.getElementById('exportbtn').addEventListener('click', () => {
    var data = {
        type : id,
        data : saved
    }
    const jsonStr = JSON.stringify(data);
    const compressed = gzip(jsonStr);
    const base64 = btoa(String.fromCharCode(...compressed));

    navigator.clipboard.writeText(base64).then(() => {
        alert('데이터가 클립보드에 복사되었습니다!\n다른 브라우저나 디바이스의 "저장된 데이터 불러오기" 버튼을 누르고 붙여 넣어주세요');
    });
});
document.getElementById('importbtn').addEventListener('click', () => {
    const storageKey = `checklist_${id}`;
    const base64 = prompt('가져올 데이터를 붙여넣으세요:');
    if (!base64) return;

    try {
        // Base64 → Uint8Array
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Gzip 해제
        const jsonStr = new TextDecoder().decode(ungzip(bytes));
        const data = JSON.parse(jsonStr);
        console.log(data)
        // localStorage 저장
        if(data.type == id){
            localStorage.setItem(storageKey, JSON.stringify(data.data));
        }else{
            alert('가져오려는 데이터의 체크리스트 유형이 현재 페이지와 다릅니다.');
        }

        // alert('가져오기가 완료되었습니다!');
        // window.location.reload();
    } catch (e) {
        console.error(e);
        alert('가져오기에 실패했습니다. 데이터 형식을 확인하세요.');
    }
})
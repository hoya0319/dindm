const header_container = document.getElementById('mainHeader');

const divElement = document.createElement('div');
divElement.className = 'mainHeaderBox';

const logoBox = document.createElement('a');
logoBox.className = 'mainHeaderLogoBox';
logoBox.href = '/';

const logo = document.createElement('h1');
logo.className = 'mainHeaderLogoTitle';
logo.textContent = 'DIN-DM';
logoBox.appendChild(logo);
divElement.appendChild(logoBox);

const right = document.createElement('div');
right.className = 'mainHeaderIcons';

const note = document.createElement('a');
note.className = 'mainHeaderIcon';
note.href = '/note/'
note.textContent = '방재수첩';
right.appendChild(note)

const bangjaeHub = document.createElement('a');
bangjaeHub.className = 'mainHeaderIcon';
bangjaeHub.href = '/bangjaehub/'
bangjaeHub.textContent = '한국방재';
right.appendChild(bangjaeHub)

const bousaiHub = document.createElement('a');
bousaiHub.className = 'mainHeaderIcon';
bousaiHub.href = '/bousaihub/'
bousaiHub.textContent = '일본방재';
right.appendChild(bousaiHub)

const drs = document.createElement('a');
drs.className = 'mainHeaderIcon';
drs.href = '/drs/'
drs.textContent = 'DRS';
right.appendChild(drs)
divElement.appendChild(right);

header_container.append(divElement);
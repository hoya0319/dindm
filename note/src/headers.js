const note_header_container = document.getElementById('headers');

const note_divElement = document.createElement('div');
note_divElement.className = 'headerBox';

const note_logoBox = document.createElement('a');
note_logoBox.className = 'headerLogoBox';
note_logoBox.href = '/note/';

const note_logo = document.createElement('h1');
note_logo.className = 'headerLogoTitle';
note_logo.textContent = '방재수첩';
note_logoBox.appendChild(note_logo);
note_divElement.appendChild(note_logoBox);

note_header_container.append(note_divElement);
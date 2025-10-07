import { format1 } from './time.js';

var data
fetch('http://localhost:3000/announce')
    .then(response => response.json())
    .then(res => {
        data = res;
        // console.log(data);

        for (var i = 0; i < data.length; i++) {
            if (data[i].display == true) {
                var nowData = data[i];
                const announce_container = document.getElementById('announce');

                const asdf = document.createElement('div')

                const announceBox = document.createElement('div');
                announceBox.classList.add('announceBox', `level${nowData.level}`);

                const announceTitle = document.createElement('h2');
                announceTitle.textContent = nowData.title;
                announceTitle.className = 'announceTitle'
                asdf.appendChild(announceTitle)

                const announceTextBox = document.createElement('div');
                const textArray = (nowData.text).split("\\n");
                for(var j = 0; j < textArray.length; j++){
                    const announceText = document.createElement('p');
                    announceText.textContent = textArray[j];
                    announceText.className = 'announceText';
                    announceTextBox.appendChild(announceText)
                }
                asdf.appendChild(announceTextBox);

                const announceLinkBox = document.createElement('div')
                announceLinkBox.className = 'announceLinkBox'
                for(var j = 0; j < (nowData.links).length; j++){
                    var linkData = nowData.links[j]
                    const announceLink = document.createElement('a');
                    announceLink.textContent = linkData.linkName;
                    announceLink.href = linkData.link;
                    announceLink.target = '_blank';
                    announceLinkBox.appendChild(announceLink)
                }
                asdf.appendChild(announceLinkBox)
                announceBox.appendChild(asdf);

                announce_container.append(announceBox)
            }
        }
    })
    .catch(error => console.error('Error:', error));


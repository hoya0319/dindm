document.getElementById('go_errReport').addEventListener("click", function(){
    document.getElementById('contact').style = 'display:none;'
    document.getElementById('errReport').style = 'display:block;'
    document.getElementById('go_errReport').style = 'background-color: rgb(248,248,248);'
    document.getElementById('go_contact').style = 'background-color: white;'
    document.getElementById('success').style = 'display:none;';
});
document.getElementById('go_contact').addEventListener("click", function(){
    document.getElementById('errReport').style = 'display:none;'
    document.getElementById('contact').style = 'display:block;'
    document.getElementById('go_contact').style = 'background-color: rgb(248,248,248);'
    document.getElementById('go_errReport').style = 'background-color: white;'
    document.getElementById('success').style = 'display:none;';
})
document.getElementById('errReplyCheck').addEventListener('change', function() {
    const emailContainer = document.querySelector('.err-email-container');
    if (this.checked) {
        emailContainer.style.display = 'block';
        document.getElementById('err-email').required = true;
    } else {
        emailContainer.style.display = 'none';
        document.getElementById('err-email').required = false;
    }
});
document.getElementById('conReplyCheck').addEventListener('change', function() {
    const emailContainer = document.querySelector('.con-email-container');
    if (this.checked) {
        emailContainer.style.display = 'block';
        document.getElementById('con-email').required = true;
    } else {
        emailContainer.style.display = 'none';
        document.getElementById('con-email').required = false;
    }
});
document.getElementById('pagelink').value = localStorage.getItem('error_url');

document.getElementById('errSubmit').addEventListener("click", async function(event){
    event.preventDefault();
    var link = document.getElementById('pagelink').value;
    var message = document.getElementById('errMessage').value;
    if(link.length < 1){
        alert('링크를 입력하세요.');
        return;
    }
    if(message.length < 1){
        alert('내용을 입력하세요.');
        return;
    }
    var email
    if(document.getElementById('errReplyCheck').checked == true){
        email = document.getElementById('err-email').value;
        if(email.length < 1){
            alert('이메일을 입력하세요.');
            return;
        }
    }else{
        email = '이메일 수집 거부'
    }
    var data = {
        'link': link,
        'message' : message,
        'email' : email,
        'time': (new Date()).toLocaleString()
    }
    try {
        const response = await fetch('http://localhost:3000/report/error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            document.getElementById('success').style = 'display: block; display:flex';
            document.getElementById('errReport').style = 'display: none';
            document.getElementById('contact').style = 'display: none';
        }
    } catch (error) {
        alert('에러발생 새로고침후 다시 시도해주세요: ', error);
    }
    localStorage.removeItem('error_url')
})

document.getElementById('contactSubmit').addEventListener("click", async function(event){
    event.preventDefault();
    var message = document.getElementById('contactMessage').value;
    var email
    if(message.length < 1){
        alert('내용을 입력하세요.');
        return;
    }
    if(document.getElementById('conReplyCheck').checked == true){
        email = document.getElementById('con-email').value;
        if(email.length < 1){
            alert('이메일을 입력하세요.');
            return;
        }
    }else{
        email = '이메일 수집 거부'
    }
    var data = {
        'message' : message,
        'email' : email,
        'time': (new Date()).toLocaleString()
    }
    try {
        const response = await fetch('http://localhost:3000/report/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            document.getElementById('success').style = 'display: block; display:flex';
            document.getElementById('errReport').style = 'display: none';
            document.getElementById('contact').style = 'display: none';
        }
    } catch (error) {
        alert('에러발생 새로고침후 다시 시도해주세요: ', error);
    }
    localStorage.removeItem('error_url')
})
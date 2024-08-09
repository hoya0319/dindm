document.addEventListener('DOMContentLoaded', function () {
    // var headerHeight = document.querySelector('.navbar').offsetHeight;
    var shortcutLinks = document.querySelectorAll('.link_box');

    // 각 링크에 대한 클릭 이벤트 처리
    shortcutLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            var targetId = link.getAttribute('data-target');
            var targetSection = document.getElementById(targetId);

            if (targetSection) {
                var targetPosition = targetSection.offsetTop;

                window.scrollTo({
                    top: targetPosition - 45,
                    behavior: 'smooth'
                });
            }
        });
    });
});
const nav = document.querySelector('nav')
const button = document.querySelectorAll('#menu_bar')
if (nav) {
	let posLeft = nav.offsetLeft
	let posInitial = posLeft
	button.forEach((e) => {
		e.onclick = (data) => {
			nav.style.transition = "all 0.3s"
			if (posLeft !== 0) {
				nav.style.left = 0 + 'px'
				posLeft = 0
			} else if (posLeft === 0) {
				nav.style.left = '-100%'
				posLeft = posInitial
			}
		}
	})		
}
//permet de réglé la taille de la scroll bar
$(window).on("load resize ", function() {
  var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
  $('.tbl-header').css({'padding-right':scrollWidth});
}).resize();
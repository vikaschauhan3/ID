// Header: switch to dark when scrolled
function setScrollState(){
  if (window.scrollY > 10) document.body.classList.add('scrolled');
  else document.body.classList.remove('scrolled');
}
setScrollState();
window.addEventListener('scroll', setScrollState, { passive: true });

// Mobile menu
const menu = document.getElementById('menu');
const hb = document.getElementById('hamburger');
const closeMenu = document.getElementById('closeMenu');

if (hb && menu) {
  hb.addEventListener('click', () => {
    hb.classList.toggle('open');
    menu.classList.add('open');
  });
}
if (closeMenu && menu) {
  closeMenu.addEventListener('click', () => {
    hb?.classList.remove('open');
    menu.classList.remove('open');
  });
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hb?.classList.remove('open');
    menu?.classList.remove('open');
  }
});

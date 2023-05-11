const hamburger = document.querySelector('.hamburger');
const dropdownMenu = document.querySelector('.dropdown-menu');

hamburger.addEventListener('click', () => {
  dropdownMenu.classList.toggle('show');
});
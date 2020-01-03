import '../scss/main.scss';

const btn = document.querySelector('#contactButton');
btn.addEventListener('click', () => {
    document.querySelector('contact-modal').open = true;
});
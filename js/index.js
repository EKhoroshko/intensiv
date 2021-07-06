const headerCityButton = document.querySelector('.header__city-button'),
    subheaderCart = document.querySelector('.subheader__cart'),
    cartOverlay = document.querySelector('.cart-overlay');

if (localStorage.getItem('location')) {
    headerCityButton.textContent = localStorage.getItem('location');
}

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город');
    headerCityButton.textContent = city;
    localStorage.setItem('location', city);
});

// блок скрола

const disableScroll = () => {
    const widthScroll = window.innerWidth - document.body.offsetWidth;
    document.body.dbScrollY = window.scrollY;
    document.body.style.cssText = `
    position: fixed;
    top: ${-window.scrollY}px;
    left: 0;
    width: 100%;
    height: 100hv;
    overflow: hidden;
    padding-right: ${widthScroll}px;
    `;
};

const enableScroll = () => {
    document.body.style.cssText = '';
    window.scroll({
        top: document.body.dbScrollY
    });
};

// модалка

const openModal = () => {
    cartOverlay.classList.add('cart-overlay-open');
    disableScroll();
};

const closeModal = () => {
    cartOverlay.classList.remove('cart-overlay-open');
    enableScroll();
};

subheaderCart.addEventListener('click', openModal);
window.addEventListener('keydown', closeModalEscape);
cartOverlay.addEventListener('click', e => {
    if (e.target.matches('.cart__btn-close') || e.target.matches('.cart-overlay')) {
        closeModal();
    }
});

function closeModalEscape(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}
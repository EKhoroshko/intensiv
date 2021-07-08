const $headerCityButton = document.querySelector('.header__city-button'),
    $subheaderCart = document.querySelector('.subheader__cart'),
    $cartOverlay = document.querySelector('.cart-overlay'),
    $goodsTitle = document.querySelector('.goods__title'),
    $navList = document.querySelectorAll('.navigation__link');

let hash = location.hash.substring(1);

if (localStorage.getItem('location')) {
    $headerCityButton.textContent = localStorage.getItem('location');
}

$headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город');
    $headerCityButton.textContent = city;
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
    $cartOverlay.classList.add('cart-overlay-open');
    disableScroll();
};

const closeModal = () => {
    $cartOverlay.classList.remove('cart-overlay-open');
    enableScroll();
};

function closeModalEscape(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

//запрос базы

const getData = async () => {
    const response = await fetch('db.json');

    if (response.ok) {
        return response.json();
    } else {
        throw new Error(`Данные не были получены, ошибка ${response.status} ${response.statusText}`);
    }
};

const getGoods = (callback, value) => {
    getData().then(response => {
        if (value) {
            callback(response.filter(item => item.category === value));
        } else {
            callback(response);
        }
    })
        .catch(err => {
            console.error(err);
        });
};

try {
    const $goodsList = document.querySelector('.goods__list');
    if (!$goodsList) {
        throw 'This is not a goods page!';
    }

    const createCard = ({ id, preview, cost, brand, name, sizes }) => {
        const li = document.createElement('li');
        li.classList.add('.goods__item');

        li.innerHTML = `
             <article class="good">
                            <a class="good__link-img" href="card-good.html#${id}">
                                <img class="good__img" src="goods-image/${preview}" alt="">
                            </a>
                            <div class="good__description">
                                <p class="good__price">${cost} &#8381;</p>
                                <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                                ${sizes ?
                `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
                ''}
                                <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                            </div>
                        </article>
        `;
        return li;
    };

    const renderGoodsList = data => {
        $goodsList.innerHTML = '';
        data.forEach(element => {
            const card = createCard(element);
            $goodsList.append(card);
        });
    };

    const createTitle = (hash) => {
        $navList.forEach(item => {
            if (item.hash.substring(1) === hash) {
                $goodsTitle.textContent = item.textContent;
            }
        });
    };

    window.addEventListener('hashchange', () => {
        hash = location.hash.substring(1);
        createTitle(hash);
        getGoods(renderGoodsList, hash);
    });

    createTitle(hash);
    getGoods(renderGoodsList, hash);
    createCard(hash);

} catch (err) {
    console.warn(err);
}

// listener

$subheaderCart.addEventListener('click', openModal);
window.addEventListener('keydown', closeModalEscape);
$cartOverlay.addEventListener('click', e => {
    if (e.target.matches('.cart__btn-close') || e.target.matches('.cart-overlay')) {
        closeModal();
    }
});


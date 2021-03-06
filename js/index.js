const $headerCityButton = document.querySelector('.header__city-button'),
    $subheaderCart = document.querySelector('.subheader__cart'),
    $cartOverlay = document.querySelector('.cart-overlay'),
    $goodsTitle = document.querySelector('.goods__title'),
    $navList = document.querySelectorAll('.navigation__link'),
    $cartListGoods = document.querySelector('.cart__list-goods'),
    $cartTotalCost = document.querySelector('.cart__total-cost');

let hash = location.hash.substring(1);

if (localStorage.getItem('location')) {
    $headerCityButton.textContent = localStorage.getItem('location');
}

const getLocalStorage = () => JSON.parse(localStorage.getItem('card')) || [];
const setLocalStorage = data => localStorage.setItem('card', JSON.stringify(data));

const renderCard = () => {
    $cartListGoods.textContent = '';

    const cartItems = getLocalStorage();

    let totalPrice = 0;
    cartItems.forEach((item, i) => {

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${item.brand} ${item.name}</td>
            ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
            ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
            <td>${item.cost} &#8381;</td>
            <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
        `;
        totalPrice += item.cost;
        $cartListGoods.append(tr);
    });
    $cartTotalCost.textContent = totalPrice + " ₽";
};

const deleteItemCart = id => {
    const cartItems = getLocalStorage();
    const newCartItems = cartItems.filter(item => item.id !== id);
    setLocalStorage(newCartItems);
};

$cartListGoods.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete')) {
        deleteItemCart(e.target.dataset.id);
        renderCard();
    }
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
    renderCard();
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

const getGoods = (callback, prop, value) => {
    getData().then(response => {
        if (value) {
            callback(response.filter(item => item[prop] === value));
        } else {
            callback(response);
        }
    })
        .catch(err => {
            console.error(err);
        });
};

//страница категорий

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
        getGoods(renderGoodsList, 'category', hash);
    });

    createTitle(hash);
    getGoods(renderGoodsList, 'category', hash);
    createCard(hash);

} catch (err) {
    console.warn(err);
}

//страница товара

try {
    if (!document.querySelector('.card-good')) {
        throw 'This is not a card-good page';
    }

    const $cardGoodImage = document.querySelector('.card-good__image'),
        $cardGoodBrand = document.querySelector('.card-good__brand'),
        $cardGoodTitle = document.querySelector('.card-good__title'),
        $cardGoodPrice = document.querySelector('.card-good__price'),
        $cardGoodColor = document.querySelector('.card-good__color'),
        $cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper'),
        $cardGoodColorList = document.querySelector('.card-good__color-list'),
        $cardGoodSizes = document.querySelector('.card-good__sizes'),
        $cardGoodSizesList = document.querySelector('.card-good__sizes-list'),
        $cardGoodBuy = document.querySelector('.card-good__buy');

    const generateList = data => data.reduce((acc, item, i) =>
        acc + `<li class="card-good__select-item" data-id='${i}'>${item}</li>`, '');

    const renderCardGood = ([{ id, cost, brand, name, sizes, color, photo }]) => {

        const data = { brand, name, cost, id };

        $cardGoodImage.src = `goods-image/${photo}`;
        $cardGoodImage.alt = `${brand} ${name}`;
        $cardGoodBrand.textContent = brand;
        $cardGoodTitle.textContent = name;
        $cardGoodPrice.textContent = `${cost} ₽`;
        if (color) {
            $cardGoodColor.textContent = color[0];
            $cardGoodColor.dataset.id = 0;
            $cardGoodColorList.innerHTML = generateList(color);
        } else {
            $cardGoodColor.style.display = 'none';
        }

        if (sizes) {
            $cardGoodSizes.textContent = sizes[0];
            $cardGoodSizes.dataset.id = 0;
            $cardGoodSizesList.innerHTML = generateList(sizes);
        } else {
            $cardGoodSizes.style.display = "none";
        }

        if (getLocalStorage().some(item => item.id === id)) {
            $cardGoodBuy.classList.add('delete');
            $cardGoodBuy.textContent = 'Удалить из корзины';
        }

        $cardGoodBuy.addEventListener('click', () => {
            if ($cardGoodBuy.classList.contains('delete')) {
                deleteItemCart(id);
                $cardGoodBuy.classList.remove('delete');
                $cardGoodBuy.textContent = 'Добавить в корзину';
                return;
            }

            if (color) { data.color = $cardGoodColor.textContent; }
            if (sizes) { data.size = $cardGoodSizes.textContent; }

            $cardGoodBuy.classList.add('delete');
            $cardGoodBuy.textContent = 'Удалить из корзины';

            const cardData = getLocalStorage();
            cardData.push(data);
            setLocalStorage(cardData);
        });
    };

    $cardGoodSelectWrapper.forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.closest('.card-good__select')) {
                e.target.classList.toggle('card-good__select__open');
            }
            if (e.target.closest('.card-good__select-item')) {
                const $cardGoodSelect = item.querySelector('.card-good__select');
                $cardGoodSelect.textContent = e.target.textContent;
                $cardGoodSelect.dataset.id = e.target.dataset.id;
                $cardGoodSelect.classList.remove('card-good__select__open');
            }
        });
    });

    getGoods(renderCardGood, 'id', hash);

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

$headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город');
    $headerCityButton.textContent = city;
    localStorage.setItem('location', city);
});
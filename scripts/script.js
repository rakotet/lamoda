const headerCityButton = document.querySelector('.header__city-button')

let hash = location.hash.substring(1) // определяем хешь страницы (значение после # в конце ссылки на страницу) и сразу обрезаем первый его элемент (#)

if(hash === 'women') document.querySelector('.goods__title').textContent = 'Женщинам'
else if(hash === 'men') document.querySelector('.goods__title').textContent = 'Мужчинам'
else if(hash === 'kids') document.querySelector('.goods__title').textContent = 'Детям'

if(localStorage.getItem('lamoda-location')) {
    headerCityButton.textContent = localStorage.getItem('lamoda-location')
}

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город!')
    if(city) {
        headerCityButton.textContent = city
        localStorage.setItem('lamoda-location', city)
    }
})

// Блокировка скрола

const disableScroll = () => {
    // Делаем все эти манипуляции для устранения багов и рывков при скрытии скрола (эти ф-и можно использовать в других проэктах)
    const widthScroll = window.innerWidth - document.body.offsetWidth // находим ширину скрола (ширина окна браузера с скролом - ширина страницы без скрола)
    document.body.dbScrollY = window.scrollY // создаём и записываем в новое поле dbScrollY объекта body количество пикселей которое мы отматали сверху страницы скролом
    document.body.style.cssText = `
        position: fixed;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `
}

const enableScroll = () => {
    document.body.style.cssText = ''
    window.scroll({
        top: document.body.dbScrollY
    })
}

// Модальное окно (для корзины)

const subheaderCart = document.querySelector('.subheader__cart')
const cartOverlay = document.querySelector('.cart-overlay')

subheaderCart.addEventListener('click', () => {
    cartOverlay.classList.add('cart-overlay-open')
    disableScroll()
})

cartOverlay.addEventListener('click', (event) => {
    if(event.target.classList.contains('cart__btn-close') || event.target.classList.contains('cart-overlay')) {
        cartOverlay.classList.remove('cart-overlay-open')
        enableScroll()
    }
})

// Запрос к базе данных

const getData = async () => {
    const data = await fetch('db.json')

    if(data.ok) {
        return data.json()
    } else {
        throw new Error(`Данные не были полученны, ошибка ${data.status}; ${data.statusText}`)
    }
}

const getGoods = (callback, value) => {
    getData()
        .then(data => {
            if(value) {
                callback(data.filter(item => item.category === value)) // оставляем в data только те товары которые совпадают категорией в хешем страницы
            } else {
                callback(data)
            }
        })
            .catch(err =>console.error(err))
}


// если на странице нет селектора с классом ".goods__list", то попадаем в блок catch через выполнение throw (способ узнать на какой мы странице)
try {
    
    const goodsList = document.querySelector('.goods__list')

    if(!goodsList) {
        throw 'This is not a goods page!'
    }

    const createCard = data => {
        const {id, preview, cost, brand, name, sizes} = data // используем деструктаризацию для присвоения значения переменным

        /* // объявление тех же самых переменных, но без использования деструктаризации

        const id = data.id
        const preview = data.preview
        const cost = data.cost
        const brand = data.brand
        const name = data.name
        const sizes = data.sizes
        */

        const li = document.createElement('li')
        li.classList.add('goods__item')

        li.innerHTML = `
            <article class="good">
                <a class="good__link-img" href="card-good.html#${id}">
                    <img class="good__img" src="goods-image/${preview}" alt="">
                </a>
                <div class="good__description">
                    <p class="good__price">${cost} &#8381;</p>
                    <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                    ${sizes ? 
                        `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>`
                        : ''
                    }
                    
                    <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                </div>
            </article>
        `

        return li
    }

    const renderGoodsList = (data) => {
        goodsList.textContent = ''

        for(let i = 0; i < data.length; i++) {
            const card = createCard(data[i])
            goodsList.append(card)
        }
    }

    window.addEventListener('hashchange', () => {
        hash = location.hash.substring(1)

        if(hash === 'women') document.querySelector('.goods__title').textContent = 'Женщинам'
        else if(hash === 'men') document.querySelector('.goods__title').textContent = 'Мужчинам'
        else if(hash === 'kids') document.querySelector('.goods__title').textContent = 'Детям'

        getGoods(renderGoodsList, hash)
    })

    getGoods(renderGoodsList, hash)

} catch (error) {
    console.log(error);
}
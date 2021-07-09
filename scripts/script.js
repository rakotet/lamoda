const headerCityButton = document.querySelector('.header__city-button')

let hash = location.hash.substring(1) // определяем хешь страницы (значение после # в конце ссылки на страницу) и сразу обрезаем первый его элемент (#)

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
    if(document.disableScroll) return

    const widthScroll = window.innerWidth - document.body.offsetWidth // находим ширину скрола (ширина окна браузера с скролом - ширина страницы без скрола)

    document.disableScroll = true

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
    document.disableScroll = false

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

subheaderCart.addEventListener('keydown', (event) => {
    if(event.key === 'Escape') {
        cartOverlay.classList.remove('cart-overlay-open')
        enableScroll()
    }
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

const getGoods = (callback, prop, value) => {
    getData()
        .then(data => {
            if(value) {
                callback(data.filter(item => item[prop] === value)) // оставляем в data только те товары которые совпадают категорией в хешем страницы
            } else {
                callback(data)
            }
        })
            .catch(err =>console.error(err))
}


// если на странице нет селектора с классом ".goods__list", то попадаем в блок catch через выполнение throw (способ узнать на какой мы странице)
// Страница категорий товаров
try {
    
    const goodsList = document.querySelector('.goods__list')

    if(!goodsList) {
        throw 'This is not a goods page!'
    }

    const goodsTitle = document.querySelector('.goods__title')

    const changeTitle = () => {
        goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent // находим на странице через CSS элементы href у которых значение совпадает с нашей переменной hash
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

        getGoods(renderGoodsList, 'category', hash)
        changeTitle()
    })

    changeTitle()
    getGoods(renderGoodsList, 'category', hash)
    
} catch (error) {
    console.warn(error);
}

// Страница товара

try {

    if(!document.querySelector('.card-good')) {
        throw 'This is not a card-good page!'
    }

    const cardGoodImage = document.querySelector('.card-good__image')
    const cardGoodBrand = document.querySelector('.card-good__brand')
    const cardGoodTitle = document.querySelector('.card-good__title')
    const cardGoodPrice = document.querySelector('.card-good__price')
    const cardGoodColor = document.querySelector('.card-good__color')
    const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper')
    const cardGoodColorList = document.querySelector('.card-good__color-list')
    const cardGoodSizes = document.querySelector('.card-good__sizes')
    const cardGoodSizesList = document.querySelector('.card-good__sizes-list')
    const cardGoodBuy = document.querySelector('.card-good__buy')

    const generateList = (data) => data.reduce((html, item, index) => {
        return html + `<li class="card-good__select-item" data-id="${index}">${item}</li>`
    }, '')
        

    const renderCardGood = ([{brand, name, cost, color, sizes, photo}]) => { // деструкраризация (data.brand и т.д)
        cardGoodImage.src = `goods-image/${photo}`
        cardGoodImage.alt = `${brand} ${name}`
        cardGoodBrand.textContent = brand
        cardGoodTitle.textContent = name
        cardGoodPrice.textContent = `${cost} ₽`
        if(color) {
            cardGoodColor.textContent = color[0]
            cardGoodColor.dataset.id = 0
            cardGoodColorList.innerHTML = generateList(color)
        } else {
            cardGoodColor.style.display = 'none'
        }
        if(sizes) {
            cardGoodSizes.textContent = sizes[0]
            cardGoodSizes.dataset.id = 0
            cardGoodSizesList.innerHTML = generateList(sizes)
        } else {
            cardGoodSizes.style.display = 'none'
        }
        
    }

    cardGoodSelectWrapper.forEach(item => {
        item.addEventListener('click', (event) => {
            const target = event.target

            if(target.closest('.card-good__select')) {
                target.classList.toggle('card-good__select__open')
            }

            if(target.closest('.card-good__select-item')) {
                const cardGoodSelect = item.querySelector('.card-good__select')
                cardGoodSelect.textContent = target.textContent
                cardGoodSelect.dataset.id = target.dataset.id
                cardGoodSelect.classList.remove('card-good__select__open')
            }
        })
    })

    getGoods(renderCardGood, 'id', hash)
    
} catch (error) {
    console.warn(error);
}
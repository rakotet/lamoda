const headerCityButton = document.querySelector('.header__city-button')

if(localStorage.getItem('lamoda-location')) {
    headerCityButton.textContent = localStorage.getItem('lamoda-location')
}

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город!')
    headerCityButton.textContent = city
    localStorage.setItem('lamoda-location', city)
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


document.querySelectorAll('.dropdown-list__item-label').forEach(item => {

    item.onclick = function () {

        if (item.parentElement.classList.contains('dropdown-list__item--expanded') === false) {
            item.parentElement.classList.add('dropdown-list__item--expanded')
            item.children[0].style.display = 'none'
            item.children[1].style.display = 'block'
        }

        else {
            item.parentElement.classList.remove('dropdown-list__item--expanded')
            item.children[0].style.display = 'block'
            item.children[1].style.display = 'none'
        }

    }

})
// ADD GOODS MENU

document.querySelector('.add_goods_btn').addEventListener('click', openAddGoodsMenu);
document.querySelector('.add_goods_input__clear_btn').addEventListener('click', clearNewGoodsInput);
document.querySelector('.add_goods__cancel_btn').addEventListener('click', closeAddGoodMenu);
document.querySelector('.add_goods_buttons').addEventListener('click', acceptNewGoodToList);

function drawCategoriesButtons() {
    let categories = '';
    state.lists.forEach(list => {
        categories += `
        <button id="${list.listId}" class="add_goods_button ${list.color}">${list.name}</button>
        `
    });
    
    document.querySelector('.add_goods_buttons').innerHTML = categories;
}

function openAddGoodsMenu() {
    document.querySelector('.add_goods_wrapper').classList.add('opening');
    document.querySelector('.add_goods_wrapper').style.display = 'flex';
    setTimeout(() => {
        document.querySelector('.add_goods_wrapper').classList.remove('opening');
    }, 0);
    drawCategoriesButtons();
    document.querySelector('#new_goods_textarea').focus();
}

function closeAddGoodMenu(event) {
        document.querySelector('.add_goods_wrapper').classList.add('closing');
        document.querySelector('.add_goods_wrapper').addEventListener('transitionend', clearAfterAnimation);

        function clearAfterAnimation() {
            document.querySelector('.add_goods_wrapper').style.display = 'none';
            document.querySelector('.add_goods_wrapper').classList.remove('closing');
            document.querySelector('.add_goods_wrapper').removeEventListener('transitionend', clearAfterAnimation);
        }
}

function clearNewGoodsInput() {
    document.querySelector('#new_goods_textarea').value = '';
    document.querySelector('#new_goods_textarea').focus();
}

function parseNewGoods(string) {
    let arr = string.split(',').map(elem => elem.trim());
    return arr;
}

function addZero(num) {
    return num < 10 ? '0' + num : '' + num;
}

function idGenerator() {
    let date = new Date();
    let firstPart = `${date.getFullYear()}${addZero(date.getMonth() + 1)}${addZero(date.getDate())}-${addZero(date.getHours())}${addZero(date.getMinutes())}${addZero(date.getSeconds())}`;
    let secondPart = Math.floor(1000 + Math.random() * 9000) + '';
    return firstPart + '-' + secondPart;
}

function acceptNewGoodToList(event) {
    let newGoods = parseNewGoods(document.querySelector('#new_goods_textarea').value);
    let targetListIndex = state.findListIndex(event.target.id);
    newGoods.forEach(good => {
        state.lists[targetListIndex].items.unshift({id: idGenerator(), name: good, bought: false});
    });

    document.querySelector('#new_goods_textarea').value = '';
    closeAddGoodMenu();
    initialRender();
}
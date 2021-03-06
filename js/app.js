// EVENT LISTENERS

document.querySelector('.header_menu__button').addEventListener('click', openHeaderMenu);

document.querySelector('#categories').addEventListener('click', (event) => {
    if (event.target.classList.contains('good_element')) {
        toggleBought(event.target);
    } else if (event.target.closest('.category_header_menu')) {
        openListMenu(event.target);
    } else if (event.target.closest('.category_header')) {
        minimizeList(event.target);
    } else if (event.target.classList.contains('options_list__item') && event.target.classList.contains('edit')) {
        openListOptions(event.target);
    } else if (event.target.classList.contains('delete_crossed')) {
        deleteCrossedBtn(event.target);
    } else if (event.target.classList.contains('delete_all')) {
        deleteAllBtn(event.target);
    }
});


// VARIABLES

let delayTimerId;

// RENDER

state.readFromLocalStorage();
initialRender();

function initialRender() {
    const shoppingLists = document.querySelector('#categories');
    let listsInner = '';

    state.lists.forEach(list => {
        sortBoughtItems(list.items);
        listsInner += returnList(list);
    });
    shoppingLists.innerHTML = listsInner;

    if (state.options.darkTheme) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

// HEADER

function openHeaderMenu() {
    const menu = document.querySelector('.header_options_menu');
    openWithAnimation(menu, 'transition', 'block');
    menu.querySelector('.delete_crossed_in_all_lists').addEventListener('click', deleteCrossedInAllLists);
    menu.querySelector('.switch_theme').addEventListener('click', switchTheme);
    menu.querySelector('.manage_lists').addEventListener('click', openManageListsMenu);

    setTimeout(() => {
        document.body.addEventListener('click', closeHeaderMenu);
    }, 10);

    function closeHeaderMenu() {
        document.body.removeEventListener('click', closeHeaderMenu);
        menu.querySelector('.delete_crossed_in_all_lists').removeEventListener('click', deleteCrossedInAllLists);
        menu.querySelector('.switch_theme').removeEventListener('click', switchTheme);
        menu.querySelector('.manage_lists').removeEventListener('click', openManageListsMenu);
        closeWithAnimation(menu, 'transition');
    }

}

function deleteCrossedInAllLists() {
    const deleteCrossedBtns = document.querySelectorAll('.options_list__item.delete_crossed');
    deleteCrossedBtns.forEach(element => deleteCrossedBtn(element));
}

function switchTheme() {
    if (state.options.darkTheme) {
        state.options.darkTheme = false;
    } else {
        state.options.darkTheme = true;
    }
    state.writeToLocalStorage();
    initialRender();
}

// GOODS LISTS

function toggleBought(element) {
    let goodId = element.id;
    let listId = element.parentNode.parentNode.id;

    let listIndex = state.lists.findIndex(list => '' + list.listId === listId);
    let goodIndex = state.lists[listIndex].items.findIndex(item => '' + item.id === goodId);

    if (state.lists[listIndex].items[goodIndex].bought === false) {
        state.lists[listIndex].items[goodIndex].bought = true
    } else {state.lists[listIndex].items[goodIndex].bought = false}

    element.classList.toggle('bought');
    state.writeToLocalStorage();
    sortAfterDelay();
}

function sortAfterDelay() {
    clearTimeout(delayTimerId);
    deleteDelayAnimations();

    addDelayAnimation()
    delayTimerId =  setTimeout(() => {
        initialRender();
    }, 3000);
}

function addDelayAnimation() {
    const spinner = document.createElement('div');
    spinner.className = 'delay_spinner';
    document.querySelector('.header_menu').prepend(spinner);
    setTimeout(() => {
        spinner.remove();
    }, 3000);
}

function deleteDelayAnimations() {
    document.querySelectorAll('.delay_spinner').forEach(spinner => spinner.style.display = 'none');
}

function sortBoughtItems(list) {
    if (!list) return;
    return list.sort((a, b) => {
        if (a.bought < b.bought) return -1;
        if (a.bought > b.bought) return 1;
        if (a.bought === b.bought) return 0;
    });
}

function minimizeList(target) {
    if (target.closest('.category_header_menu')) {
        return;
    }

    const header = target.closest('.category_header');
    const targetListElement = header.closest('.category_item');
    const targetListIndex = state.lists.findIndex(item => item.listId === targetListElement.id);
    const targetListUl = targetListElement.querySelector('.category_items');
    
    if (state.lists[targetListIndex].minimized) {
        state.lists[targetListIndex].minimized = false;
        targetListUl.style.height = targetListUl.scrollHeight + 'px';
        targetListUl.addEventListener('transitionend', clearHeight);

        function clearHeight() {
            targetListUl.style.height = '';
            targetListElement.classList.remove('minimized');
            targetListUl.removeEventListener('transitionend', clearHeight);
        }
    } else {
        state.lists[targetListIndex].minimized = true;
        targetListUl.style.height = targetListUl.scrollHeight + 'px';
        targetListElement.classList.add('minimized');
        setTimeout(() => {
            targetListUl.style.height = '';
        }, 10);
    }
    state.writeToLocalStorage();
}


function returnItem({id, name, bought}) {
    return `
        <li id=${id} class="good_element${bought ? ' bought' : ''}">${name}</li>
    `
}

function returnList({name, listId, color, minimized, items}) {
    if (!items) {
        return '';
    }
    if (items.length === 0) {
        return '';
    }

    let htmlItems = '';
    items.forEach(item => {
        htmlItems += returnItem(item);
    });

    return `
        <li id=${listId} class="category_item ${color}${minimized ? ' minimized' : ''}">
            <div class="category_header">
                <div class="category_header_minimize">
                    <span class="category_header_minimize_arrow">&#9660</span>
                </div>
                <div class="category_header_name">
                    ${name ? name : '(no name)'}
                </div>
                <div class="items_amount">
                    ${items.length} ${items.length > 1 ? 'items' : 'item'}
                </div>
                <div class="category_header_menu">
                    <button class="category_header_menu_button">&#10247</button>
                </div>
            </div>
            <ul class="category_items">
                ${htmlItems}
            </ul>
            <ul class ="options_list category_options_menu">
                <li class="options_list__item edit">Edit</li>
                <li class="options_list__item delete_crossed">Delete crossed</li>
                <li class="options_list__item delete_all">Delete all</li>
            </ul>
        </li>
    `
}

function openListMenu(element) {
    let menu = element.closest('.category_item').querySelector('.category_options_menu');
    menu.classList.add('transition');
    menu.style.display = 'block';

    setTimeout(() => {
        menu.classList.remove('transition');
        document.body.addEventListener('click', closeListMenu);

        function closeListMenu() {
            menu.classList.add('transition');
            menu.addEventListener('transitionend', displayNone);
            function displayNone() {
                menu.style.display = 'none';
                menu.removeEventListener('transitionend', displayNone);
            }
            document.body.removeEventListener('click', closeListMenu);
        }
    }, 10);
}

function deleteCrossedBtn(target) {
    const listId = target.closest('.category_item').id;
    const crossedElements = target.closest('.category_item').querySelectorAll('.bought');

    crossedElements.forEach((element, index) => {
        collapseItem(element);
        if (index === 0) {
            element.addEventListener('transitionend', deleteAndRerender);
        }
    });
    state.deleteCrossedInList(listId);
    state.writeToLocalStorage();

    function deleteAndRerender(event) {
        event.target.removeEventListener('transitionend', deleteAndRerender);
        initialRender();
    }
}

function collapseItem(item) {
    item.style.height = item.scrollHeight + 'px';
    item.style.width = item.scrollWidth + 'px';
    item.classList.add('collapsed');
    setTimeout(() => {
        item.style.height = '';
        item.style.width = '';
    }, 10);
}

function deleteAllBtn(target) {
    let listId = target.closest('.category_item').id;
    openDeleteAllConfirmation(listId);
}

function openDeleteAllConfirmation(listId) {
    const confirmWindow = document.querySelector('#confirm_delete');
    const listIndex = state.findListIndex(listId);
    const listName = state.lists[listIndex].name;

    confirmWindow.querySelector('.accept_btn').addEventListener('click', confirmDelete);
    confirmWindow.addEventListener('click', cancelDelete);
    confirmWindow.querySelector('.confirm_delete_popup__message p').innerHTML = 'Are you sure you want to delete <strong>all</strong> goods in list "' + listName + '"?';
    
    openWithAnimation(confirmWindow, 'opening', 'flex');

    function confirmDelete() {
        state.deleteAllInList(listId);
        state.writeToLocalStorage();
        closeAndRerender();
    }

    function cancelDelete(event) {
        if (event.target === confirmWindow || event.target === confirmWindow.querySelector('.cancel_btn')) {
            closeAndRerender();
        }
    }

    function closeAndRerender() {
        confirmWindow.querySelector('.accept_btn').removeEventListener('click', confirmDelete);
        confirmWindow.querySelector('.cancel_btn').removeEventListener('click', confirmDelete);
        closeWithAnimation(confirmWindow, 'opening');
        initialRender();
    }
}

function openWithAnimation(elem, cssClass, display) {
    elem.classList.add(cssClass);
    elem.style.display = display;
    setTimeout(() => {
        elem.classList.remove(cssClass);
    }, 10);
}

function closeWithAnimation(elem, cssClass) {
    elem.classList.add(cssClass);
    elem.addEventListener('transitionend', displayNone);
    function displayNone() {
        elem.removeEventListener('transitionend', displayNone);
        elem.classList.remove(cssClass);
        elem.style.display = '';
    }
}
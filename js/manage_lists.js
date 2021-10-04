function openManageListsMenu() {
    const popupWrapper =  document.querySelector('#manage_lists');
    const manageListsItemsElement =  popupWrapper.querySelector('.list_options_popup__items');
    const addNewListBtn = popupWrapper.querySelector('#add_new_list_btn');
    const cancelBtn = popupWrapper.querySelector('.cancel_btn');
    const acceptBtn = popupWrapper.querySelector('.accept_btn');
    let temporaryList = [];
    createTemporaryList();

    addNewListBtn.addEventListener('click', addNewList);
    popupWrapper.addEventListener('click', closeManageListsMenu);
    acceptBtn.addEventListener('click', acceptChanges);

    openWithAnimation(popupWrapper, 'opening', 'flex');
    document.querySelector('.main').classList.add('noscroll');
    rerenderListsItems();

    function createTemporaryList() {
        for (let i = 0; i < state.lists.length; i++) {
            let nextList = {
                name: state.lists[i].name,
                listId: state.lists[i].listId,
                color: state.lists[i].color,
            }
            temporaryList = [...temporaryList, nextList]
        }
    }

    function rerenderListsItems() {
        manageListsItemsElement.innerHTML = '';

        temporaryList.forEach(list => {
            manageListsItemsElement.innerHTML += returnManageListsItem({
                name: list.name,
                listId: list.listId,
                color: list.color
            });
        });

        manageListsItemsElement.querySelectorAll('.manage_lists__item__name input').forEach(el => {
            el.addEventListener('input', onChangeName);
        });
        manageListsItemsElement.addEventListener('click', addControlBtns);
        
        function addControlBtns(event) {
            if (event.target.classList.contains('colored_square')) {
                changeListColor(event);
                manageListsItemsElement.removeEventListener('click', addControlBtns);
            } else if (event.target.classList.contains('manage_lists__item__right') || event.target.classList.contains('cross')) {
                deleteList(event);
                manageListsItemsElement.removeEventListener('click', addControlBtns);
            }
        }

        const dataObj = {
            temporaryList: temporaryList,
            wrapper: popupWrapper,
            dragBtnSelector: '.move_up_down_btn',
            dragElementSelector: '.manage_lists__item',
            dragZoneSelector: '.list_options_popup__items',
            edgeHeight: 90,
            // sortFunction: sortBoughtItems,
            updateTemporaryList: updateTemporary,
            rerenderFunction: rerenderListsItems
        }

        addDragAndDrop(dataObj);
    }

    function updateTemporary(list) {
        temporaryList = [...list];
    }

    function returnManageListsItem({name, listId, color}) {
        return `
        <li id="${listId}" class="manage_lists__item ${color}">
            <div class="manage_lists__item__left">
                <div class="move_up_down_btn">
                    <div class="arrow">&#8691</div>
                </div>
            </div>
            <div class="manage_lists__item__center">
                <div class="manage_lists__item__name">
                    <input value=${name}></input>
                </div>
                <ul class="manage_lists__item__colors">
                    ${returnColorsPalette(state.listColors, color)}
                </ul>
            </div>
            <div class="manage_lists__item__right">
                 <div class="cross">×</div>
            </div>
        </li>
        `
    }

    function returnColorsPalette(colors, activeColor) {
        let colorsPalette = '';

        colors.forEach(color => {
            colorsPalette += `<li class="colored_square ${color} ${color === activeColor ? 'active' : ''}"></li>`
        });

        return colorsPalette;
    }

    function addNewList() {
        temporaryList.push({
            name: '',
            listId: idGenerator(),
            color: state.listColors[0],
            updated: false,
            items: []
        });
        rerenderListsItems();
        manageListsItemsElement.lastElementChild.querySelector('input').focus();
    }

    function deleteList(event) {
        let idToDelete = event.target.closest('.manage_lists__item').id;
        temporaryList = temporaryList.filter(item => item.listId !== idToDelete);
        rerenderListsItems();
    }

    function onChangeName(event) {
        const newValue = event.target.value;
        const listId = event.target.closest('.manage_lists__item').id;
        const listIndex = temporaryList.findIndex(item => '' + item.listId === listId);
        temporaryList[listIndex].name = newValue;

        manageListsItemsElement.querySelectorAll('.manage_lists__item__name input').forEach(el => {
            el.removeEventListener('input', onChangeName);
        });
        rerenderListsItems();
        
        manageListsItemsElement.querySelectorAll('.manage_lists__item').forEach(item => {
            if (item.id === '' + listId) {
                const input = item.querySelector('input');
                input.focus();
                input.selectionStart = input.value.length;
            }
        });
    }

    function changeListColor(event) {
        if (!event.target.classList.contains('colored_square')) {
            return;
        }

        let choosedColor;
        state.listColors.forEach(color => {
            if (event.target.classList.contains(color)) {
                choosedColor = color;
            }
        });
        const listId = event.target.closest('.manage_lists__item').id;
        const listIndex = temporaryList.findIndex(list => list.listId === listId);

        temporaryList[listIndex].color = choosedColor;
        rerenderListsItems();
    }

    function closeManageListsMenu(event) {
        if (event.target === popupWrapper || event.target === cancelBtn) {
            closeWithAnimation(popupWrapper, 'opening');
            document.querySelector('.main').classList.remove('noscroll');
        }
    }

    function acceptChanges() {
        let newLists = []
        temporaryList.forEach(list => {
            const stateIndex = state.lists.findIndex(stateList => stateList.listId === list.listId);
            if (stateIndex === -1) {
                state.lists.push(list);
                newLists.push(list.name);
            } else {
                state.lists[stateIndex].name = list.name;
                state.lists[stateIndex].color = list.color;
            }
        });

        deleteListsFromState();
        sortListsInState();

        popupWrapper.style.display = 'none';
        cancelBtn.removeEventListener('click', closeManageListsMenu);
        acceptBtn.removeEventListener('click', acceptChanges);
        state.writeToLocalStorage();
        initialRender();
        showNewListsMessage(newLists);

        function deleteListsFromState() {
            state.lists = state.lists.filter(list => {
                if (temporaryList.find(item => item.listId === list.listId)) {
                    return true;
                }
            });
        }

        function sortListsInState() {
            let sortedLists = [];
            for (let i = 0; i < temporaryList.length; i++) {
                const listIndex = state.lists.findIndex(list => list.listId === temporaryList[i].listId);
                sortedLists.push(state.lists[listIndex]);
            }
            state.lists = [...sortedLists];
        }

        function showNewListsMessage(lists) {
            if (lists.length === 1) {
                console.log(`list ${lists[0]} added, but is not visible now because it hasn't items yet`);
            } else if (lists.length > 1) {
                console.log(`new lists added, but are not visible now because they haven't items yet`);
            }
        }
    }
}
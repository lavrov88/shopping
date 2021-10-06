function openManageListsMenu() {
    const popupWrapper =  document.querySelector('#manage_lists');
    const manageListsItemsElement =  popupWrapper.querySelector('.list_options_popup__items');
    const addNewListBtn = popupWrapper.querySelector('#add_new_list_btn');
    const cancelBtn = popupWrapper.querySelector('.cancel_btn');
    const acceptBtn = popupWrapper.querySelector('.accept_btn');
    let temporaryList = [];

    addNewListBtn.addEventListener('click', addNewList);
    popupWrapper.addEventListener('click', closeManageListsMenu);
    acceptBtn.addEventListener('click', acceptChanges);

    createTemporaryList();
    rerenderListsItems();
    openWithAnimation(popupWrapper, 'opening', 'flex');

    function createTemporaryList() {
        temporaryList = temporaryList.slice(0,0);
        for (let i = 0; i < state.lists.length; i++) {
            const nextList = {
                name: state.lists[i].name,
                listId: state.lists[i].listId,
                color: state.lists[i].color,
            };
            temporaryList = [...temporaryList, nextList];
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

        manageListsItemsElement.onclick = addControlBtns;
        manageListsItemsElement.querySelectorAll('.manage_lists__item__name input').forEach(el => {
            el.addEventListener('input', onChangeName);
        });

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
        
    }

    function addControlBtns(event) {
        if (event.target.classList.contains('colored_square')) {
            changeListColor(event);
        } else if (event.target.classList.contains('manage_lists__item__right') || event.target.classList.contains('cross')) {
            deleteList(event);
        }
    }

    function updateTemporary(list) {
        temporaryList = [...list];
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
            color: state.listColors[0]
        });
        rerenderListsItems();

        const lastList = manageListsItemsElement.lastElementChild;
        const lastListHeight = lastList.scrollHeight + 'px';
        lastList.style.transition = 'transform 0s';
        lastList.classList.add('collapsed');
        setTimeout(() => {
            lastList.style.height = lastListHeight;
            lastList.style.transition = '';
            lastList.classList.remove('collapsed');
            lastList.querySelector('input').focus();
            lastList.addEventListener('transitionend', () => lastList.style.height = '', {once: true});
        }, 10);
    }

    function deleteList(event) {
        const list = event.target.closest('.manage_lists__item')
        const idToDelete = list.id;
        temporaryList = temporaryList.filter(item => item.listId !== idToDelete);
        list.addEventListener('transitionend', removeListenerAndRerender);
        collapseItem(list);

        function removeListenerAndRerender() {
            list.removeEventListener('transitionend', removeListenerAndRerender);
            rerenderListsItems();
        }
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
        }
    }

    function acceptChanges() {
        let newLists = []

        temporaryList.forEach(list => {
            const stateIndex = state.lists.findIndex(stateList => stateList.listId === list.listId);
            if (stateIndex === -1) {
                list.items = [];
                state.lists.push(list);
                newLists.push(list.name);
            } else {
                state.lists[stateIndex].name = list.name;
                state.lists[stateIndex].color = list.color;
            }
        });

        deleteListsFromState();
        sortListsInState();

        closeWithAnimation(popupWrapper, 'opening');
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
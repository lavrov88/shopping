function openManageListsMenu() {
    const popupWrapper =  document.querySelector('#manage_lists');
    const manageListsItemsElement =  popupWrapper.querySelector('.list_options_popup__items');
    const addNewListBtn = popupWrapper.querySelector('#add_new_list_btn');
    const cancelBtn = popupWrapper.querySelector('.cancel_btn');
    const acceptBtn = popupWrapper.querySelector('.accept_btn');
    let temporaryList = [];
    createTemporaryList();

    addNewListBtn.addEventListener('click', addNewList);
    cancelBtn.addEventListener('click', closeManageListsMenu);
    acceptBtn.addEventListener('click', acceptChanges);

    popupWrapper.style.display = 'flex';
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
        manageListsItemsElement.querySelectorAll('.manage_lists__item__colors').forEach(el => {
            el.addEventListener('click', changeListColor);
        });
        manageListsItemsElement.querySelectorAll('.manage_lists__item__right').forEach(el => {
            el.addEventListener('click', deleteList)
        });
    }

    function returnManageListsItem({name, listId, color}) {
        return `
        <li id="${listId}" class="manage_lists__item ${color}">
            <div class="manage_lists__item__left">⇳</div>
            <div class="manage_lists__item__center">
                <div class="manage_lists__item__name">
                    <input value=${name}></input>
                </div>
                <ul class="manage_lists__item__colors">
                    ${returnColorsPalette(state.listColors, color)}
                </ul>
            </div>
            <div class="manage_lists__item__right">×</div>
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

    function closeManageListsMenu() {
        popupWrapper.style.display = 'none';
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
        cancelBtn.addEventListener('click', closeManageListsMenu);
        acceptBtn.removeEventListener('click', acceptChanges);
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
            
        }

        function showNewListsMessage(lists) {
            if (lists.length === 1) {
                console.log(`list ${lists[0]} is not visible now because it hasn't items yet`);
            } else if (lists.length > 1) {
                console.log(`new lists are not visible now because they haven't items yet`);
            }
        }
    }
}
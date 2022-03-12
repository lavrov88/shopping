// LIST OPTIONS POPUP

function openListOptions(target) {
    const listIndex = state.findListIndex(target.closest('.category_item').id);
    let temporaryList = [];
    let htmlItems = '';

    const optionsWrapper = document.querySelector('#list_options');
    const optionsHeader = optionsWrapper.querySelector('.list_options_popup__header');
    const optionsGoods = optionsWrapper.querySelector('.list_options_popup__items');
    const cancelBtn = optionsWrapper.querySelector('.cancel_btn');
    const acceptBtn = optionsWrapper.querySelector('.accept_btn');

    for (let i = 0; i < state.lists[listIndex].items.length; i++) {
        temporaryList[i] = {};
        Object.assign(temporaryList[i], state.lists[listIndex].items[i]);
    }

    optionsWrapper.addEventListener('click', closeListOptions);
    acceptBtn.addEventListener('click', acceptChanges);

    rerenderList();
    openWithAnimation(optionsWrapper, 'opening', 'flex');

    function rerenderList() {
        htmlItems = '';
        temporaryList.forEach(good => {
            htmlItems += `
                <li id=${good.id} class="good_element edit${good.bought ? ' bought' : ''} ${state.lists[listIndex].color}">
                    <div class="good_element__left">
                        <div class="move_up_down_btn">
                            <div class="arrow">&#8691</div>
                        </div>
                    </div>
                    <div class="good_element__center">
                        <div class="good_element__name">${good.name}</div>
                        <input class="good_element__name_input" value="${good.name}"></input>
                    </div>
                    <div class="good_element__right">&#215</div>
                </li>
            `
        });
    
        optionsHeader.innerHTML = `<h2>${state.lists[listIndex].name}</h2>`;
        optionsGoods.innerHTML = `
            <ul>
                ${htmlItems}
            </ul>
        `;

        optionsGoods.onclick = addControlBtns;

        function addControlBtns(event) {
            if (event.target.classList.contains('good_element__right')) {
                deleteItem(event);
            } else if (event.target.classList.contains('good_element__name')) {
                editGoodName(event);
            }
        };

        const dataObj = {
            temporaryList: temporaryList,
            wrapper: optionsWrapper,
            dragBtnSelector: '.move_up_down_btn',
            dragElementSelector: '.good_element',
            dragZoneSelector: '.list_options_popup__items > ul',
            edgeHeight: 60,
            sortFunction: sortBoughtItems,
            updateTemporaryList: updateTemporary,
            rerenderFunction: rerenderList
        };

        addDragAndDrop(dataObj);
        
    }

    function updateTemporary(list) {
        temporaryList = [...list];
    }

    function editGoodName(event) {
        const elementName = event.target;
        const elementNameInput = event.target.closest('.good_element__center').querySelector('.good_element__name_input');
        const elementId = event.target.closest('.good_element').id;
        const elementIndex = temporaryList.findIndex(item => item.id === elementId);

        elementName.style.display = 'none';
        elementNameInput.style.display = 'inline';
        elementNameInput.focus();
        elementNameInput.selectionStart = elementNameInput.value.length;

        elementNameInput.addEventListener('input', (event) => {
            temporaryList[elementIndex].name = elementNameInput.value;
            elementName.textContent = elementNameInput.value;
        });

        elementNameInput.addEventListener('blur', (event) => {
            elementName.style.display = '';
            elementNameInput.style.display = '';
        });
    }

    function deleteItem(event) {
        const element = event.target.closest('.good_element');
        const idToDelete = element.id;

        temporaryList = temporaryList.filter(item => '' + item.id !== idToDelete);
        element.addEventListener('transitionend', removeListenerAndRerender);
        collapseItem(element);

        function removeListenerAndRerender() {
            element.removeEventListener('transitionend', removeListenerAndRerender);
            rerenderList();
        }
    }

    function closeListOptions(event) {
        if(event.target === optionsWrapper || event.target === cancelBtn) {
            closeWithAnimation(optionsWrapper, 'opening');
        }
    }

    function acceptChanges() {
        state.lists[listIndex].items = [...temporaryList];
        closeWithAnimation(optionsWrapper, 'opening');
        state.writeToLocalStorage();
        initialRender();
    }
}
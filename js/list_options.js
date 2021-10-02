// LIST OPTIONS POPUP

function openListOptions(target) {
    let listIndex = state.findListIndex(target.closest('.category_item').id);
    let temporaryList = [...state.lists[listIndex].items];
    let htmlItems = '';

    let optionsWrapper = document.querySelector('#list_options');
    let optionsHeader = optionsWrapper.querySelector('.list_options_popup__header');
    let optionsGoods = optionsWrapper.querySelector('.list_options_popup__items');
    let cancelBtn = optionsWrapper.querySelector('.cancel_btn');
    let acceptBtn = optionsWrapper.querySelector('.accept_btn');

    cancelBtn.addEventListener('click', closeListOptions);
    acceptBtn.addEventListener('click', acceptChanges);

    rerenderList();
    optionsWrapper.style.display = 'flex';


    function rerenderList() {
        htmlItems = '';
        temporaryList.forEach(good => {
            htmlItems += `
                <li id=${good.id} class="good_element edit${good.bought ? ' bought' : ''} ${state.lists[listIndex].color}">
                    <div class="good_element__left">
                        <div class="move_up_down_btn">&#8691</div>
                        <div class="move_up_btn">&#9650</div>
                        <div class="move_down_btn">&#9660</div>
                    </div>
                    <div class="good_element__center">${good.name}</div>
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

        optionsGoods.addEventListener('click', addControlBtns);

        function addControlBtns(event) {
            if (event.target.classList.contains('move_up_btn')) {
                temporaryList = [...replaceElementByBtn(event, 'up', temporaryList)];
            }
            if (event.target.classList.contains('move_down_btn')) {
                temporaryList = [...replaceElementByBtn(event, 'down', temporaryList)];
            }
            if (event.target.classList.contains('good_element__right')) {
                deleteItem(event);
            }
            optionsGoods.removeEventListener('click', addControlBtns);
            temporaryList = sortBoughtItems(temporaryList);
            rerenderList();
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

    function deleteItem(event) {
        let idToDelete = event.target.closest('.good_element').id;
        temporaryList = temporaryList.filter(item => '' + item.id !== idToDelete);
        rerenderList();
    }

    function closeListOptions() {
        optionsWrapper.style.display = '';
    }

    function acceptChanges() {
        state.lists[listIndex].items = [...temporaryList];
        closeListOptions();
        state.writeToLocalStorage();
        initialRender();
    }
}
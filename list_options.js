// LIST OPTIONS POPUP

function openListOptions(target) {
    let listIndex = state.findListIndex(target.closest('.category_item').id);
    let temporaryList = [...state.lists[listIndex].items];
    let htmlItems = '';

    let optionsWrapper = document.querySelector('#list_options');
    let optionsHeader = optionsWrapper.querySelector('.list_options_popup__header');
    let optionsGoods = optionsWrapper.querySelector('.list_options_popup__items');
    let deleteBtns;
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
                    <div class="good_element__left">&#8691</div>
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

        deleteBtns = optionsWrapper.querySelectorAll('.good_element__right');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', deleteItem);
        });
        addDragAndDrop();
    }

    function deleteItem(event) {
        let idToDelete = event.target.closest('.good_element').id;
        temporaryList = temporaryList.filter(item => '' + item.id !== idToDelete);
        rerenderList();
    }

    // DRAG AND DROP

    function addDragAndDrop() {
        optionsWrapper.querySelectorAll('.good_element__left').forEach(dragBtn => {
            let goodElement = dragBtn.closest('.good_element');
            let listElement = optionsWrapper.querySelector('.list_options_popup__items > ul');
            dragBtn.onpointerdown = function(event) {
                event.preventDefault();
                goodElement.style.position = 'absolute';
                goodElement.style.zIndex = 1000;
                goodElement.style.left = 0;

                let shiftY = event.clientY - goodElement.getBoundingClientRect().top;

                document.addEventListener('pointermove', onMouseMove);
                document.addEventListener('pointerup', onMouseUp);
    
                function onMouseMove(event) {
                    let newTop = event.clientY - shiftY - listElement.getBoundingClientRect().top;
    
                    if (newTop < -60 ) {
                        newTop = -60;
                    }
                    let bottomEdge = listElement.offsetHeight - goodElement.offsetHeight;
                    if (newTop > bottomEdge + 60) {
                        newTop = bottomEdge + 60;
                    }
                    goodElement.style.top = newTop + 'px';
    
                    goodElement.style.display = 'none';
                    let elementBelow = document.elementFromPoint(listElement.getBoundingClientRect().left + 30, event.clientY);
                    goodElement.style.display = '';
    
                    if (elementBelow.closest('.good_element')) {
                        optionsWrapper.querySelectorAll('.good_element').forEach(el => {
                            el.style.marginBottom = '';
                            el.style.marginTop = '';
                        });
    
                        let goodBelow =  elementBelow.closest('.good_element');
                        if (event.clientY > goodBelow.getBoundingClientRect().top + goodBelow.offsetHeight / 2) {
                            goodBelow.style.marginBottom = '50px';
                            moveData = { movingElement: goodElement, targetElement: goodBelow, position: 'after' }
                        } else {
                            goodBelow.style.marginTop = '50px';
                            moveData = { movingElement: goodElement, targetElement: goodBelow, position: 'before' }
                        }
                    }
                }
    
                function onMouseUp() {
                    let movingElementId = moveData.movingElement.id;
                    let movingElementIndex = temporaryList.findIndex(item => '' + item.id === movingElementId);
                    let movingElement = temporaryList.splice(movingElementIndex, 1)[0];
    
                    let targetElementId = moveData.targetElement.id;
                    let targetElementIndex = temporaryList.findIndex(item => '' + item.id === targetElementId);
    
                    if (moveData.position === 'before') {
                        temporaryList = [...temporaryList.slice(0, targetElementIndex), movingElement, ...temporaryList.slice(targetElementIndex)];
                    } else {
                        temporaryList = [...temporaryList.slice(0, targetElementIndex + 1), movingElement, ...temporaryList.slice(targetElementIndex + 1)];
                    }
    
                    document.removeEventListener('pointermove', onMouseMove);
                    document.removeEventListener('pointerup', onMouseUp);
                    sortBoughtItems(temporaryList);
                    rerenderList();
                }
    
                goodElement.ondragstart = function() {
                    return false;
                }
            }
        });
    }

    function closeListOptions() {
        optionsWrapper.style.display = '';
    }

    function acceptChanges() {
        state.lists[listIndex].items = [...temporaryList];
        closeListOptions();
        initialRender();
    }
}
// const dataObj = {
//     temporaryList: temporaryList,
//     wrapper: optionsWrapper,
//     dragBtnSelector: '.good_element__left',
//     dragElementSelector: '.good_element',
//     dragZoneSelector: '.list_options_popup__items > ul',
//     edgeHeight: 60,
//     sortFunction: sortBoughtItems,
//     updateTemporaryList: updateTemporary,
//     rerenderFunction: rerenderList
// }

function addDragAndDrop(dataObj) {
    let moveData;
    dataObj.wrapper.querySelectorAll(dataObj.dragBtnSelector).forEach(dragBtn => {
        let dragElement = dragBtn.closest(dataObj.dragElementSelector);
        let dragZone = dataObj.wrapper.querySelector(dataObj.dragZoneSelector);
        dragBtn.onpointerdown = function(event) {
            event.preventDefault();
            dragElement.style.position = 'absolute';
            dragElement.style.zIndex = 1000;
            dragElement.style.left = 0;

            let shiftY = event.clientY - dragElement.getBoundingClientRect().top;

            document.addEventListener('pointermove', onMouseMove);
            document.addEventListener('pointerup', onMouseUp);

            function onMouseMove(event) {
                let newTop = event.clientY - shiftY - dragZone.getBoundingClientRect().top;

                if (newTop < -dataObj.edgeHeight ) {
                    newTop = -dataObj.edgeHeight;
                }
                let bottomEdge = dragZone.offsetHeight - dragElement.offsetHeight;
                if (newTop > bottomEdge + dataObj.edgeHeight) {
                    newTop = bottomEdge + dataObj.edgeHeight;
                }
                dragElement.style.top = newTop + 'px';

                dragElement.style.display = 'none';
                let elementBelow = document.elementFromPoint(dragZone.getBoundingClientRect().left + 30, event.clientY);
                dragElement.style.display = '';

                if (elementBelow.closest(dataObj.dragElementSelector)) {
                    dataObj.wrapper.querySelectorAll(dataObj.dragElementSelector).forEach(el => {
                        el.style.marginBottom = '';
                        el.style.marginTop = '';
                    });

                    let goodBelow =  elementBelow.closest(dataObj.dragElementSelector);
                    if (event.clientY > goodBelow.getBoundingClientRect().top + goodBelow.offsetHeight / 2) {
                        goodBelow.style.marginBottom = '50px';
                        moveData = { movingElement: dragElement, targetElement: goodBelow, position: 'after' }
                    } else {
                        goodBelow.style.marginTop = '50px';
                        moveData = { movingElement: dragElement, targetElement: goodBelow, position: 'before' }
                    }
                }
            }

            function onMouseUp() {
                let movingElementId = moveData.movingElement.id;
                let movingElementIndex = dataObj.temporaryList.findIndex(item => '' + (item.id || item.listId) === movingElementId);
                let movingElement = dataObj.temporaryList.splice(movingElementIndex, 1)[0];
                let targetElementId = moveData.targetElement.id;
                let targetElementIndex = dataObj.temporaryList.findIndex(item => '' + (item.id || item.listId) === targetElementId);
                
                if (moveData.position === 'before') {
                    dataObj.temporaryList = [...dataObj.temporaryList.slice(0, targetElementIndex), movingElement, ...dataObj.temporaryList.slice(targetElementIndex)];
                } else {
                    dataObj.temporaryList = [...dataObj.temporaryList.slice(0, targetElementIndex + 1), movingElement, ...dataObj.temporaryList.slice(targetElementIndex + 1)];
                }

                document.removeEventListener('pointermove', onMouseMove);
                document.removeEventListener('pointerup', onMouseUp);

                if (dataObj.sortFunction) {
                    dataObj.sortFunction(dataObj.temporaryList);
                }
                
                dataObj.updateTemporaryList(dataObj.temporaryList);
                dataObj.rerenderFunction();
            }

            dragElement.ondragstart = function() {
                return false;
            }
        }
    });
}

function replaceElementByBtn(event, btnType, inputList) {
    const elementId = (event.target.closest('.good_element') || event.target.closest('.manage_lists__item')).id;
    const elementIndex = inputList.findIndex(item => (item.id || item.listId) === elementId);
    const listLength = inputList.length;
    let updatedList = [];

    if (btnType === 'up') {
        if (elementIndex > 0) {
            updatedList = [
                ...inputList.slice(0, elementIndex - 1),
                inputList[elementIndex],
                ...inputList.slice(elementIndex - 1).filter(item => (item.id || item.listId) !== elementId)
            ];
        } else {
            updatedList = [...inputList];
        }
    }
    if (btnType === 'down') {
        if (elementIndex < listLength - 1) {
            updatedList = [
                ...inputList.slice(0, elementIndex + 2).filter(item => (item.id || item.listId) !== elementId),
                inputList[elementIndex],
                ...inputList.slice(elementIndex + 2)
            ]
        } else {
            updatedList = [...inputList];
        }
    }
    return updatedList;
}
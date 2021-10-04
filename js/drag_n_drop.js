function addDragAndDrop(dataObj) {
    let moveData;
    dataObj.wrapper.querySelectorAll(dataObj.dragBtnSelector).forEach(dragBtn => {
        let dragElement = dragBtn.closest(dataObj.dragElementSelector);
        let dragZone = dataObj.wrapper.querySelector(dataObj.dragZoneSelector);

        //dragZone.style.height = dragZone.scrollHeight + 'px';

        dragBtn.onpointerdown = function(event) {
            event.preventDefault();

            dragZone.style.height = dragZone.scrollHeight + 'px';

            window.navigator.vibrate(30);
            dragElement.classList.add('dragging');
            dragElement.style.position = 'absolute';
            dragElement.style.zIndex = 1000;
            dragElement.style.left = 0;

            let shiftY = event.clientY - dragElement.getBoundingClientRect().top;

            document.addEventListener('pointermove', onMouseMove);
            document.addEventListener('pointerup', onMouseUp);

            function onMouseMove(event) {
                let newTop = event.clientY - shiftY - dragZone.getBoundingClientRect().top - 20;

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
                    if (event.clientY > goodBelow.getBoundingClientRect().top + goodBelow.offsetHeight * 0.5) {
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
                
                window.navigator.vibrate(30);
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

                dragElement.classList.remove('dragging');
                dataObj.updateTemporaryList(dataObj.temporaryList);
                dataObj.rerenderFunction();
            }

            dragElement.ondragstart = function() {
                return false;
            }
        }
    });
}

// EXAMPLE OF DATA OBJECT
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
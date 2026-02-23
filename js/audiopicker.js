
document.addEventListener('DOMContentLoaded', () => {
    let audiopickerRoot = document.getElementById('audiopicker');
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');
    let buttonAdd = audiopickerRoot
        .querySelector('[name="source-add"]');


    let playAudioSource = (listItem) => {
        if (listItem) {
            let currentActiveItem = playlistRoot
                .querySelector('.active');
            currentActiveItem?.classList.remove('active');
            let track = listItem
                .dataset.source;
            audioplayer.src = track;
            audioplayer.play();
            listItem.classList.add('active');
        }
    }

    let addDeleteButton = (sourceItem) => {
        let deleteButton = document.createElement('button');
        deleteButton.innerText = 'DELETE';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            // Если удаляем активный – играть следующий
            if (sourceItem.classList.contains('active')) {
                let nextItem = sourceItem.nextSibling;
                audioplayer.src = nextItem?.dataset.source;
                nextItem?.classList.add('active');
            }
            sourceItem.remove();
        });
        sourceItem.append(deleteButton);
    };

    let moveItemToPosition = (sourceItem, position) => {
        if (position < 0) {
            position = 0;
        }
        if (position >= playlistRoot.children.length) {
            position = playlistRoot.children.length - 1;
        }
        playlistRoot.removeChild(sourceItem);
        let itemToInsertBefore = playlistRoot
                .children[position];
        if (itemToInsertBefore) {
            playlistRoot.insertBefore(sourceItem, itemToInsertBefore);
        }
        else {
            playlistRoot.append(sourceItem);
        }
    };


    let addMoveButton = (sourceItem, caption, getTargetPosition) => {
        let moveButton = document.createElement('button');
        moveButton.innerText = caption;
        moveButton.addEventListener('click', (event) => {
            event.stopPropagation();
            moveItemToPosition(sourceItem, getTargetPosition());
        });
        sourceItem.append(moveButton);
    };


    let addAudioSource = (source) => {
        let sourceItem = document.createElement('li');
        sourceItem.innerText = source;
        sourceItem.dataset.source = source;
        addDeleteButton(sourceItem);
        addMoveButton(sourceItem, "FIRST",
            () => 0);
        addMoveButton(sourceItem, "UP",
            () => [...playlistRoot.children].indexOf(sourceItem) - 1);
        addMoveButton(sourceItem, "DOWN",
            () => [...playlistRoot.children].indexOf(sourceItem) + 1);
        addMoveButton(sourceItem, "LAST",
            () => playlistRoot.children.length - 1);
        sourceItem.addEventListener('click', (event) => {
            event.stopPropagation();
            playAudioSource(sourceItem);
        });
        playlistRoot.append(sourceItem);
        return sourceItem;
    };

    let clearSourceInput = (sourceInput) => {
        sourceInput.value = '';
        buttonAdd.disabled = true;
    }

    let getSourceTypeInput = () => {
        return audiopickerRoot
            .querySelector('[name="source-type"]:checked');
    }

    let getSourceInput = (sourceType) => {
        return audiopickerRoot
            .querySelector(`[name="${'source-' + sourceType}"]`);
    }

    buttonAdd.addEventListener('click', (event) => {
        event.stopPropagation();
        let sourceTypeInput = getSourceTypeInput();
        let sourceType = sourceTypeInput.value;
        let sourceInput = getSourceInput(sourceType);
        let sourceValue = sourceInput.value;
        let newItem = addAudioSource(sourceValue);
        if (!audioplayer.src) {
            playAudioSource(newItem);
        }
        clearSourceInput(sourceInput);
    });

    let allPickerInputs = audiopickerRoot
        .getElementsByTagName('input');
    for (let input of allPickerInputs) {
        input.addEventListener('change', (event) => {
            event.stopPropagation();
            let sourceTypeInput = getSourceTypeInput();
            let sourceType = sourceTypeInput.value;
            let sourceInput = getSourceInput(sourceType);
            let sourceValue = sourceInput.value;
            buttonAdd.disabled = !sourceValue;
        });
    }

    // TEST TODO: remove
    addAudioSource('https://download.samplelib.com/mp3/sample-3s.mp3');
    addAudioSource('https://download.samplelib.com/mp3/sample-6s.mp3');
    addAudioSource('https://download.samplelib.com/mp3/sample-9s.mp3');
    addAudioSource('https://download.samplelib.com/mp3/sample-12s.mp3');
});

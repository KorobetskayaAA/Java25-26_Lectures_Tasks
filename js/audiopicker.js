
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
    let templatePlaylistItem = document
        .getElementById('playlist-item-template')
        .content
        .querySelector('li');


    let playAudioSource = (listItem, autoplay = true) => {
        if (listItem) {
            let currentActiveItem = playlistRoot
                .querySelector('.active');
            currentActiveItem?.classList.remove('active');
            let track = listItem
                .dataset.source;
            audioplayer.src = track;
            if (autoplay) {
                audioplayer.play();
            }
            listItem.classList.add('active');
        }
    }

    let addDeleteButton = (sourceItem) => {
        let deleteButton = sourceItem.querySelector('button[data-action="delete"]');
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


    let addMoveButton = (sourceItem, action, getTargetPosition) => {
        let moveButton = sourceItem
            .querySelector(`button[data-action="${action}"]`);
        moveButton.addEventListener('click', (event) => {
            event.stopPropagation();
            moveItemToPosition(sourceItem, getTargetPosition());
        });
    };

    let allawDragAndDrop = (sourceItem) => {
        sourceItem.draggable = true;
        sourceItem.addEventListener('dragstart', (event) => {
            event.stopPropagation();
            let currentDraggingItem = event.target;
            // в процессе перетаскивания сразу ставим элемент на новое место
            let dragoverHandler = (event) => {
                event.preventDefault(); // по умолчанию запрещено, отменяем
                // на себя не перетаскиваем
                if (!currentDraggingItem || event.target == currentDraggingItem) {
                    return;
                }
                // только для элементов списка
                if (event.target.parentElement == playlistRoot) {
                    moveItemToPosition(currentDraggingItem,
                        [...playlistRoot.children].indexOf(event.target));
                }
            };
            // конец перетаскивания - очищаем всё
            let dropHandler = (event) => {
                event.preventDefault(); // по умолчанию запрещено, отменяем
                currentDraggingItem = null;
                playlistRoot.removeEventListener('dragover', dragoverHandler);
                playlistRoot.removeEventListener('drop', dropHandler);
            };
            // включить перетаскивание во всем списке
            playlistRoot.addEventListener('dragover', dragoverHandler);
            playlistRoot.addEventListener('drop', dropHandler);
        });
    };

    let addAudioSource = (sourceValue, sourceTitle) => {
        let sourceItem = templatePlaylistItem.cloneNode(true);
        sourceItem.dataset.source = sourceValue;
        let sourceItemText = sourceItem.querySelector('span');
        sourceItemText.innerText = sourceTitle;
        addDeleteButton(sourceItem);
        addMoveButton(sourceItem, "first",
            () => 0);
        addMoveButton(sourceItem, "up",
            () => [...playlistRoot.children].indexOf(sourceItem) - 1);
        addMoveButton(sourceItem, "down",
            () => [...playlistRoot.children].indexOf(sourceItem) + 1);
        addMoveButton(sourceItem, "last",
            () => playlistRoot.children.length - 1);
        sourceItem.addEventListener('click', (event) => {
            event.stopPropagation();
            playAudioSource(sourceItem);
        });
        allawDragAndDrop(sourceItem);
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
        let source = {};
        if (sourceType == 'file') {
            source.value = URL.createObjectURL(sourceInput.files[0]);
            source.title = sourceInput.files[0].name;
        }
        else {
            source.value = sourceInput.value;
            source.title = sourceInput.value.split('/').at(-1);
        }
        let newItem = addAudioSource(source.value, source.title);
        if (!audioplayer.src) {
            playAudioSource(newItem);
        }
        clearSourceInput(sourceInput);
    });

    let allPickerInputs = audiopickerRoot
        .getElementsByTagName('input');
    for (let input of allPickerInputs) {
        input.addEventListener('change', (event) => {
            let sourceTypeInput = getSourceTypeInput();
            let sourceType = sourceTypeInput.value;
            let sourceInput = getSourceInput(sourceType);
            let sourceValue = sourceInput.value;
            buttonAdd.disabled = !sourceValue;
        });
    }

    let inputFile = audiopickerRoot
        .querySelector('input[type="file"]');
    let inputFileTitle = audiopickerRoot
        .querySelector('.input-file-text');
    inputFile.addEventListener('change', () => {
        inputFileTitle.innerText = inputFile.files[0]?.name;
    }
);

    let savedPlaylistJson = localStorage.getItem('playlist');
    if (savedPlaylistJson) {
        let savedPlaylist = JSON.parse(savedPlaylistJson);
        playlistRoot.replaceChildren(); // на всякий случай очищаем
        for (let track of savedPlaylist?.tracks) {
            let addedSource = addAudioSource(track.value, track.title);
            if (track.value == savedPlaylist.activeTrack) {
                playAudioSource(addedSource, false);
            }
        }
    }
});

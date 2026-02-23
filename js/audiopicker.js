
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

    let addAudioSource = (source) => {
        let sourceItem = document.createElement('li');
        sourceItem.innerText = source;
        sourceItem.dataset.source = source;
        addDeleteButton(sourceItem);
        sourceItem.addEventListener('click', (event) => {
            event.stopPropagation();
            playAudioSource(sourceItem);
        });
        playlistRoot.append(sourceItem);
        return sourceItem;
    }

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
});

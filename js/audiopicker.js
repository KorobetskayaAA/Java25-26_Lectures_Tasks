
document.addEventListener('DOMContentLoaded', () => {
    let audiopickerRoot = document.getElementById('audiopicker');
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');
    let addButton = audiopickerRoot
        .querySelector('[name="source-add"]');

    let addAudioSource = (source) => {
        let sourceItem = document.createElement('li');
        let addDeleteButton = () => {
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
                // очищаем зависимости для gc
                sourceItem = null;
            });
            sourceItem.append(deleteButton);
        };
        sourceItem.innerText = source;
        sourceItem.dataset.source = source;
        addDeleteButton();
        playlistRoot.append(sourceItem);
        return sourceItem;
    }

    let playAudioSource = (source) => {
        audioplayer.src = source;
        audioplayer.play();
    }

    let clearSourceInput = (sourceInput) => {
        sourceInput.value = '';
        addButton.disabled = true;
    }

    let getSourceTypeInput = () => {
        return audiopickerRoot
            .querySelector('[name="source-type"]:checked');
    }

    let getSourceInput = (sourceType) => {
        return audiopickerRoot
            .querySelector(`[name="${'source-' + sourceType}"]`);
    }

    addButton.addEventListener('click', (event) => {
        event.stopPropagation();
        let sourceTypeInput = getSourceTypeInput();
        let sourceType = sourceTypeInput.value;
        let sourceInput = getSourceInput(sourceType);
        let sourceValue = sourceInput.value;
        let newItem = addAudioSource(sourceValue);
        if (!audioplayer.src) {
            playAudioSource(sourceValue);
            newItem.classList.add('active');
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
            addButton.disabled = !sourceValue;
        });
    }
});

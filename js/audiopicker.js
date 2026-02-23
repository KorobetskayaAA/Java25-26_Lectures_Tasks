
document.addEventListener('DOMContentLoaded', () => {
    let audiopickerRoot = document.getElementById('audiopicker');
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');

    let addAudioSource = (source) => {
        let sourceItem = document.createElement('li');
        sourceItem.innerText = source;
        playlistRoot.append(sourceItem);
    }

    let playAudioSource = (source) => {
        if (!audioplayer.src) {
            audioplayer.src = source;
            audioplayer.play();
        }
    }

    let clearSourceInput = (sourceInput) => {
        sourceInput.value = '';
    }

    let getSourceTypeInput = () => {
        return audiopickerRoot
            .querySelector('[name="source-type"]:checked');
    }

    let getSourceInput = (sourceType) => {
        return audiopickerRoot
            .querySelector(`[name="${'source-' + sourceType}"]`);
    }

    let addButton = audiopickerRoot
        .querySelector('[name="source-add"]');
    addButton.addEventListener('click', (event) => {
        event.stopPropagation();
        let sourceTypeInput = getSourceTypeInput();
        let sourceType = sourceTypeInput.value;
        let sourceInput = getSourceInput(sourceType);
        let sourceValue = sourceInput.value;
        addAudioSource(sourceValue);
        playAudioSource(sourceValue);
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

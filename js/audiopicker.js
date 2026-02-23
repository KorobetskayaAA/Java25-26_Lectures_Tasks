
document.addEventListener('DOMContentLoaded', () => {
    let audiopickerRoot = document.getElementById('audiopicker');
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');

    let getAudioSourceValue = (name) => {
        let input = audiopickerRoot.querySelector(`[name="${name}"]`);
        return input.value;
    }

    let addAudioSource = (source) => {
        audioplayer.src = source;
        let sourceItem = document.createElement('li');
        sourceItem.innerText = source;
        playlistRoot.append(sourceItem);
    }

    let addButton = audiopickerRoot.querySelector('[name="source-add"]');
    addButton.addEventListener('click', (event) => {
        event.stopPropagation();
        let sourceType = audiopickerRoot.querySelector('[name="source-type"]:checked').value;
        let sourceValue = getAudioSourceValue('source-' + sourceType);
        addAudioSource(sourceValue);
    })
});

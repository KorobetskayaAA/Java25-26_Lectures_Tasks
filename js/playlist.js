
document.addEventListener('DOMContentLoaded', () => {
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');
    let audioplayer = document
        .getElementById('player')
        .querySelector('audio');
    let clearButton = document
        .getElementById('playlist')
        .querySelector('[name="playlist-clear"]');


    clearButton.addEventListener('click', () => {
        audioplayer.pause();
        audioplayer.src = null;
        playlistRoot.replaceChildren();
    });

    let saveTracks = () => {
        let tracksToSave = {
            'activeTrack': audioplayer.src,
            'tracks': [...playlistRoot.children]
                .map(li => { return {
                    'value': li.dataset.source, 
                    'title': li.querySelector('span').innerText
                }; })
        };
        localStorage.setItem('playlist', JSON.stringify(tracksToSave));
    }

    window.addEventListener('beforeunload', saveTracks);
});



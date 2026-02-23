
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
});
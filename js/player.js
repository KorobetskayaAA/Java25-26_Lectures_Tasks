
document.addEventListener('DOMContentLoaded', () => {
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');
    
    audioplayer.addEventListener('ended', () => {
        let currentTrack = audioplayer.src;
        let currentListItem = playlistRoot
            .querySelector('.active');
        let nextListItem = currentListItem.nextSibling;
        if (nextListItem) {
            let nextTrack = nextListItem
                .dataset.source;
            audioplayer.src = nextTrack;
            audioplayer.play();
        }
    });

    audioplayer.addEventListener('play', () => {
        let currentTrack = audioplayer.src;
        let prevListItem = playlistRoot
            .querySelector('.active');
        let currentListItem = playlistRoot
            .querySelector(`[data-source="${currentTrack}"]`);;
        prevListItem.classList.remove('active');
        currentListItem.classList.add('active');
    });
});

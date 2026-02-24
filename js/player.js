
document.addEventListener('DOMContentLoaded', () => {
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');
    let playlistRepeatAll = document
        .getElementById('playlist')
        .querySelector('input[name="playlist-options-repeat-all"]');
    let playlistRepeatSingle = document
        .getElementById('playlist')
        .querySelector('input[name="playlist-options-repeat-single"]');
    
    let playListItem = (listItem) => {
        if (listItem) {
            let track = listItem
                .dataset.source;
            audioplayer.src = track;
            audioplayer.play();
            listItem.classList.add('active');
        }
    }
    
    audioplayer.addEventListener('ended', () => {
        if (playlistRepeatSingle.checked) {
            audioplayer.play();
            return;
        }
        let currentListItem = playlistRoot
            .querySelector('.active');
        let nextListItem = currentListItem?.nextSibling;
        if (playlistRepeatAll.checked && !nextListItem) {
            nextListItem = playlistRoot.children[0];
        }
        if (nextListItem) {
            currentListItem?.classList.remove('active');
            playListItem(nextListItem);
        }
    });
});

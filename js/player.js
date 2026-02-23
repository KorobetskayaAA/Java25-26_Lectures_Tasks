
document.addEventListener('DOMContentLoaded', () => {
    let audioplayer = document
        .getElementById('player')
        .getElementsByTagName('audio')[0];
    let playlistRoot = document
        .getElementById('playlist')
        .querySelector('nav');
    
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
        let currentListItem = playlistRoot
            .querySelector('.active');
        let nextListItem = currentListItem?.nextSibling;
        if (nextListItem) {
            currentListItem?.classList.remove('active');
            playListItem(nextListItem);
        }
    });
});

let list = {
    "C:": {
        "Program Files": {
            "7Zip": {},
            "Notepad++": {},
            "VS Code": {
                "bin": {},
                "exec": {}
            },
            "WinRar": {}            
        }
    },
    "D:": {
        "MyDocuments": {
            "MyPictures": {},
            "MyVideos": {},
            "MyAssets": {}
        }
    }
}

function createSublist(list, rootElement) {
    if (!list) {
        return;
    }
    let ul = document.createElement('ul');
    for (let node in list) {
        let li = document.createElement('li');
        let subCount = Object.entries(list[node]).length;
        li.innerText = subCount > 0 ? `${node} (${subCount})` : node;
        if (subCount > 0) {
            li.classList.add('expandable');
        }
        li.addEventListener('click', (event) => {
            event.stopPropagation();
            li.classList.toggle('collapsed');
        });
        ul.append(li);
        createSublist(list[node], li)
    }
    rootElement.append(ul);
}

document.addEventListener('DOMContentLoaded', () => {
    let listContainer = document.getElementById('list_container');
    listContainer.innerHTML = "";
    createSublist(list, listContainer);
});

const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewer-img');
const viewerName = document.getElementById('viewer-name');
const closeButton = document.getElementById('viewer-close');
const toggleNamesButton = document.getElementById('toggle-names');
const viewerToggleButton = document.getElementById('viewer-toggle-name');

function setViewerNameHidden(hidden) {
    viewer.classList.toggle('name-hidden', hidden);
    viewerToggleButton.textContent = hidden ? 'Show name' : 'Hide name';
}

document.querySelectorAll('.card img').forEach((img) => {
    img.addEventListener('click', () => {
        viewerImg.src = img.src;
        viewerName.textContent = img.dataset.name;
        setViewerNameHidden(document.body.classList.contains('names-hidden'));
        viewer.showModal();
    });
});

closeButton.addEventListener('click', () => {
    viewer.close();
});

viewer.addEventListener('click', (event) => {
    if (event.target === viewer) {
        viewer.close();
    }
});

toggleNamesButton.addEventListener('click', () => {
    const hidden = document.body.classList.toggle('names-hidden');
    toggleNamesButton.textContent = hidden ? 'Show names' : 'Hide names';
});

viewerToggleButton.addEventListener('click', () => {
    setViewerNameHidden(!viewer.classList.contains('name-hidden'));
});
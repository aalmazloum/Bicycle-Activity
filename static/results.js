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

const gridView = document.getElementById('grid-view');
const overlayView = document.getElementById('overlay-view');
const showGridButton = document.getElementById('show-grid');
const showOverlayButton = document.getElementById('show-overlay');
const refreshButton = document.getElementById('refresh');
const overlayCanvas = document.getElementById('overlay');
const overlayCtx = overlayCanvas.getContext('2d');
const drawingImages = document.querySelectorAll('.card img');

const STRENGTH = 5;

let bounds = [];

function findBounds(img) {
    const temp = document.createElement('canvas');
    temp.width = img.naturalWidth;
    temp.height = img.naturalHeight;
    const tempCtx = temp.getContext('2d');
    tempCtx.drawImage(img, 0, 0);
    const pixels = tempCtx.getImageData(0, 0, temp.width, temp.height).data;

    let minX = temp.width;
    let minY = temp.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < temp.height; y++) {
        for (let x = 0; x < temp.width; x++) {
            const alpha = pixels[(y * temp.width + x) * 4 + 3];
            if (alpha > 0) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX === -1)  {
        return null;
    }

    return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function drawOverlay() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.globalAlpha = Math.min(1, STRENGTH / Math.max(drawingImages.length, 1));

    drawingImages.forEach((img, i) => {
        const b = bounds[i];
        if (!b) return;
        const x = (overlayCanvas.width - b.width) / 2 - b.x;
        const y = (overlayCanvas.height - b.height) / 2 - b.y;
        overlayCtx.drawImage(img, x, y);
    });

    overlayCtx.globalAlpha = 1;
}

function showView(view) {
    const isOverlay = view === 'overlay';
    gridView.hidden = isOverlay;
    overlayView.hidden = !isOverlay;
    showGridButton.classList.toggle('active', !isOverlay);
    showOverlayButton.classList.toggle('active', isOverlay);
    location.hash = view;
    if (isOverlay) {
        drawOverlay();
    }
}

showGridButton.addEventListener('click', () => showView('grid'));
showOverlayButton.addEventListener('click', () => showView('overlay'));
refreshButton.addEventListener('click', () => location.reload());

showView(location.hash === '#overlay' ? 'overlay' : 'grid');

window.addEventListener('load', () => {
    bounds = Array.from(drawingImages, findBounds);
    drawOverlay();
});
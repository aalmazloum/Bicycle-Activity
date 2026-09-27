const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

ctx.lineWidth = 4;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = '#222';

let drawing = false;

function getPoint(event) {
    const scale = canvas.width / canvas.clientWidth;
    return {
        x: event.offsetX * scale,
        y: event.offsetY * scale,
    };
}

canvas.addEventListener('pointerdown', (event) => {
    drawing = true;
    const p = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
});

canvas.addEventListener('pointermove', (event) => {
    if (!drawing) return;
    const p = getPoint(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
});

canvas.addEventListener('pointerup', () => {
    drawing = false;
});

canvas.addEventListener('pointerleave', () => {
    drawing = false;
});

const clearButton = document.getElementById('clear');

clearButton.addEventListener('click', () => {
    if (confirm('Erase your whole drawing?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

ctx.lineWidth = 4;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = '#222';

let drawing = false;
let hasDrawn = false;

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
    hasDrawn = true;
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
        hasDrawn = false;
    }
});

const submitButton = document.getElementById('submit');
const nameInput = document.getElementById('name');
const statusText = document.getElementById('status');

submitButton.addEventListener('click', async () => {
    if (!nameInput.value.trim()) {
        statusText.textContent = 'Please enter your name first.';
        nameInput.focus();
        return;
    }
    if (!hasDrawn) {
        statusText.textContent = 'Please draw your bicycle first.';
        return;
    }

    const drawing = canvas.toDataURL('image/png');

    submitButton.disabled = true;
    statusText.textContent = 'Sending...';

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput.value,
                drawing: drawing,
            }),
        });

        if (!response.ok) {
            throw new Error('Server replied with ' + response.status);
        } 
        
        statusText.textContent = 'Thanks! Your drawing was submitted!';
        clearButton.disabled = true;
        nameInput.disabled = true;
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0.6';
    } catch (error) {
        console.error(error);
        statusText.textContent = 'Something went wrong. Please try again.';
        submitButton.disabled = false;
    }
});
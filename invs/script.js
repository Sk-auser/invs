// Get the canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 400;
canvas.height = 400;

// Iron filings parameters
const filingLength = 10;
let numFilings = 700;
const maxFilings = 10000;
let filings = [];

// Magnet constants
const friction = 0.6;

// Class for the movable magnet
class Magnet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 100;
        this.angle = 0;
        this.strength = 150; // Initial strength
        this.updatePolePositions();
    }

    draw() {
        const w = this.width / 2;
        const h = this.height / 2;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(-w + 3, -h + 3, this.width, this.height);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgb(200, 20, 20)';
        ctx.fillRect(-w, -h, this.width, h);
        ctx.fillStyle = 'rgb(20, 20, 200)';
        ctx.fillRect(-w, 0, this.width, h);

        ctx.fillStyle = 'white';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', 0, -h / 2);
        ctx.fillText('S', 0, h / 2);

        ctx.restore();
    }

    updatePolePositions() {
        const s = (this.height / 2) * Math.sin(this.angle * Math.PI / 180);
        const c = (this.height / 2) * Math.cos(this.angle * Math.PI / 180);

        this.x1 = this.x + s;
        this.x2 = this.x - s;
        this.y1 = this.y - c;
        this.y2 = this.y + c;
    }

    rotate(angle) {
        this.angle += angle;
        this.updatePolePositions();
    }
}

// Class for iron filings
class Filing {
    constructor(x, y, length, theta) {
        this.x = x;
        this.y = y;
        this.length = length / 2;
        this.theta = theta;
    }

    draw() {
        const t = this.theta * Math.PI / 180;
        const s = this.length * Math.sin(t);
        const c = this.length * Math.cos(t);
        const x1 = this.x + s;
        const y1 = this.y - c;
        const x2 = this.x - s;
        const y2 = this.y + c;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    barInteraction(magnet1, magnet2) {
        let dx1 = this.x - magnet1.x;
        let dy1 = this.y - magnet1.y;
        let distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        if (distance1 < 1) distance1 = 1; // Prevent division by zero or very small numbers
        let force1 = magnet1.strength / (distance1 * distance1);

        let dx2 = this.x - magnet2.x;
        let dy2 = this.y - magnet2.y;
        let distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance2 < 1) distance2 = 1; // Prevent division by zero or very small numbers
        let force2 = magnet2.strength / (distance2 * distance2);

        let theta1 = Math.atan2(dy1, dx1) * 180 / Math.PI;
        let theta2 = Math.atan2(dy2, dx2) * 180 / Math.PI;

        let dTheta1 = (theta1 - this.theta) % 360;
        if (dTheta1 > 180) dTheta1 -= 360;
        else if (dTheta1 < -180) dTheta1 += 360;

        let dTheta2 = (theta2 - this.theta) % 360;
        if (dTheta2 > 180) dTheta2 -= 360;
        else if (dTheta2 < -180) dTheta2 += 360;

        // Adjust the influence area by modifying the force
        let influenceRadius = 10000000000000; // Influence radius
        force1 *= Math.max(0, (influenceRadius - distance1)) / influenceRadius;
        force2 *= Math.max(0, (influenceRadius - distance2)) / influenceRadius;

        // Adjust influence factor
        let influenceFactor = 15; // Adjust as needed
        this.theta += (dTheta1 * force1 + dTheta2 * force2) * influenceFactor;
    }
}

// Function to add iron filings
function addIronFilings(n) {
    const filings = [];

    for (let i = 0; i < n; i++) {
        const x = Math.random() * 400;
        const y = Math.random() * 400;
        const theta = Math.random() * 360;
        filings.push(new Filing(x, y, filingLength, theta));
    }
    return filings;
}

// Create instances of magnets and filings
const barMagnet = new Magnet(170, 230);
const stationaryMagnet = new Magnet(230, 170); // Adjust coordinates as needed
filings = addIronFilings(numFilings);

// Function to handle interactions with both magnets
function interact() {
    for (let i = 0; i < numFilings; i++) {
        filings[i].barInteraction(barMagnet, stationaryMagnet);
    }
}

// Function to draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    for (let i = 0; i < numFilings; i++) {
        filings[i].draw();
    }

    barMagnet.draw();
    stationaryMagnet.draw(); // Draw the stationary magnet

    requestAnimationFrame(draw);
}

// Event listeners for interaction (movable magnet and key controls)
canvas.addEventListener('mousemove', (e) => {
    if (e.buttons > 0) {
        barMagnet.x = e.offsetX;
        barMagnet.y = e.offsetY;
        barMagnet.updatePolePositions();
        interact();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        barMagnet.rotate(-5);
    } else if (e.key === 'ArrowRight') {
        barMagnet.rotate(5);
    }
    interact();
});

// Event listener for strength input
const strengthInput = document.getElementById('strengthInput');
strengthInput.addEventListener('input', (e) => {
    const newStrength = parseInt(e.target.value);
    barMagnet.strength = newStrength;
    stationaryMagnet.strength = newStrength;
    interact();
});

// Event listener for number of filings input
const numFilingsInput = document.getElementById('numFilingsInput');
const maxFilingsMessage = document.getElementById('maxFilingsMessage');
numFilingsInput.addEventListener('input', (e) => {
    const newNumFilings = parseInt(e.target.value);
    if (newNumFilings > maxFilings) {
        maxFilingsMessage.style.display = 'block';
        numFilingsInput.value = maxFilings;
    } else {
        maxFilingsMessage.style.display = 'none';
        numFilings = newNumFilings;
        filings = addIronFilings(numFilings);
        interact();
    }
});

// Start the drawing loop
draw();

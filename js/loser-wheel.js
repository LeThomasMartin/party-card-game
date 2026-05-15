// Challenges for the Wheel of Losers
const CHALLENGES = [
    { short: "Boit en ta**ck", text: "Finis tout les verre des autres joueurs (pas les tiens)", category: "drink" },
    { short: "Petit snack", text: "Avale un oeuf cru avec la coquille ", category: "food" },
    { short: "Aime tu les épices?", text: "Mange le truc le plus épicé de la maison", category: "food" },
    { short: "Tapette ", text: "Rien tu t sauvé du défi, mais .... t fif en esti", category: "social" },
    { short: "Mon pere y est riche en...", text: "Donne moi 20 pissse parceque anyway mon pere est riche en tabarnack", category: "social" },
    { short: "Tequila heineken", text: "Tequila heineken pas le temps de niaiser, prend un shot(tequilla si possible) et une biere(heineken si possible)", category: "drink" },
];

let loserIsSpinning = false;
let challengeObjects = [];

// Get the loser button
const loserButton = document.getElementById("loser-button");

// Add event listener for loser button
if (loserButton) {
    loserButton.addEventListener("click", spinLoserWheel);
}

// Handle spin for the loser wheel
function spinLoserWheel() {
    if (loserIsSpinning || isSpinning) return;
    
    // Store full challenge objects and set entries to only the short text for display
    challengeObjects = [...CHALLENGES];
    entries = CHALLENGES.map(c => c.short);
    
    // Show wheel
    showWheel();
    
    // Spin the wheel using the existing wheel spinner
    spinLoserWheelChallenge().then((challengeIndex) => {
        // After a short delay, hide the wheel
        setTimeout(() => {
            hideWheel();
            
            // Display the challenge as a card
            if (challengeIndex !== -1 && challengeObjects[challengeIndex]) {
                const challenge = challengeObjects[challengeIndex];
                const cardDisplay = document.querySelector(".card-display");
                if (cardDisplay) {
                    cardDisplay.className = "card-display category-" + challenge.category;
                    cardDisplay.innerHTML = `
                        <div class="card-category">${challenge.category[0].toUpperCase() + challenge.category.slice(1)}</div>
                        <div class="card-text">${challenge.text}</div>
                    `;
                }
            }
        }, 2000);
    });
}

// Custom wheel spin for challenges (reuses wheel.js infrastructure)
function spinLoserWheelChallenge() {
    return new Promise((resolve) => {
        if (isSpinning || entries.length < 2) {
            resolve(-1);
            return;
        }

        isSpinning = true;
        spinBtn.disabled = true;

        const tau = Math.PI * 2;
        const sliceAngle = tau / entries.length;

        const winnerIndex = secureRandomInt(entries.length);

        const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
        const finalNormalized = normalizeAngle(-targetSliceCenter);

        const extraTurns = 6 + secureRandomInt(4);
        const totalRotation = extraTurns * tau + finalNormalized;

        const startRotation = rotation;
        const startTime = performance.now();
        const spinDuration = 4000;
        const friction = 0.99;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function frame(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / spinDuration, 1);
            const eased = easeOutCubic(t);

            rotation = startRotation + totalRotation * eased;
            drawWheel();

            if (t < 1) {
                animationFrame = requestAnimationFrame(frame);
            } else {
                rotation = normalizeAngle(rotation);
                drawWheel();

                const actualWinnerIndex = getWinnerIndex();

                isSpinning = false;
                spinBtn.disabled = false;

                resolve(actualWinnerIndex);
            }
        }

        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(frame);
    });
}

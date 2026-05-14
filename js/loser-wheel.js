// Challenges for the Wheel of Losers
const CHALLENGES = [
    { id: 25, short: "Change un bout de vêtement", text: "Change un bout de vêtement avec la personne en face", category: "défi" },
    { id: 26, short: "Avale un oeuf cru", text: "Avale un oeuf cru", category: "défi" },
    { id: 27, short: "Belly shot", text: "La personne de ton choix te fait un belly shot", category: "défi" },
    { id: 28, short: "Shot mystère", text: "Drink un shot ! mystère", category: "défi" },
    { id: 29, short: "Texte ton cell", text: "Laisse les gens texter à une personne avec ton cell (pas le droit de suprimmer avant demain)", category: "défi" },
    { id: 30, short: "Sors deux minutes", text: "Sort dehors deux bonnes minutes ", category: "défi" },
    { id: 31, short: "Fouille ton cell", text: "Laisse les gens fouiller dans ton cell 2 bonnes minutes", category: "défi" },
    { id: 32, short: "Transfere ue gorgée", text: "Kiss ton partenaire en ayant une gorgée (Transfert la)", category: "défi" },
    { id: 33, short: "Tour de la bâtisse", text: "Fais un tour de la bâtisse. Pas le droit de mettre un manteau ou des bottes", category: "défi" },
    { id: 34, short: "Enlève un vêtement", text: "Enlève un bout de vêtement", category: "défi" },
    { id: 35, short: "15 push-up", text: "Fait 15 push-up (les filles ont le droit au genoux) 💪", category: "défi" },
    { id: 36, short: "Appel le dernier", text: "Appel le dernier numéro a qui tu as parlé. Pas le droit de racrocher avant 1 minutes (s'il répond pas passe au suivant)", category: "défi" },
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

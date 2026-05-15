/**
 * Loser Wheel System
 * Displays random challenges for losers using the weighted wheel engine
 */

// Challenges for the Wheel of Losers
const CHALLENGES = [
    { short: "Boit en ta**ck", text: "Finis tout les verre des autres joueurs (pas les tiens)", category: "looser", weight: 1 },
    { short: "Petit snack", text: "Avale un oeuf cru avec la coquille ", category: "looser", weight: 1 },
    { short: "Aime tu les épices?", text: "Mange le truc le plus épicé de la maison", category: "looser", weight: 1 },
    { short: "Tapette ", text: "Rien tu t sauvé du défi, mais .... t fif en esti", category: "looser", weight: 0.2 },
    { short: "Mon pere y est riche en...", text: "Donne moi 20 pissse parceque anyway mon pere est riche en tabarnack", category: "looser", weight: 1 },
    { short: "Tequila heineken", text: "Tequila heineken pas le temps de niaiser, prend un shot(tequilla si possible) et une biere(heineken si possible)", category: "looser", weight: 1 },
];

let loserWheelEngine = null;
let loserIsSpinning = false;

/**
 * Get or create loser wheel engine
 */
function getLoserWheelEngine() {
    if (!loserWheelEngine) {
        const canvas = document.getElementById("wheel");
        if (canvas) {
            loserWheelEngine = new WheelEngine(canvas);
        }
    }
    return loserWheelEngine;
}

// Get the loser button
const loserButton = document.getElementById("loser-button");

// Add event listener for loser button
if (loserButton) {
    loserButton.addEventListener("click", spinLoserWheel);
}

/**
 * Spin the loser wheel
 * Displays a random punishment challenge
 */
async function spinLoserWheel() {
    if (loserIsSpinning) return;

    const engine = getLoserWheelEngine();
    if (!engine) {
        console.error('⚠ Loser wheel engine not initialized');
        return;
    }

    loserIsSpinning = true;

    // Prepare challenge entries with equal weight
    const challengeEntries = CHALLENGES.map(c => new WeightedEntry(c.short, c.weight));

    // Update wheel with challenges
    engine.updateEntries(challengeEntries);
    engine.draw();

    // Show wheel modal
    showWheel();

    // Spin the wheel
    const winnerEntry = await engine.spin();

    // Find the selected challenge
    const selectedChallenge = CHALLENGES.find(c => c.short === (winnerEntry ? winnerEntry.name : null));

    // After a short delay, hide the wheel and show the challenge
    setTimeout(() => {
        hideWheel();

        if (selectedChallenge) {
            const cardDisplay = document.querySelector(".card-display");
            if (cardDisplay) {
                cardDisplay.className = "card-display category-" + selectedChallenge.category;
                cardDisplay.innerHTML = `
                    <div class="card-category">${selectedChallenge.category[0].toUpperCase() + selectedChallenge.category.slice(1)}</div>
                    <div class="card-text">${selectedChallenge.text}</div>
                `;
            }
        }

        loserIsSpinning = false;
    }, 2000);
}

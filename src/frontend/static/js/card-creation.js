const categories = [
    { key: 'boisson', label: 'BOISSON' },
    { key: 'divers', label: 'DIVERS' },
    { key: 'défi', label: 'DÉFI' },
    { key: 'parler', label: 'PARLER' },
    { key: 'roulette', label: 'ROULETTE' }
];

const stepNumber = document.getElementById('step-number');
const stepDots = document.getElementById('step-dots');
const cardEditor = document.getElementById('card-editor');
const cardCategoryLabel = document.getElementById('card-category-label');
const cardTextInput = document.getElementById('card-text-input');
const nextCardButton = document.getElementById('next-card-button');
const prevCardButton = document.getElementById('prev-card-button');
const completionMessage = document.getElementById('completion-message');
const lobbyId = window.location.pathname.split("/").pop();

let currentIndex = 0;
const cardContents = ['', '', '', '', ''];
let isSubmitted = false;
let playersDone = [];
let playersNotDone = [];

function renderSubmissionStatus(data) {
    playersDone = Array.isArray(data.players_done) ? data.players_done : [];
    playersNotDone = Array.isArray(data.players_not_done) ? data.players_not_done : [];
    isSubmitted = true;

    stepNumber.textContent = '—';
    stepDots.innerHTML = '';
    nextCardButton.disabled = true;
    prevCardButton.disabled = true;
    cardTextInput.disabled = true;
    completionMessage.textContent = 'Toutes les cartes sont prêtes';

    cardEditor.className = 'card-creation-card category-boisson submitted';
    cardEditor.innerHTML = `
        <div class="card-status-header">Progression des joueurs</div>
        <div class="card-status-list">
            ${playersDone.map((name) => `
                <div class="player-status-row done">
                    <span class="player-status-indicator"></span>
                    <span class="player-status-name">${name}</span>
                    <span class="player-status-tag">Fini</span>
                </div>
            `).join('')}
            ${playersNotDone.map((name) => `
                <div class="player-status-row pending">
                    <span class="player-status-indicator"></span>
                    <span class="player-status-name">${name}</span>
                    <span class="player-status-tag">En cours</span>
                </div>
            `).join('')}
        </div>
    `;
}

socket.on('cards_submitted', (data) => {
    renderSubmissionStatus(data);
});

socket.on("game_started", (data) => {
    window.location.href = "/lobby/game/" + data.room;
});

function renderSteps() {
    stepDots.innerHTML = '';
    categories.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'step-dot' + (index === currentIndex ? ' active' : '');
        stepDots.appendChild(dot);
    });
}

function updateCardEditor() {
    const category = categories[currentIndex];
    stepNumber.textContent = currentIndex + 1;
    cardCategoryLabel.textContent = category.label;
    cardEditor.className = `card-creation-card category-${category.key} entered`;
    cardTextInput.value = cardContents[currentIndex];
    nextCardButton.textContent = currentIndex < categories.length - 1 ? 'Suivant' : 'Terminé';
    prevCardButton.disabled = currentIndex === 0;
    nextCardButton.disabled = false;
    completionMessage.textContent = '';
    setTimeout(() => cardTextInput.focus({ preventScroll: true }), 50);
}

function moveToNextCard() {
    if (isSubmitted) return;

    cardContents[currentIndex] = cardTextInput.value;
    if (currentIndex < categories.length - 1) {
        currentIndex += 1;
        renderSteps();
        updateCardEditor();
    } else {
        const cards = categories.map((category, index) => ({
            text: cardContents[index],
            category: category.key
        }));
        socket.emit('submit_cards', { room: lobbyId, player_id: sessionStorage.getItem("playerId"), cards: cards });
        console.log('Submitted cards:', cards);
        nextCardButton.disabled = true;
        prevCardButton.disabled = true;
        cardTextInput.disabled = true;
        completionMessage.textContent = 'Toutes les cartes sont prêtes';
        nextCardButton.disabled = true;
    }
}

function moveToPreviousCard() {
    if (isSubmitted) return;

    cardContents[currentIndex] = cardTextInput.value;
    if (currentIndex > 0) {
        currentIndex -= 1;
        renderSteps();
        updateCardEditor();
    }
}

nextCardButton.addEventListener('click', () => {
    if (cardTextInput.value.trim() === '') {
        completionMessage.textContent = 'Carte invalide. Veuillez entrer un texte pour la carte.';
    } 
    else {
        moveToNextCard();
    }
});

if (prevCardButton) prevCardButton.addEventListener('click', moveToPreviousCard);
cardTextInput.addEventListener('input', () => {
    if (completionMessage.textContent) {
        completionMessage.textContent = '';
    }
});

window.addEventListener('load', () => {
    renderSteps();
    updateCardEditor();
});

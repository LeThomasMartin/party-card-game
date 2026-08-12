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
const completionMessage = document.getElementById('completion-message');

let currentIndex = 0;
const cardContents = ['', '', '', '', ''];

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
    nextCardButton.disabled = false;
    completionMessage.textContent = '';
    setTimeout(() => cardTextInput.focus({ preventScroll: true }), 50);
}

function moveToNextCard() {
    cardContents[currentIndex] = cardTextInput.value;
    if (currentIndex < categories.length - 1) {
        currentIndex += 1;
        renderSteps();
        updateCardEditor();
    } else {
        completionMessage.textContent = 'Toutes les cartes sont prêtes';
        nextCardButton.disabled = true;
    }
}

nextCardButton.addEventListener('click', moveToNextCard);
cardTextInput.addEventListener('input', () => {
    if (completionMessage.textContent) {
        completionMessage.textContent = '';
    }
});

window.addEventListener('load', () => {
    renderSteps();
    updateCardEditor();
});
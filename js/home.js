// Logique de la page d'accueil

const playersNb = document.getElementById("amountplayers");
const form = document.querySelector(".form");
const decreaseBtn = document.getElementById("decrease-players");
const increaseBtn = document.getElementById("increase-players");

// Initialiser lors du chargement de la page
window.addEventListener("load", () => {
    if (!playersNb.value || playersNb.value < 1) {
        playersNb.value = 1;
        adaptNames(1);
    }
});

form.addEventListener("submit", (e) => {
    setNames(e);
});

playersNb.addEventListener("input", () => {
    adaptNames(parseInt(playersNb.value) || 0);
});

// Boutons + et -
decreaseBtn.addEventListener("click", decreasePlayer);
increaseBtn.addEventListener("click", increasePlayer);

function setNames(e) {
    e.preventDefault();
    
    const names = [];
    const usedNames = new Set();
    let isValid = true;

    // Collecter les noms et vérifier les validations
    for (let i = 0; i < playersNb.value; i++) {
        const input = document.getElementById("name" + i);
        const name = input.value.trim();

        // Vérifier que le nom n'est pas vide
        if (!name) {
            input.style.borderColor = "red";
            isValid = false;
            continue;
        }

        // Vérifier que le nom n'est pas un doublon
        if (usedNames.has(name.toLowerCase())) {
            input.style.borderColor = "#ff9999";
            isValid = false;
            continue;
        }

        input.style.borderColor = "#e0e0e0";
        usedNames.add(name.toLowerCase());
        names.push(name);
    }

    // Si il y a des erreurs, ne pas continuer
    if (!isValid || names.length < playersNb.value) {
        alert("Merci de vérifier les noms : pas de vides et pas de doublons!");
        return;
    }

    // Sauvegarder les noms dans localStorage
    savePlayersToStorage(names);
    
    // Rediriger vers game.html
    window.location.href = "game.html";
}


function adaptNames(value) {
    const container = document.getElementById("players-names");
    
    // Ajouter les nouveaux champs nécessaires
    for (let i = 0; i < value; i++) {
        if (!document.getElementById("name" + i)) {
            const label = document.createElement("label");
            label.textContent = " Player " + (i + 1);
            
            const input = document.createElement("input");
            input.type = "text";
            input.id = "name" + i;
            input.required = true;
            input.placeholder = "Enter a crazy name";
            
            const br = document.createElement("br");
            
            container.appendChild(label);
            container.appendChild(input);
            container.appendChild(br);
        }
    }
    
    // Supprimer les champs au-delà du nombre requis
    let i = value;
    while(document.getElementById("name" + i)) {
        const input = document.getElementById("name" + i);
        const label = input.previousElementSibling;
        const br = input.nextElementSibling;
        
        if (label && label.tagName === 'LABEL') label.remove();
        input.remove();
        if (br && br.tagName === 'BR') br.remove();
        
        i++;
    }
}

function decreasePlayer() {
    if (playersNb.value > 1) {
        playersNb.value--;
        adaptNames(playersNb.value);
    }
}

function increasePlayer() {
    if (playersNb.value < 10) 
    if(playersNb.value < 10){
        playersNb.value++;
        adaptNames(playersNb.value);
    }
}
# Party-Card-Game 🎉

## Description

**Party-Card-Game** est un jeu de cartes amusant et interactif conçu pour les soirées en groupe. Le jeu propose une variété de défis, de questions et d'activités au sein de quatre catégories principales. Complètement développé en HTML, CSS et JavaScript, il fonctionne directement dans le navigateur sans dépendances externes.

## 🎮 Comment Jouer

### Étape 1 : Configuration du Jeu
1. Lancez le fichier `index.html` dans votre navigateur
2. Entrez le **nombre de joueurs** (1-10) en utilisant les boutons + et −
3. Remplissez les **noms des joueurs** avec des noms amusants et créatifs
4. Cliquez sur **"Start Playing"** pour commencer

### Étape 2 : Jeu en Action
1. Lors de chaque tour, cliquez sur **"Prochaine Carte"** pour tirer une nouvelle carte
2. Lisez le défi ou la question à voix haute et complétez-le selon les instructions
3. La prochaine personne tire une nouvelle carte
4. Continuez jusqu'à ce que vous ayez épuisé le deck (environ 75 cartes)
5. Cliquez sur **"Accueil"** pour revenir au menu et recommencer

## 📚 Catégories de Cartes

### 🍺 Boisson
- Défis impliquant de boire de l'alcool
- Ex: "Les gars boivent", "Drinking race !", "Gorgée générale !"

### 💬 Parler
- Questions provocatrices et amusantes
- Ex: "Quel est ton plus grand fantasme ?", "Raconte ta pire anecdote de sexe"

### 🏋️ Défi
- Défis physiques et personnels
- Ex: "Enlève un bout de vêtement", "Fait 15 push-up", "Appel le dernier numéro..."

### 🎲 Divers
- Activités de groupe et jeux de vote
- Ex: "Votons ! La personne qui déçoit le plus ses parents boit", "Tout le monde change de place"

## 📁 Structure du Projet

```
party-card-game/
├── index.html              # Page d'accueil - Configuration du jeu
├── game.html               # Page de jeu - Affichage des cartes
├── readme.md               # Ce fichier
├── css/
│   ├── style.css           # Styles principaux
│   └── animations.css      # Animations CSS détaillées
└── js/
    ├── home.js             # Logique de l'accueil (entrée des joueurs)
    ├── game.js             # Logique du jeu (pioche des cartes)
    └── utils.js            # Fonctions utilitaires (localStorage)
```

## 🛠️ Technologies Utilisées

- **HTML5** - Structure des pages
- **CSS3** - Mise en page et animations
- **JavaScript** - Logique du jeu et interactivité
- **LocalStorage** - Persistance des noms de joueurs

## 🚀 Installation & Utilisation

### Méthode 1 : Ouvrir directement
1. Téléchargez tous les fichiers du projet
2. Ouvrez le fichier `index.html` dans n'importe quel navigateur
3. C'est tout ! Aucune installation requise

### Méthode 2 : Serveur Local
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js / http-server
npx http-server

# Puis accédez à http://localhost:8000 dans votre navigateur
```

## 🎯 Fonctionnalités Principales

✅ Jeu de cartes avec ~75 défis différents  
✅ Système de gestion simplifié des joueurs  
✅ Interface responsive et conviviale  
✅ Pioche sans répétition pendant une partie  
✅ Sauvegarde des noms des joueurs en localStorage  
✅ Boutons d'ajustement du nombre de joueurs (+/−)  
✅ Système de validation des noms (pas de vides, pas de doublons)  
✅ Animations CSS fluides  

## ⚙️ Configurations Possibles

### Ajouter de nouvelles cartes
Modifiez le tableau `DECK` dans `js/game.js` :
```javascript
const DECK = [
    { text: "Mon nouveau défi", category: "boisson" },
    // ... autres cartes
];
```

Les catégories disponibles sont : `boisson`, `parler`, `défi`, `divers`

### Modifier le nombre de joueurs maximum
Dans `index.html`, changez l'attribut `max` :
```html
<input type="number" id="amountplayers" max="15"> <!-- Modifier 10 → 15 -->
```

## 📝 Notes

- Le jeu est conçu pour des adultes avec des questions et défis explicites
- Tous les défis sont en français
- Les noms des joueurs sont stockés localement et supprimés lorsqu'on quitte le jeu
- Le deck se réinitialise automatiquement, vous proposant de rebattre les cartes

## 🐛 Dépannage

**Les noms ne s'enregistrent pas ?**
- Vérifiez que JavaScript est activé dans votre navigateur
- Vérifiez que localStorage n'est pas désactivé

**Les cartes s'affichent mal ?**
- Assurez-vous que tous les fichiers CSS sont correctement chargés
- Rafraîchissez la page (Ctrl+Shift+R)

## 📄 Licence

Ce projet est libre d'utilisation à titre personnel.

---

**Amusez-vous bien ! 🎉🍾**
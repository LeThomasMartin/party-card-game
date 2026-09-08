# Party Card Game 🎉

Jeu de cartes multijoueur pour soirée, conçu pour jouer à plusieurs sur un même lobby, avec création de cartes, rotation des joueurs et roulette des perdants.

## Aperçu

Ce projet est une application web de type party game en Python avec Flask et Socket.IO. Les joueurs créent un lobby, s'inscrivent avec un pseudo, puis participent à une partie où l'hôte lance la session et chaque tour fait avancer le jeu.

Le jeu propose :
- la création d'un lobby partagé
- l'ajout de joueurs en temps réel
- la personnalisation des cartes par les participants
- le tirage aléatoire d'une carte dans le deck
- la gestion du tour actif entre les joueurs
- une roulette finale pour "le plus faible" ou le perdant du moment

## Fonctionnalités principales

- Lobby généré automatiquement avec un code unique
- Rejoindre un lobby en utilisant un pseudo
- Départ de partie par l'hôte du lobby
- Création collective de cartes avant le lancement
- Deck partagé et mélangé pendant la partie
- Rotation du joueur actif à chaque tour
- Affichage des cartes en direct sur la même salle
- Roulette de punition / élimination
- Interface web en HTML, CSS et JavaScript

## Stack technique

- Python
- Flask
- Flask-SocketIO
- JavaScript
- HTML / CSS

## Structure du projet

```text
party-card-game/
├── main.py                         # Point d'entrée de l'application
├── readme.md                      # Documentation du projet
├── src/
│   ├── backend/
│   │   ├── api.py                 # Routes API de création et gestion des lobbies
│   │   ├── app.py                 # Application Flask + Socket.IO
│   │   ├── data.py                # Cartes de base du jeu
│   │   ├── game.py                # Événements de jeu et logique du tour
│   │   ├── lobby.py               # Gestion des lobbies en mémoire
│   │   └── requirement.txt        # Dépendances Python
│   └── frontend/
│       ├── static/
│       │   ├── css/
│       │   ├── js/
│       │   └── sounds/
│       └── templates/
│           ├── cardCreation.html
│           ├── game.html
│           ├── index.html
│           └── lobby.html
└── .venv/                         # Environnement virtuel (si créé localement)
```

## Prérequis

- Python 3.9+
- Pip
- Navigateur web moderne

## Installation

1. Ouvrez un terminal à la racine du projet.
2. Créez un environnement virtuel :

```bash
python -m venv .venv
```

3. Activez l'environnement virtuel :

Sous Windows :
```bash
.venv\Scripts\activate
```

Sous macOS / Linux :
```bash
source .venv/bin/activate
```

4. Installez les dépendances :

```bash
pip install -r src/backend/requirement.txt flask-socketio
```

## Lancer le projet

Depuis la racine du projet :

```bash
python main.py
```

Ensuite ouvrez votre navigateur sur :

```text
http://localhost:5000
```

## Déroulement d'une partie

1. Un joueur crée un lobby depuis la page d'accueil.
2. Le serveur génère un code de lobby.
3. Les autres joueurs rejoignent avec leur pseudo et ce code.
4. L'hôte démarre la partie.
5. Les joueurs peuvent créer ou personnaliser des cartes.
6. Une fois la création terminée, la partie démarre.
7. Le joueur actif pioche une carte.
8. La carte est lue à voix haute et le jeu continue au tour suivant.
9. La roulette des faibles peut être déclenchée à tout moment pour l'épreuve finale.

## Cartes et catégories

Les cartes sont définies dans [src/backend/data.py](src/backend/data.py). Les catégories principales sont :

- boisson
- parler
- défi
- divers

Les cartes peuvent contenir des placeholders comme `[player]` et `[random]`, utilisés dynamiquement pendant la partie.

## Notes importantes

- Le projet est conçu pour un usage festif et adulte.
- Les messages et cartes peuvent contenir du contenu explicite.
- Les lobbies sont stockés en mémoire côté serveur, donc ils sont perdus si le serveur est arrêté.
- La logique réelle du jeu est gérée via des événements Socket.IO, pas uniquement via le front-end.

## Développement

Si vous souhaitez ajouter de nouvelles cartes, modifiez le tableau `deck` dans [src/backend/data.py](src/backend/data.py).

Si vous souhaitez modifier le comportement du jeu, les fichiers principaux à consulter sont :

- [src/backend/game.py](src/backend/game.py)
- [src/backend/lobby.py](src/backend/lobby.py)
- [src/backend/api.py](src/backend/api.py)
- [src/frontend/static/js](src/frontend/static/js)

## Licence

Ce projet est fourni à titre personnel et pour usage ludique. Aucune licence commerciale n'est définie dans le dépôt.

---

Amusez-vous bien et que la soirée soit mémorable ! 🍻

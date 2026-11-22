
const ROWS = 10;
const COLS = 5;
const SAFE = 4;
const TOTAL_SIMULATIONS = 10000;

let board = [];
let level = 0;
let active = false;
let selected = false;
let games = 0;
let wins = 0;
let losses = 0;
let stopped = 0;
let history = [];
let lostRow = -1;

const $ = id => document.getElementById(id);

// Génération du plateau : 4 pommes et 1 piège par ligne
function generateBoard() {
  return Array.from({ length: ROWS }, () => {
    const trap = Math.floor(Math.random() * COLS);
    return Array.from({ length: COLS }, (_, c) => c !== trap);
  });
}

// Démarrer une nouvelle partie
function newGame() {
  board = generateBoard();
  level = 0;
  lostRow = -1;
  active = true;
  selected = false;

  $("message").textContent =
    "Choisis une case pour trouver une pomme !";

  $("cashOut").disabled = true;
  render();
}

// Affichage du plateau
function render() {
  const grid = $("grid");
  grid.innerHTML = "";

  for (let r = ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < COLS; c++) {
      const btn = document.createElement("button");
      btn.className = "cell";

      const revealed = r < level || r === lostRow;

      if (revealed) {
        btn.textContent = board[r][c] ? "🍏" : "💣";
        btn.classList.add(board[r][c] ? "safe" : "trap");
        btn.disabled = true;
      } else if (r === level && active) {
        btn.textContent = "❔";
        btn.disabled = selected;
        btn.onclick = () => choose(c);
      } else {
        btn.textContent = "·";
        btn.disabled = true;
      }

      grid.appendChild(btn);
    }
  }

  $("level").textContent = `Niveau ${level} / ${ROWS}`;
}

// Choisir une case
function choose(col) {
  if (!active || selected) return;

  selected = true;

  if (!board[level][col]) {
    lostRow = level;
    finish(false);
    return;
  }

  level++;
  selected = false;

  if (level === ROWS) {
    finish(true);
    return;
  }

  $("message").textContent =
    "🍏 Bravo ! Pomme trouvée. Continue ou arrête la partie.";

  $("cashOut").disabled = false;
  render();
}

// Terminer une partie
function finish(won) {
  active = false;
  games++;

  if (won) {
    wins++;
    $("message").textContent =
      "🏆 Félicitations ! Tu as terminé les 10 niveaux.";
  } else {
    losses++;
    $("message").textContent =
      "💣 Piège ! Partie terminée.";
  }

  $("cashOut").disabled = true;

  const result = won ? "Victoire 🍏" : "Défaite 💣";
  history.unshift(`${result} — ${level}/10 niveaux`);

  history = history.slice(0, 30);

  updateStats();
  updateHistory();
  render();
}

// Arrêter volontairement une partie
function cashOut() {
  if (!active || level === 0) return;

  active = false;
  games++;
  stopped++;

  $("message").textContent =
    `Partie arrêtée volontairement — niveau atteint : ${level}/10.`;

  $("cashOut").disabled = true;

  history.unshift(
    `Arrêt volontaire — ${level}/10 niveaux`
  );

  history = history.slice(0, 30);

  updateStats();
  updateHistory();
  render();
}

// Mise à jour des statistiques
function updateStats() {
  $("games").textContent = games;
  $("wins").textContent = wins;
  $("losses").textContent = losses;

  const rate = games ? (wins / games * 100) : 0;
  $("rate").textContent = rate.toFixed(1) + "%";
}

// Mise à jour de l'historique
function updateHistory() {
  $("history").innerHTML = "";

  if (!history.length) {
    $("history").innerHTML =
      "<li>Aucune partie enregistrée.</li>";
    return;
  }

  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    $("history").appendChild(li);
  });
}

// Probabilités théoriques
function showProbabilities() {
  let html = "";

  for (let i = 1; i <= ROWS; i++) {
    const probability =
      Math.pow(SAFE / COLS, i) * 100;

    html += `
      <div class="prob-row">
        Niveau ${i} : <b>${probability.toFixed(2)}%</b>
        <div class="bar">
          <div class="fill" style="width:${probability}%"></div>
        </div>
      </div>`;
  }

  $("probabilities").innerHTML = html;
}

// Simulation de 10 000 parties indépendantes
function simulate() {
  const total = TOTAL_SIMULATIONS;

  let completed = 0;
  let reached = Array(ROWS).fill(0);

  for (let i = 0; i < total; i++) {
    let survived = true;

    for (let r = 0; r < ROWS; r++) {
      if (Math.random() >= SAFE / COLS) {
        survived = false;
        break;
      }

      reached[r]++;
    }

    if (survived) completed++;
  }

  const rate = completed / total * 100;

  $("simGames").textContent =
    total.toLocaleString("fr-FR");

  $("simRate").textContent =
    rate.toFixed(2) + "%";

  let html = "";

  for (let r = 0; r < ROWS; r++) {
    const percentage = reached[r] / total * 100;

    html += `
      <div class="chart-row">
        Niveau ${r + 1} : ${percentage.toFixed(2)}%
        <div class="bar">
          <div class="fill" style="width:${percentage}%"></div>
        </div>
      </div>`;
  }

  $("levelsChart").innerHTML = html;
}

// Connexion des boutons
$("newGame").addEventListener("click", newGame);
$("cashOut").addEventListener("click", cashOut);
$("simulate").addEventListener("click", simulate);

// Initialisation
showProbabilities();
newGame();

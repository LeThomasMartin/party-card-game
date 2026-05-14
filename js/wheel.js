const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const updateBtn = document.getElementById("updateBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const entriesInput = document.getElementById("entriesInput");
const removeWinnerCheckbox = document.getElementById("removeWinner");
const wheelModal = document.getElementById("wheelModal");


let names = getPlayersFromStorage();
let entries = [...names];
let rotation = 0;
let isSpinning = false;
let animationFrame = null;

const colors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"
];

function secureRandom() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
}

function secureRandomInt(max) {
  return Math.floor(secureRandom() * max);
}

// Recharge la roue à partir de la liste names, en excluant le joueur courant
function loadEntriesFromNames(excludeIndex = null) {
  entries = [...names];
  
  // Exclure le joueur courant si un index est fourni
  if (excludeIndex !== null && excludeIndex >= 0 && excludeIndex < entries.length) {
    entries.splice(excludeIndex, 1);
  }

  if (entriesInput) {
    entriesInput.value = entries.join("\n");
  }

  drawWheel();
}

function shuffleEntries() {
  for (let i = entries.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  // si tu veux que names reflète aussi le mélange
  //names = [...entries];

  if (entriesInput) {
    entriesInput.value = entries.join("\n");
  }

  drawWheel();
}

function drawWheel() {
  const { width, height } = canvas;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  ctx.clearRect(0, 0, width, height);

  if (entries.length === 0) {
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Aucune entrée", cx, cy);
    return;
  }

  const sliceAngle = (Math.PI * 2) / entries.length;

  for (let i = 0; i < entries.length; i++) {
    const start = rotation + i * sliceAngle;
    const end = start + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";

    const text = entries[i];
    const textRadius = radius - 50;
    ctx.fillText(text, textRadius, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 6;
  ctx.stroke();
}

function normalizeAngle(a) {
  const tau = Math.PI * 2;
  return ((a % tau) + tau) % tau;
}

function getWinnerIndex() {
  if (entries.length === 0) return -1;

  const tau = Math.PI * 2;
  const sliceAngle = tau / entries.length;
  const pointerAngle = 0;
  const relative = normalizeAngle(pointerAngle - rotation);

  return Math.floor(relative / sliceAngle) % entries.length;
}

function getWheelWinner() {
    loadEntriesFromNames(turn);

    return new Promise((resolve) => {
    if (isSpinning || entries.length < 2) {
      resolve(null);
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
    const startRotation = rotation;
    const startNormalized = normalizeAngle(startRotation);

    let delta = finalNormalized - startNormalized;
    if (delta < 0) delta += tau;

    const totalRotation = extraTurns * tau + delta;
    const duration = 5200 + secureRandomInt(1200);
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);

      rotation = startRotation + totalRotation * eased;
      drawWheel();

      if (t < 1) {
        animationFrame = requestAnimationFrame(frame);
      } else {
        rotation = normalizeAngle(rotation);
        drawWheel();

        const actualWinnerIndex = getWinnerIndex();
        const winner = entries[actualWinnerIndex];

        // Optionnel : retirer le gagnant de la liste
        /*if (removeWinnerCheckbox.checked) {
          names = names.filter(name => name !== winner);
          entries = [...names];

          if (entriesInput) {
            entriesInput.value = entries.join("\n");
          }

          setTimeout(() => {
            drawWheel();
          }, 300);
        }*/

        isSpinning = false;
        spinBtn.disabled = false;

        resolve(winner);
      }
    }

    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(frame);
  });
}

if (updateBtn) {
  updateBtn.addEventListener("click", loadEntriesFromNames);
}

if (shuffleBtn) {
  shuffleBtn.addEventListener("click", shuffleEntries);
}

spinBtn.addEventListener("click", async () => {

});

loadEntriesFromNames();

function showWheel() {
    wheelModal.classList.remove("hidden");
}

function hideWheel() {
    wheelModal.classList.add("hidden");
}

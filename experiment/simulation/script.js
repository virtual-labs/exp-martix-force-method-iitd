let currentValues = {};
let results = {};
const failedAttempts = {};

const scenes = [
  "canvas0",
  "canvas1",
  "canvas2",
  "canvas3",
  "canvas4",
  "canvas5",
  "canvas6",
  "canvas7",
  "canvas8",
  "canvas9"
];

function showScene(index) {
  scenes.forEach((id, i) => {
    document.getElementById(id).style.visibility = i === index ? "visible" : "hidden";
  });
}

function readInputs() {
  const ids = ["L", "E", "I", "P1", "P2", "P3"];
  const values = {};
  ids.forEach(id => values[id] = Number(document.getElementById(id).value));
  return values;
}

function isValidInput(values) {
  return Number.isFinite(values.L) && Number.isFinite(values.E) && Number.isFinite(values.I) &&
    Number.isFinite(values.P1) && Number.isFinite(values.P2) && Number.isFinite(values.P3) &&
    values.L > 0 && values.E > 0 && values.I > 0;
}

function calculate(values) {
  const L = values.L;
  const E = values.E;
  const I = values.I;
  const P1 = values.P1;
  const P2 = values.P2;
  const P3 = values.P3;
  const den = 6 * E * I;
  const k = L / den;
  return {
    k,
    b11: L,
    b12: 2 * L,
    b22: 0,
    b33: 1,
    f11: k * 2 * L * L,
    f12: k * 5 * L * L,
    f23: k * 12 * L,
    f33: k * 12,
    u1: (2 * Math.pow(L, 3) * P1 + 5 * Math.pow(L, 3) * P2 + 3 * Math.pow(L, 2) * P3) / den,
    u2: (5 * Math.pow(L, 3) * P1 + 16 * Math.pow(L, 3) * P2 + 12 * Math.pow(L, 2) * P3) / den,
    u3: (3 * Math.pow(L, 2) * P1 + 12 * Math.pow(L, 2) * P2 + 12 * L * P3) / den
  };
}

function fmt(value) {
  if (!Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 0.01 || abs >= 100000000)) return value.toExponential(2);
  return Number(value.toFixed(2)).toString();
}

function closeEnough(actual, expected) {
  if (!Number.isFinite(actual)) return false;
  const tolerance = Math.max(Math.abs(expected) * 0.02, 1e-12);
  return Math.abs(actual - expected) <= tolerance;
}

function showOutput(id, text, ok) {
  const out = document.getElementById(`out-${id}`);
  out.innerHTML = text;
  out.classList.toggle("warning", !ok);
}

function missingFields(fields) {
  return fields.filter(({ id }) => document.getElementById(id).value.trim() === "");
}

function showMissingFields(id, fields) {
  const missing = missingFields(fields);
  if (missing.length === 0) return false;
  showOutput(id, `Please fill all fields: <strong>${missing.map(field => field.label).join(", ")}</strong>.`, false);
  return true;
}

function fieldsExceedTwoDecimals(fields) {
  return fields.filter(({ id }) => {
    const value = document.getElementById(id).value.trim();
    return !/^[+-]?\d+(?:\.\d{0,2})?(?:e[+-]?\d+)?$/i.test(value);
  });
}

function showPrecisionError(id, fields) {
  const invalid = fieldsExceedTwoDecimals(fields);
  if (invalid.length === 0) return false;
  showOutput(id, `Use numbers with no more than <strong>two decimal places</strong>: ${invalid.map(field => field.label).join(", ")}.`, false);
  return true;
}

function hideCalculateButton(action) {
  const button = document.querySelector(`.calc-btn[data-check="${action}"]`);
  if (button) button.style.display = "none";
}

function resetAttempts(id) {
  failedAttempts[id] = 0;
}

function resetAllAttempts() {
  Object.keys(failedAttempts).forEach(id => delete failedAttempts[id]);
}

function feedbackForRetry(id, firstSuggestion, exactAnswer) {
  failedAttempts[id] = (failedAttempts[id] || 0) + 1;
  if (failedAttempts[id] === 1) {
    return `<strong>Suggestion 1:</strong> ${firstSuggestion}`;
  }
  return `<strong>Suggestion 2 - exact answer:</strong> ${exactAnswer}`;
}

function clearLaterOutputs() {
  document.querySelectorAll(".output").forEach(output => output.textContent = "");
  document.querySelectorAll(".next-hand").forEach(button => button.style.visibility = "hidden");
}

function revealNext(id) {
  document.getElementById(id).style.visibility = "visible";
}

function checkBOrder() {
  const fields = [
    { id: "bRows", label: "Rows of [b]" },
    { id: "bCols", label: "Columns of [b]" }
  ];
  if (showMissingFields("bOrder", fields) || showPrecisionError("bOrder", fields)) return;
  const rows = Number(document.getElementById("bRows").value);
  const cols = Number(document.getElementById("bCols").value);
  if (rows === 4 && cols === 3) {
    resetAttempts("bOrder");
    showOutput("bOrder", "Correct. {f} is 4x1, {P} is 3x1, so [b] is 4x3.", true);
    hideCalculateButton("bOrder");
    revealNext("next3");
  } else {
    showOutput("bOrder", feedbackForRetry(
      "bOrder",
      "Count the internal force terms for rows and the applied loads P1, P2, P3 for columns.",
      "Enter <strong>Rows = 4</strong> and <strong>Columns = 3</strong>.<br>{f} = [b]{P}; therefore [b] = (4x1)/(3x1) = <strong>4x3</strong>."
    ), false);
  }
}

function checkKValue() {
  const fields = [{ id: "kValue", label: "k" }];
  if (showMissingFields("kValue", fields) || showPrecisionError("kValue", fields)) return;
  const actual = Number(document.getElementById("kValue").value);
  if (closeEnough(actual, results.k)) {
    resetAttempts("kValue");
    showOutput("kValue", `Correct. k = L/(6EI) = ${fmt(results.k)}.`, true);
    hideCalculateButton("kValue");
    revealNext("next4");
  } else {
    showOutput("kValue", feedbackForRetry(
      "kValue",
      "Divide L by the product 6 x E x I.",
      `Enter <strong>${fmt(results.k)}</strong>.<br>k = L/(6EI) = ${fmt(currentValues.L)}/(6 x ${fmt(currentValues.E)} x ${fmt(currentValues.I)}) = <strong>${fmt(results.k)}</strong>.`
    ), false);
  }
}

function checkBTerms() {
  const fields = [
    { id: "b11", label: "b11" },
    { id: "b12", label: "b12" },
    { id: "b22", label: "b22" },
    { id: "b33", label: "b33" }
  ];
  if (showMissingFields("bTerms", fields) || showPrecisionError("bTerms", fields)) return;
  const checks = [
    ["b11", results.b11],
    ["b12", results.b12],
    ["b22", results.b22],
    ["b33", results.b33]
  ];
  const ok = checks.every(([id, expected]) => closeEnough(Number(document.getElementById(id).value), expected));
  if (ok) {
    resetAttempts("bTerms");
    showOutput("bTerms", `Correct. b11=${fmt(results.b11)}, b12=${fmt(results.b12)}, b22=0, b33=1.`, true);
    hideCalculateButton("bTerms");
    revealNext("next5");
  } else {
    showOutput("bTerms", feedbackForRetry(
      "bTerms",
      "Use the displayed [b] matrix: b11 = L, b12 = 2L, b22 = 0, and b33 = 1.",
      `Enter <strong>b11=${fmt(results.b11)}, b12=${fmt(results.b12)}, b22=0, b33=1</strong>.<br>b11 = L = ${fmt(currentValues.L)}; b12 = 2L = 2 x ${fmt(currentValues.L)} = ${fmt(results.b12)}; b22 = 0; b33 = 1.`
    ), false);
  }
}

function checkFtsTerms() {
  const fields = [
    { id: "f11", label: "F11" },
    { id: "f12", label: "F12" },
    { id: "f23", label: "F23" },
    { id: "f33", label: "F33" }
  ];
  if (showMissingFields("ftsTerms", fields) || showPrecisionError("ftsTerms", fields)) return;
  const checks = [
    ["f11", results.f11],
    ["f12", results.f12],
    ["f23", results.f23],
    ["f33", results.f33]
  ];
  const ok = checks.every(([id, expected]) => closeEnough(Number(document.getElementById(id).value), expected));
  if (ok) {
    resetAttempts("ftsTerms");
    showOutput("ftsTerms", `Correct. F11=${fmt(results.f11)}, F12=${fmt(results.f12)}, F23=${fmt(results.f23)}, F33=${fmt(results.f33)}.`, true);
    hideCalculateButton("ftsTerms");
    revealNext("next6");
  } else {
    showOutput("ftsTerms", feedbackForRetry(
      "ftsTerms",
      "First calculate k = L/(6EI), then multiply k by the corresponding matrix coefficient.",
      `Enter <strong>F11=${fmt(results.f11)}, F12=${fmt(results.f12)}, F23=${fmt(results.f23)}, F33=${fmt(results.f33)}</strong>.<br>F11 = ${fmt(results.k)} x 2 x ${fmt(currentValues.L)}^2 = ${fmt(results.f11)}; F12 = ${fmt(results.k)} x 5 x ${fmt(currentValues.L)}^2 = ${fmt(results.f12)};<br>F23 = ${fmt(results.k)} x 12 x ${fmt(currentValues.L)} = ${fmt(results.f23)}; F33 = ${fmt(results.k)} x 12 = ${fmt(results.f33)}.`
    ), false);
  }
}

function checkU1() {
  const fields = [{ id: "u1", label: "u1" }];
  if (showMissingFields("u1", fields) || showPrecisionError("u1", fields)) return;
  const actual = Number(document.getElementById("u1").value);
  if (closeEnough(actual, results.u1)) {
    resetAttempts("u1");
    showOutput("u1", `Correct. u1 = ${fmt(results.u1)}.`, true);
    hideCalculateButton("u1");
    revealNext("next7");
  } else {
    showOutput("u1", feedbackForRetry(
      "u1",
      "Multiply the first row of [F]TS by the load vector {P}.",
      `Enter <strong>${fmt(results.u1)}</strong>.<br>u1 = [2L^3P1 + 5L^3P2 + 3L^2P3]/(6EI)<br>= [2 x ${fmt(currentValues.L)}^3 x ${fmt(currentValues.P1)} + 5 x ${fmt(currentValues.L)}^3 x ${fmt(currentValues.P2)} + 3 x ${fmt(currentValues.L)}^2 x ${fmt(currentValues.P3)}]/(6 x ${fmt(currentValues.E)} x ${fmt(currentValues.I)}) = <strong>${fmt(results.u1)}</strong>.`
    ), false);
  }
}

function checkU23() {
  const fields = [
    { id: "u2", label: "u2" },
    { id: "u3", label: "u3" }
  ];
  if (showMissingFields("u23", fields) || showPrecisionError("u23", fields)) return;
  const u2 = Number(document.getElementById("u2").value);
  const u3 = Number(document.getElementById("u3").value);
  if (closeEnough(u2, results.u2) && closeEnough(u3, results.u3)) {
    resetAttempts("u23");
    showOutput("u23", `Correct. u2 = ${fmt(results.u2)}, u3 = ${fmt(results.u3)}.`, true);
    hideCalculateButton("u23");
    drawBeam();
    revealNext("next8");
  } else {
    showOutput("u23", feedbackForRetry(
      "u23",
      "Use row 2 for u2 and row 3 for u3, then divide each result by 6EI.",
      `Enter <strong>u2=${fmt(results.u2)}</strong> and <strong>u3=${fmt(results.u3)}</strong>.<br>u2 = [5 x ${fmt(currentValues.L)}^3 x ${fmt(currentValues.P1)} + 16 x ${fmt(currentValues.L)}^3 x ${fmt(currentValues.P2)} + 12 x ${fmt(currentValues.L)}^2 x ${fmt(currentValues.P3)}]/(6 x ${fmt(currentValues.E)} x ${fmt(currentValues.I)}) = <strong>${fmt(results.u2)}</strong>.<br>u3 = [3 x ${fmt(currentValues.L)}^2 x ${fmt(currentValues.P1)} + 12 x ${fmt(currentValues.L)}^2 x ${fmt(currentValues.P2)} + 12 x ${fmt(currentValues.L)} x ${fmt(currentValues.P3)}]/(6 x ${fmt(currentValues.E)} x ${fmt(currentValues.I)}) = <strong>${fmt(results.u3)}</strong>.`
    ), false);
  }
}

function drawBeam() {
  const canvas = document.getElementById("beamCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const y = 92;
  const x0 = 35;
  const x1 = 180;
  const x2 = 325;

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x0, y - 38);
  ctx.lineTo(x0, y + 38);
  ctx.stroke();
  for (let i = -34; i <= 34; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x0, y + i);
    ctx.lineTo(x0 - 18, y + i + 12);
    ctx.stroke();
  }

  drawBox(ctx, 92, y - 28, "1");
  drawBox(ctx, 235, y - 28, "2");
  drawArrow(ctx, x1, y - 72, y - 12, "P1");
  drawArrow(ctx, x2, y - 72, y - 12, "P2");
  ctx.fillStyle = "#2150a0";
  ctx.font = "13px Verdana";
  ctx.fillText("u1=" + fmt(results.u1), 42, 155);
  ctx.fillText("u2=" + fmt(results.u2), 147, 155);
  ctx.fillText("u3=" + fmt(results.u3), 252, 155);
}

function drawBox(ctx, x, y, text) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#111";
  ctx.strokeRect(x, y, 44, 22);
  ctx.fillStyle = "#111";
  ctx.font = "13px Verdana";
  ctx.fillText(text, x + 17, y + 15);
}

function drawArrow(ctx, x, y1, y2, text) {
  ctx.strokeStyle = "#b52626";
  ctx.fillStyle = "#b52626";
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6, y2 - 9);
  ctx.lineTo(x, y2);
  ctx.lineTo(x + 6, y2 - 9);
  ctx.fill();
  ctx.fillText(text, x + 7, y1 + 12);
}

function showFinal() {
  document.getElementById("finalValues").innerHTML = `
    <div class="matrix-equation final-vector">
      <strong>{u} =</strong>
      <span class="matrix matrix-1" aria-label="Final displacement vector">
        <span>${fmt(results.u1)}</span>
        <span>${fmt(results.u2)}</span>
        <span>${fmt(results.u3)}</span>
      </span>
    </div>
  `;
  showScene(9);
}

document.getElementById("startBtn").addEventListener("click", () => showScene(1));

document.getElementById("bringBtn").addEventListener("click", () => {
  document.getElementById("figureGuide").style.visibility = "hidden";
  document.getElementById("bringBtn").style.display = "none";
  document.querySelector("#canvas1 .arrow-inline").style.display = "none";
  ["loadedSpecimen", "releasedSpecimen", "flexSpecimen"].forEach(id => {
    document.getElementById(id).style.visibility = "visible";
  });
  ["loadedCaption", "releasedCaption", "flexCaption"].forEach(id => {
    document.getElementById(id).style.visibility = "visible";
  });
  document.getElementById("loadedSpecimen").classList.add("move-loaded");
  document.getElementById("releasedSpecimen").classList.add("move-released");
  document.getElementById("flexSpecimen").classList.add("move-flex");
  setTimeout(() => revealNext("toInputBtn"), 2000);
});

document.getElementById("toInputBtn").addEventListener("click", () => showScene(2));

document.getElementById("saveInputBtn").addEventListener("click", () => {
  const values = readInputs();
  const out = document.getElementById("inputOutput");
  const inputFields = [
    { id: "L", label: "L" },
    { id: "E", label: "E" },
    { id: "I", label: "I" },
    { id: "P1", label: "P1" },
    { id: "P2", label: "P2" },
    { id: "P3", label: "P3" }
  ];
  const missing = missingFields(inputFields);
  if (missing.length > 0) {
    out.innerHTML = `Please fill all fields: <strong>${missing.map(field => field.label).join(", ")}</strong>.`;
    out.classList.add("warning");
    out.style.display = "block";
    return;
  }
  const precisionErrors = fieldsExceedTwoDecimals(inputFields);
  if (precisionErrors.length > 0) {
    out.innerHTML = `Use numbers with no more than <strong>two decimal places</strong>: ${precisionErrors.map(field => field.label).join(", ")}.`;
    out.classList.add("warning");
    out.style.display = "block";
    return;
  }
  if (!isValidInput(values)) {
    out.innerHTML = feedbackForRetry(
      "inputValues",
      "Enter a positive number for L, E and I. P1, P2 and P3 may be zero.",
      "Use these valid example values: <strong>L=2, E=200000, I=50000000, P1=1, P2=1, P3=1</strong>.<br>L, E and I must be positive because k = L/(6EI), so the denominator 6EI cannot be zero."
    );
    out.classList.add("warning");
    out.style.display = "block";
    return;
  }
  currentValues = values;
  results = calculate(values);
  resetAllAttempts();
  clearLaterOutputs();
  out.textContent = "Values accepted. Continue to matrix order.";
  out.classList.remove("warning");
  document.getElementById("saveInputBtn").style.display = "none";
  revealNext("next2");
});

document.getElementById("next2").addEventListener("click", () => showScene(3));
document.getElementById("next3").addEventListener("click", () => showScene(4));
document.getElementById("next4").addEventListener("click", () => showScene(5));
document.getElementById("next5").addEventListener("click", () => showScene(6));
document.getElementById("next6").addEventListener("click", () => showScene(7));
document.getElementById("next7").addEventListener("click", () => showScene(8));
document.getElementById("next8").addEventListener("click", showFinal);
document.getElementById("restartBtn").addEventListener("click", () => location.reload());

document.querySelectorAll(".calc-btn").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.check;
    if (action === "bOrder") checkBOrder();
    if (action === "kValue") checkKValue();
    if (action === "bTerms") checkBTerms();
    if (action === "ftsTerms") checkFtsTerms();
    if (action === "u1") checkU1();
    if (action === "u23") checkU23();
  });
});

showScene(0);

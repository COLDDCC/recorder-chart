/* ==================================================================
   INTERACTIVE CHART — handles interaction only.

   The 28-note keyboard and the printable sheet are pre-rendered into
   the static HTML at build time (build.js + fingering-data.js), so
   the fingerings are visible to crawlers and no-JS visitors. This
   file only wires up clicks, sound, the C/F relabel switch and the
   report link.

   Fingering data lives in fingering-data.js (loaded first), which is
   the single source of truth for both the build and the runtime.
   ================================================================== */
var DATA = window.RecorderData;

/* P0-1 — real address goes here once the domain/email is decided. */
var CONTACT = "hello@example.com";

var DEFAULT_F = document.body.dataset.instrument === "F";

/* C/F choice is remembered per visitor, so a user who relabels the
   soprano chart to alto keeps that choice on the other pages. */
var SAVED = null;
try { SAVED = window.localStorage ? window.localStorage.getItem("rc-instrument") : null; } catch (e) {}

var inF = (SAVED === "F") || (SAVED !== "C" && DEFAULT_F);
var current = 0, audio = null;

/* Written-pitch helpers. Soprano/tenor (C) base = 72 (C5);
   alto/bass (F) base = 65 (F4). */
var BASE = function () { return inF ? 65 : 72; };
var midiOf = function (i) { return BASE() + i; };
var nameOf = function (i) { return DATA.noteInfo(i, BASE()).name; };
var octOf  = function (i) { return DATA.noteInfo(i, BASE()).octave; };
var freqOf = function (i) { return DATA.freqOf(midiOf(i)); };

/* ---------- drawing: big interactive recorder ---------- */
function bigSVG(H, bell){
  var o = [];
  var f = v => v === 1 ? "var(--ink)" : (v === 0 ? "#fff" : "url(#half)");
  var sc = v => v === 1 ? "var(--ink)" : "var(--ink-soft)";
  var sw = v => v === 1 ? "2.1" : "1.4";
  o.push('<defs><linearGradient id="half" x1="0" y1="0" x2="1" y2="0">'
    + '<stop offset="50%" stop-color="var(--ink)"/><stop offset="50%" stop-color="#fff"/></linearGradient></defs>');
  o.push('<rect x="6" y="34" width="26" height="118" rx="13" fill="#fff" stroke="var(--rule)" stroke-width="1.5"/>');
  o.push('<text x="19" y="26" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--ink-soft)">BACK</text>');
  o.push('<circle cx="19" cy="64" r="7.5" fill="' + f(H[0]) + '" stroke="' + sc(H[0]) + '" stroke-width="' + sw(H[0]) + '"/>');
  o.push('<text x="19" y="86" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--ink-soft)">0</text>');
  o.push('<path d="M56 8 h28 a8 8 0 0 1 8 8 v250 a12 12 0 0 0 12 12 v6 h-68 v-6 a12 12 0 0 0 12 -12 v-250 a8 8 0 0 1 8 -8 z"'
    + ' fill="#fff" stroke="var(--ink)" stroke-width="1.8" stroke-linejoin="round"/>');
  o.push('<rect x="63" y="34" width="14" height="11" rx="1.5" fill="var(--ink)"/>');
  o.push('<line x1="56" y1="52" x2="84" y2="52" stroke="var(--rule)" stroke-width="1.5"/>');
  o.push('<text x="104" y="20" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--ink-soft)">FRONT</text>');
  var y = [74,98,122,152,176,204,236];
  for(var i = 1; i <= 7; i++){
    var yy = y[i-1], v = H[i];
    if(i <= 5){
      o.push('<circle cx="70" cy="' + yy + '" r="8" fill="' + f(v) + '" stroke="' + sc(v) + '" stroke-width="' + sw(v) + '"/>');
    }else{
      o.push('<circle cx="64" cy="' + yy + '" r="5.5" fill="' + (v === 1 ? "var(--ink)" : "#fff") + '" stroke="' + (v === 1 ? "var(--ink)" : "var(--ink-soft)") + '" stroke-width="' + (v === 1 ? "1.8" : "1.3") + '"/>');
      o.push('<circle cx="76" cy="' + yy + '" r="5.5" fill="' + (v === 0 ? "#fff" : "var(--ink)") + '" stroke="' + (v === 0 ? "var(--ink-soft)" : "var(--ink)") + '" stroke-width="' + (v === 0 ? "1.3" : "1.8") + '"/>');
    }
    o.push('<text x="99" y="' + (yy + 3.5) + '" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="var(--ink-soft)">' + i + '</text>');
  }
  if(bell){
    o.push('<ellipse cx="70" cy="279" rx="13" ry="4.5" fill="var(--ink)"/>');
    o.push('<text x="70" y="301" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--ink-soft)">cover bell</text>');
  }
  o.push('<line x1="44" y1="68" x2="44" y2="128" stroke="var(--mimeo)" stroke-width="2"/>');
  o.push('<text x="40" y="102" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--mimeo)">L</text>');
  o.push('<line x1="44" y1="146" x2="44" y2="242" stroke="var(--pencil)" stroke-width="2"/>');
  o.push('<text x="40" y="196" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--pencil)">R</text>');
  return o.join("");
}

/* ---------- sound ---------- */
function tone(freq, when, dur){
  if(!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  var t = when || audio.currentTime, d = dur || 0.5;
  var osc = audio.createOscillator(), gain = audio.createGain(), lp = audio.createBiquadFilter();
  osc.type = "triangle"; osc.frequency.value = freq;
  lp.type = "lowpass"; lp.frequency.value = freq * 3.2;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
  gain.gain.setValueAtTime(0.12, t + d - 0.09);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
  osc.connect(lp); lp.connect(gain); gain.connect(audio.destination);
  osc.start(t); osc.stop(t + d + 0.02);
}

/* ---------- interaction ---------- */
var announcer = (function(){
  var el = document.getElementById("announcer");
  return function(msg){ if(msg && el) el.textContent = msg; };
})();

function select(i, play){
  current = i;
  var n = DATA.NOTES[i], label = nameOf(i) + octOf(i);
  document.getElementById("noteName").innerHTML = nameOf(i) + "<sup>" + octOf(i) + "</sup>";
  document.getElementById("noteMeta").textContent = n.m;
  document.getElementById("bigRecorder").innerHTML = "<title>Fingering for " + label + "</title>" + bigSVG(n.h, n.bell);
  document.getElementById("reportLink").href =
    "mailto:" + CONTACT + "?subject=" + encodeURIComponent("Fingering issue: " + label + (inF ? " (alto/bass)" : " (soprano/tenor)")) +
    "&body=" + encodeURIComponent("The fingering shown for " + label + " looks wrong to me because:\n\n");
  document.querySelectorAll(".key").forEach(k => k.setAttribute("aria-pressed", k.dataset.i == i ? "true" : "false"));
  if(play){ tone(freqOf(i)); announcer(label + " — " + n.m); }
}

function attachKeys(){
  document.querySelectorAll(".key").forEach(k => {
    if(k._bound) return;
    k._bound = true;
    k.addEventListener("click", function(){ select(+k.dataset.i, true); });
  });
}

/* Rebuilds are only needed after a C/F relabel switch; the initial
   markup is already pre-rendered in the HTML. */
function buildKeys(){
  [1,2,3].forEach(r => { document.getElementById("row" + r).innerHTML = DATA.keysForRow(r, BASE()); });
  attachKeys();
}
function buildSheet(){
  [1,2,3].forEach(r => { document.getElementById("g" + r).innerHTML = DATA.cellsForGrid(r, BASE()); });
}

function setInstrument(f, announce){
  inF = f;
  try { window.localStorage.setItem("rc-instrument", f ? "F" : "C"); } catch (e) {}
  document.getElementById("btnC").setAttribute("aria-pressed", String(!f));
  document.getElementById("btnF").setAttribute("aria-pressed", String(f));
  var label = f ? "Alto and bass recorders" : "Soprano and tenor recorders";
  document.getElementById("eyebrow").textContent =
    (f ? "Alto & bass recorder · Baroque fingering" : "Soprano recorder · Baroque fingering");
  if (announce !== false) announcer("Now showing " + label + " — the whole chart has been relabeled.");
  buildKeys(); buildSheet(); select(current, false);
}

/* The interactive tool is only pre-rendered on the four chart pages.
   Printable-only pages (the PDF page) have no tool markup, so there
   is nothing to wire up there — this guard keeps chart.js from
   throwing on those pages. */
if (document.querySelector(".tool")) {

document.getElementById("btnC").addEventListener("click", function(){ setInstrument(false); });
document.getElementById("btnF").addEventListener("click", function(){ setInstrument(true); });

document.getElementById("btnScale").addEventListener("click", function(){
  if(!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  var t0 = audio.currentTime + 0.05;
  var steps = [0,2,4,5,7,9,11,12];   /* C major / F major, first octave */
  announcer("Playing the " + (inF ? "F" : "C") + " major scale.");
  steps.forEach(function(idx, k){
    tone(freqOf(idx), t0 + k * 0.38, 0.34);
    setTimeout(function(){ select(idx, false); }, (0.05 + k * 0.38) * 1000);
  });
});

document.getElementById("mailTo").href = "mailto:" + CONTACT;
document.getElementById("mailTo").textContent = CONTACT;

/* Wire up the pre-rendered keys and show the first note. The
   printable sheet is already in the HTML, so nothing is rebuilt. */
if (inF !== DEFAULT_F) {
  setInstrument(inF, false);
} else {
  attachKeys();
  select(0, false);
}

}

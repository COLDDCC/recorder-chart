/* ==================================================================
   FINGERING DATA — Baroque (English) recorder fingerings.
   Single source of truth for the whole site.

   Used in two places:
     1. At build time  — node build.js pre-renders the 28-note keys
        and printable cells into the static HTML (P0-3: content is
        visible without JavaScript).
     2. At runtime     — chart.js reads the same data for the
        interactive tool, so runtime output always matches the
        server-rendered HTML.

   Verification status (P0-4): verified 2026-08-06, note-by-note
   against two independent authoritative charts — the American
   Recorder Society, "Fingering Chart for Soprano (or Tenor)
   Recorder, Baroque (English) Fingering", and the Yamaha Musical
   Instrument Guide's Baroque soprano chart. 25 of 28 were already
   correct; 3 were fixed (C6, D6, E♭6 — second octave). The two
   sources agreed on every note.

   Confirmations from that check:
     1. C♯7 and D7 genuinely share the same fingerings (ARS confirms);
        C♯7 differs only in that the bell must be covered with the
        knee (the ARS chart marks it *). The bell marker on the
        diagram keeps the two visually distinct.
     2. G♯5 (index 8) half-covers hole 6 — confirmed by both ARS and
        Yamaha. Do not "fix" it to fully covered.

   Notation note: publishers draw the thumb pinch differently — the
   ARS uses a half-filled circle, Yamaha a quarter-open thumb. Both
   mean the same slight thumb roll; this site follows the ARS style.

   h = [thumb, 1, 2, 3, 4, 5, 6, 7]
     1   = cover fully
     0   = open
     0.5 = thumb: pinch (roll back to leave a crescent)
           holes 6 / 7: cover the outer hole of the pair only

   Notes run chromatically upward from written C5 (soprano / tenor,
   MIDI base 72) or F4 (alto / bass, MIDI base 65), one semitone
   apart, so names and octaves are derived from the index.
   ================================================================== */
(function (root) {
  "use strict";

  var NAMES = ["C","C♯","D","E♭","E","F","F♯","G","G♯","A","B♭","B"];

  var NOTES = [
    /* --- first octave --- */
    {r:1, h:[1,1,1,1,1,1,1,1],   m:"all holes covered"},
    {r:1, h:[1,1,1,1,1,1,1,.5],  m:"hole 7 — outer hole only"},
    {r:1, h:[1,1,1,1,1,1,1,0],   m:"hole 7 open"},
    {r:1, h:[1,1,1,1,1,1,.5,0],  m:"hole 6 — outer hole only"},
    {r:1, h:[1,1,1,1,1,1,0,0],   m:"holes 6 and 7 open"},
    {r:1, h:[1,1,1,1,1,0,1,1],   m:"fork — hole 5 open, 6 and 7 closed again", fork:1},
    {r:1, h:[1,1,1,1,0,1,1,0],   m:"fork — hole 4 open, 5 and 6 closed", fork:1},
    {r:1, h:[1,1,1,1,0,0,0,0],   m:"left hand only"},
    /* G♯5 — confirmed (P0-4): both ARS and Yamaha half-cover hole 6. */
    {r:1, h:[1,1,1,0,1,1,.5,0],  m:"fork — hole 3 open, 6 outer only", fork:1},
    {r:1, h:[1,1,1,0,0,0,0,0],   m:"thumb, 1 and 2"},
    {r:1, h:[1,1,0,1,1,0,0,0],   m:"fork — hole 2 open, 3 and 4 closed", fork:1},
    {r:1, h:[1,1,0,0,0,0,0,0],   m:"thumb and 1"},
    {r:1, h:[1,0,1,0,0,0,0,0],   m:"thumb and hole 2"},
    /* --- second octave --- */
    {r:2, h:[0,1,1,0,0,0,0,0],   m:"thumb fully open, 1 and 2"},
    {r:2, h:[0,0,1,0,0,0,0,0],   m:"thumb fully open, hole 2 only"},
    {r:2, h:[0,0,1,1,1,1,1,0],   m:"thumb fully open, 2 to 6"},
    {r:2, h:[.5,1,1,1,1,1,0,0],  m:"pinch the thumb, 1 to 5", pinch:1},
    {r:2, h:[.5,1,1,1,1,0,1,0],  m:"pinch, fork — hole 5 open, 6 closed", pinch:1, fork:1},
    {r:2, h:[.5,1,1,1,0,1,0,0],  m:"pinch, fork — hole 4 open, 5 closed", pinch:1, fork:1},
    {r:2, h:[.5,1,1,1,0,0,0,0],  m:"pinch the thumb, left hand only", pinch:1},
    {r:2, h:[.5,1,1,0,1,0,0,0],  m:"pinch, fork — hole 3 open, 4 closed", pinch:1, fork:1},
    {r:2, h:[.5,1,1,0,0,0,0,0],  m:"pinch the thumb, 1 and 2", pinch:1},
    {r:2, h:[.5,1,1,0,0,1,1,.5], m:"pinch, fork — 5 and 6 closed, 7 outer only", pinch:1, fork:1},
    {r:2, h:[.5,1,1,0,1,1,0,0],  m:"pinch, fork — 4 and 5 closed", pinch:1, fork:1},
    {r:2, h:[.5,1,0,0,1,1,0,0],  m:"pinch, fork — hole 1, then 4 and 5", pinch:1, fork:1},
    /* --- top register --- */
    /* C♯7 — pinch + fork + knee covering the bell (confirmed P0-4). */
    {r:3, h:[.5,1,0,1,1,0,1,1],  m:"pinch, fork, and cover the bell with your knee", pinch:1, fork:1, bell:1},
    /* D7 — same fingerings as C♯7, only the bell stays open (confirmed). */
    {r:3, h:[.5,1,0,1,1,0,1,1],  m:"pinch, fork — same as C♯ but leave the bell open", pinch:1, fork:1},
    {r:3, h:[.5,0,1,1,0,1,1,0],  m:"pinch, fork — 2, 3, then 5 and 6", pinch:1, fork:1}
  ];

  /* Written-note helpers. midiBase = written MIDI of the lowest note:
     soprano / tenor (C instrument) = 72 (C5), alto / bass (F) = 65 (F4). */
  function noteInfo(i, midiBase) {
    var midi = midiBase + i;
    return { name: NAMES[midi % 12], octave: Math.floor(midi / 12) - 1, midi: midi };
  }
  function freqOf(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Mini fingering diagram used in the printable sheet and the print
     PDF. Shared so build output always matches runtime rebuilds.
     bell = true draws the knee-on-bell marker (C♯7). */
  function miniSVG(H, id, bell) {
    var f = function (v) { return v === 1 ? "var(--ink)" : (v === 0 ? "#fff" : "url(#" + id + ")"); };
    var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">'
      + '<stop offset="50%" stop-color="var(--ink)"/><stop offset="50%" stop-color="#fff"/></linearGradient></defs>';
    s += '<circle cx="7" cy="9" r="4.4" fill="' + f(H[0]) + '" stroke="var(--ink)" stroke-width="1.2"/>';
    s += '<line x1="14" y1="3" x2="14" y2="93" stroke="var(--rule)" stroke-width="1"/>';
    var y = [9,21,33,45,57,71,85];
    for (var i = 1; i <= 7; i++) {
      if (i <= 5) {
        s += '<circle cx="26" cy="' + y[i-1] + '" r="4.6" fill="' + f(H[i]) + '" stroke="var(--ink)" stroke-width="1.2"/>';
      } else {
        s += '<circle cx="21" cy="' + y[i-1] + '" r="3.4" fill="' + (H[i] === 1 ? "var(--ink)" : "#fff") + '" stroke="var(--ink)" stroke-width="1.1"/>'
           + '<circle cx="31" cy="' + y[i-1] + '" r="3.4" fill="' + (H[i] === 0 ? "#fff" : "var(--ink)") + '" stroke="var(--ink)" stroke-width="1.1"/>';
      }
    }
    if (bell) {
      s += '<path d="M17 87 L33 87 L31.5 94 L18.5 94 Z" fill="var(--ink)"/>';
    }
    return s;
  }

  /* Interactive key button for the tool panel. */
  function keyHTML(i, midiBase) {
    var n = noteInfo(i, midiBase), note = NOTES[i];
    return '<button type="button" class="key" data-i="' + i + '" aria-pressed="false" aria-label="'
      + n.name + ' ' + n.octave + ' — ' + esc(note.m) + '">'
      + '<b>' + n.name + '</b><small>' + n.octave + '</small></button>';
  }

  /* Printable cell for the sheet. */
  function cellHTML(i, midiBase) {
    var n = noteInfo(i, midiBase), note = NOTES[i], tags = [];
    if (note.bell) tags.push("BELL");
    if (note.fork) tags.push("FORK");
    if (note.pinch) tags.push("PINCH");
    return '<div class="cell">'
      + '<div class="n">' + n.name + '<span class="oct">' + n.octave + '</span></div>'
      + '<div class="o">' + (tags.length ? tags.join(" ") : "&nbsp;") + '</div>'
      + '<svg viewBox="0 0 40 96" aria-hidden="true">' + miniSVG(note.h, "gr" + i, note.bell) + '</svg>'
      + '<div class="m">' + esc(note.m) + '</div>'
      + '</div>';
  }

  function keysForRow(r, midiBase) {
    return NOTES.map(function (note, i) { return note.r === r ? keyHTML(i, midiBase) : ""; }).join("");
  }
  function cellsForGrid(r, midiBase) {
    return NOTES.map(function (note, i) { return note.r === r ? cellHTML(i, midiBase) : ""; }).join("");
  }

  var api = {
    NAMES: NAMES,
    NOTES: NOTES,
    noteInfo: noteInfo,
    freqOf: freqOf,
    miniSVG: miniSVG,
    keyHTML: keyHTML,
    cellHTML: cellHTML,
    keysForRow: keysForRow,
    cellsForGrid: cellsForGrid
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.RecorderData = api;
  }
})(typeof self !== "undefined" ? self : globalThis);

/* ==================================================================
   BUILD — pre-renders the fingering data into static HTML.

   Usage:  node build.js
   Output: overwrites the site pages in this folder, regenerates
   robots.txt and sitemap.xml, and rewrites the CONTACT address in
   chart.js.

   P0-1: when the domain and email are decided, edit CONFIG below and
   re-run `node build.js`. That is the only edit needed anywhere —
   every canonical, og:url, JSON-LD url, sitemap entry and robots
   line is driven by it.
   ================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const data = require("./fingering-data.js");

const ROOT = __dirname;
const TPL = path.join(ROOT, "templates");

/* ---- P0-1 configuration — edit these two lines when going live ---- */
const CONFIG = {
  domain: "https://example.com",
  email:  "hello@example.com"
};

/* Shared snippets injected into every page. */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>`;

const TOGGLE = `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Open menu"><svg class="icon" viewBox="0 0 448 512" aria-hidden="true"><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>Menu</button>`;

const NAV_LINKS = [
  { href: "/",                                  label: "Soprano",  key: "index"  },
  { href: "/alto.html",                         label: "Alto",     key: "alto"   },
  { href: "/tenor.html",                        label: "Tenor",    key: "tenor"  },
  { href: "/bass.html",                         label: "Bass",     key: "bass"   },
  { href: "/recorder-fingering-chart-pdf.html", label: "PDF &amp; Print", key: "pdf" },
  { href: "/german-fingering-recorder-chart.html", label: "German", key: "german" },
  { href: "/recorder-notes.html",               label: "Notes",    key: "notes"  },
  { href: "/#faq",                              label: "FAQ",      key: null     }
];

function navFor(activeKey) {
  return NAV_LINKS.map(function (l) {
    return '      <a href="' + l.href + '"' + (l.key === activeKey ? ' aria-current="page"' : "") + ">" + l.label + "</a>";
  }).join("\n");
}

const FOOTER = `    <p class="foot-brand">Recorder<span>Chart</span> — free recorder fingering references</p>
    <p class="foot-verify">All 28 fingerings were checked note-by-note against the American Recorder Society and Yamaha charts in August 2026; the source behind every fingering is listed on each chart page.</p>
    <nav class="foot-links" aria-label="Footer">
      <a href="/">Soprano</a><a href="/alto.html">Alto</a><a href="/tenor.html">Tenor</a><a href="/bass.html">Bass</a>
      <a href="/recorder-fingering-chart-pdf.html">Printable PDF</a><a href="/german-fingering-recorder-chart.html">German fingering</a><a href="/recorder-notes.html">Beginner notes</a>
      <a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/#contact">Report a correction</a>
    </nav>
    <p class="foot-copy">Maintained by SKY AND WIND &middot; &copy; 2026</p>`;

/* Inline icons (self-hosted SVG paths, no icon font). */
const REPORT_ICON = '<svg class="icon" viewBox="0 0 448 512" aria-hidden="true"><path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 64 0 368 0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30l0-247.7c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48l0-16z"/></svg>';
const PLAY_ICON = '<svg class="icon" viewBox="0 0 384 512" aria-hidden="true"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const PRINT_ICON = '<svg class="icon" viewBox="0 0 512 512" aria-hidden="true"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>';
const PDF_ICON = '<svg class="icon" viewBox="0 0 512 512" aria-hidden="true"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z"/></svg>';
const PLAY_SCALE_TIP = 'Start with B, A and G near the top of the first octave. They use only your left hand, and they are enough to play <em>Hot Cross Buns</em> and <em>Mary Had a Little Lamb</em>.';

const MIDI = { C: 72, F: 65 };

/* Interactive tool block. The 28 keys are pre-rendered here (P0-3). */
function toolHTML(instrument, tip) {
  var midi = MIDI[instrument];
  var n0 = data.noteInfo(0, midi);
  var btnC = instrument === "F" ? "false" : "true";
  var btnF = instrument === "F" ? "true" : "false";
  return '<div class="tool">'
    + '<div class="stage">'
    + '<div class="readout">'
    + '<div class="name" id="noteName">' + n0.name + '<sup>' + n0.octave + '</sup></div>'
    + '<div class="meta" id="noteMeta">' + data.NOTES[0].m + '</div>'
    + '</div>'
    + '<svg class="recorder" id="bigRecorder" viewBox="0 0 120 320" role="img" aria-labelledby="recTitle" aria-describedby="legend">'
    + '<title id="recTitle">Recorder diagram</title></svg>'
    + '<div class="legend" id="legend">'
    + '<span><i class="f"></i>cover</span>'
    + '<span><i></i>open</span>'
    + '<span><i class="h"></i>half / pinch</span>'
    + '</div>'
    + '<a class="report" id="reportLink" href="#">' + REPORT_ICON + 'Report this fingering</a>'
    + '</div>'
    + '<div class="panel">'
    + '<div class="controls">'
    + '<div class="seg" role="group" aria-label="Instrument size">'
    + '<button id="btnC" type="button" aria-pressed="' + btnC + '">C recorders &mdash; soprano, tenor</button>'
    + '<button id="btnF" type="button" aria-pressed="' + btnF + '">F recorders &mdash; alto, bass</button>'
    + '</div>'
    + '<button class="ghost" id="btnScale" type="button">' + PLAY_ICON + 'Play the scale</button>'
    + '</div>'
    + '<p class="row-label">First octave &mdash; gentle, steady breath</p>'
    + '<div class="keys" id="row1">' + data.keysForRow(1, midi) + '</div>'
    + '<p class="row-label">Second octave &mdash; open, then pinch the thumb</p>'
    + '<div class="keys" id="row2">' + data.keysForRow(2, midi) + '</div>'
    + '<p class="row-label">Top register &mdash; advanced</p>'
    + '<div class="keys" id="row3">' + data.keysForRow(3, midi) + '</div>'
    + '<div class="tip"><strong>New to the recorder?</strong> ' + tip + '</div>'
    + '</div>'
    + '</div>';
}

/* Printable sheet block, pre-rendered (P0-3, P1-4). */
function sheetHTML(title, pdfFile, instrument) {
  var midi = MIDI[instrument];
  return '<div class="sheet">'
    + '<div class="sheet-head">'
    + '<div>'
    + '<div class="head-title">' + title + '</div>'
    + '<div class="head-sub">'
    + '<span>BAROQUE (ENGLISH) FINGERING</span>'
    + '<span><svg class="icon" viewBox="0 0 512 512" aria-hidden="true"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>COVER</span>'
    + '<span><svg class="icon" viewBox="0 0 512 512" aria-hidden="true"><path fill-rule="evenodd" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>OPEN</span>'
    + '<span><svg class="icon" viewBox="0 0 512 512" aria-hidden="true"><path d="M448 256c0-106-86-192-192-192l0 384c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>HALF OR PINCH</span>'
    + '</div>'
    + '</div>'
    + '<div class="noprint" style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="ghost" type="button" onclick="window.print()">' + PRINT_ICON + 'Print this chart</button>'
    + '<a class="ghost" style="text-decoration:none" href="' + pdfFile + '" download>' + PDF_ICON + 'Download PDF</a>'
    + '</div>'
    + '</div>'
    + '<h3>First octave</h3><div class="grid" id="g1">' + data.cellsForGrid(1, midi) + '</div>'
    + '<h3>Second octave</h3><div class="grid" id="g2">' + data.cellsForGrid(2, midi) + '</div>'
    + '<h3>Top register</h3><div class="grid" id="g3">' + data.cellsForGrid(3, midi) + '</div>'
    + '</div>';
}

function fill(cfg) {
  var html = fs.readFileSync(path.join(TPL, cfg.tpl), "utf8");
  html = html
    .replace(/\{\{DOMAIN\}\}/g, CONFIG.domain)
    .replace(/\{\{EMAIL\}\}/g, CONFIG.email)
    .replace(/\{\{NAV\}\}/g, navFor(cfg.key))
    .replace(/\{\{TOGGLE\}\}/g, TOGGLE)
    .replace(/\{\{FOOTER\}\}/g, FOOTER)
    .replace(/\{\{FONTS\}\}/g, FONTS)
    .replace(/\{\{REPORT_ICON\}\}/g, REPORT_ICON)
    .replace(/\{\{TOOL\}\}/g, cfg.instrument ? toolHTML(cfg.instrument, PLAY_SCALE_TIP) : "")
    .replace(/\{\{SHEET\}\}/g, cfg.sheet ? sheetHTML(cfg.sheet.title, cfg.sheet.pdf, cfg.instrument) : "");
  fs.writeFileSync(path.join(ROOT, cfg.out), html);
  console.log("built", cfg.out);
}

var PAGES = [
  { tpl: "index.template.html", out: "index.html", key: "index",   instrument: "C",
    sheet: { title: "Soprano Recorder &mdash; Fingering Chart", pdf: "recorder-fingering-chart.pdf" } },
  { tpl: "alto.template.html",  out: "alto.html",  key: "alto",    instrument: "F",
    sheet: { title: "Alto Recorder &mdash; Fingering Chart", pdf: "alto-recorder-fingering-chart.pdf" } },
  { tpl: "tenor.template.html", out: "tenor.html", key: "tenor",   instrument: "C",
    sheet: { title: "Tenor Recorder &mdash; Fingering Chart", pdf: "tenor-recorder-fingering-chart.pdf" } },
  { tpl: "bass.template.html",  out: "bass.html",  key: "bass",    instrument: "F",
    sheet: { title: "Bass Recorder &mdash; Fingering Chart", pdf: "bass-recorder-fingering-chart.pdf" } },
  { tpl: "pdf.template.html",   out: "recorder-fingering-chart-pdf.html", key: "pdf", instrument: "C",
    sheet: { title: "Soprano Recorder &mdash; Fingering Chart", pdf: "recorder-fingering-chart.pdf" } },
  { tpl: "german.template.html", out: "german-fingering-recorder-chart.html", key: "german", instrument: null, sheet: null },
  { tpl: "notes.template.html",  out: "recorder-notes.html",  key: "notes",  instrument: null, sheet: null },
  { tpl: "privacy.template.html", out: "privacy.html", key: null, instrument: null, sheet: null },
  { tpl: "terms.template.html",  out: "terms.html",  key: null, instrument: null, sheet: null },
  { tpl: "error.template.html",  out: "404.html",    key: null, instrument: null, sheet: null }
];

PAGES.forEach(fill);

/* ---- robots.txt ---- */
var robots = "User-agent: *\nAllow: /\n\n"
  + "# AI crawlers are welcome to read and quote the charts.\n"
  + "User-agent: GPTBot\nAllow: /\n\n"
  + "User-agent: PerplexityBot\nAllow: /\n\n"
  + "User-agent: ClaudeBot\nAllow: /\n\n"
  + "Sitemap: " + CONFIG.domain + "/sitemap.xml\n";
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);
console.log("built robots.txt");

/* ---- sitemap.xml ---- */
var TODAY = "2026-08-06";
var URLS = [
  { loc: "/",                               prio: "1.0" },
  { loc: "/alto.html",                      prio: "0.9" },
  { loc: "/tenor.html",                     prio: "0.8" },
  { loc: "/bass.html",                      prio: "0.8" },
  { loc: "/recorder-fingering-chart-pdf.html", prio: "0.8" },
  { loc: "/german-fingering-recorder-chart.html", prio: "0.7" },
  { loc: "/recorder-notes.html",            prio: "0.7" },
  { loc: "/privacy.html",                   prio: "0.3" },
  { loc: "/terms.html",                     prio: "0.3" }
];
var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
URLS.forEach(function (u) {
  sitemap += "  <url>\n"
    + "    <loc>" + CONFIG.domain + u.loc + "</loc>\n"
    + "    <lastmod>" + TODAY + "</lastmod>\n"
    + "    <changefreq>monthly</changefreq>\n"
    + "    <priority>" + u.prio + "</priority>\n"
    + "  </url>\n";
});
sitemap += "</urlset>\n";
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
console.log("built sitemap.xml");

/* ---- chart.js CONTACT address (P0-1) ---- */
var chartJs = path.join(ROOT, "chart.js");
var src = fs.readFileSync(chartJs, "utf8");
src = src.replace(/var CONTACT = "[^"]*";/, 'var CONTACT = "' + CONFIG.email + '";');
fs.writeFileSync(chartJs, src);
console.log("chart.js CONTACT ->", CONFIG.email);

console.log("done.");

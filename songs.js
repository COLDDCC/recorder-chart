(() => {
'use strict';
const notes=[...document.querySelectorAll('.song-note')];
const play=document.getElementById('songPlay'), status=document.getElementById('songStatus');
if(!play)return;
let audio, timer, voice, generation=0;
const tempo=document.getElementById('songTempo');
function stop(){generation++;clearTimeout(timer);if(voice){try{voice.stop();}catch(e){}voice=null;}notes.forEach(n=>n.classList.remove('is-playing'));play.textContent='Play melody';}
async function start(list){stop();const run=generation;
try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('unsupported');audio=audio||new Audio();await audio.resume();if(run!==generation)return;
play.textContent='Restart melody';let i=0;
function next(){if(run!==generation)return;notes.forEach(n=>n.classList.remove('is-playing'));if(i>=list.length){stop();status.textContent='Finished. Play again or practise one phrase.';return;}
const n=list[i++],duration=+n.dataset.beats*60/+tempo.value;
n.classList.add('is-playing');status.textContent=n.querySelector('strong').textContent+' · '+n.dataset.beats+(+n.dataset.beats===1?' beat':' beats');
const osc=audio.createOscillator(),gain=audio.createGain();voice=osc;osc.type='sine';osc.frequency.value=440*Math.pow(2,(+n.dataset.midi-69)/12);osc.connect(gain);gain.connect(audio.destination);
const now=audio.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.16,now+.015);gain.gain.setValueAtTime(.16,now+Math.max(.02,duration*.8));gain.gain.linearRampToValueAtTime(0,now+duration*.95);osc.start(now);osc.stop(now+duration);timer=setTimeout(next,duration*1000);
}next();
}catch(e){stop();status.textContent='Audio is unavailable in this browser. You can still read and print every note.';}}
notes.forEach(n=>n.addEventListener('click',()=>start([n])));
play.addEventListener('click',()=>start(notes));
document.getElementById('songStop').addEventListener('click',()=>{stop();status.textContent='Stopped.';});
document.querySelectorAll('[data-phrase]').forEach(b=>b.addEventListener('click',()=>start([...b.closest('.song-phrase').querySelectorAll('.song-note')])));
tempo.addEventListener('input',()=>{document.getElementById('tempoValue').value=tempo.value;});
document.getElementById('songPrint').addEventListener('click',()=>{stop();window.print();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);
})();

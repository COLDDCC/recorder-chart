(function(){
'use strict';
const data=window.RecorderData,buttons=[...document.querySelectorAll('.learn-note')],status=document.getElementById('learnStatus');
if(!data||!buttons.length)return;
let audio,voice,run=0;
function stop(){run++;if(voice){try{voice.stop();}catch(e){}voice=null;}}
buttons.forEach(button=>button.addEventListener('click',async()=>{
stop();const token=run,i=Number(button.dataset.note),note=data.NOTES[i],name=data.noteInfo(i,72);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
status.textContent=name.name+name.octave+': '+note.m+'.';
try{const Audio=window.AudioContext||window.webkitAudioContext;audio=audio||new Audio();await audio.resume();if(token!==run)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;voice=o;o.frequency.value=data.freqOf(72+i);o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.02);g.gain.setValueAtTime(.12,t+.55);g.gain.linearRampToValueAtTime(0,t+.7);o.start();o.stop(t+.72);}catch(e){status.textContent+=' Audio is unavailable; the fingering chart still works.';}
}));
document.getElementById('learnStop').addEventListener('click',()=>{stop();status.textContent='Sound stopped. Select any note to try again.';});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
})();

/* Standard three-valve Bb trumpet. Written MIDI 54 (F#3) to 72 (C5).
   Primary fingerings visually cross-checked against Yamaha and StepWise on 2026-10-20.
   Optional 3rd-valve alternatives come from Yamaha only; they are not universal replacements. */
(function(root){
'use strict';
const names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const valves=['123','13','23','12','1','2','0','123','13','23','12','1','2','0','23','12','1','2','0'];
const notes=valves.map((v,i)=>{const midi=54+i,name=names[midi%12]+(Math.floor(midi/12)-1);return {writtenMidi:midi,concertMidi:midi-2,name,valves:v,alternates:[57,64,69].includes(midi)?['3']:[],hint:[61,62].includes(midi)?'Low C# and D tend sharp. Your teacher may ask you to extend the third-valve slide.':''};});
const api={id:'bb-trumpet',title:'B♭ trumpet',transposition:-2,notes,sources:[{name:'Yamaha Musical Instrument Guide — trumpet fingering chart',url:'https://www.yamaha.com/en/musical_instrument_guide/common/images/trumpet/fingering.pdf'},{name:'StepWise Publications — trumpet fingering chart',url:'https://www.stepwisepublications.com/uploads/1/6/2/6/16262424/2022_new_trumpet_fingering_chart.pdf'}]};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TrumpetData=api;
})(typeof self!=='undefined'?self:globalThis);

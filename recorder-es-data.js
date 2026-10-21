/* Spanish labels layered over the shared soprano fingering data. */
(function(root){
const names=['Do','Do♯','Re','Mi♭','Mi','Fa','Fa♯','Sol','Sol♯','La','Si♭','Si'];
function name(i){return names[i%12]+(5+Math.floor(i/12));}
function description(note){const closed=[],open=[],partial=[];note.h.forEach((v,i)=>{if(v===1)closed.push(i===0?'pulgar':String(i));else if(v===0)open.push(i===0?'pulgar':String(i));else partial.push(i===0?'Deja una pequeña abertura en el agujero del pulgar.':'En el doble orificio '+i+', cubre solo uno de los dos agujeros.');});return (closed.length?'Tapa: '+closed.join(', ')+'. ':'')+(open.length?'Abre: '+open.join(', ')+'. ':'')+partial.join(' ')+(note.bell?' Tapa también la campana.':'');}
const api={names,name,description};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RecorderSpanish=api;
})(typeof self!=='undefined'?self:globalThis);

'use strict';
/* Procedural sound effects and background music (Web Audio). */
function initAudio(){if(!G.sound||G.paused)return;try{if(!G.audio)G.audio=new (window.AudioContext||window.webkitAudioContext)();if(G.audio.state==='suspended')G.audio.resume().catch(()=>{})}catch{/* Sound is optional. */}}
function note(freq,duration=.12,type='triangle',gain=.06,delay=0,endFreq=freq){if(!G.sound||G.paused||!G.audio||G.audio.state==='closed')return;const t=G.audio.currentTime+delay,osc=G.audio.createOscillator(),volume=G.audio.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(endFreq,t+duration);volume.gain.setValueAtTime(0,t);volume.gain.linearRampToValueAtTime(gain,t+.008);volume.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(volume);volume.connect(G.audio.destination);osc.onended=()=>{osc.disconnect();volume.disconnect()};osc.start(t);osc.stop(t+duration+.03)}
function rustle(duration,freq,gain,delay=0,endFreq=freq){
 if(!G.sound||G.paused||!G.audio||G.audio.state==='closed')return;
 const audio=G.audio,t=audio.currentTime+delay,buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),samples=buffer.getChannelData(0);
 for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
 const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),volume=audio.createGain();
 source.buffer=buffer;filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(freq,t);filter.frequency.exponentialRampToValueAtTime(endFreq,t+duration);
 volume.gain.setValueAtTime(0,t);volume.gain.linearRampToValueAtTime(gain,t+.008);volume.gain.exponentialRampToValueAtTime(.0001,t+duration);
 source.connect(filter);filter.connect(volume);volume.connect(audio.destination);source.onended=()=>{source.disconnect();filter.disconnect();volume.disconnect()};source.start(t);source.stop(t+duration)
}
function sound(kind,grade='GOOD'){
 if(!G.sound||G.paused)return;initAudio();
 if(kind==='hit'){const strength=grade==='PERFECT'?1.15:grade==='BAD'?.5:.85;rustle(.12,2600,.32*strength,0,900);note(150,.2,'sine',.22*strength,0,42);note(75,.15,'triangle',.08*strength,0,35)}
 else if(kind==='whoosh')rustle(.25,500,.09,0,3000);
 else if(kind==='flip'){rustle(.2,2400,.12,0,600);rustle(.07,1800,.15,.22);note(180,.1,'triangle',.06,.22,80)}
 else if(kind==='perfect'){note(660,.16);note(880,.2,'triangle',.06,.09);note(1320,.25,'sine',.04,.18)}
 else if(kind==='fold'){rustle(.18,3400,.15,0,1100);rustle(.065,1700,.1,.13);note(210,.09,'triangle',.035,.12,120)}
 else if(kind==='win'){[523,659,784,1046].forEach((n,i)=>note(n,.4,'triangle',.07,i*.14))}
 else if(kind==='lose'){[330,294,220].forEach((n,i)=>note(n,.3,'triangle',.06,i*.15))}
 else note(440,.055,'square',.025)
}
function updateSoundButton(){$('sound').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4 6 8H3v8h3l5 4V4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/><path class="sound-off" d="m3 3 18 18"/></svg>';$('sound').setAttribute('aria-pressed',String(G.sound));$('sound').setAttribute('aria-label',G.sound?'소리 끄기':'소리 켜기')}
function toggleSound(){G.sound=!G.sound;initAudio();updateSoundButton();try{localStorage.setItem('ddakzizon.sound',G.sound?'on':'off')}catch{}if((!G.sound||G.paused)&&G.audio)G.audio.suspend().catch(()=>{})}
function music(){if(!G.sound||G.paused||G.audio?.state!=='running'||G.now<G.musicAt)return;G.musicAt=G.now+390;const melody=[262,0,330,392,0,330,294,0,262,0,220,294,330,0,294,0];let n=melody[G.musicStep++%melody.length];if(n)note(n,G.scene==='battle'?.13:.24,'triangle',.018);if(G.musicStep%4===0)note(131,.3,'sine',.02)}

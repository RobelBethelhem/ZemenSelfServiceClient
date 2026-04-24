import{r as h,j as e}from"./index-B6oVdzIg.js";import{a as T,c as de,b as Ne}from"./logo-CX7RpXdV.js";import{d as p}from"./styled-components.browser.esm-DlRXTL0c.js";import{C as Ce}from"./react-confetti.min-DBCcDYV2.js";import{m as x}from"./proxy-BZt8nq9-.js";import{C as Z,a as J}from"./CRow-GJdf8ZQz.js";import{c as ze}from"./cil-volume-high-D3jFsj8z.js";import{C as Ee}from"./CAlert-ByFTOTea.js";import{C as $,a as G}from"./CCardBody-B0nWpZ0V.js";import{C as U}from"./CCardHeader-DC0Mlzoy.js";import{C as Pe,a as Ie,b as Le,c as Ae,d as Be}from"./DefaultLayout-Cvokl6XA.js";import{C as Ve,a as _}from"./CFormLabel-Soh_jztQ.js";import{C as D}from"./CFormInput-BZce5gF0.js";import{A as Oe}from"./index-B6k3t1RV.js";import"./emotion-unitless.esm-sScrWPmR.js";var Te=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M208,16A112.127,112.127,0,0,0,96,128v79.681a80.236,80.236,0,0,0,9.768,38.308l27.455,50.333L60.4,343.656A79.725,79.725,0,0,0,24,410.732V496H312V464H56V410.732a47.836,47.836,0,0,1,21.841-40.246l97.66-63.479-41.64-76.341A48.146,48.146,0,0,1,128,207.681V128a80,80,0,0,1,160,0v79.681a48.146,48.146,0,0,1-5.861,22.985L240.5,307.007,312,353.483V315.317l-29.223-19,27.455-50.334A80.23,80.23,0,0,0,320,207.681V128A112.127,112.127,0,0,0,208,16Z' class='ci-primary'/><polygon fill='var(--ci-primary-color, currentColor)' points='424 400 424 336 392 336 392 400 328 400 328 432 392 432 392 496 424 496 424 432 488 432 488 400 424 400' class='ci-primary'/>"],K={},w={};Object.defineProperty(w,"__esModule",{value:!0});w.trim=w.isObject=w.isNil=w.isNan=w.size=w.isString=w.validateLocale=w.splitSentences=void 0;var Ge=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:"";return a.replace(/\.+/g,".|").replace(/\?/g,"?|").replace(/\!/g,"!|").split("|").map(function(t){return he(t)}).filter(Boolean)};w.splitSentences=Ge;var $e=/^(?:(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))$|^((?:[a-z]{2,3}(?:(?:-[a-z]{3}){1,3})?)|[a-z]{4}|[a-z]{5,8})(?:-([a-z]{4}))?(?:-([a-z]{2}|\d{3}))?((?:-(?:[\da-z]{5,8}|\d[\da-z]{3}))*)?((?:-[\da-wy-z](?:-[\da-z]{2,8})+)*)?(-x(?:-[\da-z]{1,8})+)?$|^(x(?:-[\da-z]{1,8})+)$/i,_e=function(a){return typeof a!="string"?!1:$e.test(a)};w.validateLocale=_e;var ue=function(a){return typeof a=="string"||a instanceof String};w.isString=ue;var Fe=function(a){return a&&Array.isArray(a)&&a.length?a.length:0};w.size=Fe;var Me=function(a){return typeof a=="number"&&isNaN(a)};w.isNan=Me;var Re=function(a){return a==null};w.isNil=Re;var De=function(a){return Object.prototype.toString.call(a)==="[object Object]"};w.isObject=De;var he=function(a){return ue(a)?a.trim():""};w.trim=he;Object.defineProperty(K,"__esModule",{value:!0});var me=K.default=void 0,f=w;function He(n,a){if(!(n instanceof a))throw new TypeError("Cannot call a class as a function")}function We(n,a){for(var t=0;t<a.length;t++){var i=a[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(n,i.key,i)}}function Ue(n,a,t){return a&&We(n.prototype,a),n}var qe=function(){function n(){He(this,n),this.browserSupport="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window,this.synthesisVoice=null}return Ue(n,[{key:"init",value:function(){var t=this,i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return new Promise(function(o,s){t.browserSupport||s("Your browser does not support Speech Synthesis");var r=(0,f.isNil)(i.listeners)?{}:i.listeners,u=(0,f.isNil)(i.splitSentences)?!0:i.splitSentences,m=(0,f.isNil)(i.lang)?void 0:i.lang,b=(0,f.isNil)(i.volume)?1:i.volume,d=(0,f.isNil)(i.rate)?1:i.rate,j=(0,f.isNil)(i.pitch)?1:i.pitch,v=(0,f.isNil)(i.voice)?void 0:i.voice;Object.keys(r).forEach(function(k){var V=r[k],O=function(y){V&&V(y)};k!=="onvoiceschanged"&&(speechSynthesis[k]=O)}),t._loadVoices().then(function(k){r.onvoiceschanged&&r.onvoiceschanged(k),!(0,f.isNil)(m)&&t.setLanguage(m),!(0,f.isNil)(v)&&t.setVoice(v),!(0,f.isNil)(b)&&t.setVolume(b),!(0,f.isNil)(d)&&t.setRate(d),!(0,f.isNil)(j)&&t.setPitch(j),!(0,f.isNil)(u)&&t.setSplitSentences(u),o({voices:k,lang:t.lang,voice:t.voice,volume:t.volume,rate:t.rate,pitch:t.pitch,splitSentences:t.splitSentences,browserSupport:t.browserSupport})}).catch(function(k){s(k)})})}},{key:"_fetchVoices",value:function(){return new Promise(function(t,i){setTimeout(function(){var o=speechSynthesis.getVoices();return(0,f.size)(o)>0?t(o):i("Could not fetch voices")},100)})}},{key:"_loadVoices",value:function(){var t=this,i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:10;return this._fetchVoices().catch(function(o){if(i===0)throw o;return t._loadVoices(i-1)})}},{key:"hasBrowserSupport",value:function(){return this.browserSupport}},{key:"setVoice",value:function(t){var i,o=speechSynthesis.getVoices();if((0,f.isString)(t)&&(i=o.find(function(s){return s.name===t})),(0,f.isObject)(t)&&(i=t),i)this.synthesisVoice=i;else throw"Error setting voice. The voice you passed is not valid or the voices have not been loaded yet."}},{key:"setLanguage",value:function(t){if(t=t.replace("_","-"),(0,f.validateLocale)(t))this.lang=t;else throw"Error setting language. Please verify your locale is BCP47 format (http://schneegans.de/lv/?tags=es-FR&format=text)"}},{key:"setVolume",value:function(t){if(t=parseFloat(t),!(0,f.isNan)(t)&&t>=0&&t<=1)this.volume=t;else throw"Error setting volume. Please verify your volume value is a number between 0 and 1."}},{key:"setRate",value:function(t){if(t=parseFloat(t),!(0,f.isNan)(t)&&t>=0&&t<=10)this.rate=t;else throw"Error setting rate. Please verify your volume value is a number between 0 and 10."}},{key:"setPitch",value:function(t){if(t=parseFloat(t),!(0,f.isNan)(t)&&t>=0&&t<=2)this.pitch=t;else throw"Error setting pitch. Please verify your pitch value is a number between 0 and 2."}},{key:"setSplitSentences",value:function(t){this.splitSentences=t}},{key:"speak",value:function(t){var i=this;return new Promise(function(o,s){var r=t.text,u=t.listeners,m=u===void 0?{}:u,b=t.queue,d=b===void 0?!0:b,j=(0,f.trim)(r);(0,f.isNil)(j)&&o(),!d&&i.cancel();var v=[],k=i.splitSentences?(0,f.splitSentences)(j):[j];k.forEach(function(V,O){var B=O===(0,f.size)(k)-1,y=new SpeechSynthesisUtterance;i.synthesisVoice&&(y.voice=i.synthesisVoice),i.lang&&(y.lang=i.lang),i.volume&&(y.volume=i.volume),i.rate&&(y.rate=i.rate),i.pitch&&(y.pitch=i.pitch),y.text=V,Object.keys(m).forEach(function(z){var P=m[z],E=function(S){P&&P(S),z==="onerror"&&s({utterances:v,lastUtterance:y,error:S}),z==="onend"&&B&&o({utterances:v,lastUtterance:y})};y[z]=E}),v.push(y),speechSynthesis.speak(y)})})}},{key:"pending",value:function(){return speechSynthesis.pending}},{key:"paused",value:function(){return speechSynthesis.paused}},{key:"speaking",value:function(){return speechSynthesis.speaking}},{key:"pause",value:function(){speechSynthesis.pause()}},{key:"resume",value:function(){speechSynthesis.resume()}},{key:"cancel",value:function(){speechSynthesis.cancel()}}]),n}(),Ke=qe;me=K.default=Ke;let L=null;const ge=async()=>{L=new me;try{if(await L.init({volume:1,lang:"en-US",rate:1,pitch:1,splitSentences:!0}))return console.log("Speech is ready"),!0}catch(n){return console.error("Speech init failed:",n),!1}},Ye=async(n,a="English")=>{L||await ge();try{switch(a){case"Amharic":L.setLanguage("am-ET");break;case"Tigrinya":L.setLanguage("ti-ET");break;case"Oromiffa":L.setLanguage("om-ET");break;default:L.setLanguage("en-US")}await L.speak({text:n,queue:!1,listeners:{onstart:()=>console.log("Speech started"),onend:()=>console.log("Speech ended"),onerror:t=>console.error("Speech error:",t)}})}catch(t){console.error("Speech failed:",t),L.setLanguage("en-US"),await L.speak({text:n})}},Y={English:{code:"en-US",label:"English"},Amharic:{code:"am-ET",label:"አማርኛ"},Tigrinya:{code:"ti-ET",label:"ትግርኛ"},Oromiffa:{code:"om-ET",label:"Afaan Oromoo"}},q={B:[1,15],I:[16,30],N:[31,45],G:[46,60],O:[61,75]},F=["B","I","N","G","O"],Xe=()=>{const a=[],t=new Set;for(let i=0;i<5;i++){const o=[];for(let s=0;s<5;s++)if(i===2&&s===2)o.push({number:"FREE",marked:!0,column:"N"});else{const r=F[s],[u,m]=q[r];let b;do b=Math.floor(Math.random()*(m-u+1))+u;while(t.has(b));t.add(b),o.push({number:b,marked:!1,column:r})}a.push(o)}return a},Q=n=>{const a=F.filter(r=>{const[u,m]=q[r];return n.filter(d=>d.number>=u&&d.number<=m).length<(r==="N"?14:15)});if(a.length===0)return null;const t=a[Math.floor(Math.random()*a.length)],[i,o]=q[t];let s;do s=Math.floor(Math.random()*(o-i+1))+i;while(n.some(r=>r.number===s));return{column:t,number:s}},ee=(n,a,t)=>{const i=u=>{if(t==="Amharic"){const m=["፩","፪","፫","፬","፭","፮","፯","፰","፱","፲"];return u.toString().split("").map(d=>m[parseInt(d)-1]||d).join("")}return u.toString()},s=((u,m)=>{switch(m){case"Amharic":return{B:"ቢ",I:"አይ",N:"ኤን",G:"ጂ",O:"ኦ"}[u];case"Tigrinya":return{B:"ቢ",I:"አይ",N:"ኤን",G:"ጂ",O:"ኦ"}[u];default:return u}})(n,t),r=i(a);return`${s} ${r}`},H=async(n,a="English")=>{try{await Ye(n,a)}catch(t){console.error("Speech error:",t)}},pe=p($)`
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  transition: all 0.3s ease;
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    transform: scale(1.05) rotateX(5deg) rotateY(5deg);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
`,Ze=p(pe)`
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
`,te=p.div`
  width: 100%;
  padding-bottom: 100%; /* Maintains square aspect ratio */
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding-bottom: 100%;
  }
`,ne=p.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(${n=>n.size}, 1fr);
  grid-template-rows: repeat(${n=>n.size}, 1fr);
  gap: 2px;
`,ae=p.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  margin-bottom: 4px;
`,ie=p.div`
  background: #4ecdc4;
  color: white;
  font-weight: bold;
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
`,Je=p.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  z-index: 1000;
`,fe=({card:n,color:a,isCurrentPlayer:t,isFirst:i})=>e.jsx(x.div,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0},transition:{type:"spring",duration:1},children:i?e.jsx(Ze,{className:`mb-0 ${t?"border-warning border-3":""}`,children:e.jsxs(G,{className:"p-2",children:[e.jsx(ae,{children:F.map((o,s)=>e.jsx(ie,{children:o},s))}),e.jsx(te,{children:e.jsx(ne,{size:n.length,children:n.map((o,s)=>o.map((r,u)=>e.jsx(x.div,{initial:{scale:0,rotate:-360},animate:{scale:1,rotate:0},transition:{type:"spring",delay:(s*5+u)*.05,duration:.5},children:e.jsx(se,{whileHover:{scale:1.1},whileTap:{scale:.9},animate:{backgroundColor:r.marked?"#a1c4fd":"#fff",scale:r.marked?[1,1.2,1]:1},transition:{duration:.3},disabled:r.marked,size:n.length,marked:r.marked,isFree:r.number==="FREE",children:e.jsxs("div",{className:"cell-content",children:[r.number,r.marked&&e.jsx(x.div,{className:"dauber",initial:{scale:0},animate:{scale:1},transition:{duration:.3}})]})})},`${s}-${u}`)))})})]})}):e.jsx(pe,{color:a,className:`mb-0 ${t?"border-primary border-3":""}`,children:e.jsxs(G,{className:"p-2",children:[e.jsx(ae,{children:F.map((o,s)=>e.jsx(ie,{children:o},s))}),e.jsx(te,{children:e.jsx(ne,{size:n.length,children:n.map((o,s)=>o.map((r,u)=>e.jsx(x.div,{initial:{scale:0,rotate:-360},animate:{scale:1,rotate:0},transition:{type:"spring",delay:(s*5+u)*.05,duration:.5},children:e.jsx(se,{whileHover:{scale:1.1},whileTap:{scale:.9},animate:{backgroundColor:r.marked?"#a1c4fd":"#fff",scale:r.marked?[1,1.2,1]:1},transition:{duration:.3},disabled:r.marked,size:n.length,marked:r.marked,isFree:r.number==="FREE",children:e.jsxs("div",{className:"cell-content",children:[r.number,r.marked&&e.jsx(x.div,{className:"dauber",initial:{scale:0},animate:{scale:1},transition:{duration:.3}})]})})},`${s}-${u}`)))})})]})})}),se=p(x.button)`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  font-size: ${n=>n.isFree?"calc(12px + 0.3vw)":"calc(16px + 0.5vw)"};
  font-weight: bold;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: ${n=>n.isFree?"linear-gradient(135deg, #4ecdc4, #2cb5ab)":n.marked?"#4ecdc4":"#fff"};
  color: ${n=>n.marked||n.isFree?"#fff":"#333"};
  box-shadow: ${n=>n.marked?"0 4px 8px rgba(78, 205, 196, 0.3)":"0 4px 8px rgba(0,0,0,0.1)"};
  cursor: ${n=>n.marked?"default":"pointer"};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: ${n=>n.marked?"none":"scale(1.1)"};
    box-shadow: ${n=>n.marked?"0 4px 8px rgba(78, 205, 196, 0.3)":"0 6px 12px rgba(0,0,0,0.2)"};
  }

  .cell-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .dauber {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
    z-index: 1;
  }
`;p.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at center, #000 1px, transparent 1px);
  background-size: 10px 10px;
  pointer-events: none;
`;const Qe=({onStartGame:n})=>{const[a,t]=h.useState(2),[i,o]=h.useState(10),[s,r]=h.useState([]),[u,m]=h.useState("English"),b=(d,j)=>{if(s.length<a){const v=["light","info","warning","danger","primary","secondary","success","dark"],k=j===0?"warning":v[(s.length-(j===0?1:0))%v.length];r([...s,{name:d,card:Xe(),color:k}])}};return e.jsxs($,{children:[e.jsx(U,{children:e.jsx("h4",{children:"Game Setup"})}),e.jsx(G,{children:e.jsxs(Ve,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsx(_,{htmlFor:"language",children:"Voice Language"}),e.jsx("select",{className:"form-select",id:"language",value:u,onChange:d=>m(d.target.value),children:Object.entries(Y).map(([d,j])=>e.jsx("option",{value:d,children:j.label},d))})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(_,{htmlFor:"playerCount",children:"Number of Players (2-100)"}),e.jsx(D,{id:"playerCount",type:"number",min:"2",max:"100",value:a,onChange:d=>t(Math.min(100,Math.max(2,parseInt(d.target.value)||2)))})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(_,{htmlFor:"drawLimit",children:"Number of Draws (10-100)"}),e.jsx(D,{id:"drawLimit",type:"number",min:"10",max:"100",value:i,onChange:d=>o(Math.min(100,Math.max(10,parseInt(d.target.value)||10)))})]}),s.length<a&&e.jsxs("div",{className:"mb-3",children:[e.jsx(_,{htmlFor:"playerName",children:"Player Name"}),e.jsxs("div",{className:"d-flex",children:[e.jsx(D,{id:"playerName",placeholder:`Enter Player ${s.length+1} name`,onKeyPress:d=>{d.key==="Enter"&&d.target.value&&(b(d.target.value,s.length),d.target.value="")}}),e.jsxs(T,{color:"primary",className:"ms-2",onClick:()=>{const d=document.getElementById("playerName");d.value&&(b(d.value,s.length),d.value="")},children:[e.jsx(de,{icon:Te,className:"me-2"}),"Add Player"]})]})]}),s.length>0&&e.jsxs("div",{children:[e.jsx("h5",{className:"mb-2",children:"Added Players:"}),e.jsx($,{className:"overflow-auto",style:{maxHeight:"200px"},children:e.jsx(G,{children:e.jsx("ul",{className:"list-unstyled",children:s.map((d,j)=>e.jsx("li",{children:d.name},j))})})})]}),s.length===a&&e.jsx(T,{color:"success",className:"mt-3",onClick:()=>n(s,u,i),children:"Start Game"})]})})]})},be=p(x.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`,xe=p(x.div)`
  background: linear-gradient(145deg, #f3ec78, #af4261);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 90vw;
  width: 600px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
`;p(x.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
`;p(x.div)`
  background: linear-gradient(135deg, #ff6b6b, #ff8787);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;const et=p.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 2rem auto;
  perspective: 1000px;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`,tt=p.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  overflow: hidden;
  border: 4px solid rgba(255,255,255,0.2);
`,nt=p(x.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`,at=p(x.div)`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: inset -2px -2px 8px rgba(0,0,0,0.1);
  color: #2c3e50;
`,it=p(x.div)`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ff8787);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 8px 32px rgba(255,107,107,0.4);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
`,st=({number:n,column:a})=>{const[t,i]=h.useState(!0),o=15,s=Array.from({length:o},(r,u)=>({id:u,number:Math.floor(Math.random()*25)+1,radius:80,angle:360/o*u}));return h.useEffect(()=>{i(!0);const r=setTimeout(()=>{i(!1)},2e3);return()=>clearTimeout(r)},[n]),e.jsx(et,{children:e.jsxs(tt,{children:[e.jsx(Oe,{children:t?e.jsx(nt,{animate:{rotate:360},transition:{duration:2,repeat:1/0,ease:"linear"},children:s.map(r=>e.jsx(at,{initial:{x:Math.cos(r.angle*(Math.PI/180))*r.radius,y:Math.sin(r.angle*(Math.PI/180))*r.radius},children:r.number},r.id))}):e.jsx(it,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0,transition:{type:"spring",damping:12,stiffness:200}},whileHover:{scale:1.1,rotate:[0,-10,10,0],transition:{duration:.5}},children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"column-letter",children:a}),e.jsx("div",{className:"number",children:n})]})})}),e.jsx(x.div,{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)",pointerEvents:"none"}})]})})},rt=({winners:n})=>{const[a,t]=h.useState({width:window.innerWidth,height:window.innerHeight});return h.useEffect(()=>{const i=()=>{t({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]),e.jsxs(be,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:[e.jsx(Ce,{width:a.width,height:a.height,recycle:!0,numberOfPieces:500,gravity:.3,tweenDuration:5e3,colors:["#ff6b6b","#4ecdc4","#fff176","#64b5f6","#ba68c8"]}),e.jsxs(xe,{initial:{scale:0,y:-1e3},animate:{scale:1,y:0,transition:{type:"spring",damping:15,stiffness:100}},children:[e.jsx(x.div,{animate:{scale:[1,1.2,1],rotate:[0,10,-10,0]},transition:{duration:1,repeat:1/0,repeatType:"reverse"},children:e.jsx("h1",{className:"display-1 mb-4",style:{color:"#ffffff",textShadow:"2px 2px 4px rgba(0,0,0,0.3)"},children:"🎉 BINGO! 🎉"})}),n.map((i,o)=>e.jsxs(x.div,{className:"mb-4",children:[e.jsxs(x.h2,{className:"display-4 mb-4",style:{color:"#ffe066",textShadow:"1px 1px 2px rgba(0,0,0,0.2)"},animate:{color:["#ffe066","#ffdd57","#ffe066"]},transition:{duration:2,repeat:1/0},children:[i.name," Wins!"]}),e.jsx(fe,{card:i.card,color:i.color,isFirst:n.indexOf(i)===0,isCurrentPlayer:!0})]},o)),e.jsx(x.div,{whileHover:{scale:1.1},whileTap:{scale:.9},children:e.jsx(T,{color:"primary",size:"lg",className:"mt-4",onClick:()=>window.location.reload(),children:"New Game"})})]})]})},ot=async n=>{const a=await new Promise(i=>{const o=window.speechSynthesis.getVoices();o.length?i(o):window.speechSynthesis.onvoiceschanged=()=>{i(window.speechSynthesis.getVoices())}}),t=Y[n].code;return a.some(i=>i.lang.startsWith(t))},lt=p(be)`
  background: rgba(0, 0, 0, 0.95);
`,ct=p(xe)`
  background: linear-gradient(145deg, #8e9eab, #eef2f3);
  color: #333333;
`,dt=({onNewGame:n})=>e.jsx(lt,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:e.jsxs(ct,{initial:{scale:0,y:-1e3},animate:{scale:1,y:0,transition:{type:"spring",damping:15,stiffness:100}},children:[e.jsxs(x.div,{animate:{scale:[1,1.1,1],rotate:[0,5,-5,0]},transition:{duration:2,repeat:1/0,repeatType:"reverse"},children:[e.jsx("h1",{className:"display-1 mb-4",children:"Game Over!"}),e.jsx("p",{className:"lead mb-4",children:"No winners after 10 draws"})]}),e.jsx(x.div,{whileHover:{scale:1.1},whileTap:{scale:.9},children:e.jsx(T,{color:"primary",size:"lg",className:"mt-4",onClick:n,children:"Start New Game"})})]})}),re=p(Ne)`
  min-height: 100vh;
  position: relative;
  padding: 2rem 1rem;
  z-index: 1;
`,W=["/bingoo.png","/bingoo3.jpg","/bingoo4.jpg","/bingoo5.jpg","/bingoo7.jpg","/bingoo8.jpg"],oe=p.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
`,ut=p.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${n=>n.active?.8:0};
  transition: opacity 1s ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%) scale(1.1);
    background-image: url(${n=>n.image});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: brightness(1.1) contrast(1.1) saturate(1.2);
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    will-change: transform; /* Optimize performance */
    backface-visibility: hidden; /* Prevent flickering */
    -webkit-backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
  }

  /* Add progressive enhancement for modern browsers */
  @supports (object-fit: cover) {
    &::before {
      object-fit: cover;
      object-position: center;
    }
  }
`,ht=p.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000; /* Add black background to prevent any white showing */
`,le=()=>{const[n,a]=h.useState(0),[t,i]=h.useState(!1);return h.useEffect(()=>{(async()=>{const s=W.map(r=>new Promise((u,m)=>{const b=new Image;b.src=r,b.onload=u,b.onerror=m}));try{await Promise.all(s),i(!0)}catch(r){console.error("Error loading images:",r)}})()},[]),h.useEffect(()=>{if(!t)return;const o=setInterval(()=>{a(s=>(s+1)%W.length)},3e3);return()=>clearInterval(o)},[t]),t?e.jsx(oe,{children:e.jsx(ht,{children:W.map((o,s)=>e.jsx(ut,{image:o,active:s===n},o))})}):e.jsx(oe,{children:"Loading..."})},ce=p.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, rgba(238, 119, 82, 0.7), rgba(231, 60, 126, 0.7), rgba(35, 166, 213, 0.7), rgba(35, 213, 171, 0.7));
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  z-index: -1;
  mix-blend-mode: overlay;

  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`,Et=()=>{const[n,a]=h.useState("setup"),[t,i]=h.useState("English"),[o,s]=h.useState([]),[r,u]=h.useState(0),[m,b]=h.useState([]),[d,j]=h.useState(null),[v,k]=h.useState([]),[V,O]=h.useState(0),[B,y]=h.useState(!1),[z,P]=h.useState(!1),[E,I]=h.useState(null),[S,M]=h.useState(0),[C,ve]=h.useState(10);h.useEffect(()=>{(async()=>{await ge()})()},[]);const ye=(c,l,g)=>{console.log("Starting game with language:",l,"and draw limit:",g),s(c),i(l||"English"),ve(g),a("playing"),H("Welcome to Bingo!",l||"English").catch(N=>console.error("Speech synthesis test failed:",N))},X=c=>{s(l=>l.map(g=>({...g,card:g.card.map(N=>N.map(A=>A.number===c?{...A,marked:!0}:{...A}))})))},we=async()=>{if(S>=C||m.length===75||n!=="playing"||B){z&&(clearInterval(E),I(null),P(!1));return}try{y(!0);const c=Q(m);if(!c)return;const l=S+1;M(l),l>=C&&(a("finished"),z&&(clearInterval(E),I(null),P(!1))),j(c),b(N=>[...N,c]);const g=ee(c.column,c.number,t);console.log("Speaking:",g),await new Promise(N=>setTimeout(N,2e3)),await H(g,t),await new Promise(N=>setTimeout(N,2e3)),X(c.number)}catch(c){console.error("Error calling number:",c)}finally{y(!1)}};h.useEffect(()=>{const c=o.filter(l=>je(l.card)&&!v.includes(l)).slice(0,2-v.length);c.length>0?(k([...v,...c]),v.length===0&&a("winner")):u((r+1)%o.length)},[m]);const je=c=>{for(let l=0;l<5;l++)if(c[l].every(g=>g.marked)||c.every(g=>g[l].marked))return!0;return!!(c.every((l,g)=>l[g].marked)||c.every((l,g)=>l[4-g].marked))};h.useEffect(()=>{n==="playing"&&(async()=>{await ot(t)||alert(`Voice for ${Y[t].label} is not available. Using English as fallback.`)})()},[t,n]),h.useEffect(()=>{typeof window<"u"&&window.speechSynthesis&&(window.speechSynthesis.getVoices(),window.speechSynthesis.onvoiceschanged=()=>{const c=window.speechSynthesis.getVoices();console.log("Available voices:",c.map(l=>`${l.name} (${l.lang})`))})},[]);const ke=async()=>{if(z)E&&(clearInterval(E),I(null));else{if(S>=C)return;const c=setInterval(async()=>{if(S>=C||m.length===75||n!=="playing"||B){clearInterval(c),I(null),P(!1),S>=C&&!v.length&&a("finished");return}if(!B)try{y(!0);const l=Q(m);if(!l){clearInterval(c),I(null),P(!1);return}const g=S+1;M(g),g>=C&&(a("finished"),clearInterval(c),I(null),P(!1)),j(l),b(A=>[...A,l]);const N=ee(l.column,l.number,t);console.log("Speaking:",N),await new Promise(A=>setTimeout(A,2e3)),await H(N,t),await new Promise(A=>setTimeout(A,2e3)),X(l.number)}catch(l){console.error("Error in auto play:",l)}finally{y(!1)}},1e4);I(c)}P(!z)};h.useEffect(()=>()=>{E&&clearInterval(E)},[]),h.useEffect(()=>{S>=C&&(E&&(clearInterval(E),I(null),P(!1)),a("finished"))},[S,C]),h.useEffect(()=>{console.log("Called Numbers:",m),console.log("Players State:",o)},[m,o]);const Se=()=>{a("setup"),M(0),b([]),j(null),k([]),s([]),u(0),O(0),E&&(clearInterval(E),I(null)),P(!1)};if(n==="setup")return e.jsxs(re,{fluid:!0,children:[e.jsx(le,{}),e.jsx(ce,{}),e.jsx(Qe,{onStartGame:ye})]});const R=[];for(let c=0;c<o.length;c+=10)R.push(o.slice(c,c+10));return e.jsxs(re,{fluid:!0,children:[e.jsx(le,{}),e.jsx(ce,{}),e.jsxs("div",{className:"bg-light p-5 mb-4 rounded shadow-lg",children:[e.jsx(x.h1,{className:"display-3 text-center",animate:{scale:[1,1.05,1],color:["#333","#ff6b6b","#333"]},transition:{duration:2,repeat:1/0},style:{fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"},children:"Bingo Night!"}),e.jsx(Z,{className:"justify-content-center mb-3",children:e.jsx(J,{xs:"12",md:"6",className:"text-center",children:e.jsxs("div",{className:"d-flex justify-content-center gap-3",children:[e.jsxs(T,{color:"primary",size:"lg",onClick:we,disabled:n==="finished"||B||z||S>=C,className:"shadow",children:[e.jsx(de,{icon:ze,className:"me-2"}),B?"Speaking...":S>=C?"Game Over":"Call Number"]}),e.jsx(T,{color:z?"danger":"success",size:"lg",onClick:ke,disabled:n==="finished"||S>=C,className:"shadow",children:z?"Stop Auto Call":"Start Auto Call"})]})})}),e.jsx(Je,{children:e.jsxs("span",{style:{fontSize:"1.5rem",fontWeight:"bold"},children:["Draw ",S,"/",C]})}),d&&e.jsx(st,{number:d.number,column:d.column}),v.length>0&&e.jsxs(Ee,{color:"success",className:"text-center shadow-lg",children:[e.jsxs("h3",{className:"mb-2",children:["BINGO! ",v.map(c=>c.name).join(", ")," ",v.length===1?"has":"have"," won!"]}),n!=="finished"&&e.jsx("p",{className:"mb-0",children:"The game continues for other players to achieve Bingo as well."})]})]}),e.jsxs($,{className:"shadow-lg",children:[e.jsx(U,{children:e.jsx(Pe,{variant:"tabs",role:"tablist",className:"card-header bg-dark text-white",children:R.map((c,l)=>e.jsx(Ie,{children:e.jsxs(Le,{active:V===l,onClick:()=>O(l),style:{cursor:"pointer"},children:["Group ",l+1]})},l))})}),e.jsx(G,{children:e.jsx(Ae,{children:R.map((c,l)=>e.jsx(Be,{visible:V===l,children:e.jsx(Z,{className:"g-4",children:c.map((g,N)=>e.jsx(J,{xs:12,sm:6,md:4,lg:3,xl:5,children:e.jsxs($,{className:"h-100 shadow-sm",children:[e.jsx(U,{className:`bg-${g.color} text-white`,children:e.jsxs("h4",{className:"mb-0",children:[g.name,"'s Card"]})}),e.jsx(G,{className:"p-2",children:e.jsx(fe,{card:g.card,color:g.color,isFirst:N===0&&l===0,isCurrentPlayer:o.indexOf(g)===r&&n==="playing"})})]})},N))})},l))})})]}),n==="winner"&&e.jsx(rt,{winners:v}),S>=C&&!v.length&&e.jsx(dt,{onNewGame:Se})]})};export{Et as default};

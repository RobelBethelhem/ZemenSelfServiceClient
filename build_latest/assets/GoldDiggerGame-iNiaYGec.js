import{r as l,j as e}from"./index-C-XzS4Y3.js";import{d as f}from"./styled-components.browser.esm-BGPZCG7c.js";import{C as P}from"./react-confetti.min-CK30oMj-.js";import{m as d}from"./proxy-W7PsZfmF.js";import{b as $,a as C}from"./logo-Bk6Uziqt.js";import{C as v,a as w}from"./CCardBody-DAMnYs85.js";import{C as k}from"./CCardHeader-CD31VLri.js";import{C as z,a as b}from"./CFormLabel-5gSGvcEP.js";import{C as j}from"./CFormInput-DiPmyF9A.js";import"./emotion-unitless.esm-sScrWPmR.js";const F=f(v)`
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
  background-color: ${t=>t.color==="light"?"#fff":`var(--cui-bg-${t.color})`};
  color: ${t=>t.color==="light"?"#000":"#fff"};
`,B=f.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
`,E=f.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(${t=>t.size}, 1fr);
  grid-template-rows: repeat(${t=>t.size}, 1fr);
  gap: 2px;
`,I=f(d.button)`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  font-size: ${t=>`calc(20px / ${Math.sqrt(t.size)} + 0.8vw)`};
  font-weight: bold;
  border: none;
  background: ${t=>t.marked?t.isGold?"#FFD700":"#4ecdc4":"#fff"};
  color: ${t=>t.marked?"#fff":"#333"};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  cursor: ${t=>t.disabled?"not-allowed":"pointer"};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.2) 0%,
      rgba(255,255,255,0) 50%,
      rgba(0,0,0,0.1) 100%
    );
    opacity: ${t=>t.marked?.8:.4};
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    
    &:before {
      opacity: 0.6;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`,W=t=>{const a=t*t,o=Math.floor(Math.random()*a),n=[];let r=1;for(let i=0;i<t;i++){const p=[];for(let c=0;c<t;c++){const m=i*t+c;p.push({number:r,isGold:m===o,marked:!1}),r++}n.push(p)}return n},M=({winner:t})=>{const[a,o]=l.useState({width:window.innerWidth,height:window.innerHeight});return l.useEffect(()=>{const n=()=>{o({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[]),e.jsxs(d.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},style:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0, 0, 0, 0.8)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1e3},children:[e.jsx(P,{width:a.width,height:a.height,recycle:!0,numberOfPieces:500,gravity:.3,tweenDuration:5e3,colors:["#ff6b6b","#4ecdc4","#fff176","#64b5f6","#ba68c8"]}),e.jsxs(d.div,{initial:{scale:0,y:-100},animate:{scale:1,y:0},transition:{type:"spring",damping:15},style:{background:"white",padding:"2rem",borderRadius:"20px",textAlign:"center",maxWidth:"90vw"},children:[e.jsx(d.h1,{animate:{scale:[1,1.2,1],rotate:[0,10,-10,0]},transition:{duration:.5,repeat:1/0,repeatType:"reverse"},style:{marginBottom:"2rem"},children:"🎉 Congratulations! 🎉"}),e.jsxs("h2",{style:{color:"#4ecdc4",marginBottom:"2rem"},children:[t.name," found the Gold! 🏆"]}),e.jsx(C,{color:"primary",onClick:()=>window.location.reload(),children:"Play Again"})]})]})},D=({onStartGame:t})=>{const[a,o]=l.useState(2),[n,r]=l.useState(2),[i,p]=l.useState([]);l.useState(""),l.useEffect(()=>{n<a&&r(a)},[a]);const c=s=>{i.length<a&&p([...i,{name:s}])},m=()=>{const s=[...i].sort(()=>Math.random()-.5),h=W(n);t(s,n,h)};return e.jsxs(v,{children:[e.jsx(k,{children:e.jsx("h4",{children:"Game Setup"})}),e.jsx(w,{children:e.jsxs(z,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsx(b,{htmlFor:"playerCount",children:"Number of Players (2-8)"}),e.jsx(j,{id:"playerCount",type:"number",min:"2",max:"8",value:a,onChange:s=>o(Math.min(8,Math.max(2,parseInt(s.target.value)||2)))})]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(b,{htmlFor:"cardSize",children:["Card Size (",a,"-10)"]}),e.jsx(j,{id:"cardSize",type:"number",min:a,max:10,value:n,onChange:s=>r(Math.min(10,Math.max(a,parseInt(s.target.value)||a)))})]}),i.length<a&&e.jsxs("div",{className:"mb-3",children:[e.jsx(b,{htmlFor:"playerName",children:"Player Name"}),e.jsxs("div",{className:"d-flex",children:[e.jsx(j,{id:"playerName",placeholder:`Enter Player ${i.length+1} name`,onKeyPress:s=>{s.key==="Enter"&&s.target.value&&(c(s.target.value),s.target.value="")}}),e.jsx(C,{color:"primary",className:"ms-2",onClick:()=>{const s=document.getElementById("playerName");s.value&&(c(s.value),s.value="")},children:"Add Player"})]})]}),i.length>0&&e.jsxs("div",{children:[e.jsx("h5",{className:"mb-2",children:"Players Turn Order:"}),e.jsx(v,{className:"overflow-auto",style:{maxHeight:"200px"},children:e.jsx(w,{children:e.jsx("ol",{className:"list-group list-group-numbered",children:i.map((s,h)=>e.jsx("li",{className:"list-group-item",children:s.name},h))})})})]}),i.length===a&&e.jsx(C,{color:"success",className:"mt-3",onClick:m,children:"Start Game"})]})})]})},H=({card:t,isCurrentPlayer:a,onCellClick:o,playerName:n})=>e.jsx(d.div,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0},transition:{type:"spring",duration:1},children:e.jsxs(F,{color:"light",className:`mb-0 ${a?"border-primary border-3":""}`,children:[e.jsx(k,{className:"text-center py-2",children:e.jsxs(d.h5,{className:"mb-0",initial:{opacity:0,y:-20},animate:{opacity:1,y:0},transition:{delay:1,duration:.5},children:[n,"'s Card"]})}),e.jsx(w,{className:"p-2",children:e.jsx(B,{children:e.jsx(E,{size:t.length,children:t.flat().map((r,i)=>e.jsx(d.div,{initial:{scale:0,rotate:-180,opacity:0},animate:{scale:1,rotate:0,opacity:1},transition:{type:"spring",stiffness:260,damping:20,delay:i*.05,duration:.8},children:e.jsx(I,{onClick:()=>a&&!r.marked&&o(i),whileHover:a&&!r.marked?{scale:1.1,boxShadow:"0 8px 16px rgba(0,0,0,0.2)",transition:{duration:.2}}:{},whileTap:a&&!r.marked?{scale:.95,rotate:-10}:{},animate:{backgroundColor:r.marked?r.isGold?"#FFD700":"#4ecdc4":"#fff",scale:r.marked?[1,1.2,1]:1,rotate:r.marked?[0,360,0]:0},transition:{duration:.6,type:"spring",stiffness:200,damping:10},disabled:r.marked||!a,size:t.length,marked:r.marked,isGold:r.isGold,children:e.jsx(d.span,{initial:{scale:0},animate:{scale:1},transition:{delay:i*.05+.5},children:r.marked?e.jsx(d.span,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0},transition:{duration:.5,type:"spring"},children:r.isGold?"🏆":"❌"}):e.jsx(d.span,{whileHover:{scale:1.2},style:{display:"inline-block"},children:r.number})})})},i))})})})]})}),U=()=>{const[t,a]=l.useState("setup"),[o,n]=l.useState([]),[r,i]=l.useState(0),[p,c]=l.useState(null),[m,s]=l.useState(null),h=(u,x,g)=>{n(u),s(g),i(0),a("playing")},N=u=>{if(t!=="playing")return;const g=m.flat()[u];if(g.marked)return;const S=m.map(G=>G.map(y=>y===g?{...y,marked:!0}:y));s(S),g.isGold?(c(o[r]),a("winner")):i((r+1)%o.length)};return e.jsxs($,{fluid:!0,children:[t==="setup"&&e.jsx(D,{onStartGame:h}),t==="playing"&&m&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"bg-light p-4 mb-4 rounded",children:e.jsxs("h2",{className:"text-center",children:["Current Turn: ",o[r].name]})}),e.jsx("div",{className:"d-flex justify-content-center",children:e.jsx("div",{style:{maxWidth:"600px",width:"100%"},children:e.jsx(H,{card:m,isCurrentPlayer:!0,onCellClick:N,playerName:"Gold Digger"})})}),e.jsxs("div",{className:"mt-4",children:[e.jsx("h5",{className:"text-center mb-3",children:"Players Turn Order:"}),e.jsx("div",{className:"d-flex justify-content-center flex-wrap gap-2",children:o.map((u,x)=>e.jsx("div",{className:`badge ${x===r?"bg-primary":"bg-secondary"} p-2`,style:{fontSize:"1rem"},children:u.name},x))})]})]}),t==="winner"&&p&&e.jsx(M,{winner:p})]})};export{U as default};

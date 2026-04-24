import{r as c,j as e}from"./index-B6oVdzIg.js";import{d as x}from"./styled-components.browser.esm-DlRXTL0c.js";import{C as G}from"./react-confetti.min-DBCcDYV2.js";import{m}from"./proxy-BZt8nq9-.js";import{b as P,a as C}from"./logo-CX7RpXdV.js";import{C as z,a as $}from"./CRow-GJdf8ZQz.js";import{C as w,a as v}from"./CCardBody-B0nWpZ0V.js";import{C as N}from"./CCardHeader-DC0Mlzoy.js";import{C as F,a as b}from"./CFormLabel-Soh_jztQ.js";import{C as j}from"./CFormInput-BZce5gF0.js";import{C as B}from"./CAlert-ByFTOTea.js";import"./emotion-unitless.esm-sScrWPmR.js";import"./DefaultLayout-Cvokl6XA.js";const E=x(w)`
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
  background-color: ${t=>t.color==="light"?"#fff":`var(--cui-bg-${t.color})`};
  color: ${t=>t.color==="light"?"#000":"#fff"};
`,M=x.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
`,I=x.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(${t=>t.size}, 1fr);
  grid-template-rows: repeat(${t=>t.size}, 1fr);
  gap: 2px;
`,W=x(m.button)`
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
`,D=t=>{const r=t*t,i=Math.floor(Math.random()*r),o=[];let l=1;for(let a=0;a<t;a++){const d=[];for(let p=0;p<t;p++){const f=a*t+p;d.push({number:l,isGold:f===i,marked:!1}),l++}o.push(d)}return o},A=({winner:t})=>{const[r,i]=c.useState({width:window.innerWidth,height:window.innerHeight});return c.useEffect(()=>{const o=()=>{i({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),e.jsxs(m.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},style:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0, 0, 0, 0.8)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1e3},children:[e.jsx(G,{width:r.width,height:r.height,recycle:!0,numberOfPieces:500,gravity:.3,tweenDuration:5e3,colors:["#ff6b6b","#4ecdc4","#fff176","#64b5f6","#ba68c8"]}),e.jsxs(m.div,{initial:{scale:0,y:-100},animate:{scale:1,y:0},transition:{type:"spring",damping:15},style:{background:"white",padding:"2rem",borderRadius:"20px",textAlign:"center",maxWidth:"90vw"},children:[e.jsx(m.h1,{animate:{scale:[1,1.2,1],rotate:[0,10,-10,0]},transition:{duration:.5,repeat:1/0,repeatType:"reverse"},style:{marginBottom:"2rem"},children:"🎉 Congratulations! 🎉"}),e.jsxs("h2",{style:{color:"#4ecdc4",marginBottom:"2rem"},children:[t.name," found the Gold! 🏆"]}),e.jsx(C,{color:"primary",onClick:()=>window.location.reload(),children:"Play Again"})]})]})},H=({onStartGame:t})=>{const[r,i]=c.useState(2),[o,l]=c.useState(2),[a,d]=c.useState([]),[p,f]=c.useState("");c.useEffect(()=>{o<r&&l(r)},[r]);const u=s=>{if(a.length<r){const n=["light","info","warning","danger","primary","secondary","success","dark"];d([...a,{name:s,color:n[a.length%n.length]}])}},y=()=>{const s=[...a].map(n=>({...n,card:D(o)})).sort(()=>Math.random()-.5);t(s,o)};return e.jsxs(w,{children:[e.jsx(N,{children:e.jsx("h4",{children:"Gold Digger Game Setup"})}),e.jsx(v,{children:e.jsxs(F,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsx(b,{htmlFor:"playerCount",children:"Number of Players (2-100)"}),e.jsx(j,{id:"playerCount",type:"number",min:"2",max:"100",value:r,onChange:s=>{const n=Math.min(100,Math.max(2,parseInt(s.target.value)||2));i(n)}})]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(b,{htmlFor:"cardSize",children:["Card Size (",r,"-100)"]}),e.jsx(j,{id:"cardSize",type:"number",min:r,max:"100",value:o,onChange:s=>{const n=Math.min(100,Math.max(r,parseInt(s.target.value)||r));l(n)}})]}),a.length<r&&e.jsxs("div",{className:"mb-3",children:[e.jsx(b,{htmlFor:"playerName",children:"Player Name"}),e.jsxs("div",{className:"d-flex",children:[e.jsx(j,{id:"playerName",placeholder:`Enter Player ${a.length+1} name`,onKeyPress:s=>{s.key==="Enter"&&s.target.value&&(u(s.target.value),s.target.value="")}}),e.jsx(C,{color:"primary",className:"ms-2",onClick:()=>{const s=document.getElementById("playerName");s.value&&(u(s.value),s.value="")},children:"Add Player"})]})]}),p&&e.jsx(B,{color:"danger",children:p}),a.length>0&&e.jsxs("div",{children:[e.jsx("h5",{className:"mb-2",children:"Players Turn Order:"}),e.jsx(w,{className:"overflow-auto",style:{maxHeight:"200px"},children:e.jsx(v,{children:e.jsx("ol",{className:"list-group list-group-numbered",children:a.map((s,n)=>e.jsx("li",{className:"list-group-item",children:s.name},n))})})})]}),a.length===r&&e.jsx(C,{color:"success",className:"mt-3",onClick:y,children:"Start Game"})]})})]})},R=({card:t,color:r,isCurrentPlayer:i,onCellClick:o,playerName:l})=>e.jsx(m.div,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0},transition:{type:"spring",duration:1},children:e.jsxs(E,{color:r,className:`mb-0 ${i?"border-primary border-3":""}`,children:[e.jsx(N,{className:"text-center py-2",children:e.jsxs(m.h5,{className:"mb-0",initial:{opacity:0,y:-20},animate:{opacity:1,y:0},transition:{delay:1,duration:.5},children:[l,"'s Card"]})}),e.jsx(v,{className:"p-2",children:e.jsx(M,{children:e.jsx(I,{size:t.length,children:t.flat().map((a,d)=>e.jsx(m.div,{initial:{scale:0,rotate:-180,opacity:0},animate:{scale:1,rotate:0,opacity:1},transition:{type:"spring",stiffness:260,damping:20,delay:d*.05,duration:.8},children:e.jsx(W,{onClick:()=>i&&!a.marked&&o(d),whileHover:i&&!a.marked?{scale:1.1,boxShadow:"0 8px 16px rgba(0,0,0,0.2)",transition:{duration:.2}}:{},whileTap:i&&!a.marked?{scale:.95,rotate:-10}:{},animate:{backgroundColor:a.marked?a.isGold?"#FFD700":"#4ecdc4":"#fff",scale:a.marked?[1,1.2,1]:1,rotate:a.marked?[0,360,0]:0},transition:{duration:.6,type:"spring",stiffness:200,damping:10},disabled:a.marked||!i,size:t.length,marked:a.marked,isGold:a.isGold,children:e.jsx(m.span,{initial:{scale:0},animate:{scale:1},transition:{delay:d*.05+.5},children:a.marked?e.jsx(m.span,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0},transition:{duration:.5,type:"spring"},children:a.isGold?"🏆":"❌"}):e.jsx(m.span,{whileHover:{scale:1.2},style:{display:"inline-block"},children:a.number})})})},d))})})})]})}),te=()=>{const[t,r]=c.useState("setup"),[i,o]=c.useState([]),[l,a]=c.useState(0),[d,p]=c.useState(null),[f,u]=c.useState(0),y=(n,h)=>{o(n),u(h),a(0),r("playing")},s=(n,h)=>{if(t!=="playing"||n!==l)return;const g=[...i],k=g[n],S=k.card.flat()[h];S.marked=!0,S.isGold?(p(k),r("winner")):a((l+1)%i.length),o(g)};return e.jsxs(P,{fluid:!0,children:[t==="setup"&&e.jsx(H,{onStartGame:y}),t==="playing"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"bg-light p-4 mb-4 rounded",children:e.jsxs("h2",{className:"text-center",children:["Current Turn: ",i[l].name]})}),e.jsx(z,{className:"g-4",children:i.map((n,h)=>e.jsx($,{xs:12,sm:6,md:4,lg:3,children:e.jsx(R,{card:n.card,color:n.color,isCurrentPlayer:h===l,onCellClick:g=>s(h,g),playerName:n.name})},h))})]}),t==="winner"&&d&&e.jsx(A,{winner:d})]})};export{te as default};

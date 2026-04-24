import{r as c,j as e}from"./index-B6oVdzIg.js";import{b as L,a as C,c as W}from"./logo-CX7RpXdV.js";import{d as y}from"./styled-components.browser.esm-DlRXTL0c.js";import{C as B,a as z}from"./CRow-GJdf8ZQz.js";import{c as H}from"./cil-volume-high-D3jFsj8z.js";import{C as G}from"./CAlert-ByFTOTea.js";import{C as j,a as f}from"./CCardBody-B0nWpZ0V.js";import{C as w}from"./CCardHeader-DC0Mlzoy.js";import{C as R,a as O,b as q,c as K,d as V}from"./DefaultLayout-Cvokl6XA.js";import{C as X}from"./CSSTransition-MdIx9BDO.js";import{C as Y,a as S}from"./CFormLabel-Soh_jztQ.js";import{C as k}from"./CFormInput-BZce5gF0.js";import"./emotion-unitless.esm-sScrWPmR.js";const _=a=>{const o=[];for(let i=0;i<a;i++){const l=[];for(let d=0;d<a;d++)l.push({number:Math.floor(Math.random()*(a*a))+1,marked:!1});o.push(l)}return o},D=y(j)`
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    transform: rotateX(5deg) rotateY(5deg);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  }
`,J=y.div`
  width: 100%;
  padding-bottom: 100%; // This maintains the square aspect ratio
  position: relative;
  overflow: hidden;
`,Q=y.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(${a=>a.size}, 1fr);
  grid-template-rows: repeat(${a=>a.size}, 1fr);
  gap: 2px;
`,U=y(C)`
  width: 100%;
  height: 100%;
  padding: 0;
  border-radius: 50%;
  font-size: ${a=>`calc(16px / ${a.size} + 0.5vw)`};
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &.cell-enter {
    opacity: 0;
    transform: scale(0.8);
  }
  &.cell-enter-active {
    opacity: 1;
    transform: scale(1);
  }
  &.cell-exit {
    opacity: 1;
    transform: scale(1);
  }
  &.cell-exit-active {
    opacity: 0;
    transform: scale(0.8);
  }
`,Z=({card:a,color:o,isCurrentPlayer:i})=>e.jsx(D,{color:o,className:`mb-0 ${i?"border-primary border-3":""}`,children:e.jsx(f,{className:"p-2",children:e.jsx(J,{children:e.jsx(Q,{size:a.length,children:a.flat().map((l,d)=>e.jsx(X,{in:l.marked,timeout:300,classNames:"cell",children:e.jsx(U,{color:l.marked?"success":"light",disabled:l.marked,size:a.length,children:l.number})},d))})})})}),ee=({onStartGame:a})=>{const[o,i]=c.useState(2),[l,d]=c.useState(6),[m,u]=c.useState([]),g=t=>{if(m.length<o){const p=["light","info","warning","danger","primary","secondary","success","dark"];u([...m,{name:t,card:_(l),color:p[m.length%p.length]}])}};return e.jsxs(j,{children:[e.jsx(w,{children:e.jsx("h4",{children:"Game Setup"})}),e.jsx(f,{children:e.jsxs(Y,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsx(S,{htmlFor:"playerCount",children:"Number of Players (2-100)"}),e.jsx(k,{id:"playerCount",type:"number",min:"2",max:"100",value:o,onChange:t=>i(Math.min(100,Math.max(2,parseInt(t.target.value)||2)))})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx(S,{htmlFor:"cardSize",children:"Card Size (2-10)"}),e.jsx(k,{id:"cardSize",type:"number",min:"2",max:"10",value:l,onChange:t=>d(Math.min(10,Math.max(2,parseInt(t.target.value)||2)))})]}),m.length<o&&e.jsxs("div",{className:"mb-3",children:[e.jsx(S,{htmlFor:"playerName",children:"Player Name"}),e.jsxs("div",{className:"d-flex",children:[e.jsx(k,{id:"playerName",placeholder:`Enter Player ${m.length+1} name`,onKeyPress:t=>{t.key==="Enter"&&t.target.value&&(g(t.target.value),t.target.value="")}}),e.jsx(C,{color:"primary",className:"ms-2",onClick:()=>{const t=document.getElementById("playerName");t.value&&(g(t.value),t.value="")},children:"Add Player"})]})]}),m.length>0&&e.jsxs("div",{children:[e.jsx("h5",{className:"mb-2",children:"Added Players:"}),e.jsx(j,{className:"overflow-auto",style:{maxHeight:"200px"},children:e.jsx(f,{children:e.jsx("ul",{className:"list-unstyled",children:m.map((t,p)=>e.jsx("li",{children:t.name},p))})})})]}),m.length===o&&e.jsx(C,{color:"success",className:"mt-3",onClick:()=>a(m,l),children:"Start Game"})]})})]})},pe=()=>{const[a,o]=c.useState("setup"),[i,l]=c.useState([]),[d,m]=c.useState(0),[u,g]=c.useState([]),[t,p]=c.useState(null),[x,M]=c.useState([]),[P,A]=c.useState(0),[h,F]=c.useState(6),E=(s,r)=>{l(s),F(r),o("playing")},I=()=>{if(u.length===h*h)return;let s;do s=Math.floor(Math.random()*(h*h))+1;while(u.includes(s));g([...u,s]),p(s),$(s)},$=s=>{const r=i.map(n=>({...n,card:n.card.map(N=>N.map(v=>v.number===s?{...v,marked:!0}:v))}));l(r)},T=s=>{for(let r=0;r<h;r++)if(s[r].every(n=>n.marked)||s.every(n=>n[r].marked))return!0;return!!(s.every((r,n)=>r[n].marked)||s.every((r,n)=>r[h-1-n].marked))};if(c.useEffect(()=>{const s=i.filter(r=>T(r.card)&&!x.includes(r));s.length>0?(M([...x,...s]),x.length===0&&o("finished")):m((d+1)%i.length)},[u]),a==="setup")return e.jsx(ee,{onStartGame:E});const b=[];for(let s=0;s<i.length;s+=10)b.push(i.slice(s,s+10));return e.jsxs(L,{fluid:!0,children:[e.jsxs("div",{className:"bg-light p-5 mb-4 rounded",children:[e.jsx("h1",{className:"display-3 text-center",children:"Bingo Night!"}),e.jsx(B,{className:"justify-content-center mb-3",children:e.jsx(z,{xs:"12",md:"6",className:"text-center",children:e.jsxs(C,{color:"primary",size:"lg",onClick:I,disabled:a==="finished",children:[e.jsx(W,{icon:H,className:"me-2"}),"Call Number"]})})}),t&&e.jsx(G,{color:"info",className:"text-center",children:e.jsxs("h2",{className:"mb-0",children:["Last called number: ",t]})}),x.length>0&&e.jsxs(G,{color:"success",className:"text-center",children:[e.jsxs("h3",{className:"mb-2",children:["BINGO! ",x.map(s=>s.name).join(", ")," ",x.length===1?"has":"have"," won!"]}),a!=="finished"&&e.jsx("p",{className:"mb-0",children:"The game continues for other players to achieve Bingo as well."})]})]}),e.jsxs(j,{children:[e.jsx(w,{children:e.jsx(R,{variant:"tabs",role:"tablist",children:b.map((s,r)=>e.jsx(O,{children:e.jsxs(q,{active:P===r,onClick:()=>A(r),children:["Group ",r+1]})},r))})}),e.jsx(f,{children:e.jsx(K,{children:b.map((s,r)=>e.jsx(V,{visible:P===r,children:e.jsx(B,{className:"g-4",children:s.map((n,N)=>e.jsx(z,{xs:12,sm:6,md:4,lg:3,xl:h>6?4:3,children:e.jsxs(j,{children:[e.jsx(w,{children:e.jsxs("h4",{className:"mb-0",children:[n.name,"'s Card"]})}),e.jsx(f,{className:"p-2",children:e.jsx(Z,{card:n.card,color:n.color,isCurrentPlayer:i.indexOf(n)===d&&a==="playing"})})]})},N))})},r))})})]})]})};export{pe as default};

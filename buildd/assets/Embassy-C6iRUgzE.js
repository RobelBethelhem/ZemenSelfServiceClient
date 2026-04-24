import{u as A,r as l,j as e,R as F,y as P}from"./index-B6oVdzIg.js";import{l as B,n as O}from"./nuru_signature-O3HsIx5w.js";import{C as U,w as y,s as V,Q as $}from"./spaced-BbSuxHKG.js";import{h as j,E as Y}from"./html2canvas.esm-CtbZB9rZ.js";import{C as Z}from"./react-confetti.min-DBCcDYV2.js";import{m as q}from"./proxy-BZt8nq9-.js";import{C as G,a as Q}from"./CCardBody-B0nWpZ0V.js";import{C as X}from"./CFormLabel-Soh_jztQ.js";import{b as J}from"./logo-CX7RpXdV.js";const m=({path:a,viewBox:t="0 0 24 24"})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:t,width:"18",height:"18",fill:"currentColor",children:e.jsx("path",{d:a})}),K=a=>{const t=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],c=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];if(a===0)return"Zero";const d=i=>i>=100?t[Math.floor(i/100)]+" Hundred "+d(i%100):i>=20?o[Math.floor(i/10)]+" "+t[i%10]:i>=10?c[i-10]:t[i],r=i=>i>=1e6?r(Math.floor(i/1e6))+" Million "+r(i%1e6):i>=1e3?r(Math.floor(i/1e3))+" Thousand "+r(i%1e3):d(i);return r(a).trim()},f=a=>{const t=new Date(a),o={year:"numeric",month:"long",day:"numeric"};return t.toLocaleDateString("en-US",o)},he=()=>{var w;const t=(w=A().state)==null?void 0:w.rowData,[o,c]=l.useState(!1);if(!t)return e.jsx("div",{children:"No data available"});const[d,r]=l.useState(!1),[i,v]=l.useState({width:window.innerWidth,height:window.innerHeight}),C=t.employee_first_name,_=t.employee_last_name,S=t.employee_middle_name,N=t.reference_number,h=`${C} ${S} ${_}`,R=t.employee_embassy_name,k=t.embassy_location||"Addis Ababa",u=t.annual_salary,E=t.employee_position,L=f(t.date_of_employment),T=t.viewed_date?f(t.viewed_date):f(new Date),z=K(u),b=100,g=F.useRef();l.useEffect(()=>{const n=()=>{v({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[]),l.useEffect(()=>{I(!0);const n=setTimeout(()=>{r(!0)},3e3);return()=>clearTimeout(n)},[]);const D=()=>{const n=g.current;j(n,{scale:2,useCORS:!0,allowTaint:!0,scrollY:-window.scrollY,width:n.offsetWidth,height:n.offsetHeight,windowWidth:n.scrollWidth,windowHeight:n.scrollHeight,backgroundColor:"#ffffff"}).then(p=>{const x=p.toDataURL("image/png"),s=window.open("","_blank");s.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print</title>
            <style>
              @page {
                size: A4;
                margin: 0mm;
                bleed: 0mm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              body {
                width: 210mm;
                height: 297mm;
                display: block;
                position: relative;
              }
              img {
                width: 210mm;
                height: 297mm;
                object-fit: fill;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  color-adjust: exact;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                @page {
                  margin: 0mm !important;
                }
              }
            </style>
          </head>
          <body>
            <img src="${x}" alt="Print content">
            <script>
              window.onload = function() {
                window.print();
              }
            <\/script>
          </body>
        </html>
      `),s.document.close(),s.focus(),setTimeout(()=>{s.print(),s.close()},250)})},W=()=>{const n=g.current;j(n,{scale:3,useCORS:!0,allowTaint:!0,scrollY:-window.scrollY,width:n.offsetWidth,height:n.offsetHeight,windowWidth:n.scrollWidth,windowHeight:n.scrollHeight,backgroundColor:"#ffffff"}).then(p=>{const x=p.toDataURL("image/png"),s=new Y({orientation:"portrait",unit:"mm",format:"a4",compress:!0});s.addImage(x,"PNG",0,0,210,297),s.save(`${h}_Embassy_Letter.pdf`)})},[H,I]=l.useState(!1),M={hidden:{opacity:0,rotate:360},visible:{opacity:1,rotate:0,transition:{duration:3,ease:"easeInOut"}}};return e.jsxs("div",{className:"d-flex justify-content-center align-items-center min-vh-100 bg-light",children:[d&&e.jsx(Z,{width:i.width,height:i.height,recycle:!0,numberOfPieces:500,gravity:.3,tweenDuration:5e3,colors:["#ff6b6b","#4ecdc4","#fff176","#64b5f6","#ba68c8"]}),e.jsx("div",{className:"d-flex justify-content-center align-items-center min-vh-100 bg-light",children:e.jsxs("div",{className:"position-relative",style:{width:"210mm",minHeight:"297mm",maxWidth:"100%",margin:"0 auto",backgroundColor:"white"},children:[e.jsxs("div",{className:"top-0 start-0 m-3 z-index-1",children:[e.jsx("button",{onClick:D,className:"btn btn-primary me-2",children:"Print"}),e.jsx("button",{onClick:W,className:"btn btn-success me-2",children:"Download as PDF"}),e.jsx("div",{className:"d-inline-flex align-items-center ms-3",children:e.jsx(U,{label:"Without Letterhead",id:"letterheadToggle",checked:o,onChange:n=>c(n.target.checked),style:{fontSize:"14px"}})})]}),e.jsx(q.div,{initial:"hidden",animate:H?"visible":"hidden",variants:M,style:{boxShadow:"0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",borderRadius:"0.25rem"},children:e.jsxs(G,{style:{width:"210mm",minHeight:"297mm",height:"297mm",maxWidth:"100%",position:"relative",overflow:"hidden",margin:0,padding:0,boxSizing:"border-box",border:"none",boxShadow:"none",borderRadius:0,backgroundColor:"white"},ref:g,children:[!o&&e.jsx("div",{style:{position:"absolute",top:"30px",left:"30px",bottom:"30px",width:"4px",backgroundColor:"red"}}),!o&&e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundImage:`url(${y})`,backgroundRepeat:"no-repeat",backgroundPosition:"33% 40%",backgroundSize:"150%",opacity:.08,pointerEvents:"none",transform:"rotate(-1deg)"}}),!o&&e.jsx("img",{src:B,alt:"Logo",style:{position:"absolute",top:"60px",left:"50px",width:"180px",height:"auto"}}),e.jsx(Q,{className:"ps-5 pe-4",style:{marginTop:o?"80px":"60px",paddingBottom:"40mm",height:"100%",boxSizing:"border-box"},children:e.jsx(X,{children:e.jsxs(J,{fluid:!0,className:"p-0",style:{height:"100%",fontFamily:"Calibri, sans-serif",minHeight:"calc(297mm - 140px)",position:"relative"},children:[e.jsxs("div",{className:"d-flex flex-column align-items-end mb-4",style:{marginLeft:"20px",marginRight:"20px"},children:[e.jsx("div",{className:"d-flex justify-content-end w-100",children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("span",{className:"me-2 text-nowrap fw-bold",children:"Date:"}),e.jsx("span",{className:"fw-bold",children:T})]})}),e.jsx("div",{className:"d-flex justify-content-end w-100",children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("span",{className:"me-2 text-nowrap fw-bold",children:"Ref. No.:"}),e.jsx("span",{className:"fw-bold",children:N})]})})]}),e.jsxs("div",{className:"d-flex flex-column mb-4",style:{marginLeft:"20px",marginRight:"20px"},children:[e.jsx("div",{className:"fw-bold",children:R}),e.jsx("div",{className:"text-decoration-underline fw-bold",children:k})]}),e.jsx("div",{className:"fw-bold mb-4",style:{marginLeft:"20px",marginRight:"20px"},children:"Dear Sir/Madam,"}),e.jsxs("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px",lineHeight:"1.8"},children:["Pursuant to the request of ",e.jsxs("strong",{children:["Mr./Ms. ",h]}),", we would like to certify that he/she is working in Zemen Bank S.C. on a permanent basis commencing his/her date of employment ",e.jsx("strong",{children:L}),"."]}),e.jsxs("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px",lineHeight:"1.8"},children:["Currently, ",e.jsxs("strong",{children:["Mr./Ms. ",h.split(" ")[0]]})," is serving in the capacity of ",e.jsx("strong",{children:E})," drawing an annual gross salary of ETB ",e.jsxs("strong",{children:[Number(u).toLocaleString("en-US",{maximumFractionDigits:2})," (",z,")"]}),", and other standard benefits per the Bank's procedure."]}),e.jsx("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px",lineHeight:"1.8"},children:"Income tax is being deducted from his/her basic salary on monthly basis and paid to the concerned governmental authority."}),e.jsx("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px",lineHeight:"1.8"},children:"Any assistance given to him/her is highly appreciated."}),e.jsx("div",{className:"mt-4 mb-5 fw-bold",style:{marginLeft:"20px",marginRight:"20px"},children:"Sincerely,"}),e.jsx("img",{src:O,alt:"Signature",style:{position:"absolute",left:"-35px",width:"150px",height:"auto",marginTop:"-55px"}}),e.jsxs("div",{style:{alignItems:"flex-start",marginTop:"10px",marginLeft:"20px",marginRight:"20px",position:"relative"},children:[e.jsxs("div",{className:"fw-bold",children:["Nuru Mustefa",e.jsx("br",{}),"Director, Performance Management & Employee Services Dep't"]}),!o&&e.jsx("img",{src:V,alt:"Stamp",style:{position:"absolute",left:"120px",width:"150px",height:"auto",top:"-80px"}})]}),e.jsx("div",{"data-qr-code":!0,style:{position:"absolute",width:b,height:b,left:"300px",bottom:"80px",zIndex:10},children:e.jsx($,{url:"https://www.zemenbank.com",size:80,logoUrl:y})}),e.jsx("div",{className:"fst-italic mt-3 position-absolute bottom-0 start-0",style:{paddingLeft:"5px",marginLeft:"20px",marginRight:"20px"},children:!o&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),e.jsxs("small",{style:{fontWeight:"bold",lineHeight:"0"},children:["ዘመን ባንክ አ.ማ. / Zemen bank S.C.",e.jsx("br",{}),"Ras Abebe Aregay St.",e.jsx("br",{}),"P.O.Box 1212 Addis Ababa, Ethiopia",e.jsx("br",{}),"SWIFT Code: ZEMEETAA",e.jsx("br",{}),"Call Center 6500",e.jsx("br",{}),"info@zemenbank.com",e.jsx("br",{}),e.jsx("span",{style:{color:"red",fontWeight:"bold"},children:"www.zemenbank.com"}),e.jsx("div",{style:{marginTop:"10px"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"})}),e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"})}),e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"})}),e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"})}),e.jsx("span",{style:{color:"red",fontWeight:"bold",marginLeft:"60px"},children:"DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE"})]})})]})]})}),!o&&e.jsx("img",{src:P,alt:"Bool",style:{position:"absolute",bottom:"1px",right:"1px",width:"150px",height:"auto"}})]})})})]})})]})})]})};export{he as default};

import{u as P,r as o,j as e,R as F,y as O}from"./index-B6oVdzIg.js";import{l as B,n as U}from"./nuru_signature-O3HsIx5w.js";import{C as V,w as v,s as Y,Q as $}from"./spaced-BbSuxHKG.js";import{h as y,E as q}from"./html2canvas.esm-CtbZB9rZ.js";import{C as G}from"./react-confetti.min-DBCcDYV2.js";import{m as Q}from"./proxy-BZt8nq9-.js";import{C as Z,a as X}from"./CCardBody-B0nWpZ0V.js";import{C as J}from"./CFormLabel-Soh_jztQ.js";import{b as K}from"./logo-CX7RpXdV.js";const ee=({children:r,style:s})=>e.jsx("div",{className:"d-flex flex-wrap align-items-baseline mb-2",style:s,children:r}),m=({path:r,viewBox:s="0 0 24 24"})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:s,width:"18",height:"18",fill:"currentColor",children:e.jsx("path",{d:r})}),C=r=>{const s=["","አንድ","ሁለት","ሶስት","አራት","አምስት","ስድስት","ሰባት","ስምንት","ዘጠኝ"],a=["","","ሃያ","ሰላሳ","አርባ","ሃምሳ","ስልሳ","ሰባ","ሰማንያ","ዘጠና"],c=["አስር","አስራ አንድ","አስራ ሁለት","አስራ ሶስት","አስራ አራት","አስራ አምስት","አስራ ስድስት","አስራ ሰባት","አስራ ስምንት","አስራ ዘጠኝ"];if(r===0||typeof r=="string"&&r.startsWith("0"))return"ዜሮ";const d=t=>t>=100?s[Math.floor(t/100)]+" መቶ "+d(t%100):t>=20?a[Math.floor(t/10)]+" "+s[t%10]:t>=10?c[t-10]:s[t],n=t=>t>=1e9?n(Math.floor(t/1e9))+" ቢሊዮን "+n(t%1e9):t>=1e6?n(Math.floor(t/1e6))+" ሚሊዮን "+n(t%1e6):t>=1e3?n(Math.floor(t/1e3))+" ሺ "+n(t%1e3):d(t);return n(r).trim()},ge=()=>{var j;const s=(j=P().state)==null?void 0:j.rowData,[a,c]=o.useState(!1);if(!s)return e.jsx("div",{children:"No data available"});const[d,n]=o.useState(!1),[t,N]=o.useState({width:window.innerWidth,height:window.innerHeight});var _=s.employee_first_name,R=s.employee_last_name,S=s.employee_middle_name,z=s.reference_number,h=_+" "+S+" "+R,L=s.request_day_amharic;s.approved_day_amharic;var u=s.salary,k=s.date_of_employment_amharic,W=s.employee_organization_location,E=C(u),I=s.employee_organazation;const[p,te]=o.useState(21),[ie,T]=o.useState("");o.useEffect(()=>{const i=C(p);T(i),console.log(`Number ${p} in words: ${i}`)},[p]),o.useEffect(()=>{const i=()=>{N({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]),o.useEffect(()=>{w(!0);const i=setTimeout(()=>{n(!0)},3e3);return()=>clearTimeout(i)},[]);const b=100,x=F.useRef(),D=()=>{const i=x.current;y(i,{scale:2,useCORS:!0,allowTaint:!0,scrollY:-window.scrollY,width:i.offsetWidth,height:i.offsetHeight,windowWidth:i.scrollWidth,windowHeight:i.scrollHeight,backgroundColor:"#ffffff"}).then(g=>{const f=g.toDataURL("image/png"),l=window.open("","_blank");l.document.write(`
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
            <img src="${f}" alt="Print content">
            <script>
              window.onload = function() {
                window.print();
              }
            <\/script>
          </body>
        </html>
      `),l.document.close(),l.focus(),setTimeout(()=>{l.print(),l.close()},250)})},H=()=>{const i=x.current;y(i,{scale:3,useCORS:!0,allowTaint:!0,scrollY:-window.scrollY,width:i.offsetWidth,height:i.offsetHeight,windowWidth:i.scrollWidth,windowHeight:i.scrollHeight,backgroundColor:"#ffffff"}).then(g=>{const f=g.toDataURL("image/png"),l=new q({orientation:"portrait",unit:"mm",format:"a4",compress:!0});l.addImage(f,"PNG",0,0,210,297),l.save(`${h}_Supportive_Letter.pdf`)})},[A,w]=o.useState(!1);o.useEffect(()=>{w(!0)},[]);const M={hidden:{opacity:0,rotate:360},visible:{opacity:1,rotate:0,transition:{duration:3,ease:"easeInOut"}}};return e.jsxs("div",{className:"d-flex justify-content-center align-items-center min-vh-100 bg-light",children:[d&&e.jsx(G,{width:t.width,height:t.height,recycle:!0,numberOfPieces:500,gravity:.3,tweenDuration:5e3,colors:["#ff6b6b","#4ecdc4","#fff176","#64b5f6","#ba68c8"]}),e.jsx("div",{className:"d-flex justify-content-center align-items-center min-vh-100 bg-light",children:e.jsxs("div",{className:"position-relative",style:{width:"210mm",minHeight:"297mm",maxWidth:"100%",margin:"0 auto",backgroundColor:"white"},children:[e.jsxs("div",{className:"top-0 start-0 m-3 z-index-1",children:[e.jsx("button",{onClick:D,className:"btn btn-primary me-2",children:"Print"}),e.jsx("button",{onClick:H,className:"btn btn-success me-2",children:"Download as PDF"}),e.jsx("div",{className:"d-inline-flex align-items-center ms-3",children:e.jsx(V,{label:"Without Letterhead",id:"letterheadToggle",checked:a,onChange:i=>c(i.target.checked),style:{fontSize:"14px"}})})]}),e.jsx(Q.div,{initial:"hidden",animate:A?"visible":"hidden",variants:M,style:{boxShadow:"0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",borderRadius:"0.25rem"},children:e.jsxs(Z,{style:{width:"210mm",minHeight:"297mm",height:"297mm",maxWidth:"100%",position:"relative",overflow:"hidden",margin:0,padding:0,boxSizing:"border-box",border:"none",boxShadow:"none",borderRadius:0,backgroundColor:"white"},ref:x,children:[!a&&e.jsx("div",{style:{position:"absolute",top:"30px",left:"30px",bottom:"30px",width:"4px",backgroundColor:"red"}}),!a&&e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundImage:`url(${v})`,backgroundRepeat:"no-repeat",backgroundPosition:"33% 40%",backgroundSize:"150%",opacity:.08,pointerEvents:"none",transform:"rotate(-1deg)"}}),!a&&e.jsx("img",{src:B,alt:"Logo",style:{position:"absolute",top:"60px",left:"50px",width:"180px",height:"auto"}}),e.jsx(X,{className:"ps-5 pe-4",style:{marginTop:a?"80px":"60px",paddingBottom:"40mm",height:"100%",boxSizing:"border-box"},children:e.jsx(J,{children:e.jsxs(K,{fluid:!0,className:"p-0",style:{height:"100%",fontFamily:"Calibri, sans-serif",minHeight:"calc(297mm - 140px)",position:"relative"},children:[e.jsxs("div",{className:"d-flex flex-column align-items-end mb-4",style:{marginLeft:"20px",marginRight:"20px"},children:[e.jsx("div",{className:"d-flex justify-content-end w-100",children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("span",{className:"me-2 text-nowrap fw-bold",children:"ቀን:"}),e.jsx("span",{className:"fw-bold",children:s.approved_day_amharic})]})}),e.jsx("div",{className:"d-flex justify-content-end w-100",children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("span",{className:"me-2 text-nowrap fw-bold",children:"ቁጥር:"}),e.jsx("span",{className:"fw-bold",children:z})]})})]}),e.jsxs("div",{className:"d-flex flex-column mb-4",style:{marginLeft:"20px",marginRight:"20px"},children:[e.jsx("div",{className:"d-flex w-100",children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("span",{className:"me-2 text-nowrap fw-bold",children:"ለ "}),e.jsx("span",{className:"fw-bold",children:I})]})}),e.jsx("div",{className:"d-flex w-100",children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("span",{className:"me-2 text-nowrap"}),e.jsxs("span",{className:"fw-bold text-decoration-underline",children:[W,"፣"]})]})})]}),e.jsxs("div",{className:"text-center fw-bold mb-4",children:["ጉዳዩ:- ",e.jsx("span",{className:"text-decoration-underline",children:"መረጃ ስለመስጠት፣"})]}),e.jsxs("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px"},children:["የባንካችን ሠራተኛ የሆኑት አቶ/ወይ ",e.jsx("strong",{children:h})," የባንከችን ቋሚ ሠራተኛ መሆናቸው፣ ተገልጾ የድጋፍ ደብዳቤ እንዲፃፍላቸው ",L," በተፃፈ ማመልከቻ ጠይቀዋል፡፡"]}),e.jsxs("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px"},children:["ስለሆነም አቶ/ወይ ",e.jsx("strong",{children:h})," ",k," ጀምሮ በባንካችን ውስጥ በቋሚነት ተቀጥረው በመስራት ላይ የሚገኙ ሲሆን፤ የሚከፈላቸውም ያልጣራ የወር ደመወዝ ብር ",e.jsx("strong",{children:Number(u).toLocaleString("en-US",{maximumFractionDigits:0})})," / ",e.jsx("strong",{children:E})," / መሆኑን እናረጋግጣለን፡፡"]}),e.jsx("div",{style:{textAlign:"justify",marginBottom:"1rem",marginLeft:"20px",marginRight:"20px"},children:"ከተጠቃሽ የወር ደመወዝ ተገቢው የስራ ግብርና የጡረታ መዋጮ በየወሩ እየተቆረጠ ለሚመለከተው የመንግስት አካል ገቢ እየተደረገ መሆኑን እየገልፅን፤ ለሚደረግላቸው ትብብር እናመሰግናለን፡፡"}),e.jsx("div",{className:"mt-4 mb-5 fw-bold",style:{marginLeft:"20px",marginRight:"20px"},children:"ከሠላምታ ጋር,"}),e.jsx("img",{src:U,alt:"Signature",style:{position:"absolute",left:"-35px",width:"150px",height:"auto",marginTop:"-55px"}}),e.jsxs(ee,{style:{alignItems:"flex-start",marginTop:"10px",marginLeft:"20px",marginRight:"20px"},children:[e.jsxs("div",{className:"fw-bold",children:["ኑሩ ሙስጠፋ",e.jsx("br",{}),"ዳይሬክተር- የስራ አፈፃፀም እና የሰራተኞች አገልግሎት መምሪያ"]}),!a&&e.jsx("img",{src:Y,alt:"Stamp",style:{position:"absolute",marginLeft:"120px",width:"150px",height:"auto",alignSelf:"flex-start",marginTop:"-80px"}})]}),e.jsx("div",{"data-qr-code":!0,style:{position:"absolute",width:b,height:b,left:"300px",bottom:"80px",zIndex:10},children:e.jsx($,{url:"https://www.zemenbank.com",size:80,logoUrl:v})}),e.jsx("div",{className:"fst-italic mt-3 position-absolute bottom-0 start-0",style:{paddingLeft:"5px",marginLeft:"20px",marginRight:"20px"},children:!a&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),e.jsxs("small",{style:{fontWeight:"bold",lineHeight:"0"},children:["ዘመን ባንክ አ.ማ. / Zemen bank S.C.",e.jsx("br",{}),"Ras Abebe Aregay St.",e.jsx("br",{}),"P.O.Box 1212 Addis Ababa, Ethiopia",e.jsx("br",{}),"SWIFT Code: ZEMEETAA",e.jsx("br",{}),"Call Center 6500",e.jsx("br",{}),"info@zemenbank.com",e.jsx("br",{}),e.jsx("span",{style:{color:"red",fontWeight:"bold"},children:"www.zemenbank.com"}),e.jsx("div",{style:{marginTop:"10px"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"})}),e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"})}),e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"})}),e.jsx("div",{style:{backgroundColor:"red",color:"white",padding:"4px",borderRadius:"50%"},children:e.jsx(m,{path:"M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"})}),e.jsx("span",{style:{color:"red",fontWeight:"bold",marginLeft:"60px"},children:"DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE"})]})})]})]})}),!a&&e.jsx("img",{src:O,alt:"Bool",style:{position:"absolute",bottom:"1px",right:"1px",width:"150px",height:"auto"}})]})})})]})})]})})]})};export{ge as default};

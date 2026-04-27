// import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion'; // Add this import
// import {
//   CCard,
//   CCardBody,
//   CForm,
//   CContainer,
 
// } from '@coreui/react';
// import '@coreui/coreui/dist/css/coreui.min.css';
// import logoImage from './logo.png';
// import watermarkImage from './watermark.png';
// import stampImage from './stamp.png';
// import boolImage from './bool.png';
// import { QRCodeSVG } from 'qrcode.react';
// import QRCodeWithLogo from './QRCodeWithLogo';
// import './spaced.css';
// import AutoResizeInput  from "./AutoResizeInput"
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { useLocation } from 'react-router-dom';
// import Confetti from 'react-confetti';

// const FlexContainer = ({ children, style }) => (
//   <div className="d-flex flex-wrap align-items-baseline mb-2" style={style}>
//     {children}
//   </div>
// );

// const InlineInput = ({ prefix, suffix, placeholder, onChange, style }) => (
//   <div className="d-inline-flex align-items-baseline" style={{ maxWidth: '100%', position: 'relative' }}>
//     {prefix && <span style={{ marginRight: '2px' }}>{prefix}</span>}
//     <AutoResizeInput placeholder={placeholder} onChange={onChange} style={style} />
//     {suffix && <span style={{ marginLeft: '2px' }}>{suffix}</span>}
//   </div>
// );

// const FlexItem = ({ children, style }) => (
//   <div className="d-flex align-items-baseline flex-wrap" style={{ marginRight: '10px', ...style }}>
//     {children}
//   </div>
// );

// const SocialIcon = ({ path, viewBox = "0 0 24 24" }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width="18" height="18" fill="currentColor">
//     <path d={path} />
//   </svg>
// );

// // Function to convert numbers to words
// const numberToWords = (num) => {
//   const belowTwenty = [
//     'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 
//     'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 
//     'seventeen', 'eighteen', 'nineteen'
//   ];
//   const tens = [
//     '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
//   ];
//   const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion'];

//   if (num === 0) return 'zero';

//   const convertThreeDigits = (n) => {
//     if (n === 0) return '';
//     if (n < 20) return belowTwenty[n] + ' ';
//     if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + belowTwenty[n % 10] : '') + ' ';
//     return belowTwenty[Math.floor(n / 100)] + ' hundred ' + convertThreeDigits(n % 100);
//   };

//   let words = '';
//   let scaleIndex = 0;

//   while (num > 0) {
//     const threeDigits = num % 1000;
//     if (threeDigits !== 0) {
//       words = convertThreeDigits(threeDigits) + scales[scaleIndex] + ' ' + words;
//     }
//     num = Math.floor(num / 1000);
//     scaleIndex++;
//   }

//   return words.trim();
// };

// const Experiance_Letter = () => {

//   const location = useLocation();
//   const rowData = location.state?.rowData;

  

//   if (!rowData) {
//     return <div>No data available</div>;
//   }

//   const [showConfetti, setShowConfetti] = useState(false);
//   const [windowDimensions, setWindowDimensions] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight
//   });

  

//   var employee_first_name = rowData.employee_first_name;
//   var reference_number = rowData.reference_number;
//   var employee_last_name = rowData.employee_last_name;
//   var employee_middle_name = rowData.employee_middle_name;
//   var approved_day = rowData.viewed_date;
//   var salary = rowData.salary;
//   var experience_data = rowData.experiences;
//   var salary_in_words = numberToWords(salary);


//   var full_name = employee_first_name + ' ' + employee_middle_name + ' ' + employee_last_name;
//   const experienceData = experience_data.map(exp => {
//     let article = ['a', 'e', 'i', 'o', 'u'].includes(exp.position[0].toLowerCase()) ? 'an' : 'a';
//     let periodEnd = exp.isCurrent ? "to date" : exp.period.split(" to ")[1];
//     return `${exp.period} as ${article} ${exp.position}.`
//   });
  
//   console.log(experienceData);

//   const [numberInput, setNumberInput] = useState(21);
//   const [wordOutput, setWordOutput] = useState('');
//   useEffect(() => {
//     const result = numberToWords(numberInput);
//     setWordOutput(result);
//     console.log(`Number ${numberInput} in words: ${result}`);
//   }, [numberInput]);



//     // Add window resize handler
//     useEffect(() => {
//       const handleResize = () => {
//         setWindowDimensions({
//           width: window.innerWidth,
//           height: window.innerHeight
//         });
//       };
//       window.addEventListener('resize', handleResize);
//       return () => window.removeEventListener('resize', handleResize);
//     }, []);
  
//     // Modify the existing useEffect
//     useEffect(() => {
//       setIsLoaded(true);
//       // Add timer to show confetti after rotation animation
//       const timer = setTimeout(() => {
//         setShowConfetti(true);
//       }, 3000); // 3 seconds matches the rotation duration
  
//       return () => clearTimeout(timer);
//     }, []);




//   const data = "https://www.zemenbank.com";
//   const size = 100;
//   const qrSize = size;
//   const logoSize = size * 0.18;

//   const printRef = React.useRef();

//   const handlePrint = () => {
//     const content = printRef.current;
    
//     html2canvas(content, { 
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       scrollY: -window.scrollY
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
      
//       const printWindow = window.open('', '_blank');
//       const aspectRatio = canvas.height / canvas.width;
      
//       printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>Print</title>
//             <style>
//               @page {
//                 size: letter;
//                 margin: 0;
//               }
//               body { 
//                 margin: 0;
//                 padding: 0;
//                 display: flex;
//                 justify-content: center;
//                 align-items: start;
//                 width: 8.5in;
//                 height: 11in;
//               }
//               img {
//                 max-width: 100%;
//                 max-height: 100%;
//                 object-fit: contain;
//               }
//               @media print {
//                 body { 
//                   -webkit-print-color-adjust: exact;
//                   print-color-adjust: exact;
//                 }
//               }
//             </style>
//           </head>
//           <body>
//             <img src="${imgData}" alt="Print content">
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//       printWindow.focus();
      
//       setTimeout(() => {
//         printWindow.print();
//         printWindow.close();
//       }, 250);
//     });
//   };

//   const handleDownload = () => {
//     const input = printRef.current;
//     html2canvas(input, { 
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       scrollY: -window.scrollY
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF({
//         orientation: 'p',
//         unit: 'mm',
//         format: 'a4', // Updated from 'letter' to 'a4'
//         compress: true
//       });
  
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
//       const imgX = 0;
//       const imgY = 0;
  
//       pdf.addImage(imgData, 'PNG', imgX, imgY, pdfWidth, imgHeight * (pdfWidth / imgWidth));
//       pdf.save(`${full_name}_Experiance_Letter.pdf`);
//     });
//   };

//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     setIsLoaded(true);
//   }, []);

//   const cardVariants = {
//     hidden: { opacity: 0, rotate: 360 },
//     visible: { 
//       opacity: 1, 
//       rotate: 0,
//       transition: { 
//         duration: 3,
//         ease: "easeInOut"
//       }
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//     {showConfetti && (
//       <Confetti
//         width={windowDimensions.width}
//         height={windowDimensions.height}
//         recycle={true}
//         numberOfPieces={500}
//         gravity={0.3}
//         tweenDuration={5000}
//         colors={['#ff6b6b', '#4ecdc4', '#fff176', '#64b5f6', '#ba68c8']}
//       />
//     )}
//     <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//       <div className="position-relative" style={{ width: '210mm', maxWidth: '100%' }}>
//         <div className="top-0 start-0 m-3 z-index-1">
//           <button onClick={handlePrint} className="btn btn-primary me-2">Print</button>
//           <button onClick={handleDownload} className="btn btn-success">Download as PDF</button>
//         </div>
//         <motion.div
//           initial="hidden"
//           animate={isLoaded ? "visible" : "hidden"}
//           variants={cardVariants}
//         >
//           <CCard className="shadow-sm" style={{
//             width: '210mm',
//             height: '297mm',
//             maxWidth: '100%',
//             position: 'relative',
//             overflow: 'hidden'
//           }} ref={printRef}> 
//             <div style={{
//               position: 'absolute',
//               top: '30px',
//               left: '30px',
//               bottom: '30px',
//               width: '4px',
//               backgroundColor: 'red'
//             }}></div>
            
//             <div style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundImage: `url(${watermarkImage})`,
//               backgroundRepeat: 'no-repeat',
//               backgroundPosition: 'center',
//               backgroundSize: '170%',
//               opacity: 0.1,
//               pointerEvents: 'none',
//             }}></div>

//             <img
//               src={logoImage}
//               alt="Logo"
//               style={{
//                 position: 'absolute',
//                 top: '60px',
//                 left: '50px',
//                 width: '180px',
//                 height: 'auto'
//               }}
//             />
            
//             <CCardBody className="ps-5 pe-4 mt-5">
//               <CForm>
//                 <CContainer fluid className="p-0" style={{ height: '100%', fontFamily: 'Calibri, sans-serif' }}>
                  
//                   {/* Date and Reference Number */}
//                   <div className="d-flex flex-column align-items-end mb-4">
//                     <div className="d-flex justify-content-end w-100 mb-2">
//                       <div className="d-flex align-items-center">
//                         <span className="me-2 text-nowrap fw-bold">Date:</span>
//                         <span className="fw-bold">{new Date(approved_day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} G.C </span>
//                       </div>
//                     </div>
//                     <div className="d-flex justify-content-end w-100">
//                       <div className="d-flex align-items-center">
//                         <span className="me-2 text-nowrap fw-bold">Ref. NO. :</span>
//                         <span className="fw-bold">{reference_number} </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Certificate Header */}
//                   <div className="text-center fw-bold mb-4 text-decoration-underline">
//                     To Whom It May Concern
//                   </div>

//                   {/* Certification Body */}
//                   <FlexContainer>
//                     <FlexItem>
//                       <span className="spaced">Pursuant </span>
//                       <span className="spaced">to</span>
//                       <span className="spaced">the</span>
//                       <span className="spaced">request</span>
//                       <span className="spaced">of</span>
//                       <span className="spaced">Ato/Wro</span>
//                       <span className="spaced fw-bold">{full_name},</span>
//                       {/* <span className="spaced">,</span> */}
//                       <span className="spaced">we</span>
//                       <span className="spaced">would</span>
//                       <span className="spaced">like</span>
//                       <span className="spaced">to</span>
//                       <span className="spaced">certify</span>
//                       <span className="spaced">that</span>
//                       <span className="spaced">he/she</span>
//                       <span className="spaced">has</span>
//                       <span className="spaced">been</span>
//                       <span className="spaced">working</span>
//                       <span className="spaced">in</span>
//                       <span className="spaced">Zemen</span>
//                       <span className="spaced">Bank</span>
//                       <span className="spaced">S.C</span>
//                       <span className="spaced">assuming</span>
//                       <span className="spaced">the</span>
//                       <span className="spaced">following</span>
//                       <span className="spaced">positions</span>
//                       <span className="spaced">:-</span>
//                     </FlexItem>
//                   </FlexContainer>

//                   {/* Experience Data */}
//                   {experienceData.map((experience, index) => (
//                     <FlexItem key={index} style={{ fontSize: '14px' }}> {/* Adjusted font size */}
//                       <FlexContainer>
//                         <span className="spaced" style={{ marginLeft: 20, fontStyle: 'italic', fontWeight: 500 }}>-</span>
//                         <span style={{ fontStyle: 'italic', fontHeight: 500 }}>{experience}</span>
                        
//                       </FlexContainer>
//                     </FlexItem>
//                   ))}

//                   {/* Currently Working Details */}
//                   <FlexContainer>
//                     <FlexItem>
//                       <span className="spaced">Currently,</span>
//                       <span className="spaced">he/she</span>
//                       <span className="spaced">is</span>
//                       <span className="spaced">drawing</span>
//                       <span className="spaced">a</span>
//                       <span className="spaced">gross</span>
//                       <span className="spaced">salary</span>
//                       <span className="spaced">of</span>
//                       <span className="spaced">birr</span>
//                       <span className="spaced fw-bold"> {Number(salary).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
//                       <span className="spaced">(</span>
//                       {salary_in_words.split(' ').map((word, index) => (
//                         <span key={index} className="spaced fw-bold">{word}</span>
//                       ))}
//                       <span className="spaced">)</span>
//                       <span className="spaced">and</span>
//                       <span className="spaced">Transportation</span>
//                       <span className="spaced">allowance</span>
//                       <InlineInput />
//                       <span className="spaced">of</span>
//                       <span className="spaced">fuel</span>
//                       <span className="spaced">per</span>
//                       <span className="spaced">month.</span>
//                       <span className="spaced">This</span>
//                       <span className="spaced">certificate</span>
//                       <span className="spaced">is</span>
//                       <span className="spaced">issued</span>
//                       <span className="spaced">upon</span>
//                       <span className="spaced">his</span>
//                       <span className="spaced">request</span>
//                       <span className="spaced">and</span>
//                       <span className="spaced">cannot</span>
//                       <span className="spaced">serve</span>
//                       <span className="spaced">as</span>
//                       <span className="spaced">a</span>
//                       <span className="spaced">release</span>
//                       <span className="spaced">paper.</span>
                      
//                     </FlexItem>
//                   </FlexContainer>

//                   {/* Certificate Statement */}
//                   {/* <FlexContainer>
//                     <FlexItem>
//                       <span className="spaced">This</span>
//                       <span className="spaced">certificate</span>
//                       <span className="spaced">is</span>
//                       <span className="spaced">issued</span>
//                       <span className="spaced">upon</span>
//                       <span className="spaced">his</span>
//                       <span className="spaced">request</span>
//                       <span className="spaced">and</span>
//                       <span className="spaced">cannot</span>
//                       <span className="spaced">serve</span>
//                       <span className="spaced">as</span>
//                       <span className="spaced">a</span>
//                       <span className="spaced">release</span>
//                       <span className="spaced">paper.</span>
//                     </FlexItem>
//                   </FlexContainer> */}

//                   {/* Sincerely and Signature */}
//                   <div className="mt-4 mb-5">
//                     Sincerely,
//                   </div>

//                   {/* Signature and Stamp Image */}
//                   <FlexContainer style={{ alignItems: 'flex-start', marginTop: '10px' }}>
//                     <div className="fst-italic">
//                       Nuru Mustefa
//                       <br />
//                       Director- Performance Management & Employee Services Department
//                     </div>
//                     {/* Stamp Image Positioned Next to the Signature */}
//                     <img
//                       src={stampImage}
//                       alt="Stamp"
//                       style={{
//                         position: 'absolute',
//                         marginLeft: '120px', // Space between text and image
//                         width: '150px',      // Adjust as needed
//                         height: 'auto',
//                         alignSelf: 'flex-start', // Aligns the image to the top of the container
//                         marginTop: '-80px' 
//                       }}
//                     />
//                   </FlexContainer>

//                   {/* QR Code and Social Icons */}
//                   <div 
//                     className="fst-italic mt-3 position-absolute bottom-0 start-0" 
//                     style={{ paddingLeft: '50px', marginBottom: '30px' }}
//                   >
//                     <div style={{ position: 'relative', width: qrSize, height: qrSize }}>
//                       <QRCodeWithLogo 
//                         url="https://www.zemenbank.com"
//                         size={80}
//                         logoUrl={watermarkImage}
//                       />
//                     </div>
//                     <br />
//                     <small style={{ fontWeight: 'bold', lineHeight: '0' }}>
//                       ዘመን ባንክ አ.ማ. / Zemen bank S.C.
//                       <br />
//                       Ras Abebe Aregay St.
//                       <br />
//                       P.O.Box 1212 Addis Ababa, Ethiopia
//                       <br />
//                       SWIFT Code: ZEMEETAA
//                       <br />
//                       Call Center 6500
//                       <br />
//                       info@zemenbank.com
//                       <br />
//                       <span style={{ color: 'red', fontWeight: 'bold' }}>www.zemenbank.com</span>
//                       <div style={{ marginTop: '10px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                           <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                             <SocialIcon path="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
//                           </div>
//                           <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                             <SocialIcon path="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
//                           </div>
//                           <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                             <SocialIcon path="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
//                           </div>
//                           <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                             <SocialIcon path="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
//                           </div>

//                           <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '60px' }}>
//                             DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE
//                           </span>
//                         </div>
//                       </div>
//                     </small>
//                   </div>
               
//                   {/* Bottom Image */}
//                   <img
//                     src={boolImage}
//                     alt="Bool"
//                     style={{
//                       position: 'absolute',
//                       bottom: '20px',
//                       right: '1px',
//                       width: '150px',
//                       height: 'auto'
//                     }}
//                   />
//                 </CContainer>
//               </CForm>
//             </CCardBody>
//           </CCard>
//         </motion.div>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default Experiance_Letter;




// import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//   CCard,
//   CCardBody,
//   CForm,
//   CContainer,
//   CFormSwitch, // Add this import for the toggle switch
// } from '@coreui/react';
// import '@coreui/coreui/dist/css/coreui.min.css';
// import logoImage from './logo.png';
// import watermarkImage from './watermark.png';
// import stampImage from './stamp.png';
// import boolImage from './bool.png';
// import { QRCodeSVG } from 'qrcode.react';
// import QRCodeWithLogo from './QRCodeWithLogo';
// import './spaced.css';
// import AutoResizeInput from "./AutoResizeInput"
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { useLocation } from 'react-router-dom';
// import Confetti from 'react-confetti';

// const FlexContainer = ({ children, style }) => (
//   <div className="d-flex flex-wrap align-items-baseline mb-2" style={style}>
//     {children}
//   </div>
// );

// const InlineInput = ({ prefix, suffix, placeholder, onChange, style }) => (
//   <div className="d-inline-flex align-items-baseline" style={{ maxWidth: '100%', position: 'relative' }}>
//     {prefix && <span style={{ marginRight: '2px' }}>{prefix}</span>}
//     <AutoResizeInput placeholder={placeholder} onChange={onChange} style={style} />
//     {suffix && <span style={{ marginLeft: '2px' }}>{suffix}</span>}
//   </div>
// );

// const FlexItem = ({ children, style }) => (
//   <div className="d-flex align-items-baseline flex-wrap" style={{ marginRight: '10px', ...style }}>
//     {children}
//   </div>
// );

// const SocialIcon = ({ path, viewBox = "0 0 24 24" }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width="18" height="18" fill="currentColor">
//     <path d={path} />
//   </svg>
// );

// // Function to convert numbers to words
// const numberToWords = (num) => {
//   const belowTwenty = [
//     'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 
//     'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 
//     'seventeen', 'eighteen', 'nineteen'
//   ];
//   const tens = [
//     '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
//   ];
//   const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion'];

//   if (num === 0) return 'zero';

//   const convertThreeDigits = (n) => {
//     if (n === 0) return '';
//     if (n < 20) return belowTwenty[n] + ' ';
//     if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + belowTwenty[n % 10] : '') + ' ';
//     return belowTwenty[Math.floor(n / 100)] + ' hundred ' + convertThreeDigits(n % 100);
//   };

//   let words = '';
//   let scaleIndex = 0;

//   while (num > 0) {
//     const threeDigits = num % 1000;
//     if (threeDigits !== 0) {
//       words = convertThreeDigits(threeDigits) + scales[scaleIndex] + ' ' + words;
//     }
//     num = Math.floor(num / 1000);
//     scaleIndex++;
//   }

//   return words.trim();
// };

// const Experiance_Letter = () => {

//   const location = useLocation();
//   const rowData = location.state?.rowData;

//   // Add state for letterhead toggle
//   const [withoutLetterhead, setWithoutLetterhead] = useState(false);

//   if (!rowData) {
//     return <div>No data available</div>;
//   }

//   const [showConfetti, setShowConfetti] = useState(false);
//   const [windowDimensions, setWindowDimensions] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight
//   });

//   var employee_first_name = rowData.employee_first_name;
//   var reference_number = rowData.reference_number;
//   var employee_last_name = rowData.employee_last_name;
//   var employee_middle_name = rowData.employee_middle_name;
//   var approved_day = rowData.viewed_date;
//   var salary = rowData.salary;
//   var experience_data = rowData.experiences;
//   var salary_in_words = numberToWords(salary);

//   var full_name = employee_first_name + ' ' + employee_middle_name + ' ' + employee_last_name;
//   const experienceData = experience_data.map(exp => {
//     let article = ['a', 'e', 'i', 'o', 'u'].includes(exp.position[0].toLowerCase()) ? 'an' : 'a';
//     let periodEnd = exp.isCurrent ? "to date" : exp.period.split(" to ")[1];
//     return `${exp.period} as ${article} ${exp.position}.`
//   });
  
//   console.log(experienceData);

//   const [numberInput, setNumberInput] = useState(21);
//   const [wordOutput, setWordOutput] = useState('');
//   useEffect(() => {
//     const result = numberToWords(numberInput);
//     setWordOutput(result);
//     console.log(`Number ${numberInput} in words: ${result}`);
//   }, [numberInput]);

//   // Add window resize handler
//   useEffect(() => {
//     const handleResize = () => {
//       setWindowDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight
//       });
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Modify the existing useEffect
//   useEffect(() => {
//     setIsLoaded(true);
//     // Add timer to show confetti after rotation animation
//     const timer = setTimeout(() => {
//       setShowConfetti(true);
//     }, 3000); // 3 seconds matches the rotation duration

//     return () => clearTimeout(timer);
//   }, []);

//   const data = "https://www.zemenbank.com";
//   const size = 100;
//   const qrSize = size;
//   const logoSize = size * 0.18;

//   const printRef = React.useRef();

//   const handlePrint = () => {
//     const content = printRef.current;
    
//     html2canvas(content, { 
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       scrollY: -window.scrollY
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
      
//       const printWindow = window.open('', '_blank');
//       const aspectRatio = canvas.height / canvas.width;
      
//       printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>Print</title>
//             <style>
//               @page {
//                 size: letter;
//                 margin: 0;
//               }
//               body { 
//                 margin: 0;
//                 padding: 0;
//                 display: flex;
//                 justify-content: center;
//                 align-items: start;
//                 width: 8.5in;
//                 height: 11in;
//               }
//               img {
//                 max-width: 100%;
//                 max-height: 100%;
//                 object-fit: contain;
//               }
//               @media print {
//                 body { 
//                   -webkit-print-color-adjust: exact;
//                   print-color-adjust: exact;
//                 }
//               }
//             </style>
//           </head>
//           <body>
//             <img src="${imgData}" alt="Print content">
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//       printWindow.focus();
      
//       setTimeout(() => {
//         printWindow.print();
//         printWindow.close();
//       }, 250);
//     });
//   };

//   const handleDownload = () => {
//     const input = printRef.current;
//     html2canvas(input, { 
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       scrollY: -window.scrollY
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF({
//         orientation: 'p',
//         unit: 'mm',
//         format: 'a4',
//         compress: true
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
//       const imgX = 0;
//       const imgY = 0;

//       pdf.addImage(imgData, 'PNG', imgX, imgY, pdfWidth, imgHeight * (pdfWidth / imgWidth));
//       pdf.save(`${full_name}_Experiance_Letter.pdf`);
//     });
//   };

//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     setIsLoaded(true);
//   }, []);

//   const cardVariants = {
//     hidden: { opacity: 0, rotate: 360 },
//     visible: { 
//       opacity: 1, 
//       rotate: 0,
//       transition: { 
//         duration: 3,
//         ease: "easeInOut"
//       }
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//     {showConfetti && (
//       <Confetti
//         width={windowDimensions.width}
//         height={windowDimensions.height}
//         recycle={true}
//         numberOfPieces={500}
//         gravity={0.3}
//         tweenDuration={5000}
//         colors={['#ff6b6b', '#4ecdc4', '#fff176', '#64b5f6', '#ba68c8']}
//       />
//     )}
//     <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//       <div className="position-relative" style={{ width: '210mm', maxWidth: '100%' }}>
//         <div className="top-0 start-0 m-3 z-index-1">
//           <button onClick={handlePrint} className="btn btn-primary me-2">Print</button>
//           <button onClick={handleDownload} className="btn btn-success me-2">Download as PDF</button>
          
//           {/* Toggle Switch for Letterhead */}
//           <div className="d-inline-flex align-items-center ms-3">
//             <CFormSwitch
//               label="Without Letterhead"
//               id="letterheadToggle"
//               checked={withoutLetterhead}
//               onChange={(e) => setWithoutLetterhead(e.target.checked)}
//               style={{ fontSize: '14px' }}
//             />
//           </div>
//         </div>
        
//         <motion.div
//           initial="hidden"
//           animate={isLoaded ? "visible" : "hidden"}
//           variants={cardVariants}
//         >
//           <CCard className="shadow-sm" style={{
//             width: '210mm',
//             height: '297mm',
//             maxWidth: '100%',
//             position: 'relative',
//             overflow: 'hidden'
//           }} ref={printRef}> 
            
//             {/* Red Line - Only show if NOT without letterhead */}
//             {!withoutLetterhead && (
//               <div style={{
//                 position: 'absolute',
//                 top: '30px',
//                 left: '30px',
//                 bottom: '30px',
//                 width: '4px',
//                 backgroundColor: 'red'
//               }}></div>
//             )}
            
//             {/* Watermark - Only show if NOT without letterhead */}
//             {!withoutLetterhead && (
//               <div style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundImage: `url(${watermarkImage})`,
//                 backgroundRepeat: 'no-repeat',
//                 backgroundPosition: 'center',
//                 backgroundSize: '170%',
//                 opacity: 0.1,
//                 pointerEvents: 'none',
//               }}></div>
//             )}

//             {/* Logo - Only show if NOT without letterhead */}
//             {!withoutLetterhead && (
//               <img
//                 src={logoImage}
//                 alt="Logo"
//                 style={{
//                   position: 'absolute',
//                   top: '60px',
//                   left: '50px',
//                   width: '180px',
//                   height: 'auto'
//                 }}
//               />
//             )}
            
//             <CCardBody className="ps-5 pe-4 mt-5" style={{ marginTop: withoutLetterhead ? '80px' : '60px' }}>
//               <CForm>
//                 <CContainer fluid className="p-0" style={{ height: '100%', fontFamily: 'Calibri, sans-serif' }}>
                  
//                   {/* Date and Reference Number */}
//                   <div className="d-flex flex-column align-items-end mb-4">
//                     <div className="d-flex justify-content-end w-100 mb-2">
//                       <div className="d-flex align-items-center">
//                         <span className="me-2 text-nowrap fw-bold">Date:</span>
//                         <span className="fw-bold">{new Date(approved_day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} G.C </span>
//                       </div>
//                     </div>
//                     <div className="d-flex justify-content-end w-100">
//                       <div className="d-flex align-items-center">
//                         <span className="me-2 text-nowrap fw-bold">Ref. NO. :</span>
//                         <span className="fw-bold">{reference_number} </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Certificate Header */}
//                   <div className="text-center fw-bold mb-4 text-decoration-underline">
//                     To Whom It May Concern
//                   </div>

//                   {/* Certification Body */}
//                   <FlexContainer>
//                     <FlexItem>
//                       <span className="spaced">Pursuant </span>
//                       <span className="spaced">to</span>
//                       <span className="spaced">the</span>
//                       <span className="spaced">request</span>
//                       <span className="spaced">of</span>
//                       <span className="spaced">Ato/Wro</span>
//                       <span className="spaced fw-bold">{full_name},</span>
//                       <span className="spaced">we</span>
//                       <span className="spaced">would</span>
//                       <span className="spaced">like</span>
//                       <span className="spaced">to</span>
//                       <span className="spaced">certify</span>
//                       <span className="spaced">that</span>
//                       <span className="spaced">he/she</span>
//                       <span className="spaced">has</span>
//                       <span className="spaced">been</span>
//                       <span className="spaced">working</span>
//                       <span className="spaced">in</span>
//                       <span className="spaced">Zemen</span>
//                       <span className="spaced">Bank</span>
//                       <span className="spaced">S.C</span>
//                       <span className="spaced">assuming</span>
//                       <span className="spaced">the</span>
//                       <span className="spaced">following</span>
//                       <span className="spaced">positions</span>
//                       <span className="spaced">:-</span>
//                     </FlexItem>
//                   </FlexContainer>

//                   {/* Experience Data */}
//                   {experienceData.map((experience, index) => (
//                     <FlexItem key={index} style={{ fontSize: '14px' }}>
//                       <FlexContainer>
//                         <span className="spaced" style={{ marginLeft: 20, fontStyle: 'italic', fontWeight: 500 }}>-</span>
//                         <span style={{ fontStyle: 'italic', fontHeight: 500 }}>{experience}</span>
//                       </FlexContainer>
//                     </FlexItem>
//                   ))}

//                   {/* Currently Working Details */}
//                   <FlexContainer>
//                     <FlexItem>
//                       <span className="spaced">Currently,</span>
//                       <span className="spaced">he/she</span>
//                       <span className="spaced">is</span>
//                       <span className="spaced">drawing</span>
//                       <span className="spaced">a</span>
//                       <span className="spaced">gross</span>
//                       <span className="spaced">salary</span>
//                       <span className="spaced">of</span>
//                       <span className="spaced fw-bold">Birr</span>
//                       <span className="spaced fw-bold"> {Number(salary).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
//                       <span className="spaced">(</span>
//                       {salary_in_words.toUpperCase().split(' ').map((word, index) => (
//                         <span key={index} className="spaced fw-bold">{word}</span>
//                       ))}
//                       <span className="spaced">)</span>
//                       {/* <span className="spaced">and</span>
//                       <span className="spaced">Transportation</span>
//                       <span className="spaced">allowance</span>
//                       <InlineInput />
//                       <span className="spaced">of</span>
//                       <span className="spaced">fuel</span> */}
//                       <span className="spaced">per</span>
//                       <span className="spaced">month.</span>
                     
//                     </FlexItem>
//                   </FlexContainer>

//                   <FlexContainer>
//                      <span className="spaced">This</span>
//                       <span className="spaced">certificate</span>
//                       <span className="spaced">is</span>
//                       <span className="spaced">issued</span>
//                       <span className="spaced">upon</span>
//                       <span className="spaced">his</span>
//                       <span className="spaced">request</span>
//                       <span className="spaced">and</span>
//                       <span className="spaced">cannot</span>
//                       <span className="spaced">serve</span>
//                       <span className="spaced">as</span>
//                       <span className="spaced">a</span>
//                       <span className="spaced">release</span>
//                       <span className="spaced">paper.</span>
//                   </FlexContainer>

//                   {/* Sincerely and Signature */}
//                   <div className="mt-4 mb-5">
//                     Sincerely,
//                   </div>

//                   {/* Signature and Stamp Image */}
//                   <FlexContainer style={{ alignItems: 'flex-start', marginTop: '10px' }}>
//                     <div className="fst-italic">
//                       Nuru Mustefa
//                       <br />
//                       Director- Performance Management & Employee Services Department
//                     </div>
//                     {/* Stamp Image - Only show if NOT without letterhead */}
//                     {!withoutLetterhead && (
//                       <img
//                         src={stampImage}
//                         alt="Stamp"
//                         style={{
//                           position: 'absolute',
//                           marginLeft: '120px',
//                           width: '150px',
//                           height: 'auto',
//                           alignSelf: 'flex-start',
//                           marginTop: '-80px' 
//                         }}
//                       />
//                     )}
//                   </FlexContainer>

//                   {/* QR Code and Social Icons - Only show if NOT without letterhead */}
//                   {!withoutLetterhead && (
//                     <div 
//                       className="fst-italic mt-3 position-absolute bottom-0 start-0" 
//                       style={{ paddingLeft: '50px', marginBottom: '30px' }}
//                     >
//                       <div style={{ position: 'relative', width: qrSize, height: qrSize }}>
//                         <QRCodeWithLogo 
//                           url="https://www.zemenbank.com"
//                           size={80}
//                           logoUrl={watermarkImage}
//                         />
//                       </div>
//                       <br />
//                       <small style={{ fontWeight: 'bold', lineHeight: '0' }}>
//                         ዘመን ባንክ አ.ማ. / Zemen bank S.C.
//                         <br />
//                         Ras Abebe Aregay St.
//                         <br />
//                         P.O.Box 1212 Addis Ababa, Ethiopia
//                         <br />
//                         SWIFT Code: ZEMEETAA
//                         <br />
//                         Call Center 6500
//                         <br />
//                         info@zemenbank.com
//                         <br />
//                         <span style={{ color: 'red', fontWeight: 'bold' }}>www.zemenbank.com</span>
//                         <div style={{ marginTop: '10px' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                             <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                               <SocialIcon path="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
//                             </div>
//                             <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                               <SocialIcon path="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
//                             </div>
//                             <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                               <SocialIcon path="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
//                             </div>
//                             <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
//                               <SocialIcon path="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
//                             </div>

//                             <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '60px' }}>
//                               DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE
//                             </span>
//                           </div>
//                         </div>
//                       </small>
//                     </div>
//                   )}
               
//                   {/* Bottom Image - Only show if NOT without letterhead */}
//                   {!withoutLetterhead && (
//                     <img
//                       src={boolImage}
//                       alt="Bool"
//                       style={{
//                         position: 'absolute',
//                         bottom: '20px',
//                         right: '1px',
//                         width: '150px',
//                         height: 'auto'
//                       }}
//                     />
//                   )}
//                 </CContainer>
//               </CForm>
//             </CCardBody>
//           </CCard>
//         </motion.div>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default Experiance_Letter;


import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CCard,
  CCardBody,
  CForm,
  CContainer,
  CFormSwitch,
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import logoImage from './logo.png';
import social from './social.png';
import watermarkImage from './watermark.png';
import stampImage from './stamp.png';
import boolImage from './bool.png';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeWithLogo from './QRCodeWithLogo';
import nuru_signature from './nuru_signature.png';
import './spaced.css';
import AutoResizeInput from "./AutoResizeInput"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FlexContainer = ({ children, style }) => (
  <div className="d-flex flex-wrap align-items-baseline mb-2" style={style}>
    {children}
  </div>
);

const InlineInput = ({ prefix, suffix, placeholder, onChange, style }) => (
  <div className="d-inline-flex align-items-baseline" style={{ maxWidth: '100%', position: 'relative' }}>
    {prefix && <span style={{ marginRight: '2px' }}>{prefix}</span>}
    <AutoResizeInput placeholder={placeholder} onChange={onChange} style={style} />
    {suffix && <span style={{ marginLeft: '2px' }}>{suffix}</span>}
  </div>
);

const FlexItem = ({ children, style }) => (
  <div className="d-flex align-items-baseline flex-wrap" style={{ marginRight: '10px', ...style }}>
    {children}
  </div>
);

const SocialIcon = ({ path, viewBox = "0 0 24 24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width="18" height="18" fill="currentColor">
    <path d={path} />
  </svg>
);

// Function to convert numbers to words
const numberToWords = (num) => {
  const belowTwenty = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion'];

  if (num === 0) return 'zero';

  const convertThreeDigits = (n) => {
    if (n === 0) return '';
    if (n < 20) return belowTwenty[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + belowTwenty[n % 10] : '') + ' ';
    return belowTwenty[Math.floor(n / 100)] + ' Hundred ' + convertThreeDigits(n % 100);
  };

  let words = '';
  let scaleIndex = 0;

  while (num > 0) {
    const threeDigits = num % 1000;
    if (threeDigits !== 0) {
      words = convertThreeDigits(threeDigits) + scales[scaleIndex] + ' ' + words;
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return words.trim();
};

const Experience_Letter = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rowData = location.state?.rowData;

  // Token validation
  const accessToken = useSelector(state => state.user.accessToken);
  const [isVerifying, setIsVerifying] = useState(false);

  // Add state for letterhead toggle
  const [withoutLetterhead, setWithoutLetterhead] = useState(false);

  // Token verification function
  const verifyTokenBeforeAction = async () => {
    if (!accessToken) {
      toast.error('Session expired. Please login again.');
      dispatch({ type: 'clearUser' });
      navigate('/login');
      return false;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('https://aps2.zemenbank.com/zbss/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        }
      });

      if (response.ok) {
        return true;
      } else {
        toast.error('Invalid or Expired Token');
        dispatch({ type: 'clearUser' });
        navigate('/login');
        return false;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      toast.error('Unknown Error. Try Again Later');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  if (!rowData) {
    return <div>No data available</div>;
  }

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  var employee_first_name = rowData.employee_first_name;
  var reference_number = rowData.reference_number;
  var employee_last_name = rowData.employee_last_name;
  var employee_middle_name = rowData.employee_middle_name;
  var approved_day = rowData.viewed_date;
  var salary = rowData.salary;
  var experience_data = rowData.experiences;
  var salary_in_words = numberToWords(salary);

  var full_name = employee_first_name + ' ' + employee_middle_name + ' ' + employee_last_name;

  // const experienceData = experience_data.map(exp => {
  //   let article = ['a', 'e', 'i', 'o', 'u'].includes(exp.position[0].toLowerCase()) ? 'an' : 'a';
  //   let periodEnd = exp.isCurrent ? "to date" : exp.period.split(" to ")[1];
  //   return (
  //     <>
  //      {/* {exp.period} as {article} <strong>{exp.position}</strong>. */}
  //       {exp.period} as <strong>{exp.position}</strong>.
  //     </>
  //   );
  // });

  const experienceData = experience_data
  .sort((a, b) => {
    // Extract start dates from period strings
    const startDateA = a.period.split(" to ")[0];
    const startDateB = b.period.split(" to ")[0];
    
    // Compare dates (this works if dates are in a sortable format like "YYYY-MM" or "Jan 2020")
    return new Date(startDateA) - new Date(startDateB);
  })
  .map(exp => {
    let article = ['a', 'e', 'i', 'o', 'u'].includes(exp.position[0].toLowerCase()) ? 'an' : 'a';
    let periodEnd = exp.isCurrent ? "to date" : exp.period.split(" to ")[1];
    return (
      <>
        {exp.period} as <strong>{exp.position}</strong>.
      </>
    );
  });
  
  console.log(experienceData);

  const [numberInput, setNumberInput] = useState(21);
  const [wordOutput, setWordOutput] = useState('');
  useEffect(() => {
    const result = numberToWords(numberInput);
    setWordOutput(result);
    console.log(`Number ${numberInput} in words: ${result}`);
  }, [numberInput]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modify the existing useEffect
  useEffect(() => {
    setIsLoaded(true);
    // Add timer to show confetti after rotation animation
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 3000); // 3 seconds matches the rotation duration

    return () => clearTimeout(timer);
  }, []);

  const data = "https://www.zemenbank.com";
  const size = 100;
  const qrSize = size;
  const logoSize = size * 0.18;

  const printRef = React.useRef();

  const handlePrint = async () => {
    const isValid = await verifyTokenBeforeAction();
    if (!isValid) return;

    const content = printRef.current;
    
    // Add small delay to ensure QR code is fully rendered
    setTimeout(() => {
      html2canvas(content, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        width: content.offsetWidth,
        height: content.offsetHeight,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure QR code is visible in clone
          const qrElement = clonedDoc.querySelector('[data-qr-code]');
          if (qrElement) {
            qrElement.style.visibility = 'visible';
          }
        }
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
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
              <img src="${imgData}" alt="Print content">
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      });
    }, 100);
  };

  const handleDownload = async () => {
    const isValid = await verifyTokenBeforeAction();
    if (!isValid) return;

    const input = printRef.current;
    
    // Add small delay to ensure QR code is fully rendered
    setTimeout(() => {
      html2canvas(input, { 
        scale: 3,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        width: input.offsetWidth,
        height: input.offsetHeight,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure QR code is visible in clone
          const qrElement = clonedDoc.querySelector('[data-qr-code]');
          if (qrElement) {
            qrElement.style.visibility = 'visible';
          }
        }
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${full_name}_Experience_Letter.pdf`);
      });
    }, 100);
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, rotate: 360 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: { 
        duration: 3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    {showConfetti && (
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        recycle={true}
        numberOfPieces={500}
        gravity={0.3}
        tweenDuration={5000}
        colors={['#ff6b6b', '#4ecdc4', '#fff176', '#64b5f6', '#ba68c8']}
      />
    )}
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="position-relative" style={{ 
        width: '210mm', 
        minHeight: '297mm',
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: 'white'
      }}>
        <div className="top-0 start-0 m-3 z-index-1">
          <button onClick={handlePrint} className="btn btn-primary me-2" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Print'}
          </button>
          <button onClick={handleDownload} className="btn btn-success me-2" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Download as PDF'}
          </button>
          
          {/* Toggle Switch for Letterhead */}
          <div className="d-inline-flex align-items-center ms-3">
            <CFormSwitch
              label="Without Letterhead"
              id="letterheadToggle"
              checked={withoutLetterhead}
              onChange={(e) => setWithoutLetterhead(e.target.checked)}
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>
        
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={cardVariants}
          style={{
            boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
            borderRadius: '0.25rem'
          }}
        >
          <CCard style={{
            width: '210mm',
            minHeight: '297mm',
            height: '297mm',
            maxWidth: '100%',
            position: 'relative',
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            backgroundColor: 'white'
          }} ref={printRef}> 
            
            {/* Red Line - Only show if NOT without letterhead */}
            {!withoutLetterhead && (
              <div style={{
                position: 'absolute',
                top: '30px',
                left: '30px',
                bottom: '30px',
                width: '4px',
                backgroundColor: 'red'
              }}></div>
            )}
            
            {/* Watermark - Only show if NOT without letterhead */}
            {!withoutLetterhead && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${watermarkImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '33% 40%',
                backgroundSize: '150%',
                opacity: 0.07,
                pointerEvents: 'none',
                transform: 'rotate(-1deg)'
              }}></div>
            )}

            {/* Logo - Only show if NOT without letterhead */}
            {!withoutLetterhead && (
              <img
                src={logoImage}
                alt="Logo"
                style={{
                  position: 'absolute',
                  top: '60px',
                  left: '50px',
                  width: '180px',
                  height: 'auto'
                }}
              />
            )}
            
            <CCardBody className="ps-5 pe-4" style={{ 
              marginTop: withoutLetterhead ? '80px' : '60px',
              paddingBottom: '40mm',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <CForm>
                <CContainer fluid className="p-0" style={{ 
                  height: '100%', 
                  fontFamily: 'Calibri, sans-serif',
                  minHeight: 'calc(297mm - 140px)',
                  position: 'relative'
                }}>
                  
                  {/* Date and Reference Number */}
                  <div className="d-flex flex-column align-items-end mb-4" style = {{marginLeft: '20px', marginRight: '20px'}}>
                    <div className="d-flex justify-content-end w-100">
                      <div className="d-flex align-items-center">
                        <span className="me-2 text-nowrap fw-bold">Date:</span>
                        <span className="fw-bold">{new Date(approved_day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} G.C </span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end w-100">
                      <div className="d-flex align-items-center">
                        <span className="me-2 text-nowrap fw-bold">Ref. NO. :</span>
                        <span className="fw-bold">{reference_number} </span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Header */}
                  <div className="text-center fw-bold mb-4 text-decoration-underline" >
                    To Whom It May Concern
                  </div>
                  

                  {/* Certification Body - Fixed text flow */}
                  <div style={{ textAlign: 'justify', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px' }}>
                    Pursuant to the request of Ato/Woy <strong>{full_name}</strong>, we would like to certify that 
                    he/she has been working in Zemen Bank S.C assuming the following positions:-
                  </div>

                  {/* Experience Data */}
                
                  {experienceData.map((experience, index) => (
                    <div key={index} style={{ fontSize: '14px', marginLeft: '20px', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>- {experience}</span>
                    </div>
                  ))}

                  {/* Currently Working Details - Fixed text flow */}
                  <div style={{ textAlign: 'justify', marginTop: '1rem', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px' }}>
                    Currently, he/she is drawing a gross salary of <strong>Birr {Number(salary).toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong> (<strong>{salary_in_words}</strong>) per month.
                  </div>

                  <div style={{ textAlign: 'justify', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px' }}>
                    This certificate is issued upon his/her request and cannot serve as a release paper.
                  </div>

                  {/* Sincerely and Signature */}
                  <div className="mt-4 mb-5 fw-bold" style={{marginLeft: '20px', marginRight: '20px'}}>
                    Sincerely,
                  </div>
                  <img
                        src={nuru_signature}
                        alt="Signature"
                        style={{
                         position: 'absolute',
                          left: '-45px',
                          width: '200px',
                          height: 'auto',
                          marginTop: '-95px' 
                        }}
                      />


                  {/* Signature and Stamp Image */}
                  <FlexContainer style={{ alignItems: 'flex-start', marginTop: '10px',marginLeft: '20px', marginRight: '20px' }}>
                    <div className="fw-bold">
                      Nuru Mustefa
                      <br />
                      Director- Performance Management & Employee Services Department
                    </div>


                  
                    {/* Stamp Image - Only show if NOT without letterhead */}
                    {!withoutLetterhead && (
                      <img
                        src={stampImage}
                        alt="Stamp"
                        style={{
                          position: 'absolute',
                          left: '75px',
                          width: '140px',
                          height: 'auto',
                          marginTop: '-80px',
                          zIndex: 6
                        }}
                      />
                    )}
                  </FlexContainer>

                  {/* QR Code - FIXED POSITIONING */}
                  <div 
                    data-qr-code
                    style={{ 
                      position: 'absolute', 
                      width: qrSize, 
                      height: qrSize, 
                      left: '300px', 
                      bottom: '80px',
                      zIndex: 10
                    }}
                  >
                    <QRCodeWithLogo
                      url={`${typeof __VERIFY_URL_BASE__ !== 'undefined' ? __VERIFY_URL_BASE__ : 'https://aps2.zemenbank.com/zbss/#/verify'}/${encodeURIComponent(reference_number || '')}`}
                      size={80}
                      logoUrl={watermarkImage}
                    />
                  </div>

                  {/* Footer with contact info - adjusted to accommodate QR code */}
                  <div 
                    className="fst-italic mt-3 position-absolute bottom-0 start-0" 
                    style={{ paddingLeft: '5px', paddingBottom: '20px', marginLeft: '20px', marginRight: '20px' }}
                  >
                    
                    {/* Contact info and social icons - Only show if NOT without letterhead */}
                    {!withoutLetterhead && (
                      <>
                        <br />
                        <small style={{ fontWeight: 'bold', lineHeight: '0' }}>
                          ዘመን ባንክ አ.ማ. / Zemen bank S.C.
                          <br />
                          Ras Abebe Aregay St.
                          <br />
                          P.O.Box 1212 Addis Ababa, Ethiopia
                          <br />
                          SWIFT Code: ZEMEETAA
                          <br />
                          Call Center 6500
                          <br />
                          info@zemenbank.com
                          <br />
                          <span style={{ color: 'red', fontWeight: 'bold' }}>www.zemenbank.com</span>
                          <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <img
                                  src={social}
                                  alt="social media icons"
                                  style={{
                                    width: '120px',
                                    height: 'auto'
                                  }}
                                />
                                <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '20px' }}>
                                  DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE
                                </span>
                              </div>
                            </div>
                        </small>
                      </>
                    )}
                  </div>

                  {/* Bottom Image - Only show if NOT without letterhead */}
                  {!withoutLetterhead && (
                    <img
                      src={boolImage}
                      alt="Bool"
                      style={{
                        position: 'absolute',
                        bottom: '1px',
                        right: '1px',
                        width: '150px',
                        height: 'auto'
                      }}
                    />
                  )}
                </CContainer>
              </CForm>
            </CCardBody>
          </CCard>
        </motion.div>
      </div>
    </div>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
    </div>
  );
};

export default Experience_Letter;
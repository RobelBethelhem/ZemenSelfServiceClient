// import React, { useState, useEffect } from 'react';
// import { motion, useAnimation } from 'framer-motion';
// import { FileText, Plane, Shield, HeartHandshake, ArrowRight, Calendar } from 'lucide-react';
// import { CCard, CCardBody, CCardTitle, CButton } from '@coreui/react';
// import classNames from 'classnames';
// import { useNavigate } from 'react-router-dom';

// const BouncingBall = () => (
//   <motion.div
//     className="position-absolute"
//     style={{ top: '-8px', right: '-8px' }}
//     animate={{
//       scale: [1, 1.2, 1],
//       rotate: [0, 180, 360],
//     }}
//     transition={{
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }}
//   >
//     <div className="bg-primary" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
//   </motion.div>
// );

// const getIcon = (title) => {
//   const iconProps = { size: 40 };
//   switch (title) {
//     case "Experience Letter":
//       return <FileText {...iconProps} className="text-primary" />;
//     case "Letter for Embassy":
//       return <Plane {...iconProps} className="text-success" />;
//     case "Guaranty Letter":
//       return <Shield {...iconProps} className="text-info" />;
//     case "Supportive Letter":
//       return <HeartHandshake {...iconProps} className="text-danger" />;
//     default:
//       return <FileText {...iconProps} className="text-primary" />;
//   }
// };

// const AnimatedText = ({ text }) => {
//   const words = text.split(' ');
//   const controls = useAnimation();

//   useEffect(() => {
//     const animateText = async () => {
//       await controls.start(i => ({
//         x: [-100, 0, 0, 100],
//         opacity: [0, 1, 1, 0],
//         transition: { 
//           duration: 4,
//           times: [0, 0.1, 0.9, 1],
//           delay: i * 0.1,
//           repeat: Infinity,
//           repeatDelay: words.length * 0.1
//         }
//       }));
//     };
//     animateText();
//   }, [controls, words.length]);

//   return (
//     <div className="overflow-hidden">
//       {words.map((word, i) => (
//         <motion.span
//           key={i}
//           custom={i}
//           animate={controls}
//           style={{ display: 'inline-block', marginRight: '0.2em' }}
//         >
//           {word}
//         </motion.span>
//       ))}
//     </div>
//   );
// };

// const Card = ({ title, description, index, path }) => {
//   const navigate = useNavigate();

//   const handleNavigate = () => {
//     navigate(path);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ 
//         delay: index * 0.2,
//         duration: 0.5,
//         type: "spring",
//         stiffness: 100
//       }}
//       whileHover={{ 
//         scale: 1.02,
//         transition: { duration: 0.2 }
//       }}
//       className="w-100"
//       style={{ maxWidth: '900px' }}
//     >
//       <CCard className="mb-4 border-0 shadow-sm">
//         <CCardBody className="p-4">
//           <div className="d-flex align-items-center">
//             <motion.div 
//               className={classNames(
//                 "me-4 p-3 rounded-circle",
//                 "bg-light"
//               )}
//               animate={{
//                 y: [0, -10, 0],
//               }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: "easeInOut"
//               }}
//             >
//               {getIcon(title)}
//             </motion.div>
            
//             <div className="flex-grow-1 overflow-hidden">
//               <div className="position-relative">
//                 <CCardTitle className="h3 mb-2">{title}</CCardTitle>
//               </div>
//               <div className="text-medium-emphasis mb-2">
//                 <AnimatedText text={description} />
//               </div>
              
//               <div className="d-flex align-items-center mt-3">
//                 <div className="d-flex align-items-center small text-medium-emphasis">
//                   <Calendar className="me-1" size={16} />
//                   <span>Available Now</span>
//                 </div>
//               </div>
//             </div>

//             <motion.div whileHover={{ x: 5 }}>
//               <CButton 
//                 color="light" 
//                 className="rounded-circle p-2 border-0"
//                 onClick={handleNavigate}
//               >
//                 <ArrowRight className="text-medium-emphasis" size={24} />
//               </CButton>
//             </motion.div>
//           </div>
//         </CCardBody>
//       </CCard>
//     </motion.div>
//   );
// };

// const LettersView = () => {
//   const events = [
//     {
//       title: "Experience Letter",
//       description: "Professional experience letters crafted for career advancement and job applications.",
//       path: "/user/experiance"
//     },
//     {
//       title: "Letter for Embassy",
//       description: "Official embassy letters for visa applications, travel purposes, and international documentation.",
//       path: "/user/embassy"
//     },
//     {
//       title: "Guaranty Letter",
//       description: "Formal guarantee letters for financial, legal, and business purposes with professional formatting.",
//       path: "/user/guaranty"
//     },
//     {
//       title: "Supportive Letter",
//       description: "Compelling recommendation and support letters for various professional and academic needs.",
//       path: "/user/supportive"
//     }
//   ];

//   return (
//     <div className="bg-light min-vh-100 d-flex flex-column">
//       <motion.div 
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//         className="container-lg py-4"
//       >
//         <div className="text-center mb-4">
//           <h1 className="h2 mb-2">Professional Letters</h1>
//           <p className="text-medium-emphasis">Select the type of letter you need</p>
//         </div>
        
//         <div className="d-flex flex-column align-items-center">
//           {events.map((event, index) => (
//             <Card key={index} {...event} index={index} />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default LettersView;

























// import React, { useState } from 'react';
// import { motion, useAnimation } from 'framer-motion';
// import { FileText, Plane, Shield, HeartHandshake, ArrowRight, Calendar } from 'lucide-react';
// import { CCard, CCardBody, CCardTitle, CButton } from '@coreui/react';
// import classNames from 'classnames';
// import { useNavigate } from 'react-router-dom';
// import LanguageSelectionModal from './LanguageSelectionModal '; // Import the modal

// const BouncingBall = () => (
//   <motion.div
//     className="position-absolute"
//     style={{ top: '-8px', right: '-8px' }}
//     animate={{
//       scale: [1, 1.2, 1],
//       rotate: [0, 180, 360],
//     }}
//     transition={{
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }}
//   >
//     <div className="bg-primary" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
//   </motion.div>
// );

// const getIcon = (title) => {
//   const iconProps = { size: 40 };
//   switch (title) {
//     case "Experience Letter":
//       return <FileText {...iconProps} className="text-primary" />;
//     case "Letter for Embassy":
//       return <Plane {...iconProps} className="text-success" />;
//     case "Guaranty Letter":
//       return <Shield {...iconProps} className="text-info" />;
//     case "Supportive Letter":
//       return <HeartHandshake {...iconProps} className="text-danger" />;
//     default:
//       return <FileText {...iconProps} className="text-primary" />;
//   }
// };

// const AnimatedText = ({ text }) => {
//   const words = text.split(' ');
//   const controls = useAnimation();

//   React.useEffect(() => {
//     const animateText = async () => {
//       await controls.start(i => ({
//         x: [-100, 0, 0, 100],
//         opacity: [0, 1, 1, 0],
//         transition: { 
//           duration: 4,
//           times: [0, 0.1, 0.9, 1],
//           delay: i * 0.1,
//           repeat: Infinity,
//           repeatDelay: words.length * 0.1
//         }
//       }));
//     };
//     animateText();
//   }, [controls, words.length]);

//   return (
//     <div className="overflow-hidden">
//       {words.map((word, i) => (
//         <motion.span
//           key={i}
//           custom={i}
//           animate={controls}
//           style={{ display: 'inline-block', marginRight: '0.2em' }}
//         >
//           {word}
//         </motion.span>
//       ))}
//     </div>
//   );
// };

// const Card = ({ title, description, index, path, onSpecialClick }) => {
//   const navigate = useNavigate();

//   const handleNavigate = () => {
//     // Special handling for Supportive Letter
//     if (title === "Supportive Letter" && onSpecialClick) {
//       onSpecialClick();
//     } else {
//       navigate(path);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ 
//         delay: index * 0.2,
//         duration: 0.5,
//         type: "spring",
//         stiffness: 100
//       }}
//       whileHover={{ 
//         scale: 1.02,
//         transition: { duration: 0.2 }
//       }}
//       className="w-100"
//       style={{ maxWidth: '900px' }}
//     >
//       <CCard className="mb-4 border-0 shadow-sm">
//         <CCardBody className="p-4">
//           <div className="d-flex align-items-center">
//             <motion.div 
//               className={classNames(
//                 "me-4 p-3 rounded-circle",
//                 "bg-light"
//               )}
//               animate={{
//                 y: [0, -10, 0],
//               }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: "easeInOut"
//               }}
//             >
//               {getIcon(title)}
//             </motion.div>
            
//             <div className="flex-grow-1 overflow-hidden">
//               <div className="position-relative">
//                 <CCardTitle className="h3 mb-2">{title}</CCardTitle>
//               </div>
//               <div className="text-medium-emphasis mb-2">
//                 <AnimatedText text={description} />
//               </div>
              
//               <div className="d-flex align-items-center mt-3">
//                 <div className="d-flex align-items-center small text-medium-emphasis">
//                   <Calendar className="me-1" size={16} />
//                   <span>Available Now</span>
//                 </div>
//               </div>
//             </div>

//             <motion.div whileHover={{ x: 5 }}>
//               <CButton 
//                 color="light" 
//                 className="rounded-circle p-2 border-0"
//                 onClick={handleNavigate}
//               >
//                 <ArrowRight className="text-medium-emphasis" size={24} />
//               </CButton>
//             </motion.div>
//           </div>
//         </CCardBody>
//       </CCard>
//     </motion.div>
//   );
// };

// const LettersView = () => {
//   const navigate = useNavigate();
//   const [showLanguageModal, setShowLanguageModal] = useState(false);

//   const handleSupportiveLetterClick = () => {
//     setShowLanguageModal(true);
//   };

//   const handleLanguageSelect = (language) => {
//     setShowLanguageModal(false);
//     if (language === 'english') {
//       navigate('/user/supportive');
//     } else if (language === 'amharic') {
//       navigate('/user/supportive-am');
//     }
//   };

//   const events = [
//     {
//       title: "Experience Letter",
//       description: "Professional experience letters crafted for career advancement and job applications.",
//       path: "/user/experiance"
//     },
//     {
//       title: "Letter for Embassy",
//       description: "Official embassy letters for visa applications, travel purposes, and international documentation.",
//       path: "/user/embassy"
//     },
//     {
//       title: "Guaranty Letter",
//       description: "Formal guarantee letters for financial, legal, and business purposes with professional formatting.",
//       path: "/user/guaranty"
//     },
//     {
//       title: "Supportive Letter",
//       description: "Compelling recommendation and support letters for various professional and academic needs.",
//       path: "/user/supportive"
//     }
//   ];

//   return (
//     <>
//       <div className="bg-light min-vh-100 d-flex flex-column">
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1 }}
//           className="container-lg py-4"
//         >
//           <div className="text-center mb-4">
//             <h1 className="h2 mb-2">Professional Letters</h1>
//             <p className="text-medium-emphasis">Select the type of letter you need</p>
//           </div>
          
//           <div className="d-flex flex-column align-items-center">
//             {events.map((event, index) => (
//               <Card 
//                 key={index} 
//                 {...event} 
//                 index={index}
//                 onSpecialClick={event.title === "Supportive Letter" ? handleSupportiveLetterClick : null}
//               />
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       {/* Language Selection Modal */}
//       <LanguageSelectionModal
//         isOpen={showLanguageModal}
//         onClose={() => setShowLanguageModal(false)}
//         onSelectLanguage={handleLanguageSelect}
//       />
//     </>
//   );
// };

// export default LettersView;




import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FileText, Plane, Shield, HeartHandshake, ArrowRight, Calendar, Heart } from 'lucide-react';
import { CCard, CCardBody, CCardTitle, CButton } from '@coreui/react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import LanguageSelectionModal from './LanguageSelectionModal ';// Import the modal

const BouncingBall = () => (
  <motion.div
    className="position-absolute"
    style={{ top: '-8px', right: '-8px' }}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <div className="bg-primary" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
  </motion.div>
);

const getIcon = (title) => {
  const iconProps = { size: 40 };
  switch (title) {
    case "Experience Letter":
      return <FileText {...iconProps} className="text-primary" />;
    case "Letter for Embassy":
      return <Plane {...iconProps} className="text-success" />;
    case "Guaranty Letter":
      return <Shield {...iconProps} className="text-info" />;
    case "Support Letter":
      return <HeartHandshake {...iconProps} className="text-danger" />;
    case "Medical Letter":
      return <Heart {...iconProps} className="text-danger" />;
    default:
      return <FileText {...iconProps} className="text-primary" />;
  }
};

const AnimatedText = ({ text }) => {
  const words = text.split(' ');
  const controls = useAnimation();

  React.useEffect(() => {
    const animateText = async () => {
      await controls.start(i => ({
        x: [-100, 0, 0, 100],
        opacity: [0, 1, 1, 0],
        transition: { 
          duration: 4,
          times: [0, 0.1, 0.9, 1],
          delay: i * 0.1,
          repeat: Infinity,
          repeatDelay: words.length * 0.1
        }
      }));
    };
    animateText();
  }, [controls, words.length]);

  return (
    <div className="overflow-hidden">
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          animate={controls}
          style={{ display: 'inline-block', marginRight: '0.2em' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const Card = ({ title, description, index, path, onSpecialClick }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    // Special handling for Support Letter
    if (title === "Support Letter" && onSpecialClick) {
      onSpecialClick();
    } else {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.2,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="w-100"
      style={{ maxWidth: '900px' }}
    >
      <CCard className="mb-4 border-0 shadow-sm">
        <CCardBody className="p-4">
          <div className="d-flex align-items-center">
            <motion.div 
              className={classNames(
                "me-4 p-3 rounded-circle",
                "bg-light"
              )}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {getIcon(title)}
            </motion.div>
            
            <div className="flex-grow-1 overflow-hidden">
              <div className="position-relative">
                <CCardTitle className="h3 mb-2">{title}</CCardTitle>
              </div>
              <div className="text-medium-emphasis mb-2">
                <AnimatedText text={description} />
              </div>
              
              <div className="d-flex align-items-center mt-3">
                <div className="d-flex align-items-center small text-medium-emphasis">
                  <Calendar className="me-1" size={16} />
                  <span>Available Now</span>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ x: 5 }}>
              <CButton 
                color="light" 
                className="rounded-circle p-2 border-0"
                onClick={handleNavigate}
              >
                <ArrowRight className="text-medium-emphasis" size={24} />
              </CButton>
            </motion.div>
          </div>
        </CCardBody>
      </CCard>
    </motion.div>
  );
};

const LettersView = () => {
  const navigate = useNavigate();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleSupportLetterClick = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (language) => {
    setShowLanguageModal(false);
    if (language === 'english') {
      navigate('/user/supportive');
    } else if (language === 'amharic') {
      navigate('/user/supportive-am');
    }
  };

  const events = [
    {
      title: "Experience Letter",
      description: "Professional experience letters crafted for career advancement and job applications.",
      path: "/user/experiance"
    },
    {
      title: "Letter for Embassy",
      description: "Official embassy letters for visa applications, travel purposes, and international documentation.",
      path: "/user/embassy"
    },
    {
      title: "Guaranty Letter",
      description: "Formal guarantee letters for financial, legal, and business purposes with professional formatting.",
      path: "/user/guaranty"
    },
    {
      title: "Support Letter",
      description: "Compelling recommendation and support letters for various professional and academic needs.",
      path: "/user/supportive"
    },
    {
      title: "Medical Slip",
      description: "Medical support Slips for health-related documentation, treatment, and insurance purposes.",
      path: "/user/medical"
    }
  ];

  return (
    <>
      <div className="bg-light min-vh-100 d-flex flex-column">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="container-lg py-4"
        >
          <div className="text-center mb-4">
            <h1 className="h2 mb-2">Professional Letters</h1>
            <p className="text-medium-emphasis">Select the type of letter you need</p>
          </div>
          
          <div className="d-flex flex-column align-items-center">
            {events.map((event, index) => (
              <Card 
                key={index} 
                {...event} 
                index={index}
                onSpecialClick={event.title === "Support Letter" ? handleSupportLetterClick : null}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelectLanguage={handleLanguageSelect}
      />
    </>
  );
};

export default LettersView;

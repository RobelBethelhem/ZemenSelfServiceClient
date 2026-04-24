import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Sparkles } from 'lucide-react';

const LanguageSelectionModal = ({ isOpen, onClose, onSelectLanguage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    // Create a div at the root of the body for the portal
    const root = document.createElement('div');
    root.id = 'language-modal-root';
    document.body.appendChild(root);
    setPortalRoot(root);

    // Cleanup
    return () => {
      document.body.removeChild(root);
    };
  }, []);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowConfirmation(true);
    
    // Wait for animation then navigate
    setTimeout(() => {
      onSelectLanguage(language);
      setShowConfirmation(false);
      setSelectedLanguage(null);
    }, 1500);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      rotateX: -45,
      y: 100
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateX: 0,
      y: 0,
      transition: { 
        type: "spring",
        duration: 0.8,
        bounce: 0.4,
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.5,
      rotateX: 45,
      y: -100,
      transition: { duration: 0.3 }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", bounce: 0.5 }
    }
  };

  const languageCardVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    hover: { 
      scale: 1.08,
      boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
      background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,1) 100%)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 },
    selected: {
      scale: [1, 1.2, 1.1],
      transition: { duration: 0.5 }
    }
  };

  const sparkleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: { 
      scale: [0, 1.5, 0],
      rotate: [0, 180, 360],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 0, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'all'
          }}
        >
          {/* Backdrop */}
          <motion.div
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={!showConfirmation ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            style={{ 
              position: 'relative',
              width: '90%',
              maxWidth: '650px',
              margin: '0 auto',
              perspective: '1000px'
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div 
              className="rounded-4 shadow-lg position-relative overflow-visible"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                padding: '3px'
              }}
            >
              {/* Animated border effect */}
              <motion.div
                className="position-absolute w-100 h-100 rounded-4"
                style={{
                  background: 'linear-gradient(45deg, #ff6ec7, #ffd700, #00ffff, #ff6ec7)',
                  backgroundSize: '400% 400%',
                  opacity: 0.8,
                  filter: 'blur(3px)',
                  zIndex: -1
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />

              {/* Inner content */}
              <div 
                className="bg-white rounded-4 position-relative"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.98) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                {/* Decorative sparkles */}
                <motion.div
                  className="position-absolute"
                  style={{ top: '20px', right: '20px' }}
                  variants={sparkleVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Sparkles size={20} className="text-warning" />
                </motion.div>
                <motion.div
                  className="position-absolute"
                  style={{ bottom: '20px', left: '20px' }}
                  variants={sparkleVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles size={20} className="text-info" />
                </motion.div>

                {/* Main Content */}
                <div className="p-5 text-center position-relative">
                  {/* Animated Globe with pulse effect */}
                  <motion.div
                    className="position-relative d-inline-block mb-4"
                    variants={childVariants}
                  >
                    <motion.div
                      className="position-absolute w-100 h-100 rounded-circle"
                      style={{
                        background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
                        filter: 'blur(15px)',
                      }}
                      variants={pulseVariants}
                      animate="animate"
                    />
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Globe size={70} className="text-primary" />
                    </motion.div>
                  </motion.div>

                  <motion.h2 
                    className="h2 mb-3 fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      color: 'transparent'
                    }}
                    variants={childVariants}
                  >
                    Choose Your Language
                  </motion.h2>
                  
                  <motion.p 
                    className="mb-5 text-muted"
                    variants={childVariants}
                  >
                    Select your preferred language for the Supportive Letter
                  </motion.p>

                  {/* Language Options */}
                  <div className="row g-4">
                    {/* English Option */}
                    <div className="col-md-6">
                      <motion.div
                        variants={languageCardVariants}
                        initial="initial"
                        animate={selectedLanguage === 'english' ? 'selected' : 'animate'}
                        whileHover={!showConfirmation ? "hover" : ""}
                        whileTap={!showConfirmation ? "tap" : ""}
                        transition={{ delay: 0.1 }}
                        onClick={() => !showConfirmation && handleLanguageSelect('english')}
                        className="position-relative"
                        style={{ cursor: showConfirmation ? 'default' : 'pointer' }}
                      >
                        <div 
                          className="p-4 rounded-4 border shadow-sm h-100 position-relative overflow-hidden"
                          style={{
                            background: selectedLanguage === 'english' 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                              : 'white',
                            borderColor: selectedLanguage === 'english' ? 'transparent' : '#e9ecef',
                            minHeight: '200px'
                          }}
                        >
                          {selectedLanguage === 'english' && showConfirmation && (
                            <motion.div
                              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                              style={{ 
                                background: 'rgba(255,255,255,0.95)',
                                borderRadius: '1rem',
                                zIndex: 10
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Check size={40} className="text-success" />
                              </motion.div>
                            </motion.div>
                          )}
                          
                          <motion.div
                            className="mb-3"
                            style={{ fontSize: '3.5rem' }}
                            animate={{ 
                              y: [0, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            🇬🇧
                          </motion.div>
                          <h4 className={`fw-bold mb-2 ${selectedLanguage === 'english' ? 'text-white' : 'text-dark'}`}>
                            English
                          </h4>
                          <p className={`small mb-0 ${selectedLanguage === 'english' ? 'text-white-50' : 'text-muted'}`}>
                            Continue in English
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Amharic Option */}
                    <div className="col-md-6">
                      <motion.div
                        variants={languageCardVariants}
                        initial="initial"
                        animate={selectedLanguage === 'amharic' ? 'selected' : 'animate'}
                        whileHover={!showConfirmation ? "hover" : ""}
                        whileTap={!showConfirmation ? "tap" : ""}
                        transition={{ delay: 0.2 }}
                        onClick={() => !showConfirmation && handleLanguageSelect('amharic')}
                        className="position-relative"
                        style={{ cursor: showConfirmation ? 'default' : 'pointer' }}
                      >
                        <div 
                          className="p-4 rounded-4 border shadow-sm h-100 position-relative overflow-hidden"
                          style={{
                            background: selectedLanguage === 'amharic' 
                              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                              : 'white',
                            borderColor: selectedLanguage === 'amharic' ? 'transparent' : '#e9ecef',
                            minHeight: '200px'
                          }}
                        >
                          {selectedLanguage === 'amharic' && showConfirmation && (
                            <motion.div
                              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                              style={{ 
                                background: 'rgba(255,255,255,0.95)',
                                borderRadius: '1rem',
                                zIndex: 10
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Check size={40} className="text-success" />
                              </motion.div>
                            </motion.div>
                          )}
                          
                          <motion.div
                            className="mb-3"
                            style={{ fontSize: '3.5rem' }}
                            animate={{ 
                              y: [0, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }}
                          >
                            🇪🇹
                          </motion.div>
                          <h4 className={`fw-bold mb-2 ${selectedLanguage === 'amharic' ? 'text-white' : 'text-dark'}`}>
                            አማርኛ
                          </h4>
                          <p className={`small mb-0 ${selectedLanguage === 'amharic' ? 'text-white-50' : 'text-muted'}`}>
                            በአማርኛ ቀጥል
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Confirmation Message */}
                  <AnimatePresence>
                    {showConfirmation && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <motion.div
                          className="badge bg-success px-4 py-2"
                          style={{ fontSize: '1.1rem' }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.5, repeat: 2 }}
                        >
                          {selectedLanguage === 'english' 
                            ? '✨ English Selected - Loading...' 
                            : '✨ አማርኛ ተመርጧል - በመጫን ላይ...'}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Return portal if root exists, otherwise return null
  if (!portalRoot) return null;
  return createPortal(modalContent, portalRoot);
};

export default LanguageSelectionModal;
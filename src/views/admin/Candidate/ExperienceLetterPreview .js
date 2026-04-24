import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { Download, Printer } from 'lucide-react';

// Import the image directly
import expImage from './exp.jpg';  // Adjust this path if necessary

const ExperienceLetterPreview = ({ onClose }) => {
  const [state, setState] = useState({
    previewImage: null,
    isLoading: true,
    error: null
  });
//   const userData = useSelector((state) => state.user.userData);
  const userData = {
    firstName: "Robel",
    middleName: "Asfaw",
    lastName: "Bogale",
  }
  const loadAndModifyImage = useCallback(async () => {
    try {
      const image = new Image();
      image.src = expImage;
      
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      
      // Embed the reference number
      ctx.fillText(`Ref. No.: ZB/HC/C-678/321`, 100, 150);
      
      // Embed the name
      ctx.fillText(`Ato ${userData.firstName} ${userData.middleName} ${userData.lastName}`, 100, 250);
      
      // Embed work history
      ctx.fillText('Oct 18, 2023 to Feb 1, 2023 as Young Graduate Trainee', 100, 300);
      ctx.fillText('Feb 2, 2023 to July 1, 2024 as Software Developer II', 100, 330);
      ctx.fillText('July 2, 2024 to date as Software Developer III', 100, 360);
      
      // Embed salary and allowance
      ctx.fillText('Salary: 33,456 Birr', 100, 400);
      ctx.fillText('Fuel Allowance: 70 litres', 100, 430);
      
      const previewImage = canvas.toDataURL('image/jpeg');
      setState({ previewImage, isLoading: false, error: null });
    } catch (err) {
      console.error('Error in loadAndModifyImage:', err);
      setState({ previewImage: null, isLoading: false, error: 'Failed to load or process the image.' });
    }
  }, [userData]);

  useEffect(() => {
    loadAndModifyImage();
  }, [loadAndModifyImage]);

  const handleDownload = () => {
    if (state.previewImage) {
      const link = document.createElement('a');
      link.href = state.previewImage;
      link.download = 'experience_letter.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (state.previewImage) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<img src="${state.previewImage}" onload="window.print();window.close()" />`);
      printWindow.document.close();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
        <Typography variant="h4" gutterBottom>Experience Letter Preview</Typography>
        {state.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : state.error ? (
          <Typography color="error">{state.error}</Typography>
        ) : state.previewImage ? (
          <Box sx={{ mb: 3, border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden' }}>
            <img src={state.previewImage} alt="Experience Letter" style={{ width: '100%', display: 'block' }} />
          </Box>
        ) : (
          <Typography color="error">Failed to generate preview image</Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            disabled={!state.previewImage}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<Printer />}
            onClick={handlePrint}
            disabled={!state.previewImage}
          >
            Print
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ExperienceLetterPreview;
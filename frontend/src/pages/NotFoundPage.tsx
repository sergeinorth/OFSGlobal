import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography 
        variant="h1" 
        sx={{ 
          fontSize: '8rem', 
          fontWeight: 700, 
          background: 'linear-gradient(45deg, #9D6AF5, #b350ff)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          textShadow: '0 0 30px rgba(157, 106, 245, 0.6)'
        }}
      >
        404
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3,
          color: '#fff',
          textShadow: '0 0 10px rgba(157, 106, 245, 0.5)'
        }}
      >
        Страница не найдена
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 4,
          maxWidth: 600,
          color: 'rgba(255,255,255,0.7)'
        }}
      >
        Запрашиваемая страница не существует или была перемещена.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/')}
        sx={{
          background: 'linear-gradient(45deg, #9D6AF5, #b350ff)',
          px: 4,
          py: 1,
          borderRadius: 2,
          boxShadow: '0 5px 15px rgba(157, 106, 245, 0.4)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(157, 106, 245, 0.6)',
            background: 'linear-gradient(45deg, #a478f5, #c070ff)'
          }
        }}
      >
        Вернуться на главную
      </Button>
    </Box>
  );
};

export default NotFoundPage; 
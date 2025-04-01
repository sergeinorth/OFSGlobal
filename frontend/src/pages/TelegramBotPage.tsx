import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TelegramBotPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        sx={{ 
          p: 3,
          background: 'linear-gradient(45deg, rgba(0,255,157,0.1), rgba(255,0,255,0.1))',
          border: '1px solid rgba(0,255,157,0.2)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h1" className="cyber-glitch" data-text="Telegram Бот">
          Telegram Бот
        </Typography>
        <Typography variant="h4" sx={{ mt: 2, color: 'primary.main' }}>
          Управление корпоративным ботом
        </Typography>
      </Paper>
    </Box>
  );
};

export default TelegramBotPage;

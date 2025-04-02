import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';

// Стилизованные компоненты в стиле Cryptonite
const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(26, 26, 32, 0.95)',
  border: '1px solid rgba(157, 106, 245, 0.2)',
  boxShadow: '0 8px 32px rgba(157, 106, 245, 0.1)',
  backdropFilter: 'blur(8px)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(157, 106, 245, 0.6), transparent)',
  },
}));

const Logo = styled('img')({
  width: '200px',
  marginBottom: '2rem',
  filter: 'drop-shadow(0 0 8px rgba(157, 106, 245, 0.4))',
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': {
      borderColor: 'rgba(157, 106, 245, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(157, 106, 245, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9D6AF5',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#9D6AF5',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  background: 'linear-gradient(45deg, #9D6AF5 30%, #7B4FE9 90%)',
  borderRadius: '8px',
  border: 0,
  color: 'white',
  height: '48px',
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(157, 106, 245, .3)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(45deg, #8A5CE0 30%, #6A40D9 90%)',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 8px 3px rgba(157, 106, 245, .4)',
  },
}));

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('[LOG:Login] Отправка формы логина');

    try {
      // login уже выполняет redirect на /dashboard
      await login(username, password);
    } catch (err) {
      console.error('[LOG:Login] Ошибка входа:', err);
      setError('Неверное имя пользователя или пароль');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#121215',
        background: 'radial-gradient(circle at 10% 10%, rgba(20, 20, 35, 0.95) 0%, rgba(10, 10, 18, 0.98) 100%)',
      }}
    >
      <Container component="main" maxWidth="xs">
        <StyledPaper elevation={6}>
          <Logo src="/images/Logo_NEW2.png" alt="Photomatrix" />
          <Typography component="h1" variant="h5" sx={{ color: '#fff', mb: 3 }}>
            Вход в систему
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                {error}
              </Alert>
            )}
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
            </StyledButton>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default LoginPage; 
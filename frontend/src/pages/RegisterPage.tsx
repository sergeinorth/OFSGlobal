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
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

// Стилизованные компоненты
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

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Проверка паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    console.log('[LOG:Register] Отправка формы регистрации');
    console.log('[LOG:Register] Данные:', { email, full_name: fullName, password });

    try {
      // Явно указываем формат данных и логируем всё для отладки
      const response = await api.post('/register', {
        email,
        full_name: fullName,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[LOG:Register] Успешная регистрация:', response.data);
      setSuccess(true);
      
      // Очищаем форму
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      console.error('[LOG:Register] Ошибка регистрации:', err);
      
      // Более детальная информация об ошибке
      if (err.response) {
        console.error('[LOG:Register] Статус ошибки:', err.response.status);
        console.error('[LOG:Register] Данные ошибки:', err.response.data);
        setError(err.response.data?.detail || 'Произошла ошибка при регистрации');
      } else if (err.request) {
        console.error('[LOG:Register] Запрос отправлен, но ответ не получен');
        setError('Сервер не отвечает, проверьте подключение');
      } else {
        setError(err.message || 'Произошла ошибка при регистрации');
      }
    } finally {
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
            Регистрация
          </Typography>
          
          {success ? (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
                Регистрация прошла успешно!
              </Alert>
              <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
                Теперь вы можете войти в систему, используя ваш email и пароль.
              </Typography>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="contained" 
                sx={{ 
                  mt: 2,
                  background: 'linear-gradient(45deg, #9D6AF5 30%, #7B4FE9 90%)',
                }}
              >
                Перейти к входу
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Полное имя"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Подтвердите пароль"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
              </StyledButton>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  sx={{ 
                    color: 'rgba(157, 106, 245, 0.8)',
                    '&:hover': {
                      color: 'rgba(157, 106, 245, 1)',
                    } 
                  }}
                >
                  Уже есть аккаунт? Войти
                </Link>
              </Box>
            </Box>
          )}
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 
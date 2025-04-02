import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

interface UseAuthReturn {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuth = useCallback(async () => {
    // Не проверяем авторизацию на странице логина
    if (window.location.pathname.includes('/login')) {
      console.log('[LOG:Auth] Страница логина, пропускаем проверку авторизации');
      console.log(`[LOG:Auth] Текущий путь: ${window.location.pathname}`);
      return;
    }

    try {
      // Для проверки аутентификации используем FastAPI эндпоинт без префикса
      await api.get('/login/test-token');
      setIsAuthenticated(true);
      console.log('[LOG:Auth] Пользователь аутентифицирован');
    } catch (error) {
      setIsAuthenticated(false);
      console.log('[LOG:Auth] Пользователь не аутентифицирован');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      console.log(`[LOG:Auth] Попытка входа для пользователя: ${username}`);
      console.log(`[LOG:Auth] Текущий путь до входа: ${window.location.pathname}`);

      // Используем URLSearchParams для application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      // FastAPI аутентификация без префикса /api/v1
      const response = await api.post('/login/access-token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Сохраняем токен
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      console.log('[LOG:Auth] Успешный вход, токен сохранен');
      console.log(`[LOG:Auth] Токен: ${access_token.substring(0, 15)}...`);
      
      setIsAuthenticated(true);
      
      // Перенаправляем на дашборд после успешного входа
      console.log('[LOG:Auth] Перенаправление на /dashboard...');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('[LOG:Auth] Ошибка входа:', error);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      console.log('[LOG:Auth] Выход из системы');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      // Перенаправляем на логин после выхода
      window.location.href = '/login';
    } catch (error) {
      console.error('[LOG:Auth] Ошибка при выходе:', error);
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}; 
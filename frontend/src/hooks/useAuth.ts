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
      const token = localStorage.getItem('token');
      console.log(`[LOG:Auth] Перед запросом test-token, токен: ${token ? 'присутствует' : 'отсутствует'}`);
      
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

      // Проверка ответа
      console.log('[LOG:Auth] Ответ на запрос логина:', response.data);
      
      // Сохраняем токен
      const { access_token } = response.data;
      
      if (!access_token) {
        console.error('[LOG:Auth] Ошибка: токен отсутствует в ответе!');
        throw new Error('Token missing in response');
      }
      
      // Очищаем существующий токен перед сохранением нового
      localStorage.removeItem('token');
      
      // Сохраняем новый токен
      localStorage.setItem('token', access_token);
      console.log('[LOG:Auth] Успешный вход, токен сохранен');
      console.log(`[LOG:Auth] Токен: ${access_token.substring(0, 15)}...`);
      
      // Проверяем, что токен действительно сохранился
      const savedToken = localStorage.getItem('token');
      console.log(`[LOG:Auth] Проверка сохранения токена: ${savedToken ? savedToken.substring(0, 15) + '...' : 'не сохранен'}`);
      
      setIsAuthenticated(true);
      
      // Используем задержку перед редиректом, чтобы localStorage успел обновиться
      console.log('[LOG:Auth] Подготовка к перенаправлению на /dashboard...');
      setTimeout(() => {
        console.log('[LOG:Auth] Выполняю перенаправление на /dashboard...');
        window.location.href = '/dashboard';
      }, 100);
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
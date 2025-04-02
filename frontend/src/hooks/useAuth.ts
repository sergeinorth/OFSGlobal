import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

interface UseAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    // Не проверяем авторизацию на странице логина
    if (window.location.pathname.includes('/login')) {
      console.log('[LOG:Auth:checkAuth] Страница логина, пропускаем проверку авторизации');
      setLoading(false);
      return;
    }

    try {
      // Для проверки аутентификации используем FastAPI эндпоинт GET /users/me
      const token = localStorage.getItem('token');
      console.log(`[LOG:Auth:checkAuth] Перед запросом /users/me, токен: ${token ? 'присутствует' : 'отсутствует'}`);
      
      const response = await api.get('/users/me');
      setIsAuthenticated(true);
      console.log('[LOG:Auth:checkAuth] Успешная проверка через /users/me, пользователь аутентифицирован', response.data);
    } catch (error) {
      setIsAuthenticated(false);
      console.log('[LOG:Auth:checkAuth] Ошибка проверки токена, пользователь не аутентифицирован', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("[LOG:Auth:useEffect] Вызов checkAuth из useEffect");
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
      console.log('[LOG:Auth:login] Подготовка к перенаправлению на /dashboard...');
      const tokenBeforeRedirect = localStorage.getItem('token');
      console.log(`[LOG:Auth:login] Токен в localStorage ПЕРЕД редиректом: ${tokenBeforeRedirect ? tokenBeforeRedirect.substring(0, 15) + '...' : 'не найден'}`);
      setTimeout(() => {
        console.log('[LOG:Auth:login] Выполняю перенаправление на /dashboard...');
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
    loading,
    login,
    logout,
  };
}; 
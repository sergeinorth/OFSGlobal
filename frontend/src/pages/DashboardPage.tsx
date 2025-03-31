import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  InsertChart as InsertChartIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// Заглушка для локальной диаграммы
// @ts-ignore
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Типы данных
interface SystemStatus {
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  lastCheck: string;
  response: string;
  cpu: number;
  memory: number;
  disk: number;
}

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
}

interface QuickStats {
  organizations: number;
  divisions: number;
  staff: number;
  locations: number;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  participants: number;
}

// Моковые данные
const mockSystemStatus: SystemStatus = {
  status: 'online',
  uptime: '15д 7ч 23м',
  lastCheck: '2023-10-15T14:30:00',
  response: '120мс',
  cpu: 42,
  memory: 65,
  disk: 28,
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'info',
    message: 'Обновление системы запланировано на 20 октября',
    timestamp: '2023-10-15T10:00:00',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    message: 'Высокая нагрузка на сервер баз данных',
    timestamp: '2023-10-15T09:45:00',
    read: false,
  },
  {
    id: 3,
    type: 'error',
    message: 'Ошибка синхронизации с Active Directory',
    timestamp: '2023-10-14T16:30:00',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    message: 'Резервное копирование успешно завершено',
    timestamp: '2023-10-14T03:15:00',
    read: true,
  },
];

const mockQuickStats: QuickStats = {
  organizations: 5,
  divisions: 24,
  staff: 157,
  locations: 8,
};

const mockRecentActivities: RecentActivity[] = [
  {
    id: 1,
    action: 'Добавление сотрудника',
    user: 'Иванов И.И.',
    timestamp: '2023-10-15T13:45:00',
    details: 'Добавлен новый сотрудник в отдел разработки',
  },
  {
    id: 2,
    action: 'Изменение структуры',
    user: 'Петров П.П.',
    timestamp: '2023-10-15T11:20:00',
    details: 'Отдел маркетинга перемещен в подчинение коммерческому департаменту',
  },
  {
    id: 3,
    action: 'Обновление данных',
    user: 'Сидоров С.С.',
    timestamp: '2023-10-14T16:50:00',
    details: 'Массовое обновление данных из HR-системы',
  },
  {
    id: 4,
    action: 'Экспорт отчета',
    user: 'Козлова М.В.',
    timestamp: '2023-10-14T15:10:00',
    details: 'Сформирован отчет по организационной структуре',
  },
];

const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: 1,
    title: 'Совещание руководителей подразделений',
    date: '2023-10-17T10:00:00',
    type: 'meeting',
    participants: 12,
  },
  {
    id: 2,
    title: 'Обучение новых сотрудников',
    date: '2023-10-18T14:00:00',
    type: 'training',
    participants: 5,
  },
  {
    id: 3,
    title: 'Презентация новой версии системы',
    date: '2023-10-20T11:30:00',
    type: 'presentation',
    participants: 25,
  },
];

// Данные для диаграмм
const divisionSizeData = [
  { name: 'ИТ', сотрудники: 45 },
  { name: 'Маркетинг', сотрудники: 18 },
  { name: 'Финансы', сотрудники: 32 },
  { name: 'HR', сотрудники: 12 },
  { name: 'Операции', сотрудники: 50 },
];

const locationData = [
  { name: 'Москва', значение: 95 },
  { name: 'Санкт-Петербург', значение: 35 },
  { name: 'Новосибирск', значение: 15 },
  { name: 'Казань', значение: 12 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [quickStats, setQuickStats] = useState<QuickStats>(mockQuickStats);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(mockRecentActivities);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>(mockUpcomingEvents);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Имитация обновления данных
  const refreshData = () => {
    setIsLoading(true);
    
    // Имитация API запроса
    setTimeout(() => {
      setIsLoading(false);
      // Здесь в реальном приложении было бы обновление данных с сервера
    }, 1000);
  };
  
  // Имитация загрузки данных при монтировании компонента
  useEffect(() => {
    refreshData();
  }, []);
  
  // Обработка прочтения уведомления
  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };
  
  // Получение цвета для статуса системы
  const getStatusColor = (status: 'online' | 'offline' | 'degraded') => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'offline':
        return theme.palette.error.main;
      case 'degraded':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Получение иконки для типа уведомления
  const getNotificationIcon = (type: 'info' | 'warning' | 'error' | 'success') => {
    switch (type) {
      case 'info':
        return <AnnouncementIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <AnnouncementIcon />;
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };
  
  // Навигация к разделам
  const navigateToOrganizationChart = () => {
    navigate('/organization');
  };
  
  const navigateToBotManagement = () => {
    navigate('/bot');
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Панель управления ОФС
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={isLoading}
          >
            Обновить данные
          </Button>
        </Box>
        
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Grid container spacing={3}>
          {/* Статус системы */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Статус системы
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: getStatusColor(systemStatus.status),
                    mr: 1,
                  }}
                />
                <Typography variant="body1">
                  {systemStatus.status === 'online'
                    ? 'Онлайн'
                    : systemStatus.status === 'offline'
                    ? 'Офлайн'
                    : 'Частичная работоспособность'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Время безотказной работы: {systemStatus.uptime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Последняя проверка: {formatDate(systemStatus.lastCheck)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Время отклика: {systemStatus.response}
                </Typography>
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Использование ЦП: {systemStatus.cpu}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemStatus.cpu}
                color={systemStatus.cpu > 80 ? 'error' : systemStatus.cpu > 60 ? 'warning' : 'primary'}
                sx={{ mb: 2, height: 8, borderRadius: 2 }}
              />
              
              <Typography variant="body2" gutterBottom>
                Использование памяти: {systemStatus.memory}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemStatus.memory}
                color={systemStatus.memory > 80 ? 'error' : systemStatus.memory > 60 ? 'warning' : 'primary'}
                sx={{ mb: 2, height: 8, borderRadius: 2 }}
              />
              
              <Typography variant="body2" gutterBottom>
                Использование диска: {systemStatus.disk}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemStatus.disk}
                color={systemStatus.disk > 80 ? 'error' : systemStatus.disk > 60 ? 'warning' : 'primary'}
                sx={{ height: 8, borderRadius: 2 }}
              />
            </Paper>
          </Grid>
          
          {/* Быстрая статистика */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Статистика системы
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <BusinessIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h4">{quickStats.organizations}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Организаций
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <DashboardIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h4">{quickStats.divisions}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Подразделений
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <PeopleIcon sx={{ fontSize: 48, mb: 1, color: theme.palette.success.main }} />
                      <Typography variant="h4">{quickStats.staff}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Сотрудников
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <InsertChartIcon
                        sx={{ fontSize: 48, mb: 1, color: theme.palette.info.main }}
                      />
                      <Typography variant="h4">{quickStats.locations}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Локаций
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={navigateToOrganizationChart}
                >
                  Перейти к организационной структуре
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Графики и диаграммы */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Аналитика ОФС
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Размер подразделений (сотрудники)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={divisionSizeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="сотрудники" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Распределение по локациям
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="значение"
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Уведомления */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Уведомления системы
              </Typography>
              <List>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: notification.read ? 'transparent' : 'action.hover',
                          borderRadius: 1,
                        }}
                        secondaryAction={
                          !notification.read && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                        <ListItemText
                          primary={notification.message}
                          secondary={formatDate(notification.timestamp)}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Нет новых уведомлений
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
          
          {/* Последние действия */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Последние действия
              </Typography>
              <List>
                {recentActivities.map(activity => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {activity.user}
                            </Typography>
                            {` — ${activity.details} (${formatDate(activity.timestamp)})`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Предстоящие события */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Предстоящие события
              </Typography>
              <List>
                {upcomingEvents.map(event => (
                  <React.Fragment key={event.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            <Typography variant="body2">
                              {new Date(event.date).toLocaleString('ru-RU', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Chip
                                size="small"
                                label={event.type}
                                color={
                                  event.type === 'meeting'
                                    ? 'primary'
                                    : event.type === 'training'
                                    ? 'secondary'
                                    : 'default'
                                }
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {event.participants} участников
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Telegram бот */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CodeIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.info.main }} />
                  <Box>
                    <Typography variant="h6">Telegram бот ОФС</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Управляйте корпоративным ботом для получения информации о структуре компании
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SettingsIcon />}
                  onClick={navigateToBotManagement}
                >
                  Управление ботом
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage; 
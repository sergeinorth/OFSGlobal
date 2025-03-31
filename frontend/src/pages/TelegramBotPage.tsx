import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MessageIcon from '@mui/icons-material/Message';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import HelpIcon from '@mui/icons-material/Help';

// Типы данных для телеграм-бота
interface BotConfig {
  token: string;
  name: string;
  username: string;
  isActive: boolean;
  webhookUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface BotStats {
  totalUsers: number;
  activeUsers: number;
  messagesReceived: number;
  messagesSent: number;
  commandsProcessed: number;
  errorsCount: number;
  uptime: string;
}

interface BotUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isBlocked: boolean;
  lastActivity: string;
  registeredAt: string;
}

interface BotCommand {
  command: string;
  description: string;
  isEnabled: boolean;
}

interface BotMessage {
  id: number;
  userId: number;
  username: string;
  text: string;
  timestamp: string;
  isIncoming: boolean;
}

// Mock данные для телеграм-бота
const mockBotConfig: BotConfig = {
  token: '123456789:AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq',
  name: 'ОФС Инфо Бот',
  username: '@ofs_info_bot',
  isActive: true,
  webhookUrl: 'https://api.ofs-global.com/webhook/telegram',
  createdAt: '2023-01-15T12:00:00',
  updatedAt: '2023-08-20T15:30:45',
};

const mockBotStats: BotStats = {
  totalUsers: 158,
  activeUsers: 87,
  messagesReceived: 3425,
  messagesSent: 2780,
  commandsProcessed: 945,
  errorsCount: 23,
  uptime: '35 дней 12 часов',
};

const mockBotUsers: BotUser[] = [
  {
    id: 12345678,
    username: 'ivanov_ivan',
    firstName: 'Иван',
    lastName: 'Иванов',
    isAdmin: true,
    isBlocked: false,
    lastActivity: '2023-10-15T14:28:32',
    registeredAt: '2023-02-10T09:15:00',
  },
  {
    id: 87654321,
    username: 'petrov_petr',
    firstName: 'Петр',
    lastName: 'Петров',
    isAdmin: false,
    isBlocked: false,
    lastActivity: '2023-10-14T18:10:45',
    registeredAt: '2023-03-05T11:30:00',
  },
  {
    id: 23456789,
    username: 'sidorov_sid',
    firstName: 'Сидор',
    lastName: 'Сидоров',
    isAdmin: false,
    isBlocked: true,
    lastActivity: '2023-08-20T10:05:22',
    registeredAt: '2023-02-15T14:45:00',
  },
  {
    id: 34567890,
    username: 'kozlova_maria',
    firstName: 'Мария',
    lastName: 'Козлова',
    isAdmin: true,
    isBlocked: false,
    lastActivity: '2023-10-15T09:32:11',
    registeredAt: '2023-01-20T16:20:00',
  },
  {
    id: 45678901,
    username: 'smirnov_alex',
    firstName: 'Алексей',
    lastName: 'Смирнов',
    isAdmin: false,
    isBlocked: false,
    lastActivity: '2023-10-13T20:15:38',
    registeredAt: '2023-04-12T08:50:00',
  },
];

const mockBotCommands: BotCommand[] = [
  { command: '/start', description: 'Начать взаимодействие с ботом', isEnabled: true },
  { command: '/help', description: 'Показать список доступных команд', isEnabled: true },
  { command: '/info', description: 'Информация о системе ОФС', isEnabled: true },
  { command: '/status', description: 'Статус системы ОФС', isEnabled: true },
  { command: '/contact', description: 'Контактная информация', isEnabled: true },
  { command: '/divisions', description: 'Список подразделений', isEnabled: true },
  { command: '/find_employee', description: 'Найти сотрудника', isEnabled: true },
  { command: '/schedule', description: 'Расписание работы офисов', isEnabled: false },
  { command: '/report', description: 'Создать отчет', isEnabled: true },
  { command: '/admin', description: 'Административные функции', isEnabled: true },
];

const mockBotMessages: BotMessage[] = [
  {
    id: 1,
    userId: 12345678,
    username: 'ivanov_ivan',
    text: '/start',
    timestamp: '2023-10-15T10:00:15',
    isIncoming: true,
  },
  {
    id: 2,
    userId: 12345678,
    username: 'bot',
    text: 'Привет, Иван! Я бот системы ОФС. Чем могу помочь?',
    timestamp: '2023-10-15T10:00:16',
    isIncoming: false,
  },
  {
    id: 3,
    userId: 12345678,
    username: 'ivanov_ivan',
    text: '/info',
    timestamp: '2023-10-15T10:01:20',
    isIncoming: true,
  },
  {
    id: 4,
    userId: 12345678,
    username: 'bot',
    text: 'ОФС Глобал - международная компания, специализирующаяся на разработке информационных систем.',
    timestamp: '2023-10-15T10:01:21',
    isIncoming: false,
  },
  {
    id: 5,
    userId: 12345678,
    username: 'ivanov_ivan',
    text: 'Как найти контакты отдела разработки?',
    timestamp: '2023-10-15T10:05:33',
    isIncoming: true,
  },
  {
    id: 6,
    userId: 12345678,
    username: 'bot',
    text: 'Контакты отдела разработки: email - dev@ofs-global.com, телефон: +7 (900) 123-45-67',
    timestamp: '2023-10-15T10:05:34',
    isIncoming: false,
  },
  {
    id: 7,
    userId: 12345678,
    username: 'ivanov_ivan',
    text: '/divisions',
    timestamp: '2023-10-15T10:10:05',
    isIncoming: true,
  },
  {
    id: 8,
    userId: 12345678,
    username: 'bot',
    text: 'Список подразделений ОФС Глобал:\n1. Департамент разработки\n2. Департамент маркетинга\n3. Финансовый департамент\n4. HR-департамент',
    timestamp: '2023-10-15T10:10:06',
    isIncoming: false,
  },
];

// Компонент для отображения и управления телеграм-ботом
const TelegramBotPage: React.FC = () => {
  // Состояния компонента
  const [tabValue, setTabValue] = useState<number>(0);
  const [botConfig, setBotConfig] = useState<BotConfig>(mockBotConfig);
  const [botStats, setBotStats] = useState<BotStats>(mockBotStats);
  const [botUsers, setBotUsers] = useState<BotUser[]>(mockBotUsers);
  const [botCommands, setBotCommands] = useState<BotCommand[]>(mockBotCommands);
  const [botMessages, setBotMessages] = useState<BotMessage[]>(mockBotMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<BotUser | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isConfigEditing, setIsConfigEditing] = useState<boolean>(false);
  const [openAddCommandDialog, setOpenAddCommandDialog] = useState<boolean>(false);
  const [newCommand, setNewCommand] = useState<BotCommand>({
    command: '',
    description: '',
    isEnabled: true,
  });
  
  // Обработчик изменения вкладки
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Обработчик изменения конфигурации бота
  const handleConfigChange = (field: keyof BotConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === 'isActive') {
      setBotConfig({
        ...botConfig,
        [field]: event.target.checked,
      });
    } else {
      setBotConfig({
        ...botConfig,
        [field]: event.target.value,
      });
    }
  };
  
  // Сохранение изменений конфигурации
  const saveConfig = () => {
    setIsLoading(true);
    
    // Имитация запроса к API
    setTimeout(() => {
      setIsLoading(false);
      setIsConfigEditing(false);
      // В реальном приложении здесь был бы запрос к API
    }, 1000);
  };
  
  // Выбор пользователя для просмотра переписки
  const selectUser = (user: BotUser) => {
    setSelectedUser(user);
    // В реальном приложении здесь был бы запрос сообщений конкретного пользователя
  };
  
  // Отправка нового сообщения
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    const newBotMessage: BotMessage = {
      id: botMessages.length + 1,
      userId: selectedUser.id,
      username: 'bot',
      text: newMessage,
      timestamp: new Date().toISOString(),
      isIncoming: false,
    };
    
    setBotMessages([...botMessages, newBotMessage]);
    setNewMessage('');
    
    // В реальном приложении здесь был бы запрос к API для отправки сообщения
  };
  
  // Изменение статуса команды (включена/выключена)
  const toggleCommandStatus = (index: number) => {
    const updatedCommands = [...botCommands];
    updatedCommands[index].isEnabled = !updatedCommands[index].isEnabled;
    setBotCommands(updatedCommands);
    
    // В реальном приложении здесь был бы запрос к API
  };
  
  // Добавление новой команды
  const addCommand = () => {
    if (!newCommand.command || !newCommand.description) return;
    
    setBotCommands([...botCommands, newCommand]);
    setNewCommand({
      command: '',
      description: '',
      isEnabled: true,
    });
    setOpenAddCommandDialog(false);
    
    // В реальном приложении здесь был бы запрос к API
  };
  
  // Блокировка/разблокировка пользователя
  const toggleUserBlock = (userId: number) => {
    const updatedUsers = botUsers.map(user => {
      if (user.id === userId) {
        return { ...user, isBlocked: !user.isBlocked };
      }
      return user;
    });
    
    setBotUsers(updatedUsers);
    
    // В реальном приложении здесь был бы запрос к API
  };
  
  // Установка/снятие прав администратора
  const toggleUserAdmin = (userId: number) => {
    const updatedUsers = botUsers.map(user => {
      if (user.id === userId) {
        return { ...user, isAdmin: !user.isAdmin };
      }
      return user;
    });
    
    setBotUsers(updatedUsers);
    
    // В реальном приложении здесь был бы запрос к API
  };
  
  // Фильтрация сообщений для выбранного пользователя
  const filteredMessages = selectedUser
    ? botMessages.filter(msg => msg.userId === selectedUser.id)
    : [];
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление Telegram ботом
        </Typography>
        
        <Paper sx={{ p: 2, mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab icon={<InfoIcon />} label="Информация" />
            <Tab icon={<SettingsIcon />} label="Настройки" />
            <Tab icon={<PeopleIcon />} label="Пользователи" />
            <Tab icon={<MessageIcon />} label="Сообщения" />
            <Tab icon={<CodeIcon />} label="Команды" />
          </Tabs>
          
          {/* Вкладка Информация */}
          {tabValue === 0 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Основная информация" />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            mr: 2,
                          }}
                        >
                          <Typography variant="h4">T</Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6">{botConfig.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {botConfig.username}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Статус:</strong>{' '}
                        <Chip
                          label={botConfig.isActive ? 'Активен' : 'Неактивен'}
                          color={botConfig.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </Typography>
                      
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Webhook URL:</strong> {botConfig.webhookUrl}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Время работы:</strong> {botStats.uptime}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Дата создания:</strong>{' '}
                        {new Date(botConfig.createdAt).toLocaleString('ru-RU')}
                      </Typography>
                      
                      <Typography variant="body1">
                        <strong>Последнее обновление:</strong>{' '}
                        {new Date(botConfig.updatedAt).toLocaleString('ru-RU')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Статистика" />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h4" color="primary.main">
                              {botStats.totalUsers}
                            </Typography>
                            <Typography variant="body2">Всего пользователей</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h4" color="success.main">
                              {botStats.activeUsers}
                            </Typography>
                            <Typography variant="body2">Активных пользователей</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h4" color="info.main">
                              {botStats.messagesReceived}
                            </Typography>
                            <Typography variant="body2">Полученных сообщений</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h4" color="info.main">
                              {botStats.messagesSent}
                            </Typography>
                            <Typography variant="body2">Отправленных сообщений</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h4" color="warning.main">
                              {botStats.commandsProcessed}
                            </Typography>
                            <Typography variant="body2">Обработано команд</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h4" color="error.main">
                              {botStats.errorsCount}
                            </Typography>
                            <Typography variant="body2">Ошибок</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Вкладка Настройки */}
          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              <Card>
                <CardHeader
                  title="Конфигурация бота"
                  action={
                    isConfigEditing ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={saveConfig}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                      >
                        Сохранить
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setIsConfigEditing(true)}
                      >
                        Редактировать
                      </Button>
                    )
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Название бота"
                        fullWidth
                        value={botConfig.name}
                        onChange={handleConfigChange('name')}
                        margin="normal"
                        disabled={!isConfigEditing}
                      />
                      
                      <TextField
                        label="Имя пользователя бота"
                        fullWidth
                        value={botConfig.username}
                        onChange={handleConfigChange('username')}
                        margin="normal"
                        disabled={!isConfigEditing}
                      />
                      
                      <TextField
                        label="Токен бота"
                        fullWidth
                        value={botConfig.token}
                        onChange={handleConfigChange('token')}
                        margin="normal"
                        disabled={!isConfigEditing}
                        type="password"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Webhook URL"
                        fullWidth
                        value={botConfig.webhookUrl}
                        onChange={handleConfigChange('webhookUrl')}
                        margin="normal"
                        disabled={!isConfigEditing}
                      />
                      
                      <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={botConfig.isActive}
                              onChange={handleConfigChange('isActive')}
                              disabled={!isConfigEditing}
                            />
                          }
                          label="Бот активен"
                        />
                      </Box>
                      
                      {isConfigEditing && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Внимание! Изменение токена приведет к отключению текущего бота и
                          подключению нового. Все пользователи должны будут заново подписаться.
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
          
          {/* Вкладка Пользователи */}
          {tabValue === 2 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Card>
                    <CardHeader
                      title="Пользователи бота"
                      action={
                        <TextField
                          placeholder="Поиск пользователя"
                          size="small"
                          variant="outlined"
                        />
                      }
                    />
                    <CardContent>
                      <List>
                        {botUsers.map(user => (
                          <React.Fragment key={user.id}>
                            <ListItem
                              secondaryAction={
                                <Box>
                                  <IconButton
                                    edge="end"
                                    color={user.isBlocked ? 'error' : 'default'}
                                    onClick={() => toggleUserBlock(user.id)}
                                    title={user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    color={user.isAdmin ? 'primary' : 'default'}
                                    onClick={() => toggleUserAdmin(user.id)}
                                    title={user.isAdmin ? 'Снять права админа' : 'Сделать админом'}
                                  >
                                    <PersonAddIcon />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    onClick={() => selectUser(user)}
                                    title="Сообщения"
                                  >
                                    <MessageIcon />
                                  </IconButton>
                                </Box>
                              }
                            >
                              <ListItemIcon>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <Typography>
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                  </Typography>
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>
                                      {user.firstName} {user.lastName}
                                    </Typography>
                                    {user.isAdmin && (
                                      <Chip
                                        label="Админ"
                                        color="primary"
                                        size="small"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                    {user.isBlocked && (
                                      <Chip
                                        label="Заблокирован"
                                        color="error"
                                        size="small"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <>
                                    @{user.username} | Последняя активность:{' '}
                                    {new Date(user.lastActivity).toLocaleString('ru-RU')}
                                  </>
                                }
                              />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Вкладка Сообщения */}
          {tabValue === 3 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader title="Пользователи" />
                    <Box sx={{ overflow: 'auto', flex: 1 }}>
                      <List>
                        {botUsers.map(user => (
                          <React.Fragment key={user.id}>
                            <ListItem
                              button
                              onClick={() => selectUser(user)}
                              selected={selectedUser?.id === user.id}
                            >
                              <ListItemIcon>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <Typography>
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                  </Typography>
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={`${user.firstName} ${user.lastName}`}
                                secondary={`@${user.username}`}
                              />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Card
                    sx={{
                      height: '600px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardHeader
                      title={
                        selectedUser
                          ? `Чат с ${selectedUser.firstName} ${selectedUser.lastName}`
                          : 'Выберите пользователя'
                      }
                    />
                    
                    {selectedUser ? (
                      <>
                        <Box
                          sx={{
                            flex: 1,
                            overflow: 'auto',
                            p: 2,
                            bgcolor: '#f5f5f5',
                          }}
                        >
                          {filteredMessages.map(message => (
                            <Box
                              key={message.id}
                              sx={{
                                display: 'flex',
                                justifyContent: message.isIncoming ? 'flex-start' : 'flex-end',
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  maxWidth: '70%',
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: message.isIncoming ? 'white' : 'primary.main',
                                  color: message.isIncoming ? 'text.primary' : 'white',
                                }}
                              >
                                <Typography variant="body1">{message.text}</Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    textAlign: 'right',
                                    mt: 0.5,
                                    color: message.isIncoming ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
                                  }}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                        
                        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                          <Grid container spacing={1}>
                            <Grid item xs>
                              <TextField
                                fullWidth
                                placeholder="Введите сообщение..."
                                variant="outlined"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyPress={e => {
                                  if (e.key === 'Enter') {
                                    sendMessage();
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                              >
                                Отправить
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </>
                    ) : (
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          bgcolor: '#f5f5f5',
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          Выберите пользователя, чтобы начать чат
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Вкладка Команды */}
          {tabValue === 4 && (
            <Box sx={{ p: 2 }}>
              <Card>
                <CardHeader
                  title="Команды бота"
                  action={
                    <Button
                      variant="contained"
                      startIcon={<HelpIcon />}
                      onClick={() => setOpenAddCommandDialog(true)}
                    >
                      Добавить команду
                    </Button>
                  }
                />
                <CardContent>
                  <List>
                    {botCommands.map((command, index) => (
                      <React.Fragment key={command.command}>
                        <ListItem
                          secondaryAction={
                            <Switch
                              edge="end"
                              checked={command.isEnabled}
                              onChange={() => toggleCommandStatus(index)}
                            />
                          }
                        >
                          <ListItemIcon>
                            <CodeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={command.command}
                            secondary={command.description}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Диалог добавления новой команды */}
      <Dialog open={openAddCommandDialog} onClose={() => setOpenAddCommandDialog(false)}>
        <DialogTitle>Добавить новую команду</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Команда"
            type="text"
            fullWidth
            value={newCommand.command}
            onChange={e => setNewCommand({ ...newCommand, command: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Описание"
            type="text"
            fullWidth
            value={newCommand.description}
            onChange={e => setNewCommand({ ...newCommand, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newCommand.isEnabled}
                onChange={e =>
                  setNewCommand({ ...newCommand, isEnabled: e.target.checked })
                }
              />
            }
            label="Команда активна"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddCommandDialog(false)}>Отмена</Button>
          <Button onClick={addCommand} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TelegramBotPage;

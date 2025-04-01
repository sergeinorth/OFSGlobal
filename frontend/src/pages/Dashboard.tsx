import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Стилизованные компоненты
const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(32, 32, 36, 0.9)',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(45, 45, 55, 0.9)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), inset 0 0 3px rgba(157, 106, 245, 0.1)',
    borderColor: 'rgba(60, 60, 70, 0.9)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(90deg, #9D6AF5, #b350ff)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 'bold',
  textShadow: '0 0 10px rgba(157, 106, 245, 0.5)',
}));

const ProgressLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  color: '#fff',
  marginBottom: theme.spacing(0.8),
  fontWeight: 500,
  opacity: 0.9,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 1,
    transform: 'translateX(2px)',
  }
}));

const GradientProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 16,
  borderRadius: 8,
  marginBottom: theme.spacing(1.5),
  backgroundColor: 'rgba(32, 32, 36, 0.9)',
  border: '1px solid rgba(45, 45, 55, 0.9)',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #9D6AF5, #b350ff)',
    borderRadius: 8,
    boxShadow: '0 0 10px rgba(157, 106, 245, 0.5)',
  },
  '&:hover': {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.2)',
    '& .MuiLinearProgress-bar': {
      boxShadow: '0 0 15px rgba(157, 106, 245, 0.7)',
    }
  },
}));

const KanbanCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  background: 'rgba(30, 30, 42, 0.8)',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 0 15px rgba(157, 106, 245, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15), inset 0 0 20px rgba(157, 106, 245, 0.12)',
  },
}));

const KanbanColumn = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  background: 'rgba(20, 20, 30, 0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  height: '100%',
}));

// Примеры данных
const pieData = [
  { name: 'Выполнено', value: 65, color: '#00e6ff' },
  { name: 'В работе', value: 25, color: '#b100ff' },
  { name: 'Отложено', value: 10, color: '#f0a202' },
];

const areaData = [
  { name: 'Янв', value: 40 },
  { name: 'Фев', value: 30 },
  { name: 'Мар', value: 45 },
  { name: 'Апр', value: 50 },
  { name: 'Май', value: 65 },
  { name: 'Июн', value: 60 },
  { name: 'Июл', value: 85 },
];

const progressData = [
  { name: 'Выполнение плана', value: 82 },
  { name: 'Эффективность', value: 76 },
  { name: 'Качество', value: 90 },
  { name: 'Удовлетворенность', value: 68 },
];

const kanbanTasks = {
  todo: [
    { id: 1, title: 'Обновить дизайн', priority: 'Высокий' },
    { id: 2, title: 'Интеграция API', priority: 'Средний' },
  ],
  inProgress: [
    { id: 3, title: 'Оптимизация БД', priority: 'Средний' },
    { id: 4, title: 'Разработка новых модулей', priority: 'Высокий' },
  ],
  completed: [
    { id: 5, title: 'Обновление документации', priority: 'Низкий' },
    { id: 6, title: 'Исправление багов', priority: 'Высокий' },
  ],
};

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Ключевые метрики */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#9D6AF5', 
              fontWeight: 500,
              textShadow: '0 0 5px rgba(157, 106, 245, 0.5)'
            }}>
              Ключевые показатели эффективности
            </Typography>
            <Box sx={{ mb: 2 }}>
              {progressData.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <ProgressLabel>
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </ProgressLabel>
                  <GradientProgressBar variant="determinate" value={item.value} />
                </Box>
              ))}
            </Box>
          </StyledCard>
        </Grid>

        {/* Статистика сотрудников */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#9D6AF5', 
              fontWeight: 500,
              textShadow: '0 0 5px rgba(157, 106, 245, 0.5)'
            }}>
              Статистика персонала
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Общее количество сотрудников
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="#fff">
                  873
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Активные проекты
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="#fff">
                  42
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Отделы
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="#fff">
                  18
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Новые сотрудники (месяц)
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="#fff">
                  15
                </Typography>
              </Box>
            </Box>
          </StyledCard>
        </Grid>
        
        {/* Недавняя активность */}
        <Grid item xs={12}>
          <StyledCard>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#9D6AF5', 
              fontWeight: 500,
              textShadow: '0 0 5px rgba(157, 106, 245, 0.5)'
            }}>
              Недавняя активность
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'rgba(30, 30, 42, 0.5)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="#fff">
                      {index === 0 ? 'Создан новый отдел "Аналитика данных"' : 
                       index === 1 ? 'Добавлен сотрудник Иванов И.И.' :
                       index === 2 ? 'Обновлена организационная структура' :
                       index === 3 ? 'Изменены роли в проекте "Реструктуризация"' :
                       'Обновлены KPI сотрудников IT-отдела'}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                      {index === 0 ? 'Сегодня, 10:32' : 
                       index === 1 ? 'Сегодня, 09:15' :
                       index === 2 ? 'Вчера, 16:45' :
                       index === 3 ? 'Вчера, 12:20' :
                       '21.04.2024, 14:30'}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 1,
                      alignSelf: 'flex-start',
                      backgroundColor: index % 2 === 0 ? 'rgba(0, 230, 255, 0.1)' : 'rgba(177, 0, 255, 0.1)',
                      color: index % 2 === 0 ? '#00e6ff' : '#b100ff',
                    }}
                  >
                    {index % 2 === 0 ? 'Система' : 'HR'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
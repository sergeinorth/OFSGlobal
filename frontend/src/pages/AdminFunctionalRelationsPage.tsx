import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../services/api';
import { API_URL } from '../config';

// Типы данных для функциональных связей
interface FunctionalRelation {
  id: number;
  source_type: string;
  source_id: number;
  target_type: string;
  target_id: number;
  relation_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для связанных данных
interface Division {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
}

const AdminFunctionalRelationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Данные для таблицы
  const [relations, setRelations] = useState<FunctionalRelation[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Загружаем начальные данные
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем функциональные связи
      console.log(`Отправляем запрос к: ${API_URL}/functional-relations/`);
      const relationsResponse = await api.get('/functional-relations/');
      console.log('Ответ сервера (functional-relations):', relationsResponse);
      setRelations(relationsResponse.data);
      
      // Загружаем связанные данные для выпадающих списков
      const divResponse = await api.get('/divisions/');
      setDivisions(divResponse.data);
      
      const posResponse = await api.get('/positions/');
      setPositions(posResponse.data);
      
      const staffResponse = await api.get('/staff/');
      setStaff(staffResponse.data);
    } catch (err) {
      console.error('Ошибка при запросе functional-relations:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err !== null && 'message' in err) 
          ? String((err as any).message) 
          : String(err);
      setError(`Ошибка при загрузке функциональных связей: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Получение отображаемого имени для объекта по его типу и ID
  const getItemName = (type: string, id: number) => {
    switch(type) {
      case 'division':
        const division = divisions.find(d => d.id === id);
        return division ? division.name : 'Неизвестное подразделение';
      case 'position':
        const position = positions.find(p => p.id === id);
        return position ? position.name : 'Неизвестная должность';
      case 'staff':
        const employee = staff.find(s => s.id === id);
        return employee ? `${employee.last_name} ${employee.first_name}` : 'Неизвестный сотрудник';
      default:
        return `${type}:${id}`;
    }
  };

  // Получение типа отношения
  const getRelationTypeName = (type: string) => {
    switch(type) {
      case 'reports_to': return 'Подчиняется';
      case 'manages': return 'Руководит';
      case 'collaborates': return 'Сотрудничает';
      case 'part_of': return 'Часть';
      case 'controls': return 'Контролирует';
      default: return type;
    }
  };

  const handleEditItem = (item: any) => {
    setCurrentItem({ ...item });
    setEditDialogOpen(true);
  };

  const handleCreateItem = () => {
    setCurrentItem({ 
      source_type: 'staff',
      source_id: null,
      target_type: 'position',
      target_id: null,
      relation_type: 'reports_to',
      is_active: true 
    });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setCurrentItem(item);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    
    try {
      await api.delete(`/functional-relations/${currentItem.id}`);
      setSuccess('Запись успешно удалена');
      fetchData();
    } catch (err) {
      setError('Ошибка при удалении: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
      setConfirmDeleteOpen(false);
    }
  };

  const handleSaveItem = async () => {
    setLoading(true);
    
    try {
      let response;
      
      if (currentItem.id) {
        // Обновляем существующую связь
        response = await api.put(`/functional-relations/${currentItem.id}`, currentItem);
        setSuccess('Запись успешно обновлена');
      } else {
        // Создаем новую связь
        response = await api.post(`/functional-relations/`, currentItem);
        setSuccess('Запись успешно создана');
      }
      
      fetchData();
    } catch (err) {
      setError('Ошибка при сохранении: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    // Преобразуем строковые "true"/"false" обратно в булевы значения для is_active
    if (name === "is_active") {
      setCurrentItem({ ...currentItem, [name]: value === "true" });
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  // Таблица функциональных связей
  const renderRelationsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Источник</TableCell>
              <TableCell>Отношение</TableCell>
              <TableCell>Цель</TableCell>
              <TableCell>Активно</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relations.map((rel) => (
              <TableRow key={rel.id}>
                <TableCell>{rel.id}</TableCell>
                <TableCell>
                  <strong>{rel.source_type === 'division' ? 'Подразделение' : 
                           rel.source_type === 'position' ? 'Должность' : 
                           'Сотрудник'}:</strong> {getItemName(rel.source_type, rel.source_id)}
                </TableCell>
                <TableCell>
                  {getRelationTypeName(rel.relation_type)}
                </TableCell>
                <TableCell>
                  <strong>{rel.target_type === 'division' ? 'Подразделение' : 
                           rel.target_type === 'position' ? 'Должность' : 
                           'Сотрудник'}:</strong> {getItemName(rel.target_type, rel.target_id)}
                </TableCell>
                <TableCell>{rel.is_active ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditItem(rel)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteItem(rel)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Диалог редактирования
  const renderEditDialog = () => {
    return (
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentItem?.id ? 'Редактировать связь' : 'Создать связь'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Тип источника</InputLabel>
              <Select
                name="source_type"
                value={currentItem?.source_type || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="division">Подразделение</MenuItem>
                <MenuItem value="position">Должность</MenuItem>
                <MenuItem value="staff">Сотрудник</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Источник</InputLabel>
              <Select
                name="source_id"
                value={currentItem?.source_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Выберите...</MenuItem>
                {currentItem?.source_type === 'division' && divisions.map(div => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))}
                {currentItem?.source_type === 'position' && positions.map(pos => (
                  <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                ))}
                {currentItem?.source_type === 'staff' && staff.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.last_name} {emp.first_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Тип отношения</InputLabel>
              <Select
                name="relation_type"
                value={currentItem?.relation_type || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="reports_to">Подчиняется</MenuItem>
                <MenuItem value="manages">Руководит</MenuItem>
                <MenuItem value="collaborates">Сотрудничает</MenuItem>
                <MenuItem value="part_of">Часть</MenuItem>
                <MenuItem value="controls">Контролирует</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Тип цели</InputLabel>
              <Select
                name="target_type"
                value={currentItem?.target_type || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="division">Подразделение</MenuItem>
                <MenuItem value="position">Должность</MenuItem>
                <MenuItem value="staff">Сотрудник</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Цель</InputLabel>
              <Select
                name="target_id"
                value={currentItem?.target_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Выберите...</MenuItem>
                {currentItem?.target_type === 'division' && divisions.map(div => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))}
                {currentItem?.target_type === 'position' && positions.map(pos => (
                  <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                ))}
                {currentItem?.target_type === 'staff' && staff.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.last_name} {emp.first_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Активно</InputLabel>
              <Select
                name="is_active"
                value={currentItem?.is_active ? "true" : "false"}
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Да</MenuItem>
                <MenuItem value={"false"}>Нет</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => setEditDialogOpen(false)}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveItem}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Диалог подтверждения удаления
  const renderDeleteDialog = () => {
    return (
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить эту функциональную связь? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmDeleteOpen(false)}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Администрирование функциональных связей
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchData()}
              sx={{ mr: 1 }}
            >
              Обновить
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateItem}
            >
              Создать
            </Button>
          </Box>
        </Box>
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          {loading && <LinearProgress />}
          
          <Box sx={{ p: 3 }}>
            {renderRelationsTable()}
          </Box>
        </Paper>
        
        {renderEditDialog()}
        {renderDeleteDialog()}
        
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminFunctionalRelationsPage; 
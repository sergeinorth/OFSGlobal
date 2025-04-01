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
  TextField,
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

// Типы данных для должностей
interface Position {
  id: number;
  name: string;
  code: string;
  division_id?: number;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для связанных данных
interface Division {
  id: number;
  name: string;
}

const AdminPositionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Данные для таблицы
  const [positions, setPositions] = useState<Position[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [parentPositions, setParentPositions] = useState<Position[]>([]);

  // Загружаем начальные данные
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем должности
      console.log(`Отправляем запрос к: ${API_URL}/positions/`);
      const positionsResponse = await api.get('/positions/');
      console.log('Ответ сервера (positions):', positionsResponse);
      setPositions(positionsResponse.data);
      setParentPositions(positionsResponse.data);
      
      // Загружаем подразделения для выпадающего списка
      console.log(`Отправляем запрос к: ${API_URL}/divisions/`);
      const divResponse = await api.get('/divisions/');
      console.log('Ответ сервера (divisions):', divResponse);
      setDivisions(divResponse.data);
    } catch (err) {
      console.error('Ошибка при запросе positions:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err !== null && 'message' in err) 
          ? String((err as any).message) 
          : String(err);
      setError(`Ошибка при загрузке должностей: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: any) => {
    setCurrentItem({ ...item });
    setEditDialogOpen(true);
  };

  const handleCreateItem = () => {
    setCurrentItem({ 
      name: '', 
      code: '', 
      division_id: null,
      parent_id: null,
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
      await api.delete(`/positions/${currentItem.id}`);
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
        // Обновляем существующую должность
        response = await api.put(`/positions/${currentItem.id}`, currentItem);
        setSuccess('Запись успешно обновлена');
      } else {
        // Создаем новую должность
        response = await api.post(`/positions/`, currentItem);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
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

  // Таблица должностей
  const renderPositionsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Подразделение</TableCell>
              <TableCell>Родительская должность</TableCell>
              <TableCell>Активна</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.id}>
                <TableCell>{pos.id}</TableCell>
                <TableCell>{pos.name}</TableCell>
                <TableCell>{pos.code}</TableCell>
                <TableCell>
                  {pos.division_id && divisions.find(div => div.id === pos.division_id)?.name || '—'}
                </TableCell>
                <TableCell>
                  {pos.parent_id && parentPositions.find(parent => parent.id === pos.parent_id)?.name || '—'}
                </TableCell>
                <TableCell>{pos.is_active ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditItem(pos)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteItem(pos)}>
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
          {currentItem?.id ? 'Редактировать должность' : 'Создать должность'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Название"
              value={currentItem?.name || ''}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              name="code"
              label="Код"
              value={currentItem?.code || ''}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Подразделение</InputLabel>
              <Select
                name="division_id"
                value={currentItem?.division_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {divisions.map(div => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Родительская должность</InputLabel>
              <Select
                name="parent_id"
                value={currentItem?.parent_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {parentPositions.map(pos => 
                  // Исключаем текущую должность из списка возможных родителей
                  pos.id !== currentItem?.id && (
                    <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Активна</InputLabel>
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
            Вы действительно хотите удалить эту должность? Это действие нельзя отменить.
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
            Администрирование должностей
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
            {renderPositionsTable()}
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

export default AdminPositionsPage; 
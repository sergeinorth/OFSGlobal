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

// Типы данных для подразделений
interface Division {
  id: number;
  name: string;
  code: string;
  organization_id?: number;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для связанных данных
interface Organization {
  id: number;
  name: string;
}

const AdminDivisionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Данные для таблицы
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [parentDivisions, setParentDivisions] = useState<Division[]>([]);

  // Загружаем начальные данные
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем подразделения
      console.log(`Отправляем запрос к: ${API_URL}/divisions/`);
      const divisionsResponse = await api.get('/divisions/');
      console.log('Ответ сервера (divisions):', divisionsResponse);
      setDivisions(divisionsResponse.data);
      setParentDivisions(divisionsResponse.data);
      
      // Загружаем организации для выпадающего списка
      console.log(`Отправляем запрос к: ${API_URL}/organizations/`);
      const orgResponse = await api.get('/organizations/');
      console.log('Ответ сервера (organizations):', orgResponse);
      setOrganizations(orgResponse.data);
    } catch (err) {
      console.error('Ошибка при запросе divisions:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err !== null && 'message' in err) 
          ? String((err as any).message) 
          : String(err);
      setError(`Ошибка при загрузке подразделений: ${errorMessage}`);
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
      organization_id: null,
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
      await api.delete(`/divisions/${currentItem.id}`);
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
        // Обновляем существующее подразделение
        response = await api.put(`/divisions/${currentItem.id}`, currentItem);
        setSuccess('Запись успешно обновлена');
      } else {
        // Создаем новое подразделение
        response = await api.post(`/divisions/`, currentItem);
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

  // Таблица подразделений
  const renderDivisionsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Организация</TableCell>
              <TableCell>Родительское подразделение</TableCell>
              <TableCell>Активно</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {divisions.map((div) => (
              <TableRow key={div.id}>
                <TableCell>{div.id}</TableCell>
                <TableCell>{div.name}</TableCell>
                <TableCell>{div.code}</TableCell>
                <TableCell>
                  {div.organization_id && organizations.find(org => org.id === div.organization_id)?.name || '—'}
                </TableCell>
                <TableCell>
                  {div.parent_id && parentDivisions.find(parent => parent.id === div.parent_id)?.name || '—'}
                </TableCell>
                <TableCell>{div.is_active ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditItem(div)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteItem(div)}>
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
          {currentItem?.id ? 'Редактировать подразделение' : 'Создать подразделение'}
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
              <InputLabel>Организация</InputLabel>
              <Select
                name="organization_id"
                value={currentItem?.organization_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {organizations.map(org => (
                  <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Родительское подразделение</InputLabel>
              <Select
                name="parent_id"
                value={currentItem?.parent_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {parentDivisions.map(div => 
                  // Исключаем текущее подразделение из списка возможных родителей
                  div.id !== currentItem?.id && (
                    <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                  )
                )}
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
            Вы действительно хотите удалить это подразделение? Это действие нельзя отменить.
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
            Администрирование подразделений
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
            {renderDivisionsTable()}
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

export default AdminDivisionsPage; 
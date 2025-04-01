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
import { Link } from 'react-router-dom';
import api from '../services/api';
import { API_URL } from '../config';

// Типы данных для организаций
interface Organization {
  id: number;
  name: string;
  code: string;
  legal_name?: string;
  ckp?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminOrganizationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Данные для таблицы
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Загружаем начальные данные
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Отправляем запрос к: ${API_URL}/organizations/`);
      const response = await api.get('/organizations/');
      console.log('Ответ сервера (organizations):', response);
      setOrganizations(response.data);
    } catch (err) {
      console.error('Ошибка при запросе organizations:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err !== null && 'message' in err) 
          ? String((err as any).message) 
          : String(err);
      setError(`Ошибка при загрузке организаций: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: any) => {
    setCurrentItem({ ...item });
    setEditDialogOpen(true);
  };

  const handleCreateItem = () => {
    setCurrentItem({ name: '', legal_name: '', code: '', ckp: '', is_active: true });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setCurrentItem(item);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    
    try {
      await api.delete(`/organizations/${currentItem.id}`);
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
        // Обновляем существующий элемент
        response = await api.put(`/organizations/${currentItem.id}`, currentItem);
        setSuccess('Запись успешно обновлена');
      } else {
        // Создаем новый элемент
        response = await api.post(`/organizations/`, currentItem);
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

  // Таблица организаций
  const renderOrganizationsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Юр. название</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>ЦКП</TableCell>
              <TableCell>Активна</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.id}</TableCell>
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.legal_name}</TableCell>
                <TableCell>{org.code}</TableCell>
                <TableCell>{org.ckp || '—'}</TableCell>
                <TableCell>{org.is_active ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditItem(org)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteItem(org)}>
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentItem?.id ? 'Редактировать организацию' : 'Создать организацию'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            name="name"
            label="Название"
            value={currentItem?.name || ''}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="legal_name"
            label="Юридическое название"
            value={currentItem?.legal_name || ''}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="code"
            label="Код"
            value={currentItem?.code || ''}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="ckp"
            label="ЦКП"
            value={currentItem?.ckp || ''}
            onChange={handleInputChange}
          />
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
            Вы действительно хотите удалить эту запись? Это действие нельзя отменить.
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
            Администрирование организаций
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
            {renderOrganizationsTable()}
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

export default AdminOrganizationsPage; 
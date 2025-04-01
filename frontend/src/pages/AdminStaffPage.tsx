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
import { Link } from 'react-router-dom';

// Типы данных для сотрудников
interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  description?: string;
  is_active: boolean;
  organization_id?: number;
  primary_organization_id?: number;
  created_at: string;
  updated_at: string;
}

// Типы для связанных данных
interface Organization {
  id: number;
  name: string;
}

const AdminStaffPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Данные для таблицы
  const [staff, setStaff] = useState<Staff[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Загружаем начальные данные
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем сотрудников
      console.log(`Отправляем запрос к: ${API_URL}/staff/`);
      const staffResponse = await api.get('/staff/');
      console.log('Ответ сервера (staff):', staffResponse);
      setStaff(staffResponse.data);
      
      // Загружаем организации для выпадающего списка
      console.log(`Отправляем запрос к: ${API_URL}/organizations/`);
      const orgResponse = await api.get('/organizations/');
      console.log('Ответ сервера (organizations):', orgResponse);
      setOrganizations(orgResponse.data);
    } catch (err) {
      console.error('Ошибка при запросе staff:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err !== null && 'message' in err) 
          ? String((err as any).message) 
          : String(err);
      setError(`Ошибка при загрузке сотрудников: ${errorMessage}`);
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
      first_name: '',
      last_name: '',
      middle_name: '',
      email: '',
      phone: '',
      description: '',
      organization_id: null,
      primary_organization_id: null,
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
      await api.delete(`/staff/${currentItem.id}`);
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
        // Обновляем существующего сотрудника
        response = await api.put(`/staff/${currentItem.id}`, currentItem);
        setSuccess('Запись успешно обновлена');
      } else {
        // Создаем нового сотрудника
        response = await api.post(`/staff/`, currentItem);
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

  // Таблица сотрудников
  const renderStaffTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Организация</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.id}</TableCell>
                <TableCell>
                  {emp.last_name} {emp.first_name} {emp.middle_name || ''}
                </TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.phone || '—'}</TableCell>
                <TableCell>
                  {emp.organization_id && organizations.find(org => org.id === emp.organization_id)?.name || '—'}
                </TableCell>
                <TableCell>{emp.is_active ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditItem(emp)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteItem(emp)}>
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
          {currentItem?.id ? 'Редактировать сотрудника' : 'Создать сотрудника'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <TextField
              fullWidth
              margin="dense"
              name="last_name"
              label="Фамилия"
              value={currentItem?.last_name || ''}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              name="first_name"
              label="Имя"
              value={currentItem?.first_name || ''}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              name="middle_name"
              label="Отчество"
              value={currentItem?.middle_name || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="email"
              label="Email"
              type="email"
              value={currentItem?.email || ''}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              name="phone"
              label="Телефон"
              value={currentItem?.phone || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="description"
              label="Описание"
              multiline
              rows={3}
              value={currentItem?.description || ''}
              onChange={handleInputChange}
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
              <InputLabel>Основная организация</InputLabel>
              <Select
                name="primary_organization_id"
                value={currentItem?.primary_organization_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {organizations.map(org => (
                  <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Активен</InputLabel>
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
            Вы действительно хотите удалить этого сотрудника? Это действие нельзя отменить.
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

  // Навигационное меню для вкладок админки
  const renderNavigation = () => {
    return (
      <Box sx={{ mb: 2, display: 'flex', borderBottom: '1px solid #ddd' }}>
        <Link 
          to="/admin/organizations"
          style={{
            padding: '10px 15px',
            textDecoration: 'none',
            backgroundColor: '#f5f5f5',
            color: '#333',
            marginRight: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}
        >
          ОРГАНИЗАЦИИ
        </Link>
        <Link 
          to="/admin/divisions"
          style={{
            padding: '10px 15px',
            textDecoration: 'none',
            backgroundColor: '#f5f5f5',
            color: '#333',
            marginRight: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}
        >
          ПОДРАЗДЕЛЕНИЯ
        </Link>
        <Link 
          to="/admin/positions"
          style={{
            padding: '10px 15px',
            textDecoration: 'none',
            backgroundColor: '#f5f5f5',
            color: '#333',
            marginRight: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}
        >
          ДОЛЖНОСТИ
        </Link>
        <Link 
          to="/admin/staff"
          style={{
            padding: '10px 15px',
            textDecoration: 'none',
            backgroundColor: '#9c27b0',
            color: 'white',
            fontWeight: 'bold',
            marginRight: '8px',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          СОТРУДНИКИ
        </Link>
        <Link 
          to="/admin/functional-relations"
          style={{
            padding: '10px 15px',
            textDecoration: 'none',
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}
        >
          ФУНКЦИОНАЛЬНЫЕ СВЯЗИ
        </Link>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Администрирование базы данных
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
          {renderNavigation()}
          
          {loading && <LinearProgress />}
          
          <Box sx={{ p: 3 }}>
            {renderStaffTable()}
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

export default AdminStaffPage; 
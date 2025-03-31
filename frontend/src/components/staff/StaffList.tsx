import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { API_URL } from '../../config';

// Типы данных
interface StaffMember {
  id: number;
  name: string;
  position: string;
  division: string;
  organization: {
    id: number;
    name: string;
  };
  parent?: {
    id: number;
    name: string;
  };
  is_active: boolean;
  phone?: string;
  email?: string;
}

interface Organization {
  id: number;
  name: string;
}

// Компонент списка сотрудников
const StaffList: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояния
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Состояния для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Загрузка данных при первом рендере
  useEffect(() => {
    fetchStaff();
    fetchOrganizations();
  }, []);
  
  // Фильтрация сотрудников при изменении параметров фильтрации
  useEffect(() => {
    filterStaff();
  }, [staffList, selectedOrg, searchQuery]);
  
  // Загрузить список сотрудников
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/staff/`);
      if (!response.ok) throw new Error('Не удалось загрузить список сотрудников');
      
      const data = await response.json();
      setStaffList(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузить список организаций для фильтра
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (!response.ok) throw new Error('Не удалось загрузить список организаций');
      
      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      console.error('Ошибка при загрузке организаций:', err);
    }
  };
  
  // Фильтрация сотрудников по выбранным критериям
  const filterStaff = () => {
    let filtered = [...staffList];
    
    // Фильтр по организации
    if (selectedOrg) {
      filtered = filtered.filter(staff => staff.organization.id === selectedOrg);
    }
    
    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(staff => (
        staff.name.toLowerCase().includes(query) ||
        staff.position.toLowerCase().includes(query) ||
        staff.division.toLowerCase().includes(query) ||
        (staff.email && staff.email.toLowerCase().includes(query)) ||
        (staff.phone && staff.phone.toLowerCase().includes(query))
      ));
    }
    
    setFilteredStaff(filtered);
  };
  
  // Обработчики событий
  const handleAddStaff = () => {
    navigate('/staff/new');
  };
  
  const handleEditStaff = (id: number) => {
    navigate(`/staff/${id}`);
  };
  
  const handleOpenDeleteDialog = (staff: StaffMember) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
    setDeleteError(null);
  };
  
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const response = await fetch(`${API_URL}/staff/${staffToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Не удалось удалить сотрудника');
      
      // Обновляем список после удаления
      setStaffList(prevList => prevList.filter(staff => staff.id !== staffToDelete.id));
      handleCloseDeleteDialog();
    } catch (err: any) {
      setDeleteError(err.message || 'Ошибка при удалении сотрудника');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOrgFilter = (orgId: number | null) => {
    setSelectedOrg(orgId === selectedOrg ? null : orgId);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Сотрудники</Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStaff}
        >
          Добавить сотрудника
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Поиск по имени, должности, отделу..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
            Фильтр по организации:
          </Typography>
          
          {organizations.map(org => (
            <Chip
              key={org.id}
              icon={<BusinessIcon />}
              label={org.name}
              clickable
              color={selectedOrg === org.id ? 'primary' : 'default'}
              onClick={() => handleOrgFilter(org.id)}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredStaff.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              {staffList.length === 0
                ? 'Нет данных о сотрудниках. Добавьте первого сотрудника!'
                : 'Нет сотрудников, соответствующих выбранным фильтрам.'
              }
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Должность</TableCell>
                  <TableCell>Отдел</TableCell>
                  <TableCell>Организация</TableCell>
                  <TableCell>Руководитель</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        {staff.position}
                      </Box>
                    </TableCell>
                    <TableCell>{staff.division}</TableCell>
                    <TableCell>{staff.organization.name}</TableCell>
                    <TableCell>
                      {staff.parent ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          {staff.parent.name}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={staff.is_active ? 'Активен' : 'Неактивен'}
                        color={staff.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditStaff(staff.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDeleteDialog(staff)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить сотрудника {staffToDelete?.name}?
            Это действие нельзя будет отменить.
          </DialogContentText>
          
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="primary"
            disabled={deleteLoading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteStaff}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffList; 
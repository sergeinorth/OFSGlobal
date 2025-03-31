import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
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
  Chip,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDatabasePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [currentTable, setCurrentTable] = useState<string>('');

  // Данные для разных таблиц
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [functionalRelations, setFunctionalRelations] = useState<any[]>([]);

  // Загружаем начальные данные
  useEffect(() => {
    fetchTableData(getCurrentTableName());
  }, [tabValue]);

  const getCurrentTableName = () => {
    switch (tabValue) {
      case 0: return 'organizations';
      case 1: return 'divisions';
      case 2: return 'positions';
      case 3: return 'staff';
      case 4: return 'functional-relations';
      default: return 'organizations';
    }
  };

  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    setError(null);
    setCurrentTable(tableName);
    
    try {
      const response = await api.get(`/${tableName}/`);
      
      switch (tableName) {
        case 'organizations':
          setOrganizations(response.data);
          break;
        case 'divisions':
          setDivisions(response.data);
          break;
        case 'positions':
          setPositions(response.data);
          break;
        case 'staff':
          setStaff(response.data);
          break;
        case 'functional-relations':
          setFunctionalRelations(response.data);
          break;
      }
    } catch (err) {
      setError('Ошибка при загрузке данных: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditItem = (item: any) => {
    setCurrentItem({ ...item });
    setEditDialogOpen(true);
  };

  const handleCreateItem = () => {
    // Создаем пустой объект с нужными полями в зависимости от таблицы
    let newItem: any = {};
    
    switch (currentTable) {
      case 'organizations':
        newItem = { name: '', legal_name: '', code: '', ckp: '', is_active: true };
        break;
      case 'divisions':
        newItem = { name: '', code: '', ckp: '', organization_id: null, parent_id: null, is_active: true };
        break;
      case 'positions':
        newItem = { name: '', code: '', description: '', is_active: true };
        break;
      case 'staff':
        newItem = { name: '', position_id: null, division_id: null, email: '', phone: '', is_active: true };
        break;
      case 'functional-relations':
        newItem = { source_id: null, target_id: null, relation_type: 'REPORTS_TO', is_active: true };
        break;
    }
    
    setCurrentItem(newItem);
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setCurrentItem(item);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    
    try {
      await api.delete(`/${currentTable}/${currentItem.id}`);
      setSuccess('Запись успешно удалена');
      fetchTableData(currentTable);
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
        response = await api.put(`/${currentTable}/${currentItem.id}`, currentItem);
        setSuccess('Запись успешно обновлена');
      } else {
        // Создаем новый элемент
        response = await api.post(`/${currentTable}/`, currentItem);
        setSuccess('Запись успешно создана');
      }
      
      fetchTableData(currentTable);
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentItem({ ...currentItem, [name]: checked });
  };

  // Рендер соответствующей таблице
  const renderTable = () => {
    switch (tabValue) {
      case 0:
        return renderOrganizationsTable();
      case 1:
        return renderDivisionsTable();
      case 2:
        return renderPositionsTable();
      case 3:
        return renderStaffTable();
      case 4:
        return renderFunctionalRelationsTable();
      default:
        return null;
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
              <TableCell>ЦКП</TableCell>
              <TableCell>Организация</TableCell>
              <TableCell>Родительское подразделение</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {divisions.map((div) => (
              <TableRow key={div.id}>
                <TableCell>{div.id}</TableCell>
                <TableCell>{div.name}</TableCell>
                <TableCell>{div.code}</TableCell>
                <TableCell>{div.ckp || '—'}</TableCell>
                <TableCell>{div.organization_id}</TableCell>
                <TableCell>{div.parent_id || 'Нет'}</TableCell>
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
              <TableCell>Описание</TableCell>
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
                <TableCell>{pos.description}</TableCell>
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

  // Таблица сотрудников
  const renderStaffTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Подразделение</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.position_id}</TableCell>
                <TableCell>{emp.division_id}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.phone}</TableCell>
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

  // Таблица функциональных связей
  const renderFunctionalRelationsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Исходный сотрудник</TableCell>
              <TableCell>Целевой сотрудник</TableCell>
              <TableCell>Тип связи</TableCell>
              <TableCell>Активна</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {functionalRelations.map((rel) => (
              <TableRow key={rel.id}>
                <TableCell>{rel.id}</TableCell>
                <TableCell>{rel.source_id}</TableCell>
                <TableCell>{rel.target_id}</TableCell>
                <TableCell>{rel.relation_type}</TableCell>
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
    if (!currentItem) return null;

    let dialogContent;
    
    switch (currentTable) {
      case 'organizations':
        dialogContent = (
          <>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Название"
              value={currentItem.name || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="legal_name"
              label="Юридическое название"
              value={currentItem.legal_name || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="code"
              label="Код организации"
              value={currentItem.code || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="ckp"
              label="ЦКП (ценный конечный продукт)"
              value={currentItem.ckp || ''}
              onChange={handleInputChange}
              helperText="Обязательное поле для определения вклада в организацию"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Активна</InputLabel>
              <Select
                name="is_active"
                value={currentItem.is_active ? "true" : "false"}
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Да</MenuItem>
                <MenuItem value={"false"}>Нет</MenuItem>
              </Select>
            </FormControl>
          </>
        );
        break;
        
      case 'divisions':
        dialogContent = (
          <>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Название"
              value={currentItem.name || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="code"
              label="Код подразделения"
              value={currentItem.code || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="ckp"
              label="ЦКП (ценный конечный продукт)"
              value={currentItem.ckp || ''}
              onChange={handleInputChange}
              helperText="Обязательное поле для определения целевого продукта подразделения"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Организация</InputLabel>
              <Select
                name="organization_id"
                value={currentItem.organization_id || ''}
                onChange={handleSelectChange}
              >
                {organizations.map(org => (
                  <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Родительское подразделение</InputLabel>
              <Select
                name="parent_id"
                value={currentItem.parent_id || ''}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Нет</MenuItem>
                {divisions.filter(div => div.id !== currentItem.id).map(div => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Активно</InputLabel>
              <Select
                name="is_active"
                value={currentItem.is_active ? "true" : "false"}
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Да</MenuItem>
                <MenuItem value={"false"}>Нет</MenuItem>
              </Select>
            </FormControl>
          </>
        );
        break;
        
      case 'positions':
        dialogContent = (
          <>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Название"
              value={currentItem.name || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="code"
              label="Код должности"
              value={currentItem.code || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="description"
              label="Описание"
              multiline
              rows={3}
              value={currentItem.description || ''}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Активна</InputLabel>
              <Select
                name="is_active"
                value={currentItem.is_active ? "true" : "false"}
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Да</MenuItem>
                <MenuItem value={"false"}>Нет</MenuItem>
              </Select>
            </FormControl>
          </>
        );
        break;
        
      case 'staff':
        dialogContent = (
          <>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="ФИО"
              value={currentItem.name || ''}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Должность</InputLabel>
              <Select
                name="position_id"
                value={currentItem.position_id || ''}
                onChange={handleSelectChange}
              >
                {positions.map(pos => (
                  <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Подразделение</InputLabel>
              <Select
                name="division_id"
                value={currentItem.division_id || ''}
                onChange={handleSelectChange}
              >
                {divisions.map(div => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="dense"
              name="email"
              label="Email"
              value={currentItem.email || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              name="phone"
              label="Телефон"
              value={currentItem.phone || ''}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Активен</InputLabel>
              <Select
                name="is_active"
                value={currentItem.is_active ? "true" : "false"}
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Да</MenuItem>
                <MenuItem value={"false"}>Нет</MenuItem>
              </Select>
            </FormControl>
          </>
        );
        break;
        
      case 'functional-relations':
        dialogContent = (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel>Исходный сотрудник</InputLabel>
              <Select
                name="source_id"
                value={currentItem.source_id || ''}
                onChange={handleSelectChange}
              >
                {staff.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Целевой сотрудник</InputLabel>
              <Select
                name="target_id"
                value={currentItem.target_id || ''}
                onChange={handleSelectChange}
              >
                {staff.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Тип связи</InputLabel>
              <Select
                name="relation_type"
                value={currentItem.relation_type || 'REPORTS_TO'}
                onChange={handleSelectChange}
              >
                <MenuItem value="REPORTS_TO">Подчиняется</MenuItem>
                <MenuItem value="WORKS_WITH">Работает с</MenuItem>
                <MenuItem value="SUPERVISES">Supervises</MenuItem>
                <MenuItem value="MENTORS">Наставничество</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Активна</InputLabel>
              <Select
                name="is_active"
                value={currentItem.is_active ? "true" : "false"}
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Да</MenuItem>
                <MenuItem value={"false"}>Нет</MenuItem>
              </Select>
            </FormControl>
          </>
        );
        break;
        
      default:
        dialogContent = <Typography>Форма не найдена</Typography>;
    }

    return (
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentItem.id ? 'Редактировать запись' : 'Создать запись'}
        </DialogTitle>
        <DialogContent>{dialogContent}</DialogContent>
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
            Администрирование базы данных
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchTableData(getCurrentTableName())}
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
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Организации" {...a11yProps(0)} />
            <Tab label="Подразделения" {...a11yProps(1)} />
            <Tab label="Должности" {...a11yProps(2)} />
            <Tab label="Сотрудники" {...a11yProps(3)} />
            <Tab label="Функциональные связи" {...a11yProps(4)} />
          </Tabs>
          
          {loading && <LinearProgress />}
          
          <TabPanel value={tabValue} index={0}>
            {renderTable()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {renderTable()}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {renderTable()}
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            {renderTable()}
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            {renderTable()}
          </TabPanel>
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

export default AdminDatabasePage; 
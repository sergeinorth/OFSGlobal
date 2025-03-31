import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, SelectChangeEvent, Dialog, DialogTitle,
  DialogContent, DialogActions, FormHelperText, Chip
} from '@mui/material';
import { Add, Delete, Info } from '@mui/icons-material';
import { API_URL } from '../../config';

// Типы данных
interface Staff {
  id: number;
  name: string;
  position: string;
}

interface FunctionalRelation {
  id: number;
  manager_id: number;
  subordinate_id: number;
  relation_type: RelationType;
  description: string;
  created_at: string;
  manager?: Staff;
  subordinate?: Staff;
}

enum RelationType {
  FUNCTIONAL = 'functional',
  ADMINISTRATIVE = 'administrative',
  PROJECT = 'project',
  TERRITORIAL = 'territorial',
  MENTORING = 'mentoring'
}

interface FunctionalRelationsManagerProps {
  staffId: number;
  isManager?: boolean; // Если true, то отображаем подчиненных, иначе - руководителей
}

const relationTypeLabels = {
  [RelationType.FUNCTIONAL]: 'Функциональная',
  [RelationType.ADMINISTRATIVE]: 'Административная',
  [RelationType.PROJECT]: 'Проектная',
  [RelationType.TERRITORIAL]: 'Территориальная',
  [RelationType.MENTORING]: 'Менторская'
};

const relationTypeColors = {
  [RelationType.FUNCTIONAL]: 'primary',
  [RelationType.ADMINISTRATIVE]: 'secondary',
  [RelationType.PROJECT]: 'success',
  [RelationType.TERRITORIAL]: 'info',
  [RelationType.MENTORING]: 'warning'
};

const FunctionalRelationsManager: React.FC<FunctionalRelationsManagerProps> = ({ 
  staffId, 
  isManager = true 
}) => {
  // Состояния
  const [relations, setRelations] = useState<FunctionalRelation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для создания новой связи
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('');
  const [selectedRelationType, setSelectedRelationType] = useState<RelationType>(RelationType.FUNCTIONAL);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Загрузка данных
  useEffect(() => {
    fetchRelations();
    fetchAvailableStaff();
  }, [staffId, isManager]);
  
  // Получение списка связей
  const fetchRelations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isManager
        ? `${API_URL}/functional-relations/by-manager/${staffId}`
        : `${API_URL}/functional-relations/by-subordinate/${staffId}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить функциональные связи');
      }
      
      const data = await response.json();
      
      // Дополнительно загружаем информацию о сотрудниках
      const enrichedData = await Promise.all(
        data.map(async (relation: FunctionalRelation) => {
          // Загружаем данные руководителя, если мы не на странице руководителя
          if (!isManager) {
            const managerResponse = await fetch(`${API_URL}/staff/${relation.manager_id}`);
            if (managerResponse.ok) {
              const managerData = await managerResponse.json();
              relation.manager = {
                id: managerData.id,
                name: managerData.name,
                position: managerData.position
              };
            }
          }
          
          // Загружаем данные подчиненного, если мы не на странице подчиненного
          if (isManager) {
            const subordinateResponse = await fetch(`${API_URL}/staff/${relation.subordinate_id}`);
            if (subordinateResponse.ok) {
              const subordinateData = await subordinateResponse.json();
              relation.subordinate = {
                id: subordinateData.id,
                name: subordinateData.name,
                position: subordinateData.position
              };
            }
          }
          
          return relation;
        })
      );
      
      setRelations(enrichedData);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке функциональных связей');
      console.error('Ошибка при загрузке функциональных связей:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Получение списка доступных сотрудников для связи
  const fetchAvailableStaff = async () => {
    try {
      // Загружаем список всех сотрудников
      const response = await fetch(`${API_URL}/staff/`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить список сотрудников');
      }
      
      const data = await response.json();
      
      // Фильтруем сотрудников - исключаем текущего и тех, с кем уже есть связь
      const filteredStaff = data.filter((s: Staff) => {
        // Исключаем текущего сотрудника
        if (s.id === staffId) return false;
        
        // Исключаем сотрудников, с которыми уже есть связь
        if (isManager) {
          // Если мы создаем подчиненных, исключаем тех, кто уже является подчиненным
          return !relations.some(rel => rel.subordinate_id === s.id);
        } else {
          // Если мы создаем руководителей, исключаем тех, кто уже является руководителем
          return !relations.some(rel => rel.manager_id === s.id);
        }
      });
      
      setStaff(filteredStaff);
    } catch (err: any) {
      console.error('Ошибка при загрузке списка сотрудников:', err);
    }
  };
  
  // Открытие диалога создания связи
  const handleOpenAddDialog = () => {
    setOpenDialog(true);
    setSelectedStaffId('');
    setSelectedRelationType(RelationType.FUNCTIONAL);
    setDescription('');
    setFormError(null);
  };
  
  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Обработчики изменения полей формы
  const handleStaffChange = (event: SelectChangeEvent<number | string>) => {
    setSelectedStaffId(event.target.value as number);
    if (formError) setFormError(null);
  };
  
  const handleRelationTypeChange = (event: SelectChangeEvent) => {
    setSelectedRelationType(event.target.value as RelationType);
  };
  
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };
  
  // Создание новой функциональной связи
  const handleCreateRelation = async () => {
    // Валидация
    if (!selectedStaffId) {
      setFormError('Необходимо выбрать сотрудника');
      return;
    }
    
    try {
      const relationData = {
        manager_id: isManager ? staffId : selectedStaffId,
        subordinate_id: isManager ? selectedStaffId : staffId,
        relation_type: selectedRelationType,
        description
      };
      
      const response = await fetch(`${API_URL}/functional-relations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(relationData)
      });
      
      if (!response.ok) {
        throw new Error('Не удалось создать функциональную связь');
      }
      
      // Обновляем списки
      fetchRelations();
      fetchAvailableStaff();
      
      // Закрываем диалог
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message || 'Ошибка при создании связи');
      console.error('Ошибка при создании функциональной связи:', err);
    }
  };
  
  // Удаление функциональной связи
  const handleDeleteRelation = async (relationId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту функциональную связь?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/functional-relations/${relationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Не удалось удалить функциональную связь');
      }
      
      // Обновляем списки
      fetchRelations();
      fetchAvailableStaff();
    } catch (err: any) {
      alert('Ошибка при удалении связи: ' + (err.message || 'Неизвестная ошибка'));
      console.error('Ошибка при удалении функциональной связи:', err);
    }
  };
  
  // Отрисовка компонента
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {isManager ? 'Функциональные подчиненные' : 'Функциональные руководители'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenAddDialog}
        >
          Добавить {isManager ? 'подчиненного' : 'руководителя'}
        </Button>
      </Box>
      
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {loading ? (
        <Typography>Загрузка данных...</Typography>
      ) : relations.length === 0 ? (
        <Typography>
          {isManager ? 'Функциональных подчиненных нет' : 'Функциональных руководителей нет'}
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ФИО</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Тип связи</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relations.map((relation) => (
                <TableRow key={relation.id}>
                  <TableCell>
                    {isManager 
                      ? relation.subordinate?.name
                      : relation.manager?.name}
                  </TableCell>
                  <TableCell>
                    {isManager 
                      ? relation.subordinate?.position
                      : relation.manager?.position}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={relationTypeLabels[relation.relation_type]} 
                      color={relationTypeColors[relation.relation_type] as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{relation.description}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteRelation(relation.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Диалог добавления связи */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Добавить {isManager ? 'функционального подчиненного' : 'функционального руководителя'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!formError}>
              <InputLabel id="staff-select-label">
                {isManager ? 'Подчиненный' : 'Руководитель'}
              </InputLabel>
              <Select
                labelId="staff-select-label"
                value={selectedStaffId}
                onChange={handleStaffChange}
                label={isManager ? 'Подчиненный' : 'Руководитель'}
              >
                {staff.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name} - {member.position}
                  </MenuItem>
                ))}
              </Select>
              {formError && <FormHelperText>{formError}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="relation-type-label">Тип связи</InputLabel>
              <Select
                labelId="relation-type-label"
                value={selectedRelationType}
                onChange={handleRelationTypeChange}
                label="Тип связи"
              >
                {Object.entries(relationTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="description-label">Описание</InputLabel>
              <Select
                labelId="description-label"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="Описание"
                input={<TextField multiline rows={3} />}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Отмена</Button>
          <Button onClick={handleCreateRelation} color="primary" variant="contained">
            Создать связь
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FunctionalRelationsManager; 
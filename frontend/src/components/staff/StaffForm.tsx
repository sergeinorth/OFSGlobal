import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Divider, Avatar,
  Alert, CircularProgress, SelectChangeEvent
} from '@mui/material';
import { Save, Cancel, Upload } from '@mui/icons-material';
import { API_URL, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../../config';

// Типы данных для сотрудника
interface StaffFormData {
  name: string;
  position: string;
  division: string;
  level: number;
  organization_id: number | '';
  parent_id: number | null;
  phone: string;
  email: string;
  telegram_id: string;
  registration_address: string;
  actual_address: string;
  is_active: boolean;
}

interface Organization {
  id: number;
  name: string;
}

interface StaffMember {
  id: number;
  name: string;
  position: string;
}

// Начальное состояние формы
const initialFormData: StaffFormData = {
  name: '',
  position: '',
  division: '',
  level: 0,
  organization_id: '',
  parent_id: null,
  phone: '',
  email: '',
  telegram_id: '',
  registration_address: '',
  actual_address: '',
  is_active: true
};

// Компонент формы сотрудника
const StaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Состояния
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [managers, setManagers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Файлы
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // Ошибки валидации
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Загрузка данных организаций и потенциальных руководителей
  useEffect(() => {
    fetchOrganizations();
    
    if (isEditing) {
      fetchStaffData();
    }
  }, [id]);
  
  // Загрузить список организаций
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (!response.ok) throw new Error('Не удалось загрузить организации');
      
      const data = await response.json();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке организаций');
    }
  };
  
  // Загрузить данные сотрудника для редактирования
  const fetchStaffData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/staff/${id}`);
      if (!response.ok) throw new Error('Не удалось загрузить данные сотрудника');
      
      const data = await response.json();
      
      setFormData({
        name: data.name,
        position: data.position,
        division: data.division,
        level: data.level,
        organization_id: data.organization_id,
        parent_id: data.parent_id,
        phone: data.phone || '',
        email: data.email || '',
        telegram_id: data.telegram_id || '',
        registration_address: data.registration_address || '',
        actual_address: data.actual_address || '',
        is_active: data.is_active
      });
      
      // Если есть фото, загружаем превью
      if (data.photo_path) {
        setPhotoPreview(`${API_URL}/uploads/${data.photo_path}`);
      }
      
      // Загружаем возможных руководителей из той же организации
      fetchPotentialManagers(data.organization_id);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных сотрудника');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузить потенциальных руководителей при выборе организации
  const fetchPotentialManagers = async (orgId: number) => {
    if (!orgId) return;
    
    try {
      const response = await fetch(`${API_URL}/staff/?organization_id=${orgId}`);
      if (!response.ok) throw new Error('Не удалось загрузить список сотрудников');
      
      const data = await response.json();
      
      // Исключаем текущего сотрудника из списка потенциальных руководителей
      const filteredManagers = isEditing
        ? data.filter((member: StaffMember) => member.id !== parseInt(id as string))
        : data;
      
      setManagers(filteredManagers);
    } catch (err: any) {
      console.error('Ошибка при загрузке потенциальных руководителей:', err);
    }
  };
  
  // Обработчики изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку поля при изменении
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<number | string | boolean>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Если изменилась организация, загружаем руководителей
    if (name === 'organization_id' && typeof value === 'number') {
      fetchPotentialManagers(value);
      
      // Сбрасываем выбранного руководителя
      setFormData(prev => ({ ...prev, parent_id: null }));
    }
    
    // Очищаем ошибку поля при изменении
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Обработчики загрузки файлов
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({ 
          ...prev, 
          photo: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)` 
        }));
        return;
      }
      
      // Проверка типа файла
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFormErrors(prev => ({ 
          ...prev, 
          photo: `Недопустимый тип файла. Разрешены: ${ALLOWED_FILE_TYPES.join(', ')}` 
        }));
        return;
      }
      
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      
      // Очищаем ошибку поля при успешной загрузке
      if (formErrors.photo) {
        setFormErrors(prev => ({ ...prev, photo: '' }));
      }
    }
  };
  
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({ 
          ...prev, 
          passport: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)` 
        }));
        return;
      }
      
      // Проверка типа файла (для документов можно разрешить PDF)
      const allowedDocTypes = [...ALLOWED_FILE_TYPES, 'application/pdf'];
      if (!allowedDocTypes.includes(file.type)) {
        setFormErrors(prev => ({ 
          ...prev, 
          passport: `Недопустимый тип файла. Разрешены: ${allowedDocTypes.join(', ')}` 
        }));
        return;
      }
      
      setPassportFile(file);
      
      // Очищаем ошибку поля при успешной загрузке
      if (formErrors.passport) {
        setFormErrors(prev => ({ ...prev, passport: '' }));
      }
    }
  };
  
  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({ 
          ...prev, 
          contract: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)` 
        }));
        return;
      }
      
      // Проверка типа файла (для документов можно разрешить PDF)
      const allowedDocTypes = [...ALLOWED_FILE_TYPES, 'application/pdf'];
      if (!allowedDocTypes.includes(file.type)) {
        setFormErrors(prev => ({ 
          ...prev, 
          contract: `Недопустимый тип файла. Разрешены: ${allowedDocTypes.join(', ')}` 
        }));
        return;
      }
      
      setContractFile(file);
      
      // Очищаем ошибку поля при успешной загрузке
      if (formErrors.contract) {
        setFormErrors(prev => ({ ...prev, contract: '' }));
      }
    }
  };
  
  // Валидация формы перед отправкой
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Обязательные поля
    if (!formData.name) errors.name = 'Имя обязательно';
    if (!formData.position) errors.position = 'Должность обязательна';
    if (!formData.division) errors.division = 'Отдел обязателен';
    if (!formData.organization_id) errors.organization_id = 'Организация обязательна';
    
    // Валидация email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный формат email';
    }
    
    // Валидация телефона
    if (formData.phone && !/^\+?[0-9() -]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Некорректный формат телефона';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем форму
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      let apiUrl = `${API_URL}/staff/`;
      let method = 'POST';
      
      // Если редактирование, используем PUT и добавляем ID
      if (isEditing) {
        apiUrl += `${id}`;
        method = 'PUT';
      }
      
      // Если есть файлы, используем FormData
      if (photoFile || passportFile || contractFile) {
        const formDataObj = new FormData();
        
        // Добавляем все поля
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formDataObj.append(key, String(value));
          }
        });
        
        // Добавляем файлы
        if (photoFile) formDataObj.append('photo', photoFile);
        if (passportFile) formDataObj.append('passport', passportFile);
        if (contractFile) formDataObj.append('contract', contractFile);
        
        // Отправляем запрос
        const response = await fetch(`${apiUrl}/with-files/`, {
          method,
          body: formDataObj
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при сохранении сотрудника');
        }
      } else {
        // Без файлов используем обычный JSON
        const response = await fetch(apiUrl, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при сохранении сотрудника');
        }
      }
      
      // Успех
      setSuccess(true);
      
      // Редирект на список сотрудников после небольшой задержки
      setTimeout(() => {
        navigate('/staff');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке формы');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Отмена и возврат к списку
  const handleCancel = () => {
    navigate('/staff');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? 'Редактирование сотрудника' : 'Добавление нового сотрудника'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Сотрудник успешно {isEditing ? 'обновлен' : 'добавлен'}!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Основная информация */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ФИО"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Должность"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={!!formErrors.position}
                helperText={formErrors.position}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Отдел"
                name="division"
                value={formData.division}
                onChange={handleChange}
                error={!!formErrors.division}
                helperText={formErrors.division}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.organization_id}>
                <InputLabel>Организация</InputLabel>
                <Select
                  name="organization_id"
                  value={formData.organization_id}
                  label="Организация"
                  onChange={handleSelectChange}
                >
                  {organizations.map(org => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.organization_id && (
                  <FormHelperText>{formErrors.organization_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Руководитель</InputLabel>
                <Select
                  name="parent_id"
                  value={formData.parent_id || ''}
                  label="Руководитель"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">Нет руководителя</MenuItem>
                  {managers.map(manager => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Уровень</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  label="Уровень"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={1}>1 - Высший</MenuItem>
                  <MenuItem value={2}>2 - Средний</MenuItem>
                  <MenuItem value={3}>3 - Базовый</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Контактная информация
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telegram ID"
                name="telegram_id"
                value={formData.telegram_id}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Адреса
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Адрес регистрации"
                name="registration_address"
                value={formData.registration_address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Фактический адрес"
                name="actual_address"
                value={formData.actual_address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Документы
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                {photoPreview ? (
                  <Avatar
                    src={photoPreview}
                    alt="Фото"
                    sx={{ width: 120, height: 120, mb: 1 }}
                  />
                ) : (
                  <Avatar sx={{ width: 120, height: 120, mb: 1 }}>
                    {formData.name ? formData.name.charAt(0) : '?'}
                  </Avatar>
                )}
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                >
                  Загрузить фото
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
                
                {formErrors.photo && (
                  <FormHelperText error>{formErrors.photo}</FormHelperText>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" gutterBottom>
                  Паспорт
                </Typography>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  sx={{ mb: 1 }}
                >
                  Загрузить паспорт
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handlePassportChange}
                  />
                </Button>
                
                {passportFile && (
                  <Typography variant="caption">
                    {passportFile.name}
                  </Typography>
                )}
                
                {formErrors.passport && (
                  <FormHelperText error>{formErrors.passport}</FormHelperText>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" gutterBottom>
                  Трудовой договор
                </Typography>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  sx={{ mb: 1 }}
                >
                  Загрузить договор
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleContractChange}
                  />
                </Button>
                
                {contractFile && (
                  <Typography variant="caption">
                    {contractFile.name}
                  </Typography>
                )}
                
                {formErrors.contract && (
                  <FormHelperText error>{formErrors.contract}</FormHelperText>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Статус сотрудника
                </Typography>
                <Select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleSelectChange}
                  sx={{ mt: 1, minWidth: 200 }}
                >
                  <MenuItem value={true}>Активен</MenuItem>
                  <MenuItem value={false}>Уволен</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                >
                  Отмена
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={<Save />}
                >
                  {submitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default StaffForm; 
import sqlite3
import os
import traceback  # Добавляем модуль для печати стека вызовов
import logging    # Добавляем логирование
from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum
import uvicorn
from datetime import datetime, date
from complete_schema import ALL_SCHEMAS
import json

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api_debug.log")
    ]
)
logger = logging.getLogger("ofs_api")

# Имя нашей базы данных с новой схемой
DB_PATH = "full_api_new.db"

# Создаем приложение
app = FastAPI(title="OFS Global API", description="Гибкое API для OFS Global", version="2.0.0")

# Добавляем middleware для глобальной обработки ошибок
@app.middleware("http")
async def log_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Ошибка при обработке запроса {request.url}: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Подключаем роутер для организационной структуры, если он доступен
try:
    from org_structure_api import router as org_structure_router
    has_org_structure_router = True
except ImportError:
    has_org_structure_router = False
    logger.warning("Не удалось импортировать API организационной структуры")

# ================== МОДЕЛИ PYDANTIC ==================

class OrgType(str, Enum):
    """Типы организационных структур"""
    BOARD = "board"  # Совет учредителей
    HOLDING = "holding"  # Холдинг/головная компания
    LEGAL_ENTITY = "legal_entity"  # Юридическое лицо (ИП, ООО и т.д.)
    LOCATION = "location"  # Физическая локация/филиал

class RelationType(str, Enum):
    """Типы функциональных связей между сотрудниками"""
    FUNCTIONAL = "functional"  # Функциональное подчинение
    ADMINISTRATIVE = "administrative"  # Административное подчинение
    PROJECT = "project"  # Проектное подчинение
    TERRITORIAL = "territorial"  # Территориальное подчинение
    MENTORING = "mentoring"  # Менторство
    STRATEGIC = "strategic"  # Стратегическое управление
    GOVERNANCE = "governance"  # Корпоративное управление
    ADVISORY = "advisory"  # Консультативное управление
    SUPERVISORY = "supervisory"  # Надзорное управление

# Модели для Organization (Организация)
class OrganizationBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    org_type: OrgType
    is_active: bool = True
    parent_id: Optional[int] = None
    ckp: Optional[str] = None
    inn: Optional[str] = None
    kpp: Optional[str] = None
    legal_address: Optional[str] = None
    physical_address: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Division (Подразделение)
class DivisionBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True
    organization_id: int  # Связь с организацией (HOLDING)
    parent_id: Optional[int] = None  # Родительское подразделение
    ckp: Optional[str] = None

class DivisionCreate(DivisionBase):
    pass

class Division(DivisionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Section (Отдел)
class SectionBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True
    ckp: Optional[str] = None

class SectionCreate(SectionBase):
    pass

class Section(SectionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Division_Section (Связь подразделения и отдела)
class DivisionSectionBase(BaseModel):
    division_id: int
    section_id: int
    is_primary: bool = True
    
class DivisionSectionCreate(DivisionSectionBase):
    pass

class DivisionSection(DivisionSectionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Function (Функция)
class FunctionBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True

class FunctionCreate(FunctionBase):
    pass

class Function(FunctionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Section_Function (Связь отдела и функции)
class SectionFunctionBase(BaseModel):
    section_id: int
    function_id: int
    is_primary: bool = True
    
class SectionFunctionCreate(SectionFunctionBase):
    pass

class SectionFunction(SectionFunctionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Position (Должность)
class PositionBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True
    function_id: Optional[int] = None  # Связь с функцией

class PositionCreate(PositionBase):
    pass

class Position(PositionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Staff (Сотрудник)
class StaffBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    organization_id: Optional[int] = None  # Юридическое лицо (опционально)
    primary_organization_id: Optional[int] = None  # Основное юридическое лицо сотрудника

class StaffCreate(StaffBase):
    pass

class Staff(StaffBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Staff_Position (Связь сотрудника и должности)
class StaffPositionBase(BaseModel):
    staff_id: int
    position_id: int
    division_id: Optional[int] = None  # Подразделение, в котором сотрудник занимает эту должность
    location_id: Optional[int] = None  # Физическое местоположение
    is_primary: bool = True
    is_active: bool = True
    start_date: date = Field(default_factory=date.today)
    end_date: Optional[date] = None

class StaffPositionCreate(StaffPositionBase):
    pass

class StaffPosition(StaffPositionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Staff_Location (Связь сотрудника и физического местоположения)
class StaffLocationBase(BaseModel):
    staff_id: int
    location_id: int
    is_current: bool = True
    date_from: date = Field(default_factory=date.today)
    date_to: Optional[date] = None

class StaffLocationCreate(StaffLocationBase):
    pass

class StaffLocation(StaffLocationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Staff_Function (Связь сотрудника и функции)
class StaffFunctionBase(BaseModel):
    staff_id: int
    function_id: int
    commitment_percent: int = 100
    is_primary: bool = True
    date_from: date = Field(default_factory=date.today)
    date_to: Optional[date] = None

class StaffFunctionCreate(StaffFunctionBase):
    pass

class StaffFunction(StaffFunctionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для Functional_Relation (Функциональные отношения)
class FunctionalRelationBase(BaseModel):
    manager_id: int  # Руководитель
    subordinate_id: int  # Подчиненный
    relation_type: RelationType
    description: Optional[str] = None
    is_active: bool = True

class FunctionalRelationCreate(FunctionalRelationBase):
    pass

class FunctionalRelation(FunctionalRelationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Модели для ЦКП
class VFPBase(BaseModel):
    name: str
    description: Optional[str] = None
    metrics: Optional[dict] = None
    status: Optional[str] = 'not_started'
    progress: Optional[int] = 0
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    is_active: bool = True

class VFPCreate(VFPBase):
    entity_type: str
    entity_id: int

class VFP(VFPBase):
    id: int
    entity_type: str
    entity_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

# Функция для получения соединения с базой данных
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Это позволит получать данные как словари
    try:
        yield conn
    finally:
        conn.close()

# Инициализация базы данных, если она не существует
def init_db():
    """
    Создает базу данных и основные таблицы, только если база данных не существует.
    """
    db_path = os.path.abspath(DB_PATH)
    logger.info(f"Проверка базы данных по пути: {db_path}")
    
    # Проверяем, существует ли файл базы данных
    is_new_db = not os.path.exists(DB_PATH)
    
    if is_new_db:
        logger.info(f"База данных {DB_PATH} не найдена. Создаем новую...")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Создаем все таблицы из нашей схемы
        try:
            for schema in ALL_SCHEMAS:
                cursor.executescript(schema)
            
            conn.commit()
            logger.info("База данных успешно инициализирована")
        except Exception as e:
            logger.error(f"Ошибка при инициализации базы данных: {str(e)}")
            conn.rollback()
            raise
        finally:
            conn.close()
    else:
        logger.info(f"База данных {DB_PATH} уже существует, используем её")
        # Проверяем, содержит ли база данных все необходимые таблицы
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            # Проверка, содержит ли база данных все необходимые таблицы
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            existing_tables = [row[0] for row in cursor.fetchall()]
            logger.info(f"Существующие таблицы: {', '.join(existing_tables)}")
        except Exception as e:
            logger.error(f"Ошибка при проверке существующей базы данных: {str(e)}")
        finally:
            conn.close()

# ================== РОУТЫ API ==================

# API для организаций
@app.get("/organizations/", response_model=List[Organization])
def read_organizations(
    org_type: Optional[OrgType] = None,
    parent_id: Optional[int] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = "SELECT * FROM organizations"
    params = []
    
    if org_type or parent_id is not None:
        query += " WHERE"
        
        if org_type:
            query += " org_type = ?"
            params.append(org_type)
            
        if parent_id is not None:
            if org_type:
                query += " AND"
            query += " parent_id " + ("IS NULL" if parent_id == 0 else "= ?")
            if parent_id != 0:
                params.append(parent_id)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/organizations/", response_model=Organization)
def create_organization(organization: OrganizationCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем, существует ли родительская организация, если указана
    if organization.parent_id:
        cursor.execute("SELECT id, org_type FROM organizations WHERE id = ?", (organization.parent_id,))
        parent = cursor.fetchone()
        if not parent:
            raise HTTPException(status_code=404, detail=f"Родительская организация с ID {organization.parent_id} не найдена")
        
        # Проверяем правила иерархии
        parent_type = parent["org_type"]
        if (organization.org_type == OrgType.LEGAL_ENTITY and parent_type != OrgType.HOLDING) or \
           (organization.org_type == OrgType.LOCATION and parent_type not in [OrgType.HOLDING, OrgType.LEGAL_ENTITY]):
            raise HTTPException(
                status_code=400, 
                detail=f"Невозможно создать организацию типа {organization.org_type} с родителем типа {parent_type}"
            )
    
    # Вставляем новую организацию
    try:
        cursor.execute(
            """
            INSERT INTO organizations (
                name, code, description, is_active, org_type, parent_id,
                ckp, inn, kpp, legal_address, physical_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                organization.name,
                organization.code,
                organization.description,
                1 if organization.is_active else 0,
                organization.org_type,
                organization.parent_id,
                organization.ckp,
                organization.inn,
                organization.kpp,
                organization.legal_address,
                organization.physical_address
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании организации: {str(e)}")
    
    # Получаем созданную организацию
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM organizations WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.get("/organizations/{organization_id}", response_model=Organization)
def read_organization(organization_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM organizations WHERE id = ?", (organization_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Организация не найдена")
    
    return dict(row)

@app.put("/organizations/{organization_id}", response_model=Organization)
def update_organization(
    organization_id: int, 
    organization: OrganizationCreate, 
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Проверяем существование организации
    cursor.execute("SELECT * FROM organizations WHERE id = ?", (organization_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Организация не найдена")
    
    # Проверяем, существует ли родительская организация, если указана
    if organization.parent_id:
        cursor.execute("SELECT id, org_type FROM organizations WHERE id = ?", (organization.parent_id,))
        parent = cursor.fetchone()
        if not parent:
            raise HTTPException(status_code=404, detail=f"Родительская организация с ID {organization.parent_id} не найдена")
        
        # Проверяем правила иерархии
        parent_type = parent["org_type"]
        if (organization.org_type == OrgType.LEGAL_ENTITY and parent_type != OrgType.HOLDING) or \
           (organization.org_type == OrgType.LOCATION and parent_type not in [OrgType.HOLDING, OrgType.LEGAL_ENTITY]):
            raise HTTPException(
                status_code=400, 
                detail=f"Невозможно создать организацию типа {organization.org_type} с родителем типа {parent_type}"
            )
    
    # Обновляем организацию
    try:
        cursor.execute(
            """
            UPDATE organizations SET
                name = ?, code = ?, description = ?, is_active = ?, org_type = ?, parent_id = ?,
                ckp = ?, inn = ?, kpp = ?, legal_address = ?, physical_address = ?
            WHERE id = ?
            """,
            (
                organization.name,
                organization.code,
                organization.description,
                1 if organization.is_active else 0,
                organization.org_type,
                organization.parent_id,
                organization.ckp,
                organization.inn,
                organization.kpp,
                organization.legal_address,
                organization.physical_address,
                organization_id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обновлении организации: {str(e)}")
    
    # Получаем обновленную организацию
    cursor.execute("SELECT * FROM organizations WHERE id = ?", (organization_id,))
    return dict(cursor.fetchone())

@app.delete("/organizations/{organization_id}", response_model=dict)
def delete_organization(organization_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование организации
    cursor.execute("SELECT * FROM organizations WHERE id = ?", (organization_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Организация не найдена")
    
    # Проверяем, есть ли дочерние организации
    cursor.execute("SELECT COUNT(*) as count FROM organizations WHERE parent_id = ?", (organization_id,))
    row = cursor.fetchone()
    if row and row["count"] > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Невозможно удалить организацию, так как у неё есть {row['count']} дочерних организаций"
        )
    
    # Удаляем организацию
    cursor.execute("DELETE FROM organizations WHERE id = ?", (organization_id,))
    db.commit()
    
    return {"message": f"Организация с ID {organization_id} успешно удалена"}

# API для подразделений (Division)
@app.get("/divisions/", response_model=List[Division])
def read_divisions(
    organization_id: Optional[int] = None,
    parent_id: Optional[int] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = "SELECT * FROM divisions"
    params = []
    
    if organization_id or parent_id is not None:
        query += " WHERE"
        
        if organization_id:
            query += " organization_id = ?"
            params.append(organization_id)
            
        if parent_id is not None:
            if organization_id:
                query += " AND"
            query += " parent_id " + ("IS NULL" if parent_id == 0 else "= ?")
            if parent_id != 0:
                params.append(parent_id)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/divisions/", response_model=Division)
def create_division(division: DivisionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем, существует ли организация
    cursor.execute("SELECT id, org_type FROM organizations WHERE id = ?", (division.organization_id,))
    org = cursor.fetchone()
    if not org:
        raise HTTPException(status_code=404, detail=f"Организация с ID {division.organization_id} не найдена")
    
    # Проверяем, что организация - HOLDING
    if org["org_type"] != "holding":
        raise HTTPException(
            status_code=400, 
            detail=f"Подразделение может быть связано только с организацией типа HOLDING, а не {org['org_type']}"
        )
    
    # Если указан родитель, проверяем его существование
    if division.parent_id:
        cursor.execute("SELECT id FROM divisions WHERE id = ?", (division.parent_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Родительское подразделение с ID {division.parent_id} не найдено")
    
    # Вставляем новое подразделение
    try:
        cursor.execute(
            """
            INSERT INTO divisions (
                name, code, description, is_active, organization_id, parent_id, ckp
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                division.name,
                division.code,
                division.description,
                1 if division.is_active else 0,
                division.organization_id,
                division.parent_id,
                division.ckp
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании подразделения: {str(e)}")
    
    # Получаем созданное подразделение
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM divisions WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.get("/divisions/{division_id}", response_model=Division)
def read_division(division_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM divisions WHERE id = ?", (division_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Подразделение не найдено")
    
    return dict(row)

@app.put("/divisions/{division_id}", response_model=Division)
def update_division(
    division_id: int, 
    division: DivisionCreate, 
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Проверяем существование подразделения
    cursor.execute("SELECT * FROM divisions WHERE id = ?", (division_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Подразделение не найдено")
    
    # Проверяем, существует ли организация
    cursor.execute("SELECT id, org_type FROM organizations WHERE id = ?", (division.organization_id,))
    org = cursor.fetchone()
    if not org:
        raise HTTPException(status_code=404, detail=f"Организация с ID {division.organization_id} не найдена")
    
    # Проверяем, что организация - HOLDING
    if org["org_type"] != "holding":
        raise HTTPException(
            status_code=400, 
            detail=f"Подразделение может быть связано только с организацией типа HOLDING, а не {org['org_type']}"
        )
    
    # Если указан родитель, проверяем его существование
    if division.parent_id:
        cursor.execute("SELECT id FROM divisions WHERE id = ?", (division.parent_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Родительское подразделение с ID {division.parent_id} не найдено")
    
    # Обновляем подразделение
    try:
        cursor.execute(
            """
            UPDATE divisions SET
                name = ?, code = ?, description = ?, is_active = ?, 
                organization_id = ?, parent_id = ?, ckp = ?
            WHERE id = ?
            """,
            (
                division.name,
                division.code,
                division.description,
                1 if division.is_active else 0,
                division.organization_id,
                division.parent_id,
                division.ckp,
                division_id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обновлении подразделения: {str(e)}")
    
    # Получаем обновленное подразделение
    cursor.execute("SELECT * FROM divisions WHERE id = ?", (division_id,))
    return dict(cursor.fetchone())

@app.delete("/divisions/{division_id}", response_model=dict)
def delete_division(division_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование подразделения
    cursor.execute("SELECT * FROM divisions WHERE id = ?", (division_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Подразделение не найдено")
    
    # Проверяем, есть ли дочерние подразделения
    cursor.execute("SELECT COUNT(*) as count FROM divisions WHERE parent_id = ?", (division_id,))
    row = cursor.fetchone()
    if row and row["count"] > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Невозможно удалить подразделение, так как у него есть {row['count']} дочерних подразделений"
        )
    
    # Удаляем связи с отделами
    cursor.execute("DELETE FROM division_sections WHERE division_id = ?", (division_id,))
    
    # Удаляем подразделение
    cursor.execute("DELETE FROM divisions WHERE id = ?", (division_id,))
    db.commit()
    
    return {"message": f"Подразделение с ID {division_id} успешно удалено"}

# API для отделов (Section)
@app.get("/sections/", response_model=List[Section])
def read_sections(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM sections")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/sections/", response_model=Section)
def create_section(section: SectionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Вставляем новый отдел
    try:
        cursor.execute(
            """
            INSERT INTO sections (name, code, description, is_active, ckp)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                section.name,
                section.code,
                section.description,
                1 if section.is_active else 0,
                section.ckp
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании отдела: {str(e)}")
    
    # Получаем созданный отдел
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM sections WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.get("/sections/{section_id}", response_model=Section)
def read_section(section_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Отдел не найден")
    
    return dict(row)

@app.put("/sections/{section_id}", response_model=Section)
def update_section(
    section_id: int, 
    section: SectionCreate, 
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Проверяем существование отдела
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Отдел не найден")
    
    # Обновляем отдел
    try:
        cursor.execute(
            """
            UPDATE sections SET
                name = ?, code = ?, description = ?, is_active = ?, ckp = ?
            WHERE id = ?
            """,
            (
                section.name,
                section.code,
                section.description,
                1 if section.is_active else 0,
                section.ckp,
                section_id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обновлении отдела: {str(e)}")
    
    # Получаем обновленный отдел
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    return dict(cursor.fetchone())

@app.delete("/sections/{section_id}", response_model=dict)
def delete_section(section_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование отдела
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Отдел не найден")
    
    # Удаляем связи с подразделениями
    cursor.execute("DELETE FROM division_sections WHERE section_id = ?", (section_id,))
    
    # Удаляем связи с функциями
    cursor.execute("DELETE FROM section_functions WHERE section_id = ?", (section_id,))
    
    # Удаляем отдел
    cursor.execute("DELETE FROM sections WHERE id = ?", (section_id,))
    db.commit()
    
    return {"message": f"Отдел с ID {section_id} успешно удален"}

# API для связи Division-Section
@app.get("/division-sections/", response_model=List[DivisionSection])
def read_division_sections(
    division_id: Optional[int] = None,
    section_id: Optional[int] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = "SELECT * FROM division_sections"
    params = []
    
    if division_id or section_id:
        query += " WHERE"
        
        if division_id:
            query += " division_id = ?"
            params.append(division_id)
            
        if section_id:
            if division_id:
                query += " AND"
            query += " section_id = ?"
            params.append(section_id)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/division-sections/", response_model=DivisionSection)
def create_division_section(div_section: DivisionSectionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование подразделения
    cursor.execute("SELECT * FROM divisions WHERE id = ?", (div_section.division_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Подразделение с ID {div_section.division_id} не найдено")
    
    # Проверяем существование отдела
    cursor.execute("SELECT * FROM sections WHERE id = ?", (div_section.section_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Отдел с ID {div_section.section_id} не найден")
    
    # Вставляем новую связь
    try:
        cursor.execute(
            """
            INSERT INTO division_sections (division_id, section_id, is_primary)
            VALUES (?, ?, ?)
            """,
            (div_section.division_id, div_section.section_id, 1 if div_section.is_primary else 0)
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании связи: {str(e)}")
    
    # Получаем созданную связь
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM division_sections WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.delete("/division-sections/{id}", response_model=dict)
def delete_division_section(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование связи
    cursor.execute("SELECT * FROM division_sections WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Связь не найдена")
    
    # Удаляем связь
    cursor.execute("DELETE FROM division_sections WHERE id = ?", (id,))
    db.commit()
    
    return {"message": f"Связь с ID {id} успешно удалена"}

# API для функций (Function)
@app.get("/functions/", response_model=List[Function])
def read_functions(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM functions")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/functions/", response_model=Function)
def create_function(function: FunctionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Вставляем новую функцию
    try:
        cursor.execute(
            """
            INSERT INTO functions (name, code, description, is_active)
            VALUES (?, ?, ?, ?)
            """,
            (
                function.name,
                function.code,
                function.description,
                1 if function.is_active else 0
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании функции: {str(e)}")
    
    # Получаем созданную функцию
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM functions WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.get("/functions/{function_id}", response_model=Function)
def read_function(function_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM functions WHERE id = ?", (function_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Функция не найдена")
    
    return dict(row)

@app.put("/functions/{function_id}", response_model=Function)
def update_function(
    function_id: int, 
    function: FunctionCreate, 
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Проверяем существование функции
    cursor.execute("SELECT * FROM functions WHERE id = ?", (function_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Функция не найдена")
    
    # Обновляем функцию
    try:
        cursor.execute(
            """
            UPDATE functions SET
                name = ?, code = ?, description = ?, is_active = ?
            WHERE id = ?
            """,
            (
                function.name,
                function.code,
                function.description,
                1 if function.is_active else 0,
                function_id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обновлении функции: {str(e)}")
    
    # Получаем обновленную функцию
    cursor.execute("SELECT * FROM functions WHERE id = ?", (function_id,))
    return dict(cursor.fetchone())

@app.delete("/functions/{function_id}", response_model=dict)
def delete_function(function_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование функции
    cursor.execute("SELECT * FROM functions WHERE id = ?", (function_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Функция не найдена")
    
    # Удаляем связи с отделами
    cursor.execute("DELETE FROM section_functions WHERE function_id = ?", (function_id,))
    
    # Удаляем связи с сотрудниками
    cursor.execute("DELETE FROM staff_functions WHERE function_id = ?", (function_id,))
    
    # Проверяем, есть ли должности, связанные с этой функцией
    cursor.execute("SELECT COUNT(*) as count FROM positions WHERE function_id = ?", (function_id,))
    row = cursor.fetchone()
    if row and row["count"] > 0:
        # Обнуляем связь с функцией в должностях
        cursor.execute("UPDATE positions SET function_id = NULL WHERE function_id = ?", (function_id,))
    
    # Удаляем функцию
    cursor.execute("DELETE FROM functions WHERE id = ?", (function_id,))
    db.commit()
    
    return {"message": f"Функция с ID {function_id} успешно удалена"}

# API для связи Section-Function
@app.get("/section-functions/", response_model=List[SectionFunction])
def read_section_functions(
    section_id: Optional[int] = None,
    function_id: Optional[int] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = "SELECT * FROM section_functions"
    params = []
    
    if section_id or function_id:
        query += " WHERE"
        
        if section_id:
            query += " section_id = ?"
            params.append(section_id)
            
        if function_id:
            if section_id:
                query += " AND"
            query += " function_id = ?"
            params.append(function_id)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/section-functions/", response_model=SectionFunction)
def create_section_function(section_function: SectionFunctionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование отдела
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_function.section_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Отдел с ID {section_function.section_id} не найден")
    
    # Проверяем существование функции
    cursor.execute("SELECT * FROM functions WHERE id = ?", (section_function.function_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Функция с ID {section_function.function_id} не найдена")
    
    # Вставляем новую связь
    try:
        cursor.execute(
            """
            INSERT INTO section_functions (section_id, function_id, is_primary)
            VALUES (?, ?, ?)
            """,
            (section_function.section_id, section_function.function_id, 1 if section_function.is_primary else 0)
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании связи: {str(e)}")
    
    # Получаем созданную связь
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM section_functions WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.delete("/section-functions/{id}", response_model=dict)
def delete_section_function(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование связи
    cursor.execute("SELECT * FROM section_functions WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Связь не найдена")
    
    # Удаляем связь
    cursor.execute("DELETE FROM section_functions WHERE id = ?", (id,))
    db.commit()
    
    return {"message": f"Связь с ID {id} успешно удалена"}

# API для должностей (Position)
@app.get("/positions/", response_model=List[Position])
def read_positions(
    function_id: Optional[int] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    if function_id:
        cursor.execute("SELECT * FROM positions WHERE function_id = ?", (function_id,))
    else:
        cursor.execute("SELECT * FROM positions")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/positions/", response_model=Position)
def create_position(position: PositionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Если указана функция, проверяем ее существование
    if position.function_id:
        cursor.execute("SELECT * FROM functions WHERE id = ?", (position.function_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Функция с ID {position.function_id} не найдена")
    
    # Вставляем новую должность
    try:
        cursor.execute(
            """
            INSERT INTO positions (name, code, description, is_active, function_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                position.name,
                position.code,
                position.description,
                1 if position.is_active else 0,
                position.function_id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании должности: {str(e)}")
    
    # Получаем созданную должность
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM positions WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.get("/positions/{position_id}", response_model=Position)
def read_position(position_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Должность не найдена")
    
    return dict(row)

@app.put("/positions/{position_id}", response_model=Position)
def update_position(
    position_id: int, 
    position: PositionCreate, 
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Проверяем существование должности
    cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Должность не найдена")
    
    # Если указана функция, проверяем ее существование
    if position.function_id:
        cursor.execute("SELECT * FROM functions WHERE id = ?", (position.function_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Функция с ID {position.function_id} не найдена")
    
    # Обновляем должность
    try:
        cursor.execute(
            """
            UPDATE positions SET
                name = ?, code = ?, description = ?, is_active = ?, function_id = ?
            WHERE id = ?
            """,
            (
                position.name,
                position.code,
                position.description,
                1 if position.is_active else 0,
                position.function_id,
                position_id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обновлении должности: {str(e)}")
    
    # Получаем обновленную должность
    cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
    return dict(cursor.fetchone())

@app.delete("/positions/{position_id}", response_model=dict)
def delete_position(position_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование должности
    cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Должность не найдена")
    
    # Проверяем, есть ли сотрудники на этой должности
    cursor.execute("SELECT COUNT(*) as count FROM staff_positions WHERE position_id = ?", (position_id,))
    row = cursor.fetchone()
    if row and row["count"] > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Невозможно удалить должность, так как на ней состоит {row['count']} сотрудников"
        )
    
    # Удаляем должность
    cursor.execute("DELETE FROM positions WHERE id = ?", (position_id,))
    db.commit()
    
    return {"message": f"Должность с ID {position_id} успешно удалена"}

# API для сотрудников (Staff)
@app.get("/staff/", response_model=List[Staff])
def read_staff(
    organization_id: Optional[int] = None,
    primary_organization_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Получить список сотрудников с возможностью фильтрации.
    """
    query = "SELECT * FROM staff WHERE 1=1"
    params = []
    
    if organization_id is not None:
        query += " AND organization_id = ?"
        params.append(organization_id)
        
    if primary_organization_id is not None:
        query += " AND primary_organization_id = ?"
        params.append(primary_organization_id)
    
    if is_active is not None:
        query += " AND is_active = ?"
        params.append(1 if is_active else 0)
    
    cursor = db.execute(query, params)
    staff_list = cursor.fetchall()
    
    result = []
    for s in staff_list:
        result.append({
            "id": s["id"],
            "email": s["email"],
            "first_name": s["first_name"],
            "last_name": s["last_name"],
            "middle_name": s["middle_name"],
            "phone": s["phone"],
            "description": s["description"],
            "is_active": bool(s["is_active"]),
            "organization_id": s["organization_id"],
            "primary_organization_id": s["primary_organization_id"],
            "created_at": s["created_at"],
            "updated_at": s["updated_at"]
        })
    
    return result

@app.post("/staff/", response_model=Staff)
def create_staff(staff: StaffCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Создать нового сотрудника с возможностью указания юридического лица и основного юр.лица.
    """
    # Проверка, что organization_id и primary_organization_id, если указаны, существуют
    if staff.organization_id is not None:
        cursor = db.execute("SELECT id FROM organizations WHERE id = ?", (staff.organization_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Организация с ID {staff.organization_id} не найдена")
    
    if staff.primary_organization_id is not None:
        cursor = db.execute("SELECT id FROM organizations WHERE id = ?", (staff.primary_organization_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Организация с ID {staff.primary_organization_id} не найдена")
    
    # Создаем нового сотрудника
    cursor = db.execute(
        """
        INSERT INTO staff (
            email, first_name, last_name, middle_name, 
            phone, description, is_active, organization_id, primary_organization_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            staff.email,
            staff.first_name,
            staff.last_name,
            staff.middle_name,
            staff.phone,
            staff.description,
            1 if staff.is_active else 0,
            staff.organization_id,
            staff.primary_organization_id
        )
    )
    db.commit()
    
    # Получаем созданного сотрудника
    created_id = cursor.lastrowid
    cursor = db.execute("SELECT * FROM staff WHERE id = ?", (created_id,))
    created = cursor.fetchone()
    
    return {
        "id": created["id"],
        "email": created["email"],
        "first_name": created["first_name"],
        "last_name": created["last_name"],
        "middle_name": created["middle_name"],
        "phone": created["phone"],
        "description": created["description"],
        "is_active": bool(created["is_active"]),
        "organization_id": created["organization_id"],
        "primary_organization_id": created["primary_organization_id"],
        "created_at": created["created_at"],
        "updated_at": created["updated_at"]
    }

@app.post("/staff-positions/", response_model=StaffPosition)
def create_staff_position(staff_position: StaffPositionCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование сотрудника
    cursor.execute("SELECT * FROM staff WHERE id = ?", (staff_position.staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_position.staff_id} не найден")
    
    # Проверяем существование должности
    cursor.execute("SELECT * FROM positions WHERE id = ?", (staff_position.position_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Должность с ID {staff_position.position_id} не найдена")
    
    # Если указана локация, проверяем ее существование и тип
    if staff_position.location_id:
        cursor.execute("SELECT id, org_type FROM organizations WHERE id = ?", (staff_position.location_id,))
        location = cursor.fetchone()
        if not location:
            raise HTTPException(status_code=404, detail=f"Локация с ID {staff_position.location_id} не найдена")
        
        if location["org_type"] != "location":
            raise HTTPException(
                status_code=400, 
                detail=f"Организация с ID {staff_position.location_id} не является локацией (тип: {location['org_type']})"
            )
    
    # Вставляем новую связь
    try:
        cursor.execute(
            """
            INSERT INTO staff_positions (
                staff_id, position_id, location_id, is_primary, 
                is_active, start_date, end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                staff_position.staff_id,
                staff_position.position_id,
                staff_position.location_id,
                1 if staff_position.is_primary else 0,
                1 if staff_position.is_active else 0,
                staff_position.start_date.isoformat(),
                staff_position.end_date.isoformat() if staff_position.end_date else None
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании связи: {str(e)}")
    
    # Получаем созданную связь
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM staff_positions WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.put("/staff-positions/{id}", response_model=StaffPosition)
def update_staff_position(
    id: int,
    staff_position: StaffPositionCreate,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Проверяем существование связи
    cursor.execute("SELECT * FROM staff_positions WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Связь не найдена")
    
    # Проверяем существование сотрудника
    cursor.execute("SELECT * FROM staff WHERE id = ?", (staff_position.staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_position.staff_id} не найден")
    
    # Проверяем существование должности
    cursor.execute("SELECT * FROM positions WHERE id = ?", (staff_position.position_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Должность с ID {staff_position.position_id} не найдена")
    
    # Если указана локация, проверяем ее существование и тип
    if staff_position.location_id:
        cursor.execute("SELECT id, org_type FROM organizations WHERE id = ?", (staff_position.location_id,))
        location = cursor.fetchone()
        if not location:
            raise HTTPException(status_code=404, detail=f"Локация с ID {staff_position.location_id} не найдена")
        
        if location["org_type"] != "location":
            raise HTTPException(
                status_code=400, 
                detail=f"Организация с ID {staff_position.location_id} не является локацией (тип: {location['org_type']})"
            )
    
    # Обновляем связь
    try:
        cursor.execute(
            """
            UPDATE staff_positions SET
                staff_id = ?, position_id = ?, location_id = ?, is_primary = ?,
                is_active = ?, start_date = ?, end_date = ?
            WHERE id = ?
            """,
            (
                staff_position.staff_id,
                staff_position.position_id,
                staff_position.location_id,
                1 if staff_position.is_primary else 0,
                1 if staff_position.is_active else 0,
                staff_position.start_date.isoformat(),
                staff_position.end_date.isoformat() if staff_position.end_date else None,
                id
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обновлении связи: {str(e)}")
    
    # Получаем обновленную связь
    cursor.execute("SELECT * FROM staff_positions WHERE id = ?", (id,))
    return dict(cursor.fetchone())

@app.delete("/staff-positions/{id}", response_model=dict)
def delete_staff_position(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование связи
    cursor.execute("SELECT * FROM staff_positions WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Связь не найдена")
    
    # Удаляем связь
    cursor.execute("DELETE FROM staff_positions WHERE id = ?", (id,))
    db.commit()
    
    return {"message": f"Связь с ID {id} успешно удалена"}

# API для связи сотрудников и функций (Staff-Function)
@app.get("/staff-functions/", response_model=List[StaffFunction])
def read_staff_functions(
    staff_id: Optional[int] = None,
    function_id: Optional[int] = None,
    is_primary: Optional[bool] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Получить список связей сотрудников с функциями с возможностью фильтрации.
    """
    query = "SELECT * FROM staff_functions WHERE 1=1"
    params = []
    
    if staff_id is not None:
        query += " AND staff_id = ?"
        params.append(staff_id)
    
    if function_id is not None:
        query += " AND function_id = ?"
        params.append(function_id)
    
    if is_primary is not None:
        query += " AND is_primary = ?"
        params.append(1 if is_primary else 0)
    
    cursor = db.execute(query, params)
    staff_functions = cursor.fetchall()
    
    result = []
    for func in staff_functions:
        result.append({
            "id": func["id"],
            "staff_id": func["staff_id"],
            "function_id": func["function_id"],
            "commitment_percent": func["commitment_percent"],
            "is_primary": bool(func["is_primary"]),
            "date_from": func["date_from"],
            "date_to": func["date_to"],
            "created_at": func["created_at"],
            "updated_at": func["updated_at"]
        })
    
    return result

@app.post("/staff-functions/", response_model=StaffFunction)
def create_staff_function(staff_function: StaffFunctionCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Создать новую связь сотрудника с функцией.
    """
    # Проверяем, что функция существует
    cursor = db.execute(
        "SELECT id FROM functions WHERE id = ?",
        (staff_function.function_id,)
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Функция с ID {staff_function.function_id} не найдена")
    
    # Проверяем, что сотрудник существует
    cursor = db.execute("SELECT id FROM staff WHERE id = ?", (staff_function.staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_function.staff_id} не найден")
    
    # Если указан is_primary=True, сбрасываем текущие is_primary для этого сотрудника
    if staff_function.is_primary:
        db.execute(
            "UPDATE staff_functions SET is_primary = 0 WHERE staff_id = ? AND is_primary = 1",
            (staff_function.staff_id,)
        )
    
    cursor = db.execute(
        """
        INSERT INTO staff_functions (
            staff_id, function_id, commitment_percent, is_primary, date_from, date_to
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            staff_function.staff_id,
            staff_function.function_id,
            staff_function.commitment_percent,
            1 if staff_function.is_primary else 0,
            staff_function.date_from,
            staff_function.date_to
        )
    )
    db.commit()
    
    # Получаем созданную запись
    created_id = cursor.lastrowid
    cursor = db.execute("SELECT * FROM staff_functions WHERE id = ?", (created_id,))
    created = cursor.fetchone()
    
    return {
        "id": created["id"],
        "staff_id": created["staff_id"],
        "function_id": created["function_id"],
        "commitment_percent": created["commitment_percent"],
        "is_primary": bool(created["is_primary"]),
        "date_from": created["date_from"],
        "date_to": created["date_to"],
        "created_at": created["created_at"],
        "updated_at": created["updated_at"]
    }

@app.put("/staff-functions/{id}", response_model=StaffFunction)
def update_staff_function(
    id: int,
    staff_function: StaffFunctionCreate,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Обновить связь сотрудника с функцией.
    """
    # Проверяем, что запись существует
    cursor = db.execute("SELECT id FROM staff_functions WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Связь функции с ID {id} не найдена")
    
    # Проверяем, что функция существует
    cursor = db.execute("SELECT id FROM functions WHERE id = ?", (staff_function.function_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Функция с ID {staff_function.function_id} не найдена")
    
    # Проверяем, что сотрудник существует
    cursor = db.execute("SELECT id FROM staff WHERE id = ?", (staff_function.staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_function.staff_id} не найден")
    
    # Если указан is_primary=True, сбрасываем текущие is_primary для этого сотрудника
    if staff_function.is_primary:
        db.execute(
            "UPDATE staff_functions SET is_primary = 0 WHERE staff_id = ? AND is_primary = 1 AND id != ?",
            (staff_function.staff_id, id)
        )
    
    db.execute(
        """
        UPDATE staff_functions SET
            staff_id = ?, function_id = ?, commitment_percent = ?, is_primary = ?, date_from = ?, date_to = ?
        WHERE id = ?
        """,
        (
            staff_function.staff_id,
            staff_function.function_id,
            staff_function.commitment_percent,
            1 if staff_function.is_primary else 0,
            staff_function.date_from,
            staff_function.date_to,
            id
        )
    )
    db.commit()
    
    # Получаем обновленную запись
    cursor = db.execute("SELECT * FROM staff_functions WHERE id = ?", (id,))
    updated = cursor.fetchone()
    
    return {
        "id": updated["id"],
        "staff_id": updated["staff_id"],
        "function_id": updated["function_id"],
        "commitment_percent": updated["commitment_percent"],
        "is_primary": bool(updated["is_primary"]),
        "date_from": updated["date_from"],
        "date_to": updated["date_to"],
        "created_at": updated["created_at"],
        "updated_at": updated["updated_at"]
    }

@app.delete("/staff-functions/{id}", response_model=dict)
def delete_staff_function(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование связи
    cursor.execute("SELECT * FROM staff_functions WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Связь не найдена")
    
    # Удаляем связь
    cursor.execute("DELETE FROM staff_functions WHERE id = ?", (id,))
    db.commit()
    
    return {"message": f"Связь с ID {id} успешно удалена"}

# API для функциональных отношений (FunctionalRelation)
@app.get("/functional-relations/", response_model=List[FunctionalRelation])
def read_functional_relations(
    manager_id: Optional[int] = None,
    subordinate_id: Optional[int] = None,
    relation_type: Optional[RelationType] = None,
    is_active: Optional[bool] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = "SELECT * FROM functional_relations"
    params = []
    conditions = []
    
    if manager_id:
        conditions.append("manager_id = ?")
        params.append(manager_id)
    
    if subordinate_id:
        conditions.append("subordinate_id = ?")
        params.append(subordinate_id)
    
    if relation_type:
        conditions.append("relation_type = ?")
        params.append(relation_type)
    
    if is_active is not None:
        conditions.append("is_active = ?")
        params.append(1 if is_active else 0)
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/functional-relations/", response_model=FunctionalRelation)
def create_functional_relation(relation: FunctionalRelationCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем, что руководитель и подчиненный - не один и тот же человек
    if relation.manager_id == relation.subordinate_id:
        raise HTTPException(
            status_code=400, 
            detail="Сотрудник не может быть одновременно руководителем и подчиненным"
        )
    
    # Проверяем существование руководителя
    cursor.execute("SELECT * FROM staff WHERE id = ?", (relation.manager_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Руководитель с ID {relation.manager_id} не найден")
    
    # Проверяем существование подчиненного
    cursor.execute("SELECT * FROM staff WHERE id = ?", (relation.subordinate_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Подчиненный с ID {relation.subordinate_id} не найден")
    
    # Вставляем новое отношение
    try:
        cursor.execute(
            """
            INSERT INTO functional_relations (
                manager_id, subordinate_id, relation_type, description, is_active
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                relation.manager_id,
                relation.subordinate_id,
                relation.relation_type,
                relation.description,
                1 if relation.is_active else 0
            )
        )
        db.commit()
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании отношения: {str(e)}")
    
    # Получаем созданное отношение
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM functional_relations WHERE id = ?", (new_id,))
    return dict(cursor.fetchone())

@app.get("/functional-relations/{id}", response_model=FunctionalRelation)
def read_functional_relation(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM functional_relations WHERE id = ?", (id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Отношение не найдено")
    
    return dict(row)

@app.delete("/functional-relations/{id}", response_model=dict)
def delete_functional_relation(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Проверяем существование отношения
    cursor.execute("SELECT * FROM functional_relations WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Отношение не найдено")
    
    # Удаляем отношение
    cursor.execute("DELETE FROM functional_relations WHERE id = ?", (id,))
    db.commit()
    
    return {"message": f"Отношение с ID {id} успешно удалено"}

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в OFS Global API!"}

# Инициализация и запуск сервера
@app.on_event("startup")
def startup():
    init_db()

# Подключаем роутер для организационной структуры, если он доступен
if has_org_structure_router:
    app.include_router(org_structure_router)

# ================== STAFF LOCATIONS ENDPOINTS ==================

@app.get("/staff-locations/", response_model=List[StaffLocation])
def read_staff_locations(
    staff_id: Optional[int] = None,
    location_id: Optional[int] = None,
    is_current: Optional[bool] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Получить список связей сотрудников с локациями с возможностью фильтрации.
    """
    query = "SELECT * FROM staff_locations WHERE 1=1"
    params = []
    
    if staff_id is not None:
        query += " AND staff_id = ?"
        params.append(staff_id)
    
    if location_id is not None:
        query += " AND location_id = ?"
        params.append(location_id)
    
    if is_current is not None:
        query += " AND is_current = ?"
        params.append(1 if is_current else 0)
    
    cursor = db.execute(query, params)
    staff_locations = cursor.fetchall()
    
    result = []
    for loc in staff_locations:
        result.append({
            "id": loc["id"],
            "staff_id": loc["staff_id"],
            "location_id": loc["location_id"],
            "is_current": bool(loc["is_current"]),
            "date_from": loc["date_from"],
            "date_to": loc["date_to"],
            "created_at": loc["created_at"],
            "updated_at": loc["updated_at"]
        })
    
    return result

@app.post("/staff-locations/", response_model=StaffLocation)
def create_staff_location(staff_location: StaffLocationCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Создать новую связь сотрудника с локацией.
    """
    # Проверяем, что локация существует и имеет тип 'location'
    cursor = db.execute(
        "SELECT id, org_type FROM organizations WHERE id = ?",
        (staff_location.location_id,)
    )
    location = cursor.fetchone()
    
    if not location:
        raise HTTPException(status_code=404, detail=f"Локация с ID {staff_location.location_id} не найдена")
    
    if location["org_type"] != "location":
        raise HTTPException(
            status_code=400, 
            detail=f"Организация с ID {staff_location.location_id} не является локацией"
        )
    
    # Проверяем, что сотрудник существует
    cursor = db.execute("SELECT id FROM staff WHERE id = ?", (staff_location.staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_location.staff_id} не найден")
    
    # Если указан is_current=True, сбрасываем текущие is_current для этого сотрудника
    if staff_location.is_current:
        db.execute(
            "UPDATE staff_locations SET is_current = 0 WHERE staff_id = ? AND is_current = 1",
            (staff_location.staff_id,)
        )
    
    cursor = db.execute(
        """
        INSERT INTO staff_locations (
            staff_id, location_id, is_current, date_from, date_to
        ) VALUES (?, ?, ?, ?, ?)
        """,
        (
            staff_location.staff_id,
            staff_location.location_id,
            1 if staff_location.is_current else 0,
            staff_location.date_from,
            staff_location.date_to
        )
    )
    db.commit()
    
    # Получаем созданную запись
    created_id = cursor.lastrowid
    cursor = db.execute("SELECT * FROM staff_locations WHERE id = ?", (created_id,))
    created = cursor.fetchone()
    
    return {
        "id": created["id"],
        "staff_id": created["staff_id"],
        "location_id": created["location_id"],
        "is_current": bool(created["is_current"]),
        "date_from": created["date_from"],
        "date_to": created["date_to"],
        "created_at": created["created_at"],
        "updated_at": created["updated_at"]
    }

@app.put("/staff-locations/{id}", response_model=StaffLocation)
def update_staff_location(
    id: int,
    staff_location: StaffLocationCreate,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Обновить связь сотрудника с локацией.
    """
    # Проверяем, что запись существует
    cursor = db.execute("SELECT id FROM staff_locations WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Связь локации с ID {id} не найдена")
    
    # Проверяем, что локация существует и имеет тип 'location'
    cursor = db.execute(
        "SELECT id, org_type FROM organizations WHERE id = ?",
        (staff_location.location_id,)
    )
    location = cursor.fetchone()
    
    if not location:
        raise HTTPException(status_code=404, detail=f"Локация с ID {staff_location.location_id} не найдена")
    
    if location["org_type"] != "location":
        raise HTTPException(
            status_code=400, 
            detail=f"Организация с ID {staff_location.location_id} не является локацией"
        )
    
    # Проверяем, что сотрудник существует
    cursor = db.execute("SELECT id FROM staff WHERE id = ?", (staff_location.staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_location.staff_id} не найден")
    
    # Если указан is_current=True, сбрасываем текущие is_current для этого сотрудника
    if staff_location.is_current:
        db.execute(
            "UPDATE staff_locations SET is_current = 0 WHERE staff_id = ? AND is_current = 1 AND id != ?",
            (staff_location.staff_id, id)
        )
    
    db.execute(
        """
        UPDATE staff_locations SET
            staff_id = ?, location_id = ?, is_current = ?, date_from = ?, date_to = ?
        WHERE id = ?
        """,
        (
            staff_location.staff_id,
            staff_location.location_id,
            1 if staff_location.is_current else 0,
            staff_location.date_from,
            staff_location.date_to,
            id
        )
    )
    db.commit()
    
    # Получаем обновленную запись
    cursor = db.execute("SELECT * FROM staff_locations WHERE id = ?", (id,))
    updated = cursor.fetchone()
    
    return {
        "id": updated["id"],
        "staff_id": updated["staff_id"],
        "location_id": updated["location_id"],
        "is_current": bool(updated["is_current"]),
        "date_from": updated["date_from"],
        "date_to": updated["date_to"],
        "created_at": updated["created_at"],
        "updated_at": updated["updated_at"]
    }

@app.delete("/staff-locations/{id}", response_model=dict)
def delete_staff_location(id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Удалить связь сотрудника с локацией.
    """
    # Проверяем, что запись существует
    cursor = db.execute("SELECT id FROM staff_locations WHERE id = ?", (id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Связь локации с ID {id} не найдена")
    
    db.execute("DELETE FROM staff_locations WHERE id = ?", (id,))
    db.commit()
    
    return {"message": f"Связь локации с ID {id} успешно удалена"}

@app.get("/staff/{staff_id}", response_model=Staff)
def read_staff_member(staff_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Получить данные конкретного сотрудника по ID.
    """
    cursor = db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,))
    staff = cursor.fetchone()
    
    if not staff:
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_id} не найден")
    
    return {
        "id": staff["id"],
        "email": staff["email"],
        "first_name": staff["first_name"],
        "last_name": staff["last_name"],
        "middle_name": staff["middle_name"],
        "phone": staff["phone"],
        "description": staff["description"],
        "is_active": bool(staff["is_active"]),
        "organization_id": staff["organization_id"],
        "primary_organization_id": staff["primary_organization_id"],
        "created_at": staff["created_at"],
        "updated_at": staff["updated_at"]
    }

@app.put("/staff/{staff_id}", response_model=Staff)
def update_staff(staff_id: int, staff: StaffCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Обновить данные сотрудника.
    """
    # Проверяем, что сотрудник существует
    cursor = db.execute("SELECT id FROM staff WHERE id = ?", (staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_id} не найден")
    
    # Проверка, что organization_id и primary_organization_id, если указаны, существуют
    if staff.organization_id is not None:
        cursor = db.execute("SELECT id FROM organizations WHERE id = ?", (staff.organization_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Организация с ID {staff.organization_id} не найдена")
    
    if staff.primary_organization_id is not None:
        cursor = db.execute("SELECT id FROM organizations WHERE id = ?", (staff.primary_organization_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Организация с ID {staff.primary_organization_id} не найдена")
    
    # Обновляем сотрудника
    db.execute(
        """
        UPDATE staff SET
            email = ?, first_name = ?, last_name = ?, middle_name = ?,
            phone = ?, description = ?, is_active = ?, organization_id = ?, primary_organization_id = ?
        WHERE id = ?
        """,
        (
            staff.email,
            staff.first_name,
            staff.last_name,
            staff.middle_name,
            staff.phone,
            staff.description,
            1 if staff.is_active else 0,
            staff.organization_id,
            staff.primary_organization_id,
            staff_id
        )
    )
    db.commit()
    
    # Получаем обновленного сотрудника
    cursor = db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,))
    updated = cursor.fetchone()
    
    return {
        "id": updated["id"],
        "email": updated["email"],
        "first_name": updated["first_name"],
        "last_name": updated["last_name"],
        "middle_name": updated["middle_name"],
        "phone": updated["phone"],
        "description": updated["description"],
        "is_active": bool(updated["is_active"]),
        "organization_id": updated["organization_id"],
        "primary_organization_id": updated["primary_organization_id"],
        "created_at": updated["created_at"],
        "updated_at": updated["updated_at"]
    }

@app.delete("/staff/{staff_id}", response_model=dict)
def delete_staff(staff_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Удалить сотрудника и все связанные записи.
    """
    # Проверяем, что сотрудник существует
    cursor = db.execute("SELECT id FROM staff WHERE id = ?", (staff_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail=f"Сотрудник с ID {staff_id} не найден")
    
    # Удаляем все связанные записи
    # 1. Удаляем связи с должностями
    db.execute("DELETE FROM staff_positions WHERE staff_id = ?", (staff_id,))
    
    # 2. Удаляем связи с локациями
    db.execute("DELETE FROM staff_locations WHERE staff_id = ?", (staff_id,))
    
    # 3. Удаляем связи с функциями
    db.execute("DELETE FROM staff_functions WHERE staff_id = ?", (staff_id,))
    
    # 4. Удаляем функциональные отношения
    db.execute("DELETE FROM functional_relations WHERE manager_id = ? OR subordinate_id = ?", (staff_id, staff_id))
    
    # 5. Удаляем самого сотрудника
    db.execute("DELETE FROM staff WHERE id = ?", (staff_id,))
    db.commit()
    
    return {"message": f"Сотрудник с ID {staff_id} и все связанные записи успешно удалены"}

# Выводим информацию о базе данных
@app.get("/db-info")
def get_db_info():
    """
    Возвращает информацию о базе данных
    """
    db_path = os.path.abspath(DB_PATH)
    db_exists = os.path.exists(DB_PATH)
    db_size = os.path.getsize(DB_PATH) if db_exists else 0
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Получаем список таблиц
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    
    # Получаем статистику по таблицам
    table_stats = {}
    for table in tables:
        if table != 'sqlite_sequence':
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            table_stats[table] = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "db_path": db_path,
        "db_exists": db_exists, 
        "db_size": db_size,
        "tables": tables,
        "table_stats": table_stats
    }

# Эндпоинты для ЦКП
@app.post("/vfp/", response_model=VFP)
def create_vfp(vfp: VFPCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO valuable_final_products (
            entity_type, entity_id, name, description, metrics, 
            status, progress, start_date, target_date, is_active,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    """, (
        vfp.entity_type, vfp.entity_id, vfp.name, vfp.description,
        json.dumps(vfp.metrics) if vfp.metrics else None,
        vfp.status, vfp.progress, vfp.start_date, vfp.target_date, vfp.is_active
    ))
    db.commit()
    
    vfp_id = cursor.lastrowid
    cursor.execute("SELECT * FROM valuable_final_products WHERE id = ?", (vfp_id,))
    row = cursor.fetchone()
    
    return {
        "id": row[0],
        "entity_type": row[1],
        "entity_id": row[2],
        "name": row[3],
        "description": row[4],
        "metrics": json.loads(row[5]) if row[5] else None,
        "status": row[6],
        "progress": row[7],
        "start_date": row[8],
        "target_date": row[9],
        "is_active": bool(row[10]),
        "created_at": row[11],
        "updated_at": row[12]
    }

@app.get("/vfp/{vfp_id}", response_model=VFP)
def get_vfp(vfp_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM valuable_final_products WHERE id = ?", (vfp_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="ЦКП не найден")
    
    return {
        "id": row[0],
        "entity_type": row[1],
        "entity_id": row[2],
        "name": row[3],
        "description": row[4],
        "metrics": json.loads(row[5]) if row[5] else None,
        "status": row[6],
        "progress": row[7],
        "start_date": row[8],
        "target_date": row[9],
        "is_active": bool(row[10]),
        "created_at": row[11],
        "updated_at": row[12]
    }

@app.get("/vfp/", response_model=List[VFP])
def list_vfps(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    status: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = "SELECT * FROM valuable_final_products WHERE 1=1"
    params = []
    
    if entity_type:
        query += " AND entity_type = ?"
        params.append(entity_type)
    if entity_id is not None:
        query += " AND entity_id = ?"
        params.append(entity_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    return [{
        "id": row[0],
        "entity_type": row[1],
        "entity_id": row[2],
        "name": row[3],
        "description": row[4],
        "metrics": json.loads(row[5]) if row[5] else None,
        "status": row[6],
        "progress": row[7],
        "start_date": row[8],
        "target_date": row[9],
        "is_active": bool(row[10]),
        "created_at": row[11],
        "updated_at": row[12]
    } for row in rows]

@app.put("/vfp/{vfp_id}", response_model=VFP)
def update_vfp(vfp_id: int, vfp: VFPBase, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM valuable_final_products WHERE id = ?", (vfp_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="ЦКП не найден")
    
    cursor.execute("""
        UPDATE valuable_final_products SET
            name = ?,
            description = ?,
            metrics = ?,
            status = ?,
            progress = ?,
            start_date = ?,
            target_date = ?,
            is_active = ?,
            updated_at = datetime('now')
        WHERE id = ?
    """, (
        vfp.name,
        vfp.description,
        json.dumps(vfp.metrics) if vfp.metrics else None,
        vfp.status,
        vfp.progress,
        vfp.start_date,
        vfp.target_date,
        vfp.is_active,
        vfp_id
    ))
    db.commit()
    
    cursor.execute("SELECT * FROM valuable_final_products WHERE id = ?", (vfp_id,))
    row = cursor.fetchone()
    
    return {
        "id": row[0],
        "entity_type": row[1],
        "entity_id": row[2],
        "name": row[3],
        "description": row[4],
        "metrics": json.loads(row[5]) if row[5] else None,
        "status": row[6],
        "progress": row[7],
        "start_date": row[8],
        "target_date": row[9],
        "is_active": bool(row[10]),
        "created_at": row[11],
        "updated_at": row[12]
    }

@app.delete("/vfp/{vfp_id}")
def delete_vfp(vfp_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM valuable_final_products WHERE id = ?", (vfp_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="ЦКП не найден")
    
    cursor.execute("DELETE FROM valuable_final_products WHERE id = ?", (vfp_id,))
    db.commit()
    
    return {"message": "ЦКП успешно удален"}

if __name__ == "__main__":
    uvicorn.run("full_api:app", host="127.0.0.1", port=8001, reload=True) 
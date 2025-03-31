#!/usr/bin/env python
"""
Скрипт для проверки структуры базы данных после миграции.
"""

import sqlite3
import json

# Подключаемся к БД
conn = sqlite3.connect("full_api.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Получаем список всех таблиц
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [table[0] for table in cursor.fetchall()]

print("Таблицы в базе данных:")
for table in tables:
    print(f"- {table}")

# Проверяем наличие новых таблиц
required_tables = [
    "staff_locations",
    "staff_functions",
    "staff_positions"
]

for table in required_tables:
    if table in tables:
        print(f"\nТаблица {table} найдена.")
        # Получаем структуру таблицы
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        print("Структура таблицы:")
        for col in columns:
            print(f"  - {col['name']} ({col['type']})")
    else:
        print(f"\nТаблица {table} НЕ найдена!")

# Проверяем обновленную таблицу staff
if "staff" in tables:
    print("\nПроверка таблицы staff:")
    cursor.execute("PRAGMA table_info(staff)")
    columns = [col["name"] for col in cursor.fetchall()]
    
    if "primary_organization_id" in columns:
        print("  - Поле primary_organization_id добавлено ✓")
    else:
        print("  - Поле primary_organization_id отсутствует ✗")
    
    # Проверяем, является ли organization_id обязательным
    cursor.execute("PRAGMA table_info(staff)")
    for col in cursor.fetchall():
        if col["name"] == "organization_id":
            if col["notnull"] == 0:
                print("  - Поле organization_id теперь не обязательно ✓")
            else:
                print("  - Поле organization_id все еще обязательно ✗")

# Проверяем данные в таблицах после миграции
print("\nСтатистика по таблицам:")
for table in tables:
    cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
    count = cursor.fetchone()["count"]
    print(f"- {table}: {count} записей")

conn.close() 
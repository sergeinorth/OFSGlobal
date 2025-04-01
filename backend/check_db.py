#!/usr/bin/env python
"""
Скрипт для проверки структуры базы данных после миграции.
"""

import sqlite3
import os

def check_db(db_path):
    print(f"\n=== Проверка БД: {db_path} ===")
    if not os.path.exists(db_path):
        print(f"ОШИБКА: Файл {db_path} не существует")
        return
    
    print(f"Размер файла: {os.path.getsize(db_path)} байт")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Получаем список таблиц
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Таблицы в БД ({len(tables)}): {', '.join(tables)}")
        
        # Проверяем количество записей в каждой таблице
        for table in tables:
            if table != 'sqlite_sequence':
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    print(f"  {table}: {count} записей")
                    
                    # Если есть записи, выведем 1 запись как пример
                    if count > 0:
                        cursor.execute(f"SELECT * FROM {table} LIMIT 1")
                        row = cursor.fetchone()
                        print(f"    Пример записи: {row}")
                except Exception as e:
                    print(f"  Ошибка при проверке таблицы {table}: {str(e)}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"ОШИБКА при проверке БД: {str(e)}")

# Проверяем обе БД
print("Начинаем проверку баз данных...")
check_db("full_api.db")
check_db("full_api_new.db")
print("\nПроверка завершена.") 
from flask import Flask, request, jsonify
import jwt
import sqlite3
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Включаем CORS для всех маршрутов
app.config['SECRET_KEY'] = 'ofsglobal-secret-key'
DATABASE_PATH = "./new_app.db"

# Настройки хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/login/access-token', methods=['POST'])
def login_access_token():
    print("[LOG:AUTH] Получен запрос на логин")
    
    # Получаем данные из формы
    username = request.form.get('username')
    password = request.form.get('password')
    
    print(f"[LOG:AUTH] Попытка входа для пользователя: {username}")
    
    if not username or not password:
        print("[LOG:AUTH] Ошибка: отсутствует логин или пароль")
        return jsonify({"detail": "Необходимо указать имя пользователя и пароль"}), 400
    
    # Получаем пользователя из БД
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user WHERE email = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        print(f"[LOG:AUTH] Ошибка: пользователь {username} не найден")
        return jsonify({"detail": "Неверное имя пользователя или пароль"}), 400
    
    print(f"[LOG:AUTH] Пользователь найден: {user['email']}")
    
    # Проверяем пароль
    if not pwd_context.verify(password, user['hashed_password']):
        print("[LOG:AUTH] Ошибка: неверный пароль")
        return jsonify({"detail": "Неверное имя пользователя или пароль"}), 400
    
    # Проверяем активность пользователя
    if not user['is_active']:
        print("[LOG:AUTH] Ошибка: пользователь неактивен")
        return jsonify({"detail": "Неактивный пользователь"}), 400
    
    # Создаем JWT-токен
    access_token_expires = timedelta(minutes=60 * 24 * 8)  # 8 дней
    expire = datetime.utcnow() + access_token_expires
    payload = {"exp": expire, "sub": str(user['id'])}
    access_token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
    
    print(f"[LOG:AUTH] Успешная авторизация для {username}, токен создан")
    
    return jsonify({"access_token": access_token, "token_type": "bearer"})

@app.route('/login/test-token', methods=['GET'])
def test_token():
    print("[LOG:AUTH] Проверка токена")
    
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        print("[LOG:AUTH] Ошибка: отсутствует или неверный заголовок Authorization")
        return jsonify({"detail": "Not authenticated"}), 401
    
    token = auth_header.split(" ")[1]
    try:
        # Декодируем токен
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = payload.get('sub')
        
        print(f"[LOG:AUTH] Токен действителен, ID пользователя: {user_id}")
        
        # Получаем пользователя
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            print(f"[LOG:AUTH] Ошибка: пользователь с ID {user_id} не найден")
            return jsonify({"detail": "User not found"}), 404
        
        print(f"[LOG:AUTH] Успешная проверка токена для {user['email']}")
        
        # Возвращаем данные пользователя
        return jsonify({
            "id": user['id'],
            "email": user['email'],
            "full_name": user['full_name'],
            "is_active": bool(user['is_active']),
            "is_superuser": bool(user['is_superuser'])
        })
    
    except jwt.ExpiredSignatureError:
        print("[LOG:AUTH] Ошибка: токен просрочен")
        return jsonify({"detail": "Token expired"}), 401
    except (jwt.InvalidTokenError, Exception) as e:
        print(f"[LOG:AUTH] Ошибка проверки токена: {str(e)}")
        return jsonify({"detail": str(e)}), 401

@app.route('/')
def index():
    return jsonify({
        "name": "OFS Global Auth API",
        "version": "1.0",
        "status": "running",
        "endpoints": [
            "/login/access-token",
            "/login/test-token"
        ]
    })

if __name__ == '__main__':
    if not os.path.exists(DATABASE_PATH):
        print(f"[LOG:AUTH] ОШИБКА: База данных {DATABASE_PATH} не найдена!")
        print("[LOG:AUTH] Перед запуском API создайте базу данных командой: python init_test_db.py")
    else:
        print(f"[LOG:AUTH] База данных подключена: {os.path.abspath(DATABASE_PATH)}")
    
    print("[LOG:AUTH] Запуск сервера авторизации на http://127.0.0.1:8000")
    app.run(host='127.0.0.1', port=8000, debug=True) 
from flask import Flask, request, jsonify, url_for
import jwt
import sqlite3
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import sys
from flask_cors import CORS

# Принудительное отключение кэширования модулей
print("[LOG:AUTH] Отключаем кэширование модулей")
sys.dont_write_bytecode = True

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Разрешаем запросы со всех источников

# Отключаем кэширование в Flask
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'ofsglobal-secret-key'
DATABASE_PATH = "./full_api_new.db"  # База данных

# Настройки хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/login/access-token', methods=['POST'])
def login_access_token():
    print("[LOG:AUTH] Получен запрос на /login/access-token")
    
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
    print("[LOG:AUTH] Получен запрос на /login/test-token")
    
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

@app.route('/register', methods=['POST'])
def register():
    print("[LOG:AUTH] Получен запрос на /register")
    
    # Пытаемся получить данные из разных форматов
    data = request.get_json(silent=True)
    if not data:
        # Если JSON не пришел, пробуем form-data
        data = request.form.to_dict() if request.form else None
    
    # Если и form-data нет, логируем все что пришло для отладки
    if not data:
        print("[LOG:AUTH] Данные не получены. Детали запроса:")
        print(f"Content-Type: {request.headers.get('Content-Type', 'не указан')}")
        print(f"Данные: {request.data}")
        print(f"Аргументы: {request.args}")
        print(f"Форма: {request.form}")
        return jsonify({"detail": "Отсутствуют данные"}), 400
    
    print(f"[LOG:AUTH] Полученные данные: {data}")
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name', '')
    
    print(f"[LOG:AUTH] Попытка регистрации для пользователя: {email}")
    
    if not email or not password:
        print("[LOG:AUTH] Ошибка: отсутствует email или пароль")
        return jsonify({"detail": "Необходимо указать email и пароль"}), 400
    
    # Проверяем, не существует ли уже пользователь с таким email
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user WHERE email = ?", (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        conn.close()
        print(f"[LOG:AUTH] Ошибка: пользователь с email {email} уже существует")
        return jsonify({"detail": "Пользователь с таким email уже существует"}), 400
    
    # Хешируем пароль
    hashed_password = pwd_context.hash(password)
    
    # Добавляем нового пользователя
    try:
        cursor.execute(
            "INSERT INTO user (email, hashed_password, full_name, is_active, is_superuser) VALUES (?, ?, ?, ?, ?)",
            (email, hashed_password, full_name, True, False)
        )
        conn.commit()
        conn.close()
        
        print(f"[LOG:AUTH] Пользователь {email} успешно зарегистрирован")
        return jsonify({"message": "Пользователь успешно зарегистрирован"}), 201
        
    except Exception as e:
        conn.rollback()
        conn.close()
        print(f"[LOG:AUTH] Ошибка при регистрации пользователя: {str(e)}")
        return jsonify({"detail": f"Ошибка при регистрации: {str(e)}"}), 500

@app.route('/')
def index():
    return jsonify({
        "name": "OFS Global Auth API",
        "version": "1.0",
        "status": "running",
        "endpoints": [
            "/login/access-token",
            "/login/test-token",
            "/register",
            "/test-register",
            "/debug/routes"
        ]
    })

# Маршрут для отладки - показывает все зарегистрированные маршруты
@app.route('/debug/routes')
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': [method for method in rule.methods if method not in ['HEAD', 'OPTIONS']],
            'path': str(rule)
        })
    return jsonify(routes)

# Тестовый маршрут для проверки регистрации
@app.route('/test-register', methods=['POST', 'GET'])
def test_register():
    print("[LOG:AUTH] Получен запрос на /test-register")
    
    # Если GET-запрос, просто возвращаем форму
    if request.method == 'GET':
        return jsonify({"message": "Это тестовый маршрут для регистрации. Отправьте POST-запрос с данными."}), 200
    
    # Если POST-запрос, обрабатываем данные
    print(f"[LOG:AUTH] Тестовая регистрация: Метод={request.method}")
    print(f"[LOG:AUTH] Content-Type: {request.headers.get('Content-Type', 'не указан')}")
    print(f"[LOG:AUTH] Данные: {request.data}")
    print(f"[LOG:AUTH] Аргументы: {request.args}")
    print(f"[LOG:AUTH] Форма: {request.form}")
    print(f"[LOG:AUTH] JSON: {request.get_json(silent=True)}")
    
    return jsonify({
        "message": "Тестовый маршрут регистрации работает",
        "method": request.method,
        "content_type": request.headers.get('Content-Type', 'не указан'),
        "has_data": bool(request.data)
    }), 200

if __name__ == '__main__':
    # Удаляем блок перезагрузки, так как он вызывает ошибку
    # Нельзя перезагрузить __main__
    
    if not os.path.exists(DATABASE_PATH):
        print(f"[LOG:AUTH] ОШИБКА: База данных {DATABASE_PATH} не найдена!")
        print("[LOG:AUTH] Перед запуском API создайте базу данных командой: python init_test_db.py")
    else:
        print(f"[LOG:AUTH] База данных подключена: {os.path.abspath(DATABASE_PATH)}")
    
    print("[LOG:AUTH] Запуск сервера авторизации на http://0.0.0.0:8000")
    # Временно отключаем автоперезагрузку для стабильности отладки
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False) 
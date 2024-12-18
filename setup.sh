#!/bin/bash

# Базовая директория проекта
BASE_DIR="src/main/resources"

# Создаем папки
mkdir -p $BASE_DIR/templates
mkdir -p $BASE_DIR/static/css
mkdir -p $BASE_DIR/static/js
mkdir -p $BASE_DIR/static/images

# Создаем HTML-шаблоны
cat <<EOT > $BASE_DIR/templates/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Parking System</title>
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <header>
        <nav>
            <img src="/images/logo.png" alt="Logo" class="logo">
            <ul>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h1>Welcome to the Parking System</h1>
            <p>Reserve your parking spot easily and quickly!</p>
            <a href="/dashboard" class="button-primary">Dashboard</a>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Parking System</p>
    </footer>
</body>
</html>
EOT

touch $BASE_DIR/templates/login.html
touch $BASE_DIR/templates/register.html
touch $BASE_DIR/templates/dashboard.html
touch $BASE_DIR/templates/parking.html
touch $BASE_DIR/templates/faq.html
touch $BASE_DIR/templates/reservation.html

# Создаем CSS-файлы
cat <<EOT > $BASE_DIR/static/css/main.css
body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    margin: 0;
    padding: 0;
}
header {
    background-color: #003366;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
header .logo {
    width: 120px;
}
header ul {
    list-style: none;
    display: flex;
    gap: 1rem;
}
header ul li a {
    color: white;
    text-decoration: none;
    font-weight: bold;
}
.button-primary {
    background-color: #0066cc;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    text-decoration: none;
    display: inline-block;
    margin-top: 1rem;
}
EOT

touch $BASE_DIR/static/css/auth.css
touch $BASE_DIR/static/css/dashboard.css

# Создаем JS-файлы
touch $BASE_DIR/static/js/main.js
touch $BASE_DIR/static/js/auth.js
touch $BASE_DIR/static/js/reservation.js

# Добавляем заглушку для изображений
echo "Здесь будут храниться изображения проекта." > $BASE_DIR/static/images/README.txt

# Выводим сообщение об успешном создании файлов
echo "Структура проекта успешно создана!"

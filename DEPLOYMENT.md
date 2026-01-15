# Инструкция по развертыванию приложения Serb Burger

В этом документе описаны требования и шаги для запуска Telegram Mini App "Serb Burger" на собственном сервере.

## 1. Рекомендуемая инфраструктура

Для максимальной надежности и производительности рекомендуется разделять сервер приложения и сервер базы данных.

### Сервер приложения (App Server)

- **CPU**: 1-2 ядра
- **RAM**: 2 ГБ
- **Роль**: Запуск Docker-контейнера с Next.js, Nginx, SSL.

### Сервер базы данных (DB Server)

- **CPU**: 1-2 ядра
- **RAM**: 2-4 ГБ (PostgreSQL любит память для кэширования)
- **OC**: Ubuntu 22.04 или управляемая БД (Managed PostgreSQL от провайдера, например **Timeweb Cloud**).

---

## 2. Настройка внешней базы данных

Если вы разворачиваете PostgreSQL на отдельном сервере:

### Шаг 1: Установка PostgreSQL

На сервере БД:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Шаг 2: Настройка доступа

По умолчанию PostgreSQL слушает только `localhost`. Нужно разрешить подключения извне.

1. Отредактируйте `/etc/postgresql/15/main/postgresql.conf`:

   ```conf
   listen_addresses = '*'
   ```

2. Настройте права доступа в `/etc/postgresql/15/main/pg_hba.conf` (добавьте строку в конец):

   ```conf
   # Разрешить доступ только IP-адресу сервера приложения
   host    serb_burger    user    IP_ВАШЕГО_APP_СЕРВЕРА/32    md5
   ```

3. Перезапустите: `sudo systemctl restart postgresql`

### Шаг 3: Настройка Firewall (UFW)

Разрешите входящий трафик на порт 5432 только с сервера приложения:

```bash
sudo ufw allow from IP_ВАШЕГО_APP_СЕРВЕРА to any port 5432
```

---

## 3. Предварительные требования (App Server)

На сервере приложения должны быть установлены:

1. **Docker**: `curl -fsSL https://get.docker.com | sh`
2. **Docker Compose**: `apt install docker-compose-v2`
3. **Git**: Для клонирования репозитория.

---

## 4. Шаги развертывания приложения

### Шаг 1: Подготовка окружения

Клонируйте репозиторий на сервер и создайте файл `.env`:

```bash
cp .env.example .env
nano .env
```

Заполните обязательные переменные:

- `DATABASE_URL`: URL вашей внешней БД (`postgresql://user:password@DB_SERVER_IP:5432/serb_burger`).
- `NEXT_PUBLIC_BASE_URL`: Ваш домен (например, `https://app.serb-burger.ru`).
- `WATA_API_KEY` и `WATA_SHOP_ID`: Ваши ключи из личного кабинета WATA Pay.
- `ADMIN_PASSWORD`: Пароль для входа в админ-панель (по умолчанию `admin`).
- `JWT_SECRET`: Любая длинная случайная строка для защиты сессий.

### Шаг 2: Запуск контейнера

Запустите сборку и развертывание одной командой:

```bash
docker-compose up -d --build
```

### Шаг 3: Настройка Nginx (Reverse Proxy)

Telegram требует HTTPS. Самый простой способ — настроить Nginx на сервере для пересылки трафика в Docker-контейнер (порт 3000) и управления SSL.

Пример конфига Nginx (`/etc/nginx/sites-available/serb-burger`):

```nginx
server {
    server_name app.serb-burger.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Шаг 4: Получение SSL (Let's Encrypt)

Выполните команду:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.serb-burger.ru
```

---

## 5. Настройка в Telegram (BotFather)

1. Перейдите в `@BotFather`.
2. Выберите вашего бота и пункт **Bot Settings** -> **Menu Button**.
3. Укажите URL вашего приложения: `https://app.serb-burger.ru`.
4. Теперь при нажатии на кнопку в боте будет открываться ваше приложение.

---

## 6. База данных и миграции

Чтобы применить схему БД (Prisma) при первом запуске, выполните внутри контейнера приложения:

```bash
docker exec -it <container_name> npx prisma migrate deploy
```

---

## 7. Админ-панель и безопасность

Админ-панель (`/admin`) полностью изолирована и защищена:

1. **Middleware**: Проверяет наличие авторизации перед загрузкой любой страницы админки.
2. **HTTP-only Cookies**: Сессия хранится в зашифрованных куках, недоступных для JS-скриптов.
3. **Android App (PWA)**:
   - Откройте `/admin` на смартфоне.
   - В меню Chrome выберите **"Установить"**.
   - Теперь у вас есть отдельное приложение для персонала.

---

*Приложение готово к приему заказов!*

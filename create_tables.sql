-- Создание таблиц для Serb Burger базы данных

-- Таблица пользователей
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "telegramId" TEXT UNIQUE,
    name TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица категорий
CREATE TABLE "Category" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- Таблица продуктов
CREATE TABLE "Product" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    price REAL NOT NULL,
    "categoryId" TEXT NOT NULL REFERENCES "Category"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица ингредиентов
CREATE TABLE "Ingredient" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    type TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица связи продуктов и ингредиентов
CREATE TABLE "ProductIngredient" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    "ingredientId" TEXT NOT NULL REFERENCES "Ingredient"(id) ON DELETE CASCADE,
    "selectionType" TEXT DEFAULT 'multiple',
    "isRequired" BOOLEAN DEFAULT FALSE,
    "maxQuantity" INTEGER,
    "sortOrder" INTEGER DEFAULT 0,
    UNIQUE("productId", "ingredientId")
);

-- Таблица заказов
CREATE TABLE "Order" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    number SERIAL UNIQUE NOT NULL,
    "userId" TEXT REFERENCES "User"(id),
    "totalAmount" REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица элементов заказа
CREATE TABLE "OrderItem" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"(id),
    "productId" TEXT NOT NULL REFERENCES "Product"(id),
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    "selectedIngredients" TEXT
);

-- Создание индексов для производительности
CREATE INDEX idx_order_created_at ON "Order"("createdAt");
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_product_category_id ON "Product"("categoryId");
CREATE INDEX idx_order_item_order_id ON "OrderItem"("orderId");

-- Вставка тестовых данных
-- Создание категорий
INSERT INTO "Category" (slug, name) VALUES
('burgers', '🍔 Бургеры'),
('drinks', '🥤 Напитки'),
('snacks', '🍟 Снеки'),
('sauces', '🧂 Соусы');

-- Создание ингредиентов
INSERT INTO "Ingredient" (name, price, type, "createdAt", "updatedAt") VALUES
('Булочка обычная', 0, 'bun', NOW(), NOW()),
('Булочка бриошь', 50, 'bun', NOW(), NOW()),
('Говядина 150г', 0, 'patty', NOW(), NOW()),
('Курица 150г', 0, 'patty', NOW(), NOW()),
('Двойная говядина 300г', 150, 'patty', NOW(), NOW()),
('Сыр чеддер', 80, 'cheese', NOW(), NOW()),
('Сыр моцарелла', 80, 'cheese', NOW(), NOW()),
('Бекон хрустящий', 120, 'addon', NOW(), NOW()),
('Халапеньо', 60, 'addon', NOW(), NOW()),
('Лук красный', 30, 'veggie', NOW(), NOW()),
('Помидор свежий', 40, 'veggie', NOW(), NOW()),
('Салат айсберг', 30, 'veggie', NOW(), NOW()),
('Огурец маринованный', 35, 'veggie', NOW(), NOW()),
('Соус чесночный', 0, 'sauce', NOW(), NOW()),
('Соус барбекю', 0, 'sauce', NOW(), NOW()),
('Кетчуп', 0, 'sauce', NOW(), NOW()),
('Майонез', 0, 'sauce', NOW(), NOW());

-- Создание продуктов
INSERT INTO "Product" (name, description, price, "categoryId", "createdAt", "updatedAt") VALUES
('Сербский Классический', 'Традиционный сербский бургер с сочной говядиной, свежими овощами и фирменными соусами', 350, (SELECT id FROM "Category" WHERE slug = 'burgers'), NOW(), NOW()),
('Двойной Серб', 'Двойная порция отборной говядины для настоящих гурманов', 500, (SELECT id FROM "Category" WHERE slug = 'burgers'), NOW(), NOW()),
('Сырный Взрыв', 'Бургер с двойным сыром чеддер и хрустящим беконом', 420, (SELECT id FROM "Category" WHERE slug = 'burgers'), NOW(), NOW()),
('Куриный Классик', 'Нежная куриная котлета с овощами и легкими соусами', 320, (SELECT id FROM "Category" WHERE slug = 'burgers'), NOW(), NOW()),
('Кола 0.5л', 'Классический напиток Coca-Cola охлажденный', 120, (SELECT id FROM "Category" WHERE slug = 'drinks'), NOW(), NOW()),
('Спрайт 0.5л', 'Освежающий лимонный напиток', 120, (SELECT id FROM "Category" WHERE slug = 'drinks'), NOW(), NOW()),
('Картофель фри', 'Золотистый картофель фри с солью', 180, (SELECT id FROM "Category" WHERE slug = 'snacks'), NOW(), NOW()),
('Наггетсы 6шт', 'Хрустящие куриные наггетсы с соусом', 220, (SELECT id FROM "Category" WHERE slug = 'snacks'), NOW(), NOW()),
('Куриные крылышки', 'Острые куриные крылышки в панировке', 280, (SELECT id FROM "Category" WHERE slug = 'snacks'), NOW(), NOW());

-- Настройка ингредиентов для бургеров
-- Сербский Классический
INSERT INTO "ProductIngredient" ("productId", "ingredientId", "selectionType", "isRequired", "maxQuantity", "sortOrder") VALUES
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Булочка обычная'), 'single', true, NULL, 1),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Говядина 150г'), 'single', true, NULL, 2),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Сыр чеддер'), 'single', false, NULL, 3),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Бекон хрустящий'), 'single', false, NULL, 4),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Лук красный'), 'multiple', false, 2, 5),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Помидор свежий'), 'multiple', false, 2, 6),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Салат айсберг'), 'multiple', false, 3, 7),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Соус чесночный'), 'multiple', false, 2, 8),
((SELECT id FROM "Product" WHERE name = 'Сербский Классический'), (SELECT id FROM "Ingredient" WHERE name = 'Кетчуп'), 'multiple', false, 2, 9);

INSERT INTO "Product" (name, description, price, "categoryId") VALUES
('Сербский Классический', 'Традиционный сербский бургер с говядиной', 350, (SELECT id FROM "Category" WHERE slug = 'burgers')),
('Двойной Серб', 'Двойная порция говядины для настоящих гурманов', 500, (SELECT id FROM "Category" WHERE slug = 'burgers')),
('Сырный Взрыв', 'Бургер с двойным сыром и хрустящим беконом', 420, (SELECT id FROM "Category" WHERE slug = 'burgers')),
('Кола 0.5л', 'Классический напиток', 120, (SELECT id FROM "Category" WHERE slug = 'drinks')),
('Картофель фри', 'Золотистый картофель фри', 180, (SELECT id FROM "Category" WHERE slug = 'snacks')),
('Соус чесночный', 'Острый чесночный соус', 50, (SELECT id FROM "Category" WHERE slug = 'sauces'));

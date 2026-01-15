-- Очистка базы данных и создание начальных данных

-- Удаление существующих данных (в правильном порядке из-за зависимостей)
DELETE FROM "ProductIngredient";
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Product";
DELETE FROM "Ingredient";
DELETE FROM "Category";
DELETE FROM "User";

-- Сброс счетчиков автоинкремента
ALTER SEQUENCE "Order_number_seq" RESTART WITH 1000;

-- Создание категорий
INSERT INTO "Category" (id, slug, name) VALUES
('cat-burgers', 'burgers', '🍔 Бургеры'),
('cat-drinks', 'drinks', '🥤 Напитки'),
('cat-snacks', 'snacks', '🍟 Снеки'),
('cat-sauces', 'sauces', '🧂 Соусы');

-- Создание ингредиентов
INSERT INTO "Ingredient" (id, name, price, type) VALUES
('ing-bun-normal', 'Булочка обычная', 0, 'bun'),
('ing-bun-brioche', 'Булочка бриошь', 50, 'bun'),
('ing-beef-150g', 'Говядина 150г', 0, 'patty'),
('ing-beef-300g', 'Двойная говядина 300г', 150, 'patty'),
('ing-cheese-cheddar', 'Сыр чеддер', 80, 'cheese'),
('ing-bacon', 'Бекон хрустящий', 120, 'addon'),
('ing-onion-red', 'Лук красный', 30, 'veggie'),
('ing-tomato', 'Помидор свежий', 40, 'veggie'),
('ing-lettuce', 'Салат айсберг', 30, 'veggie'),
('ing-sauce-garlic', 'Соус чесночный', 0, 'sauce'),
('ing-sauce-ketchup', 'Кетчуп', 0, 'sauce');

-- Создание продуктов
INSERT INTO "Product" (id, name, description, price, "categoryId") VALUES
('prod-serbian-classic', 'Сербский Классический', 'Традиционный сербский бургер с сочной говядиной, свежими овощами и фирменными соусами', 350, 'cat-burgers'),
('prod-double-serb', 'Двойной Серб', 'Двойная порция отборной говядины для настоящих гурманов', 500, 'cat-burgers'),
('prod-cheese-explosion', 'Сырный Взрыв', 'Бургер с двойным сыром чеддер и хрустящим беконом', 420, 'cat-burgers'),
('prod-chicken-classic', 'Куриный Классик', 'Нежная куриная котлета с овощами и легкими соусами', 320, 'cat-burgers'),
('prod-coke-05l', 'Кола 0.5л', 'Классический напиток Coca-Cola охлажденный', 120, 'cat-drinks'),
('prod-sprite-05l', 'Спрайт 0.5л', 'Освежающий лимонный напиток', 120, 'cat-drinks'),
('prod-fries', 'Картофель фри', 'Золотистый картофель фри с солью', 180, 'cat-snacks'),
('prod-nuggets', 'Наггетсы 6шт', 'Хрустящие куриные наггетсы с соусом', 220, 'cat-snacks'),
('prod-garlic-sauce', 'Соус чесночный', 'Острый чесночный соус домашнего приготовления', 50, 'cat-sauces');

-- Настройка ингредиентов для бургеров
-- Сербский Классический
INSERT INTO "ProductIngredient" ("productId", "ingredientId", "selectionType", "isRequired", "maxQuantity", "sortOrder") VALUES
('prod-serbian-classic', 'ing-bun-normal', 'single', true, NULL, 1),
('prod-serbian-classic', 'ing-beef-150g', 'single', true, NULL, 2),
('prod-serbian-classic', 'ing-cheese-cheddar', 'single', false, NULL, 3),
('prod-serbian-classic', 'ing-bacon', 'single', false, NULL, 4),
('prod-serbian-classic', 'ing-onion-red', 'multiple', false, 2, 5),
('prod-serbian-classic', 'ing-tomato', 'multiple', false, 2, 6),
('prod-serbian-classic', 'ing-lettuce', 'multiple', false, 3, 7),
('prod-serbian-classic', 'ing-sauce-garlic', 'multiple', false, 2, 8),
('prod-serbian-classic', 'ing-sauce-ketchup', 'multiple', false, 2, 9);

-- Двойной Серб
INSERT INTO "ProductIngredient" ("productId", "ingredientId", "selectionType", "isRequired", "maxQuantity", "sortOrder") VALUES
('prod-double-serb', 'ing-bun-brioche', 'single', true, NULL, 1),
('prod-double-serb', 'ing-beef-300g', 'single', true, NULL, 2),
('prod-double-serb', 'ing-cheese-cheddar', 'multiple', false, 2, 3),
('prod-double-serb', 'ing-bacon', 'single', false, NULL, 4),
('prod-double-serb', 'ing-onion-red', 'multiple', false, 2, 5),
('prod-double-serb', 'ing-tomato', 'multiple', false, 2, 6),
('prod-double-serb', 'ing-lettuce', 'multiple', false, 3, 7),
('prod-double-serb', 'ing-sauce-garlic', 'multiple', false, 2, 8);

-- Сырный Взрыв
INSERT INTO "ProductIngredient" ("productId", "ingredientId", "selectionType", "isRequired", "maxQuantity", "sortOrder") VALUES
('prod-cheese-explosion', 'ing-bun-normal', 'single', true, NULL, 1),
('prod-cheese-explosion', 'ing-beef-150g', 'single', true, NULL, 2),
('prod-cheese-explosion', 'ing-cheese-cheddar', 'multiple', true, 2, 3),
('prod-cheese-explosion', 'ing-bacon', 'single', true, NULL, 4),
('prod-cheese-explosion', 'ing-onion-red', 'multiple', false, 1, 5),
('prod-cheese-explosion', 'ing-tomato', 'multiple', false, 2, 6),
('prod-cheese-explosion', 'ing-lettuce', 'multiple', false, 2, 7),
('prod-cheese-explosion', 'ing-sauce-garlic', 'multiple', false, 1, 8);
import { Product, Ingredient } from '@/types';

export const INGREDIENTS: Record<string, Ingredient> = {
  // Buns
  'bun-classic': { id: 'bun-classic', name: 'Булочка классическая', price: 0, type: 'bun', isDefault: true },
  'bun-brioche': { id: 'bun-brioche', name: 'Бриошь', price: 50, type: 'bun' },
  'bun-whole-grain': { id: 'bun-whole-grain', name: 'Цельнозерновая', price: 30, type: 'bun' },

  // Patties
  'patty-beef': { id: 'patty-beef', name: 'Говяжья котлета', price: 0, type: 'patty', isDefault: true },
  'patty-chicken': { id: 'patty-chicken', name: 'Куриная котлета', price: 0, type: 'patty' },
  'patty-double': { id: 'patty-double', name: 'Двойная котлета', price: 150, type: 'patty' },
  'patty-veggie': { id: 'patty-veggie', name: 'Вегетарианская котлета', price: 80, type: 'patty' },

  // Cheese
  'cheese-cheddar': { id: 'cheese-cheddar', name: 'Чеддер', price: 30, type: 'cheese' },
  'cheese-blue': { id: 'cheese-blue', name: 'Дорблю', price: 50, type: 'cheese' },
  'cheese-mozzarella': { id: 'cheese-mozzarella', name: 'Моцарелла', price: 40, type: 'cheese' },
  'cheese-parmesan': { id: 'cheese-parmesan', name: 'Пармезан', price: 45, type: 'cheese' },

  // Veggies
  'veg-tomato': { id: 'veg-tomato', name: 'Томаты', price: 0, type: 'vegetable', isDefault: true },
  'veg-lettuce': { id: 'veg-lettuce', name: 'Салат Айсберг', price: 0, type: 'vegetable', isDefault: true },
  'veg-onion': { id: 'veg-onion', name: 'Лук красный', price: 0, type: 'vegetable', isDefault: true },
  'veg-pickle': { id: 'veg-pickle', name: 'Маринованный огурец', price: 20, type: 'vegetable' },
  'veg-jalapeno': { id: 'veg-jalapeno', name: 'Халапеньо', price: 30, type: 'vegetable' },
  'veg-cucumber': { id: 'veg-cucumber', name: 'Огурец свежий', price: 15, type: 'vegetable' },
  'veg-spinach': { id: 'veg-spinach', name: 'Шпинат', price: 25, type: 'vegetable' },

  // Addons
  'addon-bacon': { id: 'addon-bacon', name: 'Бекон', price: 60, type: 'addon' },
  'addon-egg': { id: 'addon-egg', name: 'Яйцо', price: 40, type: 'addon' },
  'addon-avocado': { id: 'addon-avocado', name: 'Авокадо', price: 70, type: 'addon' },
  'addon-mushrooms': { id: 'addon-mushrooms', name: 'Грибы', price: 35, type: 'addon' },

  // Sauces (Inside burger)
  'sauce-ketchup': { id: 'sauce-ketchup', name: 'Кетчуп', price: 0, type: 'sauce' },
  'sauce-bbq': { id: 'sauce-bbq', name: 'Барбекю', price: 0, type: 'sauce' },
  'sauce-mayo': { id: 'sauce-mayo', name: 'Майонез', price: 0, type: 'sauce' },
  'sauce-garlic': { id: 'sauce-garlic', name: 'Чесночный', price: 10, type: 'sauce' },
  'sauce-spicy': { id: 'sauce-spicy', name: 'Острый', price: 15, type: 'sauce' },
};

export const MENU_ITEMS: Product[] = [
  // Burgers (6 items)
  {
    id: 'burger-classic',
    name: 'Сербский Классический',
    description: 'Сочная плескавица в домашней булочке с традиционными овощами',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center',
    price: 350,
    category: 'burgers',
    baseIngredients: ['bun-classic', 'patty-beef', 'veg-tomato', 'veg-lettuce', 'veg-onion', 'sauce-ketchup'],
    availableIngredients: [
      'bun-brioche', 'bun-whole-grain', 'patty-chicken', 'patty-double', 'patty-veggie',
      'cheese-cheddar', 'cheese-blue', 'cheese-mozzarella', 'cheese-parmesan',
      'veg-pickle', 'veg-jalapeno', 'veg-cucumber', 'veg-spinach',
      'addon-bacon', 'addon-egg', 'addon-avocado', 'addon-mushrooms',
      'sauce-bbq', 'sauce-mayo', 'sauce-garlic', 'sauce-spicy'
    ]
  },
  {
    id: 'burger-cheesy',
    name: 'Сырный Взрыв',
    description: 'Много сыра не бывает - двойная порция чеддера и моцареллы',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center',
    price: 420,
    category: 'burgers',
    baseIngredients: ['bun-classic', 'patty-beef', 'cheese-cheddar', 'cheese-mozzarella', 'sauce-mayo'],
    availableIngredients: [
      'bun-brioche', 'patty-double', 'patty-veggie',
      'cheese-blue', 'cheese-parmesan',
      'veg-lettuce', 'veg-tomato', 'veg-onion', 'veg-pickle', 'veg-jalapeno',
      'addon-bacon', 'addon-egg', 'addon-avocado',
      'sauce-bbq', 'sauce-garlic', 'sauce-spicy'
    ]
  },
  {
    id: 'burger-spicy',
    name: 'Острый Серб',
    description: 'Для любителей остренького с халапеньо и острым соусом',
    image: 'https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=300&fit=crop&crop=center',
    price: 390,
    category: 'burgers',
    baseIngredients: ['bun-classic', 'patty-beef', 'veg-tomato', 'veg-lettuce', 'veg-jalapeno', 'sauce-spicy'],
    availableIngredients: [
      'bun-brioche', 'patty-double', 'patty-chicken',
      'cheese-cheddar', 'cheese-blue',
      'veg-onion', 'veg-pickle', 'veg-cucumber',
      'addon-bacon', 'addon-egg',
      'sauce-bbq', 'sauce-mayo', 'sauce-garlic'
    ]
  },
  {
    id: 'burger-veggie',
    name: 'Вегетарианский',
    description: 'Нежная овощная котлета с свежими овощами и авокадо',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop&crop=center',
    price: 380,
    category: 'burgers',
    baseIngredients: ['bun-whole-grain', 'patty-veggie', 'veg-tomato', 'veg-lettuce', 'veg-cucumber', 'veg-spinach', 'addon-avocado', 'sauce-garlic'],
    availableIngredients: [
      'bun-brioche', 'bun-classic',
      'cheese-mozzarella', 'cheese-parmesan',
      'veg-onion', 'veg-pickle', 'veg-jalapeno',
      'addon-mushrooms',
      'sauce-mayo', 'sauce-bbq'
    ]
  },
  {
    id: 'burger-bacon',
    name: 'Бекон Бомба',
    description: 'Классика + хрустящий бекон + яйцо',
    image: 'https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=300&fit=crop&crop=center',
    price: 450,
    category: 'burgers',
    baseIngredients: ['bun-brioche', 'patty-beef', 'addon-bacon', 'addon-egg', 'cheese-cheddar', 'veg-tomato', 'veg-lettuce', 'sauce-bbq'],
    availableIngredients: [
      'bun-classic', 'patty-double', 'patty-chicken',
      'cheese-blue', 'cheese-mozzarella',
      'veg-onion', 'veg-pickle', 'veg-jalapeno', 'veg-cucumber',
      'addon-avocado', 'addon-mushrooms',
      'sauce-mayo', 'sauce-garlic', 'sauce-spicy'
    ]
  },
  {
    id: 'burger-double',
    name: 'Двойной Серб',
    description: 'Двойная порция мяса для настоящих гурманов',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop&crop=center',
    price: 520,
    category: 'burgers',
    baseIngredients: ['bun-brioche', 'patty-double', 'cheese-cheddar', 'cheese-mozzarella', 'veg-tomato', 'veg-lettuce', 'veg-onion', 'sauce-bbq'],
    availableIngredients: [
      'bun-classic', 'bun-whole-grain',
      'cheese-blue', 'cheese-parmesan',
      'veg-pickle', 'veg-jalapeno', 'veg-cucumber', 'veg-spinach',
      'addon-bacon', 'addon-egg', 'addon-avocado', 'addon-mushrooms',
      'sauce-mayo', 'sauce-garlic', 'sauce-spicy'
    ]
  },

  // Drinks (4 items)
  {
    id: 'cola',
    name: 'Coca-Cola',
    description: 'Классический вкус - освежает и бодрит',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop&crop=center',
    price: 120,
    category: 'drinks'
  },
  {
    id: 'sprite',
    name: 'Sprite',
    description: 'Лимон-лайм, освежающий и легкий',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=300&fit=crop&crop=center',
    price: 120,
    category: 'drinks'
  },
  {
    id: 'fanta-orange',
    name: 'Fanta Апельсин',
    description: 'Яркий апельсиновый вкус для хорошего настроения',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop&crop=center',
    price: 120,
    category: 'drinks'
  },
  {
    id: 'mineral-water',
    name: 'Минеральная вода',
    description: 'Природная вода с газами, полезная для здоровья',
    image: 'https://images.unsplash.com/photo-1564415075618-47e8f29b9b4c?w=400&h=300&fit=crop&crop=center',
    price: 80,
    category: 'drinks'
  },

  // Snacks (5 items)
  {
    id: 'fries',
    name: 'Картофель Фри',
    description: 'Золотистый картофель фри с солью',
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop&crop=center',
    price: 150,
    category: 'snacks'
  },
  {
    id: 'fries-cheese',
    name: 'Картофель с сыром',
    description: 'Фри с расплавленным чеддером и зеленью',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&h=300&fit=crop&crop=center',
    price: 200,
    category: 'snacks'
  },
  {
    id: 'onion-rings',
    name: 'Луковые кольца',
    description: 'Хрустящие кольца лука в панировке',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop&crop=center',
    price: 180,
    category: 'snacks'
  },
  {
    id: 'mozzarella-sticks',
    name: 'Палочки Моцарелла',
    description: 'Сырные палочки в хрустящей панировке с соусом',
    image: 'https://images.unsplash.com/photo-1541599468348-e96984315621?w=400&h=300&fit=crop&crop=center',
    price: 220,
    category: 'snacks'
  },
  {
    id: 'chicken-nuggets',
    name: 'Куриные наггетсы',
    description: 'Нежное куриное мясо в панировке (6 шт)',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop&crop=center',
    price: 250,
    category: 'snacks'
  },

  // Sauces (6 items)
  {
    id: 'sauce-cup-cheese',
    name: 'Сырный соус',
    description: 'Тягучий сырный соус для обмакивания',
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&h=300&fit=crop&crop=center',
    price: 40,
    category: 'sauces'
  },
  {
    id: 'sauce-cup-bbq',
    name: 'Барбекю',
    description: 'Сладко-острый соус с дымком',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop&crop=center',
    price: 40,
    category: 'sauces'
  },
  {
    id: 'sauce-cup-garlic',
    name: 'Чесночный',
    description: 'Острый чесночный соус с травами',
    image: 'https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=300&fit=crop&crop=center',
    price: 40,
    category: 'sauces'
  },
  {
    id: 'sauce-cup-spicy',
    name: 'Острый',
    description: 'Для любителей жара',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop&crop=center',
    price: 40,
    category: 'sauces'
  },
  {
    id: 'sauce-cup-mayo',
    name: 'Майонез',
    description: 'Классический майонез',
    image: 'https://images.unsplash.com/photo-1627625802912-208e587a8a23?w=400&h=300&fit=crop&crop=center',
    price: 30,
    category: 'sauces'
  },
  {
    id: 'sauce-cup-ketchup',
    name: 'Кетчуп',
    description: 'Традиционный томатный кетчуп',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&h=300&fit=crop&crop=center',
    price: 30,
    category: 'sauces'
  }
];


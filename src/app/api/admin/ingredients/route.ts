import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { z } from 'zod';

// Схема валидации для ингредиента
const IngredientSchema = z.object({
  name: z.string().min(1, 'Название ингредиента обязательно'),
  price: z.number().min(0, 'Цена должна быть положительной или нулевой'),
  type: z.string().min(1, 'Тип ингредиента обязателен'),
});

// GET - Получить все ингредиенты
export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        i.id, i.name, i.price, i.type,
        COUNT(pi."productId") as usage_count
      FROM "Ingredient" i
      LEFT JOIN "ProductIngredient" pi ON i.id = pi."ingredientId"
      GROUP BY i.id, i.name, i.price, i.type
      ORDER BY i.type ASC, i.name ASC
    `;

    const result = await client.query(query);

    const ingredients = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      type: row.type,
      _count: {
        productIngredients: parseInt(row.usage_count)
      }
    }));

    await client.end();
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Создать новый ингредиент
export async function POST(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const json = await request.json();
    const validation = IngredientSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { name, price, type } = validation.data;

    await client.connect();

    // Генерируем UUID
    const idQuery = await client.query('SELECT gen_random_uuid() as id');
    const id = idQuery.rows[0].id;

    const insertQuery = `
      INSERT INTO "Ingredient" (id, name, price, type, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, price, type
    `;

    const result = await client.query(insertQuery, [id, name, price, type]);
    const ingredient = result.rows[0];

    await client.end();

    return NextResponse.json({
      ...ingredient,
      price: parseFloat(ingredient.price),
      _count: {
        productIngredients: 0
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ error: 'Ошибка при создании ингредиента' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { z } from 'zod';

// Схема валидации для обновления ингредиента
const UpdateIngredientSchema = z.object({
  name: z.string().min(1, 'Название ингредиента обязательно').optional(),
  price: z.number().min(0, 'Цена должна быть положительной или нулевой').optional(),
  type: z.string().min(1, 'Тип ингредиента обязателен').optional(),
});

// GET - Получить ингредиент по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const { id } = await params;
    await client.connect();

    const query = `
      SELECT 
        i.id, i.name, i.price, i.type,
        COUNT(pi."productId") as usage_count
      FROM "Ingredient" i
      LEFT JOIN "ProductIngredient" pi ON i.id = pi."ingredientId"
      WHERE i.id = $1
      GROUP BY i.id, i.name, i.price, i.type
    `;

    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Ингредиент не найден' }, { status: 404 });
    }

    const row = result.rows[0];
    const ingredient = {
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      type: row.type,
      _count: {
        productIngredients: parseInt(row.usage_count)
      }
    };

    await client.end();
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json({ error: 'Ошибка при получении ингредиента' }, { status: 500 });
  }
}

// PUT - Обновить ингредиент
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const json = await request.json();
    const validation = UpdateIngredientSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { id } = await params;
    const { name, price, type } = validation.data;

    await client.connect();

    // Проверяем существование
    const check = await client.query('SELECT id FROM "Ingredient" WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Ингредиент не найден' }, { status: 404 });
    }

    // Обновляем
    let updateQuery = 'UPDATE "Ingredient" SET "updatedAt" = NOW()';
    const values: (string | number)[] = [id];
    let paramIndex = 2;

    if (name !== undefined) {
      updateQuery += `, name = $${paramIndex}`;
      values.push(name);
      paramIndex++;
    }
    if (price !== undefined) {
      updateQuery += `, price = $${paramIndex}`;
      values.push(price);
      paramIndex++;
    }
    if (type !== undefined) {
      updateQuery += `, type = $${paramIndex}`;
      values.push(type);
      paramIndex++;
    }

    updateQuery += ` WHERE id = $1 RETURNING *`;

    const result = await client.query(updateQuery, values);
    const updatedIngredient = result.rows[0];

    // Получаем usage count
    const countQuery = 'SELECT COUNT(*) as count FROM "ProductIngredient" WHERE "ingredientId" = $1';
    const countResult = await client.query(countQuery, [id]);

    await client.end();

    return NextResponse.json({
      ...updatedIngredient,
      price: parseFloat(updatedIngredient.price),
      _count: {
        productIngredients: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении ингредиента' }, { status: 500 });
  }
}

// DELETE - Удалить ингредиент
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const { id } = await params;
    await client.connect();

    // Проверяем использование
    const checkUsage = await client.query('SELECT COUNT(*) as count FROM "ProductIngredient" WHERE "ingredientId" = $1', [id]);
    const usageCount = parseInt(checkUsage.rows[0].count);

    if (usageCount > 0) {
      await client.end();
      return NextResponse.json({
        error: 'Невозможно удалить ингредиент, который используется в продуктах'
      }, { status: 400 });
    }

    const result = await client.query('DELETE FROM "Ingredient" WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      await client.end();
      return NextResponse.json({ error: 'Ингредиент не найден' }, { status: 404 });
    }

    await client.end();
    return NextResponse.json({ message: 'Ингредиент успешно удален' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: 'Ошибка при удалении ингредиента' }, { status: 500 });
  }
}

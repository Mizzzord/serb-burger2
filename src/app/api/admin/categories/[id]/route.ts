import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { z } from 'zod';

// Схема валидации для обновления категории
const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Название категории обязательно').optional(),
  slug: z.string().min(1, 'Slug категории обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только буквы, цифры и дефисы').optional(),
});

// GET - Получить категорию по ID
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
        c.id, c.name, c.slug,
        COUNT(p.id) as products_count
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.slug
    `;

    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }

    const row = result.rows[0];
    const category = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      _count: {
        products: parseInt(row.products_count)
      }
    };

    await client.end();
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Ошибка при получении категории' }, { status: 500 });
  }
}

// PUT - Обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const json = await request.json();
    const validation = UpdateCategorySchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { id } = await params;
    const { name, slug } = validation.data;

    await client.connect();

    // Проверяем, существует ли категория
    const checkQuery = 'SELECT id, slug FROM "Category" WHERE id = $1';
    const existing = await client.query(checkQuery, [id]);

    if (existing.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }

    const currentCategory = existing.rows[0];

    // Если меняем slug, проверяем, что он не занят другой категорией
    if (slug && slug !== currentCategory.slug) {
      const slugCheckQuery = 'SELECT id FROM "Category" WHERE slug = $1 AND id != $2';
      const slugExists = await client.query(slugCheckQuery, [slug, id]);

      if (slugExists.rows.length > 0) {
        await client.end();
        return NextResponse.json({
          error: 'Категория с таким slug уже существует'
        }, { status: 400 });
      }
    }

    // Формируем запрос обновления
    let updateQuery = 'UPDATE "Category" SET "updatedAt" = NOW()';
    const values = [id];
    let paramIndex = 2;

    if (name) {
      updateQuery += `, name = $${paramIndex}`;
      values.push(name);
      paramIndex++;
    }

    if (slug) {
      updateQuery += `, slug = $${paramIndex}`;
      values.push(slug);
      paramIndex++;
    }

    updateQuery += ` WHERE id = $1 RETURNING id, name, slug`;

    const result = await client.query(updateQuery, values);
    const updatedCategory = result.rows[0];

    // Получаем обновленное количество продуктов (хотя оно не должно меняться при обновлении категории, но для консистентности)
    const countQuery = 'SELECT COUNT(*) as count FROM "Product" WHERE "categoryId" = $1';
    const countResult = await client.query(countQuery, [id]);
    
    await client.end();

    return NextResponse.json({
      ...updatedCategory,
      _count: {
        products: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении категории' }, { status: 500 });
  }
}

// DELETE - Удалить категорию
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

    // Проверяем, существует ли категория и есть ли у нее продукты
    const checkQuery = `
      SELECT 
        c.id, 
        COUNT(p.id) as products_count
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      WHERE c.id = $1
      GROUP BY c.id
    `;
    
    const result = await client.query(checkQuery, [id]);

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }

    const productsCount = parseInt(result.rows[0].products_count);

    if (productsCount > 0) {
      await client.end();
      return NextResponse.json({
        error: 'Невозможно удалить категорию, содержащую продукты'
      }, { status: 400 });
    }

    // Удаляем категорию
    await client.query('DELETE FROM "Category" WHERE id = $1', [id]);

    await client.end();
    return NextResponse.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Ошибка при удалении категории' }, { status: 500 });
  }
}

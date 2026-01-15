import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Схема валидации для категории
const CategorySchema = z.object({
  name: z.string().min(1, 'Название категории обязательно'),
  slug: z.string().min(1, 'Slug категории обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только буквы, цифры и дефисы'),
});

// GET - Получить все категории с количеством продуктов
export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        c.id, c.name, c.slug,
        COUNT(p.id) as products_count
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.name ASC
    `;

    const result = await client.query(query);

    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      _count: {
        products: parseInt(row.products_count)
      }
    }));

    await client.end();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);

    // В случае ошибки возвращаем пустой массив вместо объекта с ошибкой
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Создать новую категорию
export async function POST(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const json = await request.json();
    const validation = CategorySchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { name, slug } = validation.data;

    await client.connect();

    // Проверяем, существует ли уже категория с таким slug
    const checkQuery = 'SELECT id FROM "Category" WHERE slug = $1';
    const existing = await client.query(checkQuery, [slug]);

    if (existing.rows.length > 0) {
      await client.end();
      return NextResponse.json({
        error: 'Категория с таким slug уже существует'
      }, { status: 400 });
    }

    // Генерируем UUID
    const idQuery = await client.query('SELECT gen_random_uuid() as id');
    const id = idQuery.rows[0].id;

    const insertQuery = `
      INSERT INTO "Category" (id, name, slug, "updatedAt")
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, slug
    `;

    const result = await client.query(insertQuery, [id, name, slug]);
    const newCategory = result.rows[0];

    await client.end();

    return NextResponse.json({
      ...newCategory,
      _count: { products: 0 }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Ошибка при создании категории' }, { status: 500 });
  }
}
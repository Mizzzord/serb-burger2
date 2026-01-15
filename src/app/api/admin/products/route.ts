import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { z } from 'zod';

// Схема валидации для продукта
const ProductSchema = z.object({
  name: z.string().min(1, 'Название продукта обязательно'),
  description: z.string().optional(),
  image: z.string().url('Некорректный URL изображения').optional().or(z.literal('')),
  price: z.number().min(0, 'Цена должна быть положительной'),
  categoryId: z.string().min(1, 'Категория обязательна'),
});

// GET - Получить все продукты с категориями
export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        p.id, p.name, p.description, p.price, p."image", p."categoryId",
        c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
        (SELECT COUNT(*) FROM "OrderItem" oi WHERE oi."productId" = p.id) as order_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'ingredientId', pi."ingredientId",
              'selectionType', pi."selectionType",
              'isRequired', pi."isRequired",
              'maxQuantity', pi."maxQuantity",
              'sortOrder', pi."sortOrder",
              'ingredient', json_build_object(
                'id', i.id,
                'name', i.name,
                'price', i.price,
                'type', i.type
              )
            ) ORDER BY pi."sortOrder" ASC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "ProductIngredient" pi ON p.id = pi."productId"
      LEFT JOIN "Ingredient" i ON pi."ingredientId" = i.id
      GROUP BY p.id, p.name, p.description, p.price, p."image", p."categoryId", c.id, c.name, c.slug
      ORDER BY p.name ASC
    `;

    const result = await client.query(query);

    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      image: row.image,
      price: parseFloat(row.price),
      categoryId: row.categoryId,
      category: {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug
      },
      productIngredients: row.ingredients,
      _count: {
        orderItems: parseInt(row.order_count)
      }
    }));

    await client.end();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Создать новый продукт
export async function POST(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const json = await request.json();
    const validation = ProductSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { name, description, image, price, categoryId } = validation.data;

    await client.connect();

    // Проверяем, существует ли категория
    const catCheck = await client.query('SELECT id, name, slug FROM "Category" WHERE id = $1', [categoryId]);
    
    if (catCheck.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 400 });
    }
    
    const category = catCheck.rows[0];

    // Генерируем UUID
    const idQuery = await client.query('SELECT gen_random_uuid() as id');
    const id = idQuery.rows[0].id;

    const insertQuery = `
      INSERT INTO "Product" (id, name, description, image, price, "categoryId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, description, image, price, "categoryId"
    `;

    const result = await client.query(insertQuery, [id, name, description || null, image || null, price, categoryId]);
    const product = result.rows[0];

    await client.end();

    return NextResponse.json({
      ...product,
      price: parseFloat(product.price),
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      productIngredients: []
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Ошибка при создании продукта' }, { status: 500 });
  }
}

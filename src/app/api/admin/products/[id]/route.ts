import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { z } from 'zod';

// Схема валидации для обновления продукта
const UpdateProductSchema = z.object({
  name: z.string().min(1, 'Название продукта обязательно').optional(),
  description: z.string().optional(),
  image: z.string().url('Некорректный URL изображения').optional().or(z.literal('')).optional(),
  price: z.number().min(0, 'Цена должна быть положительной').optional(),
  categoryId: z.string().min(1, 'Категория обязательна').optional(),
});

// GET - Получить продукт по ID
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
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.description, p.price, p."image", p."categoryId", c.id, c.name, c.slug
    `;

    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    const row = result.rows[0];
    const product = {
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
    };

    await client.end();
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Ошибка при получении продукта' }, { status: 500 });
  }
}

// PUT - Обновить продукт
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const json = await request.json();
    const validation = UpdateProductSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { id } = await params;
    const { name, description, image, price, categoryId } = validation.data;

    await client.connect();

    // Проверяем существование продукта
    const checkProduct = await client.query('SELECT id FROM "Product" WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    // Если меняем категорию, проверяем её существование
    if (categoryId) {
      const checkCategory = await client.query('SELECT id FROM "Category" WHERE id = $1', [categoryId]);
      if (checkCategory.rows.length === 0) {
        await client.end();
        return NextResponse.json({ error: 'Категория не найдена' }, { status: 400 });
      }
    }

    // Формируем запрос обновления
    let updateQuery = 'UPDATE "Product" SET "updatedAt" = NOW()';
    const values: (string | number | null)[] = [id];
    let paramIndex = 2;

    if (name !== undefined) {
      updateQuery += `, name = $${paramIndex}`;
      values.push(name);
      paramIndex++;
    }
    if (description !== undefined) {
      updateQuery += `, description = $${paramIndex}`;
      values.push(description);
      paramIndex++;
    }
    if (image !== undefined) {
      updateQuery += `, image = $${paramIndex}`;
      values.push(image || null);
      paramIndex++;
    }
    if (price !== undefined) {
      updateQuery += `, price = $${paramIndex}`;
      values.push(price);
      paramIndex++;
    }
    if (categoryId !== undefined) {
      updateQuery += `, "categoryId" = $${paramIndex}`;
      values.push(categoryId);
      paramIndex++;
    }

    updateQuery += ` WHERE id = $1 RETURNING *`;

    await client.query(updateQuery, values);

    // Получаем обновленный продукт с отношениями (повторяем логику GET)
    const getQuery = `
      SELECT 
        p.id, p.name, p.description, p.price, p."image", p."categoryId",
        c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
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
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.description, p.price, p."image", p."categoryId", c.id, c.name, c.slug
    `;

    const result = await client.query(getQuery, [id]);
    const row = result.rows[0];

    const updatedProduct = {
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
      productIngredients: row.ingredients
    };

    await client.end();
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении продукта' }, { status: 500 });
  }
}

// DELETE - Удалить продукт
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

    // Проверяем использование в заказах
    const checkOrders = await client.query('SELECT COUNT(*) as count FROM "OrderItem" WHERE "productId" = $1', [id]);
    const orderCount = parseInt(checkOrders.rows[0].count);

    if (orderCount > 0) {
      await client.end();
      return NextResponse.json({
        error: 'Невозможно удалить продукт, который используется в заказах'
      }, { status: 400 });
    }

    // Удаляем (ProductIngredient удалится каскадно на уровне БД, если настроено, или нужно удалить вручную)
    // В Prisma схеме onDelete: Cascade, но в БД это должно быть тоже. 
    // Предполагаем, что FK настроены.
    const result = await client.query('DELETE FROM "Product" WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      await client.end();
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    await client.end();
    return NextResponse.json({ message: 'Продукт успешно удален' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Ошибка при удалении продукта' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    // Получаем продукты с категориями и ингредиентами через SQL
    const query = `
      SELECT
        p.id, p.name, p.description, p.price, p."image",
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'name', i.name,
              'price', i.price,
              'type', i.type,
              'selectionType', pi."selectionType",
              'isRequired', pi."isRequired",
              'maxQuantity', pi."maxQuantity"
            ) ORDER BY pi."sortOrder"
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "ProductIngredient" pi ON p.id = pi."productId"
      LEFT JOIN "Ingredient" i ON pi."ingredientId" = i.id
      GROUP BY p.id, p.name, p.description, p.price, p."image", c.id, c.name, c.slug
      ORDER BY c.name ASC, p.name ASC
    `;

    const result = await client.query(query);

    // Группируем по категориям
    const categories = result.rows.reduce((acc, row) => {
      const categorySlug = row.category_slug;
      if (!acc[categorySlug]) {
        acc[categorySlug] = {
          id: row.category_id,
          name: row.category_name,
          slug: categorySlug,
          items: []
        };
      }

      acc[categorySlug].items.push({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        image: row.image,
        category: categorySlug,
        ingredients: row.ingredients
      });

      return acc;
    }, {} as Record<string, any>);

    const menuData = Object.values(categories);

    await client.end();
    return NextResponse.json(menuData);

  } catch (error: any) {
    console.error('Error fetching menu:', error);

    // В случае ошибки возвращаем пустое меню
    return NextResponse.json([], { status: 200 });
  }
}


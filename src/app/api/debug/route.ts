import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    // Тест подключения
    const dbTest = await client.query('SELECT version()');
    
    // Проверяем количество продуктов
    const productsCount = await client.query('SELECT COUNT(*) as count FROM "Product"');
    
    // Получаем пример продуктов
    const products = await client.query('SELECT id, name, price FROM "Product" LIMIT 3');
    
    // Проверяем категории
    const categories = await client.query('SELECT id, name, slug FROM "Category"');
    
    // Проверяем ингредиенты
    const ingredients = await client.query('SELECT COUNT(*) as count FROM "Ingredient"');
    
    await client.end();
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        version: dbTest.rows[0].version.split(' ')[1],
        productsCount: parseInt(productsCount.rows[0].count),
        categoriesCount: categories.rows.length,
        ingredientsCount: parseInt(ingredients.rows[0].count)
      },
      sampleData: {
        products: products.rows,
        categories: categories.rows
      },
      message: 'Database connection successful!'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        connected: false
      }
    }, { status: 500 });
  }
}

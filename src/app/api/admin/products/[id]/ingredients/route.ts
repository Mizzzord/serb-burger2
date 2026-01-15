import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для связи продукт-ингредиент
const ProductIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'ID ингредиента обязателен'),
  selectionType: z.enum(['single', 'multiple'], {
    message: 'Тип выбора должен быть single или multiple'
  }),
  isRequired: z.boolean().default(false),
  maxQuantity: z.number().min(1).optional(),
  sortOrder: z.number().min(0).default(0),
});

// GET - Получить все ингредиенты продукта
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем, существует ли продукт
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    const productIngredients = await prisma.productIngredient.findMany({
      where: { productId: id },
      include: {
        ingredient: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(productIngredients);
  } catch (error) {
    console.error('Error fetching product ingredients:', error);
    return NextResponse.json({ error: 'Ошибка при получении ингредиентов продукта' }, { status: 500 });
  }
}

// POST - Добавить ингредиент к продукту
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const json = await request.json();
    const validation = ProductIngredientSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { id } = await params;
    const { ingredientId, selectionType, isRequired, maxQuantity, sortOrder } = validation.data;

    // Проверяем, существует ли продукт
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    // Проверяем, существует ли ингредиент
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return NextResponse.json({ error: 'Ингредиент не найден' }, { status: 400 });
    }

    // Проверяем, не добавлен ли уже этот ингредиент к продукту
    const existingLink = await prisma.productIngredient.findUnique({
      where: {
        productId_ingredientId: {
          productId: id,
          ingredientId
        }
      }
    });

    if (existingLink) {
      return NextResponse.json({
        error: 'Этот ингредиент уже добавлен к продукту'
      }, { status: 400 });
    }

    const productIngredient = await prisma.productIngredient.create({
      data: {
        productId: id,
        ingredientId,
        selectionType,
        isRequired,
        maxQuantity,
        sortOrder
      },
      include: {
        ingredient: true
      }
    });

    return NextResponse.json(productIngredient, { status: 201 });
  } catch (error) {
    console.error('Error adding ingredient to product:', error);
    return NextResponse.json({ error: 'Ошибка при добавлении ингредиента к продукту' }, { status: 500 });
  }
}

// DELETE - Удалить все ингредиенты продукта (для массового обновления)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем, существует ли продукт
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    await prisma.productIngredient.deleteMany({
      where: { productId: id }
    });

    return NextResponse.json({ message: 'Все ингредиенты продукта удалены' });
  } catch (error) {
    console.error('Error clearing product ingredients:', error);
    return NextResponse.json({ error: 'Ошибка при удалении ингредиентов продукта' }, { status: 500 });
  }
}
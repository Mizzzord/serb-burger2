import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для обновления связи продукт-ингредиент
const UpdateProductIngredientSchema = z.object({
  selectionType: z.enum(['single', 'multiple']).optional(),
  isRequired: z.boolean().optional(),
  maxQuantity: z.number().min(1).optional(),
  sortOrder: z.number().min(0).optional(),
});

// PUT - Обновить настройки ингредиента для продукта
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const json = await request.json();
    const validation = UpdateProductIngredientSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Некорректные данные',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { id, ingredientId } = await params;
    const { selectionType, isRequired, maxQuantity, sortOrder } = validation.data;

    // Ищем существующую связь
    const existingLink = await prisma.productIngredient.findUnique({
      where: {
        productId_ingredientId: {
          productId: id,
          ingredientId
        }
      },
      include: {
        ingredient: true
      }
    });

    if (!existingLink) {
      return NextResponse.json({
        error: 'Связь между продуктом и ингредиентом не найдена'
      }, { status: 404 });
    }

    const updatedLink = await prisma.productIngredient.update({
      where: {
        productId_ingredientId: {
          productId: id,
          ingredientId
        }
      },
      data: {
        ...(selectionType !== undefined && { selectionType }),
        ...(isRequired !== undefined && { isRequired }),
        ...(maxQuantity !== undefined && { maxQuantity }),
        ...(sortOrder !== undefined && { sortOrder })
      },
      include: {
        ingredient: true
      }
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating product ingredient:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении настроек ингредиента' }, { status: 500 });
  }
}

// DELETE - Удалить ингредиент из продукта
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const { id, ingredientId } = await params;

    // Ищем существующую связь
    const existingLink = await prisma.productIngredient.findUnique({
      where: {
        productId_ingredientId: {
          productId: id,
          ingredientId
        }
      }
    });

    if (!existingLink) {
      return NextResponse.json({
        error: 'Связь между продуктом и ингредиентом не найдена'
      }, { status: 404 });
    }

    await prisma.productIngredient.delete({
      where: {
        productId_ingredientId: {
          productId: id,
          ingredientId
        }
      }
    });

    return NextResponse.json({ message: 'Ингредиент успешно удален из продукта' });
  } catch (error) {
    console.error('Error removing ingredient from product:', error);
    return NextResponse.json({ error: 'Ошибка при удалении ингредиента из продукта' }, { status: 500 });
  }
}
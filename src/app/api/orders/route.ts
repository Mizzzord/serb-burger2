import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    selectedIngredients: z.array(z.object({
      id: z.string(),
      price: z.number(),
    })),
    totalPrice: z.number(),
  })),
  totalAmount: z.number().min(1),
  paymentMethod: z.enum(['card', 'cash']),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validation = OrderSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Некорректные данные заказа' 
      }, { status: 400 });
    }

    const { items, totalAmount, paymentMethod } = validation.data;

    // Создаем заказ в базе данных
    const order = await prisma.order.create({
      data: {
        totalAmount,
        paymentMethod,
        status: 'preparing',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.totalPrice,
            // Сохраняем выбранные ингредиенты как JSON для простоты отображения
            selectedIngredients: JSON.stringify(item.selectedIngredients)
          }))
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.number,
      message: 'Заказ успешно создан' 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: 'Ошибка сервера при создании заказа' }, { status: 500 });
  }
}

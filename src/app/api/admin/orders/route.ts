import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Проверяем, что мы не во время сборки
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }

    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'completed' }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    });

    // Форматируем данные для фронтенда
    const formattedOrders = orders.map(order => ({
      id: order.id,
      number: order.number,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productName: 'Товар', // В идеале нужно делать Join с таблицей Product
        quantity: item.quantity,
        totalPrice: item.price,
        selectedIngredients: JSON.parse(item.selectedIngredients as string || '[]')
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();
    
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

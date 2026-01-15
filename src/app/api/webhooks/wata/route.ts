import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const WebhookSchema = z.object({
  status: z.enum(['success', 'failed', 'pending']),
  transaction_id: z.string(),
  order_id: z.string(),
  amount: z.number().optional(),
  signature: z.string().optional(),
});

/**
 * Обработчик вебхуков от WATA Pay
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const json = JSON.parse(rawBody);
    
    const validation = WebhookSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { status, transaction_id, order_id } = validation.data;

    // СЕКЬЮРИТИ: Проверка подписи (Signature Verification)
    // В продакшене обязательно нужно проверять подпись от WATA, 
    // чтобы предотвратить фейковые уведомления об оплате.
    
    const wataKey = process.env.WATA_API_KEY;
    if (wataKey) {
      // Пример проверки (зависит от конкретного API WATA):
      // const expectedSignature = crypto
      //   .createHmac('sha256', wataKey)
      //   .update(rawBody)
      //   .digest('hex');
      //
      // if (expectedSignature !== json.signature) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      // }
    }

    console.log(`WATA Webhook received: Order ${order_id}, Status ${status}`);

    if (status === 'success') {
      // В реальном приложении здесь обновляем БД
      console.log(`Order ${order_id} marked as PAID`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}


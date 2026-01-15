import axios from 'axios';

const WATA_API_URL = process.env.WATA_API_URL || 'https://api.watapay.io/v1';
const WATA_API_KEY = process.env.WATA_API_KEY;
const WATA_SHOP_ID = process.env.WATA_SHOP_ID;

/**
 * Интеграция с WATA Pay (упрощенная схема на основе стандартных платежных API)
 */
export const processPayment = async (amount: number, method: 'card' | 'cash'): Promise<{ success: boolean; checkoutUrl?: string; transactionId?: string; error?: string }> => {
  if (method === 'cash') {
    if (amount > 500) {
      return { success: false, error: 'Оплата наличными доступна только для заказов до 500 ₽' };
    }
    return { success: true, transactionId: `cash-${Date.now()}` };
  }

  // Реальная интеграция с WATA
  try {
    if (!WATA_API_KEY || !WATA_SHOP_ID) {
      console.warn('WATA API Key or Shop ID is missing. Using mock payment.');
      return { success: true, checkoutUrl: '#mock-payment', transactionId: `wata-mock-${Date.now()}` };
    }

    const response = await axios.post(`${WATA_API_URL}/payments`, {
      shop_id: WATA_SHOP_ID,
      amount: amount,
      currency: 'RUB',
      description: 'Заказ в Serb Burger',
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success`,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/wata`,
    }, {
      headers: {
        'Authorization': `Bearer ${WATA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.checkout_url) {
      return { success: true, checkoutUrl: response.data.checkout_url, transactionId: response.data.id };
    }

    return { success: false, error: 'Не удалось инициировать платеж через WATA' };
  } catch (error: any) {
    console.error('WATA Payment Error:', error.response?.data || error.message);
    return { success: false, error: 'Ошибка при обращении к платежному шлюзу' };
  }
};

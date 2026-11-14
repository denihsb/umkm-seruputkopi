import { describe, expect, it } from 'vitest';

import {
  orderStatusLabels,
  orderTypeLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from './labels.js';

describe('labels', () => {
  it('menyediakan label Indonesia untuk transaksi', () => {
    expect(orderTypeLabels).toEqual({
      take_away: 'Bawa pulang',
      dine_in: 'Makan di tempat',
    });
    expect(paymentMethodLabels).toEqual({
      cash: 'Tunai',
      qris_sim: 'QRIS (simulasi)',
    });
    expect(paymentStatusLabels).toEqual({
      pending: 'Belum dibayar',
      paid: 'Lunas',
    });
    expect(orderStatusLabels).toEqual({
      received: 'Diterima',
      processing: 'Diproses',
      ready: 'Siap',
      completed: 'Selesai',
    });
  });
});

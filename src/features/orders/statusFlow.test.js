import { describe, expect, it } from 'vitest';

import { getNextActionLabel, getNextStatus, STATUS_ORDER } from './statusFlow.js';

describe('statusFlow', () => {
  it('menyusun status pesanan dalam urutan maju', () => {
    expect(STATUS_ORDER).toEqual(['received', 'processing', 'ready', 'completed']);
    expect(getNextStatus('received')).toBe('processing');
    expect(getNextStatus('processing')).toBe('ready');
    expect(getNextStatus('ready')).toBe('completed');
    expect(getNextStatus('completed')).toBeNull();
  });

  it('mengembalikan label aksi untuk setiap status aktif', () => {
    expect(getNextActionLabel('received')).toBe('Proses pesanan');
    expect(getNextActionLabel('processing')).toBe('Tandai siap');
    expect(getNextActionLabel('ready')).toBe('Tandai selesai');
    expect(getNextActionLabel('completed')).toBeNull();
  });

  it('mengembalikan null untuk status yang tidak dikenal', () => {
    expect(getNextStatus('unknown')).toBeNull();
    expect(getNextActionLabel('unknown')).toBeNull();
  });
});

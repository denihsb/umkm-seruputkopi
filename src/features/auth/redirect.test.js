import { describe, expect, it } from 'vitest';

import { getHomePath, getPostLoginPath } from './redirect.js';

describe('redirect berdasarkan peran', () => {
  it('mengarahkan owner ke dashboard tanpa tujuan asal', () => {
    expect(getHomePath('owner')).toBe('/dashboard');
    expect(getPostLoginPath('owner')).toBe('/dashboard');
  });

  it('mengarahkan customer ke katalog tanpa tujuan asal', () => {
    expect(getHomePath('customer')).toBe('/');
    expect(getPostLoginPath('customer')).toBe('/');
  });

  it('mencegah customer masuk ke dashboard', () => {
    expect(getPostLoginPath('customer', '/dashboard')).toBe('/');
  });

  it('mempertahankan tujuan dashboard untuk owner', () => {
    expect(getPostLoginPath('owner', '/dashboard')).toBe('/dashboard');
  });

  it('mempertahankan tujuan katalog untuk customer', () => {
    expect(getPostLoginPath('customer', '/cart')).toBe('/cart');
  });
});

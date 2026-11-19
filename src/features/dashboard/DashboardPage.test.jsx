import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from './DashboardPage.jsx';

const { mockGetDashboardOverview } = vi.hoisted(() => ({ mockGetDashboardOverview: vi.fn() }));

vi.mock('./analyticsApi.js', () => ({ getDashboardOverview: mockGetDashboardOverview }));

const overview = {
  totalOrders: 2,
  revenue: 62000,
  average: 31000,
  unpaid: 35000,
  recentOrders: [
    {
      id: 'order-1',
      orderNumber: 'SRP-001',
      customerName: 'Deni',
      totalAmount: 27000,
      status: 'received',
      createdAt: '2026-11-14T06:45:00Z',
    },
    {
      id: 'order-2',
      orderNumber: 'SRP-002',
      customerName: 'Sari',
      totalAmount: 35000,
      status: 'processing',
      createdAt: '2026-11-13T06:45:00Z',
    },
  ],
  topProducts: [{ name: 'Kopi Susu Seruput', quantity: 5, revenue: 90000 }],
  chartDays: [
    { date: '2026-11-10', label: 'Sen', revenue: 0 },
    { date: '2026-11-11', label: 'Sel', revenue: 0 },
    { date: '2026-11-12', label: 'Rab', revenue: 0 },
    { date: '2026-11-13', label: 'Kam', revenue: 35000 },
    { date: '2026-11-14', label: 'Jum', revenue: 27000 },
    { date: '2026-11-15', label: 'Sab', revenue: 0 },
    { date: '2026-11-16', label: 'Min', revenue: 0 },
  ],
  periodLabel: '7 hari terakhir',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockGetDashboardOverview.mockReset();
    mockGetDashboardOverview.mockResolvedValue(overview);
  });

  afterEach(() => {
    cleanup();
  });

  it('menampilkan metrik ringkasan penjualan', async () => {
    renderPage();
    expect(await screen.findByText('Total Penjualan')).toBeInTheDocument();
    expect(screen.getByText('Jumlah Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Rata-rata Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Belum Lunas')).toBeInTheDocument();
    expect(screen.getByText('Rp62.000')).toBeInTheDocument();
  });

  it('menampilkan pesanan terbaru dan tautan detail', async () => {
    renderPage();
    expect(await screen.findByText('SRP-001')).toBeInTheDocument();
    expect(screen.getByText('SRP-002')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SRP-001/ })).toHaveAttribute(
      'href',
      '/dashboard/pesanan/order-1',
    );
  });

  it('mengganti periode laporan saat filter dipilih', async () => {
    renderPage();
    await screen.findByText('Menu Terlaris');
    fireEvent.click(screen.getByRole('button', { name: 'Hari ini' }));
    await waitFor(() => {
      expect(mockGetDashboardOverview).toHaveBeenLastCalledWith('today');
    });
  });

  it('menampilkan tinggi batang untuk nilai penjualan harian', async () => {
    renderPage();
    await screen.findByRole('img', { name: 'Grafik penjualan tujuh hari terakhir' });
    const chartColumns = document.querySelectorAll('.chart-column');
    const revenueBars = document.querySelectorAll('.chart-track > span');

    expect(chartColumns).toHaveLength(7);
    expect(revenueBars).toHaveLength(7);
    expect(revenueBars[3]).toHaveStyle({ height: '100%' });
    expect(Number.parseFloat(revenueBars[4].style.height)).toBeCloseTo(77.14, 2);
  });
});

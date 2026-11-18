import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import OrderStatusBadge from '@/components/OrderStatusBadge.jsx';
import { formatDateTime, formatRupiah } from '@/lib/format.js';
import { getDashboardOverview } from './analyticsApi.js';

function MetricCard({ label, value, note, icon }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('7days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getDashboardOverview(period)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period, refresh]);

  const maxRevenue = useMemo(
    () => Math.max(1, ...(data?.chartDays ?? []).map((day) => day.revenue)),
    [data],
  );

  return (
    <main className="admin-main">
      <div className="admin-page-heading">
        <div>
          <span className="section-kicker">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Ringkasan performa Seruput Kopi</p>
        </div>
        <div className="period-switch" aria-label="Pilih periode laporan">
          {[
            ['today', 'Hari ini'],
            ['7days', '7 Hari'],
            ['all', 'Semua'],
          ].map(([value, label]) => (
            <button
              aria-pressed={period === value}
              className={period === value ? 'selected' : ''}
              key={value}
              onClick={() => setPeriod(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-alert" role="alert">
          <span>{error}</span>
          <button onClick={() => setRefresh((value) => value + 1)} type="button">
            Muat ulang
          </button>
        </div>
      )}
      {loading ? (
        <div className="admin-loading-grid" aria-label="Memuat ringkasan">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : data ? (
        <>
          <section className="metric-grid" aria-label="Ringkasan penjualan">
            <MetricCard
              icon="↗"
              label="Total Penjualan"
              value={formatRupiah(data.revenue)}
              note={data.periodLabel}
            />
            <MetricCard
              icon="▣"
              label="Jumlah Pesanan"
              value={data.totalOrders.toLocaleString('id-ID')}
              note="Pesanan pada periode ini"
            />
            <MetricCard
              icon="◷"
              label="Rata-rata Pesanan"
              value={formatRupiah(data.average)}
              note="Nilai rata-rata transaksi"
            />
            <MetricCard
              icon="◌"
              label="Belum Lunas"
              value={formatRupiah(data.unpaid)}
              note="Menunggu pembayaran"
            />
          </section>
          <div className="dashboard-grid">
            <div className="dashboard-main-column">
              <section className="admin-panel sales-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Penjualan 7 Hari Terakhir</h2>
                    <p>Pergerakan omzet harian</p>
                  </div>
                  <span className="panel-tag">IDR</span>
                </div>
                <div
                  className="sales-chart"
                  role="img"
                  aria-label="Grafik penjualan tujuh hari terakhir"
                >
                  {data.chartDays.map((day) => (
                    <div className="chart-column" key={day.date}>
                      <span className="chart-value">
                        {day.revenue ? `${Math.round(day.revenue / 1000)}rb` : '0'}
                      </span>
                      <div className="chart-track">
                        <span
                          style={{
                            height: `${Math.max(day.revenue ? 5 : 1, (day.revenue / maxRevenue) * 100)}%`,
                          }}
                        />
                      </div>
                      <small>{day.label}</small>
                    </div>
                  ))}
                </div>
                <div className="chart-footnote">
                  Grafik menampilkan nilai penjualan dari transaksi yang tercatat.
                </div>
              </section>

              <section className="admin-panel top-products-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Menu Terlaris</h2>
                    <p>Produk dengan jumlah penjualan tertinggi</p>
                  </div>
                  <span className="panel-tag">TOP 3</span>
                </div>
                {data.topProducts.length ? (
                  <div className="top-products-list">
                    {data.topProducts.map((item, index) => (
                      <div className="top-product-row" key={item.name}>
                        <span className="rank-number">0{index + 1}</span>
                        <strong>{item.name}</strong>
                        <span>{item.quantity} terjual</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-admin-state">
                    Belum ada data penjualan menu pada periode ini.
                  </p>
                )}
              </section>
            </div>

            <section className="admin-panel recent-orders-panel">
              <div className="panel-heading">
                <div>
                  <h2>Pesanan Terbaru</h2>
                  <p>Aktivitas pesanan terakhir</p>
                </div>
                <Link to="/dashboard/transaksi">Lihat semua</Link>
              </div>
              {data.recentOrders.length ? (
                <div className="recent-order-list">
                  {data.recentOrders.map((order) => (
                    <Link
                      className="recent-order-card"
                      key={order.id}
                      to={`/dashboard/pesanan/${order.id}`}
                    >
                      <div className="recent-order-line">
                        <strong>{order.orderNumber}</strong>
                        <b>{formatRupiah(order.totalAmount)}</b>
                      </div>
                      <div className="recent-order-customer">
                        {order.customerName} · {formatDateTime(order.createdAt)}
                      </div>
                      <div className="recent-order-status">
                        <OrderStatusBadge status={order.status} />
                        <span>Detail →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="empty-admin-state">Belum ada pesanan masuk.</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}

import { useAuth } from '@/features/auth/useAuth.js';

export default function DashboardPage() {
  const { profile } = useAuth();
  const name = profile?.full_name ?? 'Pemilik';

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Halo, {name}. Dashboard pemilik akan diimplementasikan di US-19.</p>
    </main>
  );
}

import { useParams } from 'react-router-dom';

export default function MenuDetailPage() {
  const { id } = useParams();

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Detail Menu</h1>
      <p>Akan diimplementasikan di US-08</p>
      <p>ID menu: {id}</p>
    </main>
  );
}

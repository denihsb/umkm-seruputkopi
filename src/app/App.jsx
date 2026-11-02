import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">Seruput</h1>
        <p className="mt-2 text-ink">Ruang persiapan pemesanan kafe.</p>
        <Link className="mt-4 inline-block text-caramel underline" to="/">
          Beranda
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

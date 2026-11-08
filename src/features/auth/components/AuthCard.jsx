export default function AuthCard({ children, footer, subtitle, title }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-page px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-5 sm:p-8">
        <header className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-primary">Seruput</h1>
          <p className="mt-1 text-sm text-text-muted">Kopi &amp; Cerita</p>
        </header>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-text">{title}</h2>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-text">{footer}</div>}
      </section>
    </main>
  );
}

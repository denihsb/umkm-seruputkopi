# Seruput

Seruput adalah fondasi PWA pemesanan kafe untuk tugas kuliah Manajemen Proyek TI.
Repositori ini menggunakan Vite, React, Tailwind CSS, React Router, Supabase, dan Vitest.

## Prasyarat

- Node.js 24 atau lebih baru
- npm
- Salin `.env.example` menjadi `.env.local`, lalu isi URL Supabase dan anon key.

## Menjalankan proyek

```bash
npm install
npm run dev
```

## Script

- `npm run dev`: menjalankan server pengembangan
- `npm run lint` / `npm run lint:fix`: memeriksa atau memperbaiki lint
- `npm run format` / `npm run format:check`: memformat atau memeriksa format
- `npm run test` / `npm run test:watch`: menjalankan Vitest sekali atau dalam mode watch
- `npm run build`: membuat build produksi

## Struktur folder

Folder `src/features` menampung area auth, catalog, cart, checkout, dan dashboard.
Kode bersama berada di `src/components`, `src/hooks`, `src/lib`, dan `src/styles`.
Dokumentasi berada di `docs`, migrasi Supabase di `supabase/migrations`, dan aset publik di `public`.

## Branching dan PR

Gunakan GitFlow ringan: `main`, `develop`, dan `feature/US-XX-nama`.
Semua perubahan masuk melalui PR ke `develop` atau `main`, dan merge dilakukan dengan merge commit.

## Konvensi commit

Gunakan Conventional Commits dengan tipe `feat`, `fix`, `docs`, `test`, `refactor`, `style`,
atau `chore`. Scope bebas digunakan, misalnya `US-09` atau `BUG-014`.

Semua penggunaan AI harus dicatat di PR dan lampirannya, termasuk tool, berkas, tujuan,
dan cara verifikasi.

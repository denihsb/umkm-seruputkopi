import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatRupiah } from '@/lib/format.js';
import {
  addMenuAddon,
  listMenuAddons,
  listMenuCategories,
  listOwnerMenus,
  saveMenu,
  setMenuActive,
  setMenuAddonActive,
} from './menuApi.js';

const EMPTY_FORM = { name: '', categoryId: '', basePrice: '', description: '', imageUrl: '' };

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [addons, setAddons] = useState([]);
  const [addonForm, setAddonForm] = useState({ name: '', priceDelta: '0' });
  const [savingAddon, setSavingAddon] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextMenus, nextCategories] = await Promise.all([
        listOwnerMenus(),
        listMenuCategories(),
      ]);
      setMenus(nextMenus);
      setCategories(nextCategories);
      if (nextCategories.length)
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || String(nextCategories[0].id),
        }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let active = true;
    if (!selectedId) return undefined;
    listMenuAddons(selectedId)
      .then((result) => {
        if (active) setAddons(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const filteredMenus = useMemo(
    () =>
      menus.filter((menu) =>
        `${menu.name} ${menu.categoryName}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [menus, search],
  );

  function selectMenu(menu) {
    setAddons([]);
    setSelectedId(menu.id);
    setNotice('');
    setForm({
      name: menu.name,
      categoryId: String(menu.categoryId),
      basePrice: String(menu.basePrice),
      description: menu.description,
      imageUrl: menu.imageUrl,
    });
  }

  function startNewMenu() {
    setAddons([]);
    setSelectedId(null);
    setNotice('');
    setForm({ ...EMPTY_FORM, categoryId: categories[0] ? String(categories[0].id) : '' });
    setAddonForm({ name: '', priceDelta: '0' });
  }

  async function handleToggle(menu) {
    setError('');
    try {
      await setMenuActive(menu.id, !menu.isActive);
      setMenus((current) =>
        current.map((item) => (item.id === menu.id ? { ...item, isActive: !menu.isActive } : item)),
      );
      setNotice(
        `${menu.name} ${menu.isActive ? 'disembunyikan' : 'ditampilkan'} dari katalog pelanggan.`,
      );
    } catch (toggleError) {
      setError(toggleError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (
      !form.name.trim() ||
      !form.categoryId ||
      form.basePrice.trim() === '' ||
      !Number.isFinite(Number(form.basePrice)) ||
      Number(form.basePrice) < 0
    ) {
      setError('Lengkapi nama, kategori, dan harga dengan benar.');
      return;
    }
    setSaving(true);
    try {
      await saveMenu(form, selectedId);
      setNotice(
        selectedId ? 'Perubahan menu berhasil disimpan.' : 'Menu baru berhasil ditambahkan.',
      );
      if (!selectedId) {
        setSelectedId(null);
        setForm({ ...EMPTY_FORM, categoryId: categories[0] ? String(categories[0].id) : '' });
      }
      await loadData();
      if (selectedId) setAddons(await listMenuAddons(selectedId));
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAddon() {
    if (!selectedId || !addonForm.name.trim()) return;
    setSavingAddon(true);
    setError('');
    setNotice('');
    try {
      await addMenuAddon(selectedId, addonForm);
      setAddons(await listMenuAddons(selectedId));
      setAddonForm({ name: '', priceDelta: '0' });
      setNotice('Add-on berhasil ditambahkan ke menu.');
    } catch (addonError) {
      setError(addonError.message);
    } finally {
      setSavingAddon(false);
    }
  }

  async function handleToggleAddon(addon) {
    try {
      await setMenuAddonActive(addon.id, !addon.isActive);
      setAddons((current) =>
        current.map((item) =>
          item.id === addon.id ? { ...item, isActive: !addon.isActive } : item,
        ),
      );
    } catch (addonError) {
      setError(addonError.message);
    }
  }

  return (
    <main className="admin-main">
      <div className="admin-page-heading">
        <div>
          <span className="section-kicker">CATALOG MANAGEMENT</span>
          <h1>Kelola Menu</h1>
          <p>Atur daftar menu yang tampil di aplikasi pelanggan.</p>
        </div>
        <button className="admin-primary-button" onClick={startNewMenu} type="button">
          ＋ Tambah Menu
        </button>
      </div>

      {error && (
        <div className="admin-alert" role="alert">
          {error}
          <button onClick={loadData} type="button">
            Coba lagi
          </button>
        </div>
      )}
      {notice && (
        <p className="admin-success" role="status">
          ✓ {notice}
        </p>
      )}

      <div className="menu-manager-layout">
        <section className="admin-panel menu-list-panel">
          <div className="menu-list-toolbar">
            <div>
              <h2>Daftar Menu</h2>
              <p>{menus.length} item terdaftar</p>
            </div>
            <label className="admin-search">
              <span className="sr-only">Cari menu</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama menu..."
                value={search}
              />
              <span>⌕</span>
            </label>
          </div>
          {loading ? (
            <div className="admin-empty">Memuat data menu...</div>
          ) : filteredMenus.length ? (
            <div className="managed-menu-list">
              {filteredMenus.map((menu) => (
                <article
                  className={`managed-menu-card${selectedId === menu.id ? ' chosen' : ''}${!menu.isActive ? ' inactive' : ''}`}
                  key={menu.id}
                >
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt="" />
                  ) : (
                    <div className="menu-placeholder">☕</div>
                  )}
                  <div className="managed-menu-info">
                    <strong>{menu.name}</strong>
                    <span>
                      {menu.categoryName} · {formatRupiah(menu.basePrice)}
                    </span>
                    <small>{menu.isActive ? 'Tampil di katalog' : 'Tidak ditampilkan'}</small>
                  </div>
                  <div className="managed-menu-actions">
                    <button
                      className="admin-outline-button"
                      onClick={() => selectMenu(menu)}
                      type="button"
                    >
                      Ubah
                    </button>
                    <button
                      aria-label={`${menu.isActive ? 'Nonaktifkan' : 'Aktifkan'} ${menu.name}`}
                      className={`toggle-switch${menu.isActive ? ' on' : ''}`}
                      onClick={() => handleToggle(menu)}
                      role="switch"
                      aria-checked={menu.isActive}
                      type="button"
                    >
                      <span />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty">Tidak ada menu yang sesuai dengan pencarian.</div>
          )}
        </section>

        <section className="admin-panel menu-editor-panel">
          <div className="panel-heading">
            <div>
              <h2>{selectedId ? 'Ubah Menu' : 'Menu Baru'}</h2>
              <p>
                {selectedId
                  ? 'Perbarui informasi produk.'
                  : 'Masukkan informasi menu yang ingin ditambahkan.'}
              </p>
            </div>
            {selectedId && (
              <button className="text-button" onClick={startNewMenu} type="button">
                Batal
              </button>
            )}
          </div>
          <form className="menu-editor-form" onSubmit={handleSubmit}>
            <label>
              Nama Menu
              <input
                autoComplete="off"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Contoh: Kopi Susu Seruput"
                value={form.name}
              />
            </label>
            <label>
              Kategori
              <select
                onChange={(event) =>
                  setForm((current) => ({ ...current, categoryId: event.target.value }))
                }
                value={form.categoryId}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Harga (Rp)
              <input
                inputMode="numeric"
                min="0"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    basePrice: event.target.value.replace(/[^0-9]/g, ''),
                  }))
                }
                placeholder="18000"
                value={form.basePrice}
              />
            </label>
            <label>
              URL Gambar <span className="optional-label">(opsional)</span>
              <input
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                placeholder="https://..."
                type="url"
                value={form.imageUrl}
              />
            </label>
            <label>
              Deskripsi
              <textarea
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Ceritakan rasa atau bahan utama menu ini..."
                rows="4"
                value={form.description}
              />
            </label>
            <div className="addon-manager">
              <div className="addon-heading">
                <strong>Add-ons</strong>
                <span>
                  {selectedId ? `${addons.length} pilihan` : 'Simpan menu terlebih dahulu'}
                </span>
              </div>
              {selectedId && (
                <>
                  <div className="addon-list">
                    {addons.length ? (
                      addons.map((addon) => (
                        <div
                          className={`addon-row${!addon.isActive ? ' disabled' : ''}`}
                          key={addon.id}
                        >
                          <span>
                            {addon.name}
                            <small>{formatRupiah(addon.priceDelta)}</small>
                          </span>
                          <button
                            aria-label={`${addon.isActive ? 'Nonaktifkan' : 'Aktifkan'} add-on ${addon.name}`}
                            className={`toggle-switch${addon.isActive ? ' on' : ''}`}
                            onClick={() => handleToggleAddon(addon)}
                            role="switch"
                            aria-checked={addon.isActive}
                            type="button"
                          >
                            <span />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="addon-empty">Belum ada add-on pada menu ini.</p>
                    )}
                  </div>
                  <div className="addon-add-form">
                    <input
                      aria-label="Nama add-on"
                      onChange={(event) =>
                        setAddonForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Nama add-on"
                      value={addonForm.name}
                    />
                    <input
                      aria-label="Harga tambahan"
                      inputMode="numeric"
                      onChange={(event) =>
                        setAddonForm((current) => ({
                          ...current,
                          priceDelta: event.target.value.replace(/[^0-9]/g, ''),
                        }))
                      }
                      placeholder="Harga +"
                      value={addonForm.priceDelta}
                    />
                    <button
                      disabled={savingAddon || !addonForm.name.trim()}
                      onClick={handleAddAddon}
                      type="button"
                    >
                      {savingAddon ? '...' : '+'}
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              className="admin-primary-button save-menu-button"
              disabled={saving || !categories.length}
              type="submit"
            >
              {saving ? 'Menyimpan...' : selectedId ? 'Simpan Perubahan' : 'Simpan Menu'}
            </button>
            {!categories.length && (
              <small className="form-hint">
                Tambahkan kategori terlebih dahulu di database Supabase sebelum membuat menu.
              </small>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

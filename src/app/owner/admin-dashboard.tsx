'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import ProductEditor from './product-editor';

type User = { username: string; userId: string; isAdmin: boolean };
type StoreData = { slug: string; businessName: string; description: string; category: string; phone: string; whatsapp: string; city: string; address: string; openingHours: string; deliveryInfo: string; logoUrl: string; productsJson: string };
type StoreRecord = Schema['Store']['type'];
const client = () => generateClient<Schema>();
const errText = (e: unknown) => e instanceof Error ? e.message : 'Something went wrong. Please try again.';

export default function AdminDashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState<StoreData | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const selected = stores.find((store) => store.slug === selectedSlug) || null;
  const visibleStores = useMemo(() => stores.filter((store) => `${store.businessName} ${store.slug} ${store.city}`.toLowerCase().includes(search.toLowerCase())), [stores, search]);

  const loadStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const allStores: StoreRecord[] = [];
      let nextToken: string | undefined;
      do {
        const result = await client().models.Store.list({ authMode: 'userPool', limit: 1000, nextToken });
        if (result.errors?.length) throw Error(result.errors[0].message);
        allStores.push(...(result.data || []));
        nextToken = result.nextToken || undefined;
      } while (nextToken);
      setStores(allStores.map((store) => ({ slug: store.slug, businessName: store.businessName, description: store.description || '', category: store.category || '', phone: store.phone || '', whatsapp: store.whatsapp || '', city: store.city || '', address: store.address || '', openingHours: store.openingHours || '', deliveryInfo: store.deliveryInfo || '', logoUrl: store.logoUrl || '', productsJson: store.productsJson || '[]' })));
    } catch (e) { setError(errText(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadStores(); }, [loadStores]);
  useEffect(() => { setForm(selected); setError(''); setNote(''); }, [selected]);

  function change<K extends keyof StoreData>(key: K, value: StoreData[K]) { setForm((current) => current ? { ...current, [key]: value } : current); }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true); setError(''); setNote('');
    try {
      const result = await client().models.Store.update({ slug: form.slug, businessName: form.businessName.trim(), description: form.description, category: form.category, phone: form.phone, whatsapp: form.whatsapp, city: form.city, address: form.address, openingHours: form.openingHours, deliveryInfo: form.deliveryInfo, logoUrl: form.logoUrl }, { authMode: 'userPool' });
      if (result.errors?.length) throw Error(result.errors[0].message);
      if (!result.data) throw Error('The store could not be saved.');
      await loadStores();
      setNote('Store details saved.');
    } catch (e) { setError(errText(e)); }
    finally { setBusy(false); }
  }

  return <main className="dashboard"><header><Link className="brand" href="/">Market<span>Store</span>.ng</Link><div className="account"><span className="account-username">{user.username.toUpperCase()}</span><span>Admin</span><button onClick={onSignOut}>Sign out</button></div></header><section className="dash-title"><p className="eyebrow">MarketStore administration</p><h1>Manage all stores</h1><p>Admin access applies across every store. Store owners retain access to their own pages.</p></section>
    <section className="dashboard-card"><h2>Stores ({stores.length})</h2><label>Find a store<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by business, link, or city" /></label>{loading ? <p className="loading">Loading stores…</p> : visibleStores.length ? <div className="item-list admin-store-list">{visibleStores.map((store) => <article key={store.slug}><div><b>{store.businessName}</b><p>{store.city || 'City not set'} · marketstore.ng/{store.slug}</p></div><button type="button" onClick={() => setSelectedSlug(store.slug)}>{selectedSlug === store.slug ? 'Selected' : 'Manage'}</button></article>)}</div> : <p className="muted">No stores found.</p>}</section>
    {form && <><section className="dashboard-card"><h2>Manage {form.businessName}</h2><p className="notice"><Link href={`/${form.slug}`} target="_blank">Open public store page ↗</Link></p><form className="form-grid" onSubmit={save}><label>Business name<input required maxLength={80} value={form.businessName} onChange={(e) => change('businessName', e.target.value)} /></label><label>Store link<input disabled value={form.slug} /><small>marketstore.ng/{form.slug}</small></label><label>Category<input value={form.category} onChange={(e) => change('category', e.target.value)} /></label><label>City<input value={form.city} onChange={(e) => change('city', e.target.value)} /></label><label>Phone<input type="tel" value={form.phone} onChange={(e) => change('phone', e.target.value)} /></label><label>WhatsApp<input type="tel" value={form.whatsapp} onChange={(e) => change('whatsapp', e.target.value)} /></label><label className="full">About the business<textarea rows={3} value={form.description} onChange={(e) => change('description', e.target.value)} /></label><label className="full">Address or area<input value={form.address} onChange={(e) => change('address', e.target.value)} /></label><label>Opening hours<textarea rows={2} value={form.openingHours} onChange={(e) => change('openingHours', e.target.value)} /></label><label>Delivery information<textarea rows={2} value={form.deliveryInfo} onChange={(e) => change('deliveryInfo', e.target.value)} /></label><label className="full">Logo image link<input type="url" value={form.logoUrl} onChange={(e) => change('logoUrl', e.target.value)} /></label><button className="button wide full" disabled={busy}>{busy ? 'Saving…' : 'Save store details'}</button></form>{error && <p className="message error" role="alert">{error}</p>}{note && <p className="message" role="status">{note}</p>}</section><ProductEditor key={form.slug} slug={form.slug} initial={form.productsJson} /></>}
    {!form && error && <p className="message error" role="alert">{error}</p>}
  </main>;
}




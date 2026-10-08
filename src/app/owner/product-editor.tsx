'use client';

import { useState, type FormEvent } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

type Item = {
  name: string;
  description: string;
  price: number;
  photoUrl?: string;
  photoUrl2?: string;
};

function readItems(json: string): Item[] {
  try {
    const value: unknown = JSON.parse(json || '[]');
    if (!Array.isArray(value)) return [];
    return value.map((entry): Item => {
      const item = entry as Partial<Item>;
      return {
        name: String(item.name || ''),
        description: String(item.description || ''),
        price: Number(item.price) || 0,
        photoUrl: typeof item.photoUrl === 'string' ? item.photoUrl : '',
        photoUrl2: typeof item.photoUrl2 === 'string' ? item.photoUrl2 : '',
      };
    });
  } catch {
    return [];
  }
}

export default function ProductEditor({ slug, initial }: { slug: string; initial: string }) {
  const [items, setItems] = useState(() => readItems(initial));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUrl2, setPhotoUrl2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function commit(next: Item[]): Promise<boolean> {
    setBusy(true);
    setError('');
    try {
      const result = await generateClient<Schema>().models.Store.update(
        { slug, productsJson: JSON.stringify(next) },
        { authMode: 'userPool' },
      );
      if (result.errors?.length) throw Error(result.errors[0].message);
      setItems(next);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save products.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    const saved = await commit([
      ...items,
      {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        photoUrl: photoUrl.trim(),
        photoUrl2: photoUrl2.trim(),
      },
    ]);
    if (saved) {
      setName('');
      setDescription('');
      setPrice('');
      setPhotoUrl('');
      setPhotoUrl2('');
    }
  }

  return (
    <section className="dashboard-card">
      <h2>Products</h2>
      <p className="muted">Add product names, prices, descriptions, and up to two public image links.</p>
      {items.length > 0 && (
        <div className="item-list">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`}>
              {item.photoUrl || item.photoUrl2 ? (
                <div className="item-thumbnails">
                  {[item.photoUrl, item.photoUrl2]
                    .filter((url): url is string => Boolean(url))
                    .map((url, imageIndex) => (
                      <img src={url} alt={`${item.name} image ${imageIndex + 1}`} key={`${url}-${imageIndex}`} />
                    ))}
                </div>
              ) : null}
              <div>
                <b>{item.name}</b>
                <p>{item.description}</p>
                <strong>₦{Number(item.price).toLocaleString('en-NG')}</strong>
              </div>
              <button type="button" disabled={busy} onClick={() => commit(items.filter((_, itemIndex) => itemIndex !== index))}>
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
      <form className="form-grid product-form" onSubmit={add}>
        <label>Product name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Price in naira<input required min="0" step="0.01" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label>Description<input value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Image 1 link (optional)<input type="url" placeholder="https://…" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} /></label>
        <label>Image 2 link (optional)<input type="url" placeholder="https://…" value={photoUrl2} onChange={(e) => setPhotoUrl2(e.target.value)} /></label>
        <button className="button wide full" disabled={busy}>{busy ? 'Saving…' : 'Add product'}</button>
      </form>
      {error && <p className="message error" role="alert">{error}</p>}
    </section>
  );
}
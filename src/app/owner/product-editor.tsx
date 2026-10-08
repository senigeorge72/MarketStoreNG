'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove, uploadData } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';

type Item = {
  name: string;
  description: string;
  price: number;
  photoUrl?: string;
  photoUrl2?: string;
  photoPath?: string;
  photoPath2?: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
        photoPath: typeof item.photoPath === 'string' ? item.photoPath : '',
        photoPath2: typeof item.photoPath2 === 'string' ? item.photoPath2 : '',
      };
    });
  } catch {
    return [];
  }
}

function imagePaths(items: Item[]) {
  return items.flatMap((item) => [item.photoPath, item.photoPath2].filter((path): path is string => Boolean(path)));
}

async function uploadProductImage(file: File, slug: string) {
  if (!file.type.startsWith('image/')) throw Error(`${file.name} is not an image.`);
  if (file.size > MAX_IMAGE_BYTES) throw Error(`${file.name} is larger than 5 MB. Choose a smaller image.`);
  const session = await fetchAuthSession();
  if (!session.identityId) throw Error('Your sign-in session is not ready. Sign out and back in, then try again.');
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg';
  const uniqueName = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `products/${session.identityId}/${slug}/${uniqueName}.${extension}`;
  await uploadData({ path, data: file, options: { contentType: file.type } }).result;
  return path;
}

export default function ProductEditor({ slug, initial }: { slug: string; initial: string }) {
  const [items, setItems] = useState(() => readItems(initial));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadPreviews() {
      const next: Record<string, string> = {};
      await Promise.all(items.flatMap((item, index) => ([
        item.photoPath ? getUrl({ path: item.photoPath, options: { expiresIn: 3600 } }).then(({ url }) => { next[`${index}-1`] = url.toString(); }).catch(() => undefined) : Promise.resolve(),
        item.photoPath2 ? getUrl({ path: item.photoPath2, options: { expiresIn: 3600 } }).then(({ url }) => { next[`${index}-2`] = url.toString(); }).catch(() => undefined) : Promise.resolve(),
      ])));
      if (!cancelled) setPreviews(next);
    }
    void loadPreviews();
    return () => { cancelled = true; };
  }, [items]);

  async function commit(next: Item[]): Promise<boolean> {
    setBusy(true);
    setError('');
    try {
      const result = await generateClient<Schema>().models.Store.update(
        { slug, productsJson: JSON.stringify(next) },
        { authMode: 'userPool' },
      );
      if (result.errors?.length) throw Error(result.errors[0].message);
      const retainedPaths = new Set(imagePaths(next));
      const removedPaths = imagePaths(items).filter((path) => !retainedPaths.has(path));
      setItems(next);
      await Promise.allSettled(removedPaths.map((path) => remove({ path })));
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
    setBusy(true);
    setError('');
    const uploadedPaths: string[] = [];
    try {
      const photoPath = image1 ? await uploadProductImage(image1, slug) : '';
      if (photoPath) uploadedPaths.push(photoPath);
      const photoPath2 = image2 ? await uploadProductImage(image2, slug) : '';
      if (photoPath2) uploadedPaths.push(photoPath2);
      const next = [...items, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        photoPath,
        photoPath2,
      }];
      const result = await generateClient<Schema>().models.Store.update(
        { slug, productsJson: JSON.stringify(next) },
        { authMode: 'userPool' },
      );
      if (result.errors?.length) throw Error(result.errors[0].message);
      setItems(next);
      setName('');
      setDescription('');
      setPrice('');
      setImage1(null);
      setImage2(null);
      formRef.current?.reset();
    } catch (e) {
      await Promise.allSettled(uploadedPaths.map((path) => remove({ path })));
      setError(e instanceof Error ? e.message : 'Could not upload and save this product.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="dashboard-card">
      <h2>Products</h2>
      <p className="muted">Add product details and choose up to two images from your computer. Each image can be up to 5 MB.</p>
      {items.length > 0 && (
        <div className="item-list">
          {items.map((item, index) => {
            const urls = [item.photoUrl || previews[`${index}-1`], item.photoUrl2 || previews[`${index}-2`]].filter((url): url is string => Boolean(url));
            return (
              <article key={`${item.name}-${index}`}>
                {urls.length > 0 && <div className="item-thumbnails">{urls.map((url, imageIndex) => <img src={url} alt={`${item.name} image ${imageIndex + 1}`} key={`${url}-${imageIndex}`} />)}</div>}
                <div><b>{item.name}</b><p>{item.description}</p><strong>₦{Number(item.price).toLocaleString('en-NG')}</strong></div>
                <button type="button" disabled={busy} onClick={() => void commit(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </article>
            );
          })}
        </div>
      )}
      <form ref={formRef} className="form-grid product-form" onSubmit={add}>
        <label>Product name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Price in naira<input required min="0" step="0.01" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label>Description<input value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Product image 1 (optional)<input accept="image/*" type="file" onChange={(e) => setImage1(e.target.files?.[0] || null)} /></label>
        <label>Product image 2 (optional)<input accept="image/*" type="file" onChange={(e) => setImage2(e.target.files?.[0] || null)} /></label>
        <button className="button wide full" disabled={busy}>{busy ? 'Uploading and saving…' : 'Add product'}</button>
      </form>
      {error && <p className="message error" role="alert">{error}</p>}
    </section>
  );
}

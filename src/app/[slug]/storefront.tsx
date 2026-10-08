'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { isAmplifyConfigured } from '@/lib/amplify-client';

type Product = { name: string; description?: string; price: number; photoUrl?: string; photoUrl2?: string };

export default function Storefront({ slug }: { slug: string }) {
  const [store, setStore] = useState<Schema['Store']['type'] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAmplifyConfigured) {
      setError('Amplify configuration is missing.');
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        const client = generateClient<Schema>();
        const result = await client.models.Store.get(
          { slug },
          {
            authMode: 'apiKey',
            selectionSet: ['slug', 'businessName', 'description', 'category', 'phone', 'whatsapp', 'city', 'address', 'openingHours', 'deliveryInfo', 'logoUrl', 'productsJson', 'createdAt', 'updatedAt'],
          },
        );
        if (result.errors?.length) throw Error(result.errors[0].message);
        if (active && result.data) {
          setStore(result.data);
          try {
            const parsed = JSON.parse(result.data.productsJson || '[]');
            setProducts(Array.isArray(parsed) ? parsed : []);
          } catch {
            setProducts([]);
          }
        }
      } catch (e) {
        console.error('Storefront load failed:', e);
        if (active) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <main className="store-shell">Loading store…</main>;
  if (error) return <main className="store-shell"><p className="eyebrow">We couldn’t load this store</p><p>{process.env.NODE_ENV === 'development' ? error : 'Please try again shortly.'}</p><Link className="button" href="/">Visit MarketStore</Link></main>;
  if (!store) return <main className="store-shell"><p className="eyebrow">MarketStore.ng</p><h1>We couldn’t find that store</h1><p>Check the address or return to MarketStore.</p><Link className="button" href="/">Visit MarketStore</Link></main>;

  const whatsapp = store.whatsapp?.replace(/\D/g, '');
  const phone = store.phone?.replace(/[^\d+]/g, '');

  return (
    <main className="public-store">
      <header><Link className="brand" href="/">Market<span>Store</span>.ng</Link><span>{store.city || 'Nigeria'}</span></header>
      <section className="store-hero">
        {store.logoUrl ? <img className="logo" src={store.logoUrl} alt={`${store.businessName} logo`} /> : <div className="logo placeholder">{store.businessName.slice(0, 1).toUpperCase()}</div>}
        <p className="eyebrow">{store.category || 'Local business'}</p>
        <h1>{store.businessName}</h1>
        <p className="location">{[store.address, store.city].filter(Boolean).join(' · ')}</p>
        {store.description && <p className="description">{store.description}</p>}
        <div className="actions centered">
          {whatsapp && <a className="button" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}`}>WhatsApp</a>}
          {phone && <a className="button outline" href={`tel:${phone}`}>Call</a>}
        </div>
      </section>
      {(store.openingHours || store.deliveryInfo) && <section className="store-info">
        {store.openingHours && <article><h2>Opening hours</h2><p>{store.openingHours}</p></article>}
        {store.deliveryInfo && <article><h2>Delivery</h2><p>{store.deliveryInfo}</p></article>}
      </section>}
      {products.length > 0 && <section className="products">
        <h2>Products</h2>
        <div>{products.map((product, index) => {
          const images = [product.photoUrl, product.photoUrl2].filter((url): url is string => Boolean(url));
          return <article key={`${product.name}-${index}`}>
            {images.length > 0 ? <div className={`product-images ${images.length > 1 ? 'has-two' : ''}`}>
              {images.map((url, imageIndex) => <img src={url} alt={`${product.name} image ${imageIndex + 1}`} key={`${url}-${imageIndex}`} />)}
            </div> : <div className="product-placeholder">{product.name.slice(0, 1)}</div>}
            <h3>{product.name}</h3>
            {product.description && <p>{product.description}</p>}
            <strong>₦{Number(product.price).toLocaleString('en-NG')}</strong>
          </article>;
        })}</div>
      </section>}
      <footer><span>Store page on MarketStore.ng</span><Link href="/owner?mode=signup">Create your own store</Link></footer>
    </main>
  );
}
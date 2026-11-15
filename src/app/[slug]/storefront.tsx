'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';
import { isAmplifyConfigured } from '@/lib/amplify-client';

type Product = { name: string; description?: string; price: number; photoUrl?: string; photoUrl2?: string; photoPath?: string; photoPath2?: string };

export default function Storefront({ slug }: { slug: string }) {
  const [store, setStore] = useState<Schema['Store']['type'] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const basket = useMemo(() => products.map((product, index) => ({ product, index, quantity: quantities[index] || 0 })).filter((item) => item.quantity > 0), [products, quantities]);
  const total = basket.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);

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
            selectionSet: ['slug', 'owner', 'businessName', 'description', 'category', 'phone', 'whatsapp', 'city', 'address', 'openingHours', 'deliveryInfo', 'logoUrl', 'productsJson', 'createdAt', 'updatedAt'],
          },
        );
        if (result.errors?.length) throw Error(result.errors[0].message);
        if (active && result.data) {
          setStore(result.data);
          try {
            const parsed = JSON.parse(result.data.productsJson || '[]');
            const storedProducts: Product[] = Array.isArray(parsed) ? parsed : [];
            const readyProducts = await Promise.all(storedProducts.map(async (product) => {
              const [image1, image2] = await Promise.all([
                product.photoPath ? getUrl({ path: product.photoPath, options: { expiresIn: 3600 } }).then(({ url }) => url.toString()).catch(() => '') : Promise.resolve(''),
                product.photoPath2 ? getUrl({ path: product.photoPath2, options: { expiresIn: 3600 } }).then(({ url }) => url.toString()).catch(() => '') : Promise.resolve(''),
              ]);
              return {
                ...product,
                photoUrl: image1 || product.photoUrl,
                photoUrl2: image2 || product.photoUrl2,
              };
            }));
            if (active) setProducts(readyProducts);
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

  const rawWhatsapp = store.whatsapp?.replace(/\D/g, '') || '';
  const whatsapp = rawWhatsapp.startsWith('0') ? `234${rawWhatsapp.slice(1)}` : rawWhatsapp.startsWith('234') ? rawWhatsapp : rawWhatsapp;
  const phone = store.phone?.replace(/[^\d+]/g, '');
  function setQuantity(index: number, quantity: number) {
    setQuantities((current) => ({ ...current, [index]: Math.max(0, quantity) }));
  }
  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError('');
    if (!store.owner || basket.length === 0 || !Number.isFinite(total) || total <= 0) {
      setOrderError('This store cannot accept tracked orders right now. Please contact the seller.');
      return;
    }
    setPlacingOrder(true);
    try {
      const id = crypto.randomUUID();
      const result = await generateClient<Schema>().models.Order.create({
        id,
        storeSlug: store.slug,
        sellerOwner: store.owner,
        customerName: customerName.trim(),
        deliveryLocation: deliveryLocation.trim(),
        itemsJson: JSON.stringify(basket.map(({ product, quantity }) => ({ name: product.name, price: Number(product.price), quantity }))),
        total,
      }, { authMode: 'apiKey' });
      if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Unable to place your order.');
      window.location.assign(`/track/${encodeURIComponent(id)}`);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : 'Unable to place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }

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
            {images.length > 0 ? <div className="product-images" aria-label={`${product.name} photos`} tabIndex={images.length > 1 ? 0 : undefined}>
              {images.map((url, imageIndex) => <img src={url} alt={`${product.name} image ${imageIndex + 1}`} key={`${url}-${imageIndex}`} />)}
            </div> : <div className="product-placeholder">{product.name.slice(0, 1)}</div>}
            {images.length > 1 && <p className="image-scroll-hint">Swipe or scroll to see more photos</p>}
            <h3>{product.name}</h3>
            {product.description && <p>{product.description}</p>}
            <strong>₦{Number(product.price).toLocaleString('en-NG')}</strong>
            <div className="product-order-control">
              {(quantities[index] || 0) > 0 ? <div className="quantity-control" aria-label={`Quantity of ${product.name}`}>
                <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => setQuantity(index, (quantities[index] || 0) - 1)}>−</button>
                <span>{quantities[index]}</span>
                <button type="button" aria-label={`Add one ${product.name}`} onClick={() => setQuantity(index, (quantities[index] || 0) + 1)}>+</button>
              </div> : <button className="button small" type="button" onClick={() => setQuantity(index, 1)}>Add to order</button>}
            </div>
          </article>;
        })}</div>
      </section>}
      {products.length > 0 && <section className="order-basket" id="basket">
        <h2>Your order</h2>
        {basket.length === 0 ? <p className="muted">Your basket is empty. Add products above to get started.</p> : <>
          <div className="basket-items">{basket.map(({ product, index, quantity }) => <article key={`${product.name}-${index}`}>
            <div><strong>{product.name}</strong><p>₦{Number(product.price).toLocaleString('en-NG')} each</p></div>
            <div className="quantity-control" aria-label={`Quantity of ${product.name}`}>
              <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => setQuantity(index, quantity - 1)}>−</button><span>{quantity}</span><button type="button" aria-label={`Add one ${product.name}`} onClick={() => setQuantity(index, quantity + 1)}>+</button>
            </div>
            <strong>₦{(Number(product.price) * quantity).toLocaleString('en-NG')}</strong>
          </article>)}</div>
          <p className="basket-total"><span>Order total</span><strong>₦{total.toLocaleString('en-NG')}</strong></p>
          <form className="order-form" onSubmit={placeOrder}>
            <label>Your name<input required maxLength={100} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Name for the order" /></label>
            <label>Delivery location<input required maxLength={200} value={deliveryLocation} onChange={(event) => setDeliveryLocation(event.target.value)} placeholder="Area, street, or delivery address" /></label>
            <p className="notice">Payment is arranged directly with the seller. MarketStore tracks your order but does not hold funds.</p>
            {orderError && <p className="message error" role="alert">{orderError}</p>}
            <button className="button wide" type="submit" disabled={placingOrder}>{placingOrder ? 'Placing order…' : 'Place order and track it'}</button>
            {whatsapp && <a className="text-link" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}`}>Contact seller on WhatsApp</a>}
          </form>
        </>}
      </section>}
    </main>
  );
}

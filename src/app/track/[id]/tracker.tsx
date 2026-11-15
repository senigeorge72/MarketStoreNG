'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { isAmplifyConfigured } from '@/lib/amplify-client';

const steps = [
  ['PLACED', 'Order placed'], ['ACCEPTED', 'Seller accepted'], ['PREPARING', 'Preparing order'], ['READY_FOR_DELIVERY', 'Ready for delivery'], ['COMPLETED', 'Completed'],
] as const;
const statusLabels: Record<string, string> = { PLACED: 'Order placed', ACCEPTED: 'Accepted by seller', PREPARING: 'Being prepared', READY_FOR_DELIVERY: 'Ready for delivery', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

export default function OrderTracker({ id }: { id: string }) {
  const [order, setOrder] = useState<Schema['Order']['type'] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAmplifyConfigured) { setError('Order tracking is not available yet.'); return; }
    let active = true;
    const client = generateClient<Schema>();
    async function load() {
      try {
        const result = await client.models.Order.get({ id }, { authMode: 'apiKey', selectionSet: ['id', 'storeSlug', 'customerName', 'itemsJson', 'total', 'status', 'createdAt', 'updatedAt'] });
        if (result.errors?.length) throw new Error(result.errors[0].message);
        if (active) setOrder(result.data);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Unable to load this order.'); }
    }
    void load();
    const timer = window.setInterval(() => { void load(); }, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [id]);

  if (error) return <main className="store-shell"><p className="eyebrow">Order tracking</p><h1>We couldn’t load this order</h1><p>{process.env.NODE_ENV === 'development' ? error : 'Check the tracking link and try again.'}</p><Link className="button" href="/">Visit MarketStore</Link></main>;
  if (!order) return <main className="store-shell"><p className="eyebrow">Order tracking</p><h1>Loading your order…</h1></main>;
  const status = order.status || 'PLACED';
  let items: { name: string; price: number; quantity: number }[] = [];
  try { items = JSON.parse(order.itemsJson || '[]'); } catch { /* Show the rest of the tracking page. */ }
  const currentIndex = steps.findIndex(([value]) => value === status);

  return <main className="dashboard tracking-page">
    <header><Link className="brand" href="/">Market<span>Store</span>.ng</Link><span>Private order tracking</span></header>
    <section className="dash-title"><p className="eyebrow">Order status</p><h1>{statusLabels[status] || 'Order placed'}</h1><p>Order {order.id.slice(0, 8).toUpperCase()} · {new Date(order.createdAt).toLocaleString('en-NG')}</p></section>
    <section className="dashboard-card">
      {status === 'CANCELLED' ? <p className="message error">The seller cancelled this order. Contact the seller to discuss next steps.</p> : <ol className="order-progress">{steps.map(([value, label], index) => <li className={index <= currentIndex ? 'complete' : ''} key={value}><span>{index < currentIndex ? '✓' : index + 1}</span><b>{label}</b></li>)}</ol>}
      <h2>Order summary</h2>
      <p>Seller: <Link href={`/${encodeURIComponent(order.storeSlug)}`}>{order.storeSlug}</Link></p>
      <div className="basket-items">{items.map((item, index) => <article key={`${item.name}-${index}`}><div><strong>{item.name}</strong><p>₦{Number(item.price).toLocaleString('en-NG')} each × {item.quantity}</p></div><strong>₦{(Number(item.price) * item.quantity).toLocaleString('en-NG')}</strong></article>)}</div>
      <p className="basket-total"><span>Total</span><strong>₦{Number(order.total).toLocaleString('en-NG')}</strong></p>
      <p className="notice">MarketStore tracks order progress only. Payment is arranged directly with the seller and MarketStore does not hold or release funds.</p>
      <p className="muted">This private link lets anyone who has it view the order status. Keep it to yourself.</p>
    </section>
  </main>;
}

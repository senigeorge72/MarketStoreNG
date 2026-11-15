'use client';

import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'] as const;
const labels: Record<(typeof statuses)[number], string> = {
  PLACED: 'Placed', ACCEPTED: 'Accepted', PREPARING: 'Preparing', READY_FOR_DELIVERY: 'Ready for delivery', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

export default function OwnerOrders({ storeSlug }: { storeSlug: string }) {
  const [orders, setOrders] = useState<Schema['Order']['type'][]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    const result = await generateClient<Schema>().models.Order.list({
      authMode: 'userPool',
      selectionSet: ['id', 'storeSlug', 'sellerOwner', 'customerName', 'deliveryLocation', 'itemsJson', 'total', 'status', 'createdAt', 'updatedAt'],
    });
    if (result.errors?.length) throw new Error(result.errors[0].message);
    setOrders((result.data || []).filter((order) => order.storeSlug === storeSlug).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : 'Could not load orders.')); }, [storeSlug]);

  async function updateStatus(id: string, status: (typeof statuses)[number]) {
    setBusyId(id); setError('');
    try {
      const result = await generateClient<Schema>().models.Order.update({ id, status }, { authMode: 'userPool' });
      if (result.errors?.length) throw new Error(result.errors[0].message);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update order.'); }
    finally { setBusyId(''); }
  }

  return <section className="dashboard-card">
    <h2>Customer orders</h2>
    <p className="muted">Update each order as you handle it. Payment is arranged directly between you and the customer.</p>
    {error && <p className="message error" role="alert">{error}</p>}
    {orders.length === 0 ? <p className="muted">No customer orders yet.</p> : <div className="owner-orders">
      {orders.map((order) => {
        let items: { name: string; quantity: number; price: number }[] = [];
        try { items = JSON.parse(order.itemsJson || '[]'); } catch { /* Keep the order visible if an old record is malformed. */ }
        const status = (order.status || 'PLACED') as (typeof statuses)[number];
        return <article key={order.id}>
          <div className="owner-order-heading"><strong>Order {order.id.slice(0, 8).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleString('en-NG')}</span></div>
          <p><b>{order.customerName}</b> · {order.deliveryLocation}</p>
          <p>{items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
          <p className="owner-order-total">₦{Number(order.total).toLocaleString('en-NG')}</p>
          <div className="owner-order-actions"><a className="text-link" href={`/track/${encodeURIComponent(order.id)}`} target="_blank">Open customer tracking ↗</a>
            <label>Status<select disabled={busyId === order.id} value={status} onChange={(event) => void updateStatus(order.id, event.target.value as (typeof statuses)[number])}>
              {statuses.map((value) => <option value={value} key={value}>{labels[value]}</option>)}
            </select></label>
          </div>
        </article>;
      })}
    </div>}
  </section>;
}

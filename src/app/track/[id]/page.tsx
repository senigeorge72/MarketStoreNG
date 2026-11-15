import OrderTracker from './tracker';

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderTracker id={id} />;
}

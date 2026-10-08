import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'MarketStore.ng | Your business, online', description: 'Create a simple online storefront for your Nigerian business.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
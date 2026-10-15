import type { Metadata } from 'next';
import './globals.css';
import './site-footer.css';
import SiteFooter from './site-footer';
export const metadata: Metadata = { title: 'MarketStore.ng | Your business, online', description: 'Create a simple online storefront for your Nigerian business.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}<SiteFooter /></body></html>; }

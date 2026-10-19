import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026 MarketStore.ng</span>
      <nav className="footer-links" aria-label="Site links">
        <Link href="/owner">Store owner sign in</Link>
        <Link href="/owner?mode=signup">Create your own store</Link>
      </nav>
      <nav className="social-links" aria-label="MarketStore social media">
        <span>Follow us</span>
        <a className="social-icon" href="https://www.instagram.com/marketstore.ng" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.6" cy="6.7" r="1.2"/></svg>
        </a>
        <a className="social-icon" href="https://www.facebook.com/profile.php?id=61594609373613" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.8l.4-3.1h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8z"/></svg>
        </a>
        <a className="social-icon" href="https://www.linkedin.com/company/marketstoreng/about/?viewAsMember=true" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.7a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.7 10h3v10h-3zm5.1 0h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.5V20h-3v-5.1c0-1.2 0-2.7-1.7-2.7s-2 1.3-2 2.6V20h-3z"/></svg>
        </a>
      </nav>
    </footer>
  );
}

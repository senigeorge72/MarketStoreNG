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
        <a href="https://www.instagram.com/marketstore.ng" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.facebook.com/profile.php?id=61594609373613" target="_blank" rel="noreferrer">Facebook</a>
        <a href="https://www.linkedin.com/company/marketstoreng/about/?viewAsMember=true" target="_blank" rel="noreferrer">LinkedIn</a>
      </nav>
    </footer>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div style={{ backgroundColor: "#e8f5e9", color: "#0c4a26", padding: "8px 0", fontSize: "14px", fontWeight: "600", textAlign: "center" }}>
        <span>Join millions of businesses selling online</span>
      </div>

      <header className="topbar">
        <Link className="brand" href="/">Market<span>Store</span>.ng</Link>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features" className="button small">What you get</a>
          <Link className="button small" href="/owner?mode=signup">Create a page</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Nigeria’s small businesses</p>
          <h1>We put small<br/><span>businesses online.</span></h1>
          <p className="lead">Create a professional store page, add your products, and share one simple link with your customers.</p>
          <div className="actions">
            <Link className="button" href="/owner?mode=signup">Create a page</Link>
            <Link className="button outline" href="/owner">Store owner log in</Link>
          </div>
          <p className="small-note">Sign up with your email, then create your business page.</p>
        </div>
      </section>

      {/* Search Section with Category Discovery Tags */}
      <section className="search-section" style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f9fafb" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h4 style={{ marginBottom: "12px", fontSize: "20px" }}>Find a business or product</h4>
          <input 
            type="text" 
            placeholder="Search by business name or product..." 
            style={{ width: "100%", padding: "14px 20px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          
          {/* Quick-Click Category Tags */}
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Popular:</span>
            {["Fashion & Apparel", "Phones & Tech", "Beauty & Hair", "Food & Groceries"].map((category) => (
              <span 
                key={category} 
                style={{ 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e0e0e0", 
                  borderRadius: "16px", 
                  padding: "4px 12px", 
                  fontSize: "13px", 
                  color: "#2c3e50", 
                  cursor: "pointer" 
                }}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <p className="eyebrow">Your online storefront</p>
        <h2>Everything customers need to choose you</h2>
        <p className="lead">Show your business details, products and contact information in one shareable place.</p>
        <div className="grid">
          <div className="card">
            <span className="step-num">01</span>
            <h3>Your profile</h3>
            <p>Business name, description, location, opening hours and delivery information.</p>
          </div>
          <div className="card">
            <span className="step-num">02</span>
            <h3>Your products</h3>
            <p>Add product names, prices, descriptions and image links.</p>
          </div>
          <div className="card">
            <span className="step-num">03</span>
            <h3>Direct contact</h3>
            <p>Customers can call or message you on WhatsApp to place an order.</p>
          </div>
        </div>
      </section>

      <section id="how" className="how-section">
        <p className="eyebrow">Simple to set up</p>
        <h2>From account to store link</h2>
        <ol className="steps-list">
          <li>
            <strong>Create your owner account</strong>
            <p>Sign up with your email and verify it.</p>
          </li>
          <li>
            <strong>Add your business details</strong>
            <p>Choose your name and public store address.</p>
          </li>
          <li>
            <strong>Share your page</strong>
            <p>Your page is available at marketstore.ng/your-business-name.</p>
          </li>
        </ol>
      </section>

      <footer className="footer">
        <p>© 2026 MarketStore.ng</p>
        <div className="footer-links">
          <Link href="/owner">Store owner sign in</Link>
          <Link href="/owner?mode=signup">Create your own store</Link>
        </div>
        <div className="social-links">
          <a href="https://www.instagram.com/marketstore.ng" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61594609373613" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.linkedin.com/company/marketstoreng/about/?viewAsMember=true" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </footer>
    </main>
  );
}
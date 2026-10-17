'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { isAmplifyConfigured } from '@/lib/amplify-client';

type StoreSearchRecord = {
  slug: string;
  businessName: string;
  category?: string | null;
  city?: string | null;
  productsJson?: string | null;
};

type SearchResult = {
  store: StoreSearchRecord;
  businessMatch: boolean;
  matchingProducts: { name: string; price?: number }[];
};

function parseProducts(json?: string | null): { name: string; price?: number }[] {
  try {
    const value: unknown = JSON.parse(json || '[]');
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry): { name: string; price?: number }[] => {
      if (!entry || typeof entry !== 'object' || typeof entry.name !== 'string') return [];
      return [{ name: entry.name, price: typeof entry.price === 'number' ? entry.price : undefined }];
    });
  } catch {
    return [];
  }
}

export default function StoreSearch() {
  const [stores, setStores] = useState<StoreSearchRecord[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadStores() {
      if (!isAmplifyConfigured) {
        setError('Store search is temporarily unavailable.');
        setLoading(false);
        return;
      }
      try {
        const client = generateClient<Schema>();
        const records: StoreSearchRecord[] = [];
        let nextToken: string | undefined;
        do {
          const result = await client.models.Store.list({
            authMode: 'apiKey',
            limit: 1000,
            nextToken,
            selectionSet: ['slug', 'businessName', 'category', 'city', 'productsJson'],
          });
          if (result.errors?.length) throw Error(result.errors[0].message);
          records.push(...(result.data || []));
          nextToken = result.nextToken || undefined;
        } while (nextToken);
        if (active) setStores(records);
      } catch {
        if (active) setError('We couldn’t load stores right now. Please try again shortly.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadStores();
    return () => { active = false; };
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (term.length < 2) return [];
    return stores.flatMap((store): SearchResult[] => {
      const businessMatch = store.businessName.toLocaleLowerCase().includes(term);
      const matchingProducts = parseProducts(store.productsJson).filter((product) => product.name.toLocaleLowerCase().includes(term));
      return businessMatch || matchingProducts.length ? [{ store, businessMatch, matchingProducts }] : [];
    });
  }, [query, stores]);

  const showResults = query.trim().length >= 2;

  return (
    <section className="home-search" aria-labelledby="home-search-title">
      <div className="home-search-card">
        <h2 id="home-search-title">Find a business or product</h2>
        <label className="home-search-label" htmlFor="store-search-input">Search by business name or product</label>
        <input
          id="store-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try a business name or product"
          autoComplete="off"
        />
        {showResults && (
          <div className="home-search-results" aria-live="polite">
            {loading ? <p className="muted">Searching stores…</p>
              : error ? <p className="message error">{error}</p>
                : results.length === 0 ? <p className="muted">No businesses or products found for “{query.trim()}”.</p>
                  : <>
                    <p className="muted">{results.length} {results.length === 1 ? 'store' : 'stores'} found</p>
                    <ul>
                      {results.map(({ store, businessMatch, matchingProducts }) => (
                        <li key={store.slug}>
                          <Link href={`/${store.slug}`}>
                            <span className="home-search-result-title">{store.businessName}</span>
                            <span className="home-search-result-meta">{[store.category, store.city].filter(Boolean).join(' · ') || `marketstore.ng/${store.slug}`}</span>
                            {businessMatch && <span className="home-search-match">Business match</span>}
                            {matchingProducts.map((product) => (
                              <span className="home-search-match" key={product.name}>
                                {product.name}{typeof product.price === 'number' ? ` · ₦${product.price.toLocaleString('en-NG')}` : ''}
                              </span>
                            ))}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>}
          </div>
        )}
      </div>
    </section>
  );
}
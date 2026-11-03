import { Newspaper, RefreshCw } from 'lucide-react';
import type { NewsItem } from '../../types/product';
import type { NewsState } from '../../hooks/useNews';
import { Button } from '../ui/Button';

interface NewsPanelProps {
  items: NewsItem[];
  state: NewsState;
  onOpen: (item: NewsItem) => void;
  onRetry: () => void;
}

export function NewsPanel({ items, state, onOpen, onRetry }: NewsPanelProps) {
  const visibleItems = items.slice(0, 4);

  return (
    <section id="news" className="ds-news-panel" aria-label="News and updates">
      {state === 'loading' && (
        <div className="ds-news-grid" aria-label="Loading news">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="ds-story-card ds-story-skeleton">
              <span />
              <div>
                <i />
                <i />
                <i />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="ds-feed-state" role="alert">
          <RefreshCw aria-hidden="true" size={22} />
          <strong>News unavailable</strong>
          <p>The bundled release feed could not be read.</p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}

      {state === 'empty' && (
        <div className="ds-feed-state">
          <Newspaper aria-hidden="true" size={22} />
          <strong>No news yet</strong>
          <p>Release stories will appear here when the feed is updated.</p>
        </div>
      )}

      {state === 'ready' && (
        <div className="ds-news-grid">
          {visibleItems.map((item) => {
            const fillMedia =
              /\/news\/(clients|mappings)\./i.test(item.imageUrl || '') ||
              item.category === 'Clients' ||
              item.category === 'Mappings';
            const clientsMedia =
              /\/news\/clients\./i.test(item.imageUrl || '') || item.category === 'Clients';
            const logoMedia = /fdp-logo/i.test(item.imageUrl || '') || item.category === 'Release';

            return (
              <article key={item.id} className="ds-story-card">
                <div
                  className={[
                    'ds-story-media',
                    fillMedia ? 'is-fill' : '',
                    clientsMedia ? 'is-clients' : '',
                    logoMedia ? 'ds-story-release-media' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" draggable={false} />
                  ) : (
                    <Newspaper size={26} />
                  )}
                  <small>{item.category}</small>
                </div>
                <div className="ds-story-copy">
                  <div className="ds-story-heading">
                    <strong>{item.title}</strong>
                    <time>{item.date}</time>
                  </div>
                  <span>{item.description}</span>
                  <button
                    type="button"
                    className="ds-story-action"
                    disabled={!item.url}
                    onClick={() => item.url && onOpen(item)}
                  >
                    Read more
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

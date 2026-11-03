import { useEffect, useState } from 'react';
import type { NewsItem } from '../types/product';
import { isAllowedExternalUrl } from '../utils/urlRegistry';

export type NewsState = 'loading' | 'ready' | 'empty' | 'error';

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseNews(value: unknown): NewsItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): NewsItem[] => {
    if (!entry || typeof entry !== 'object') return [];
    const item = entry as Record<string, unknown>;
    const id = textValue(item.id);
    const title = textValue(item.title);
    const description = textValue(item.description);
    const category = textValue(item.category);
    const date = textValue(item.date);
    if (!id || !title || !description || !category || !date) return [];

    const rawUrl = textValue(item.url);
    const imageUrl = textValue(item.imageUrl);
    return [
      {
        id,
        title,
        description,
        category,
        date,
        imageUrl: imageUrl || undefined,
        linkText: textValue(item.linkText) || 'Read update',
        url: rawUrl && isAllowedExternalUrl(rawUrl) ? rawUrl : undefined,
      },
    ];
  });
}

export function useNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [state, setState] = useState<NewsState>('loading');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/config/news.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`News HTTP ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .then((value) => {
        const parsed = parseNews(value);
        setItems(parsed);
        setState(parsed.length > 0 ? 'ready' : 'empty');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState('error');
      });

    return () => controller.abort();
  }, [requestId]);

  const retry = () => {
    setState('loading');
    setRequestId((value) => value + 1);
  };

  return { items, state, retry };
}

import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description?: string;
  jsonLd?: Record<string, unknown>;
}

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name'): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

const JSON_LD_ID = 'caffeine-jsonld';

export function useDocumentMeta({ title, description, jsonLd }: DocumentMetaOptions): void {
  useEffect(() => {
    document.title = title;
    setMetaTag('og:title', title, 'property');

    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description, 'property');
    }

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = JSON_LD_ID;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      if (jsonLd) {
        document.getElementById(JSON_LD_ID)?.remove();
      }
    };
  }, [title, description, jsonLd]);
}

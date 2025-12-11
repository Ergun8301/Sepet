import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Désactiver la restauration automatique (Safari)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll immédiat
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Fallback Safari
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

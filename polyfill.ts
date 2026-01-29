
/**
 * polyfill.ts
 * Normalizes the global environment for Android WebView and Production Bundles.
 * Must be imported first in index.tsx.
 */

// 1. Fix 'global' is not defined
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// 2. Fix 'process' is not defined
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: { 
      NODE_ENV: 'production',
      // Prioritize build-time key, then fallback to native window injection
      API_KEY: 'AIzaSyB5FaWPm7TTWqaq9JHpEpEvm9KQt7rGB-c'
    },
    browser: true,
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0)
  };
} else if (!(window as any).process.env) {
    (window as any).process.env = {
        NODE_ENV: 'production',
        API_KEY: 'AIzaSyB5FaWPm7TTWqaq9JHpEpEvm9KQt7rGB-c'
    };
} else {
    (window as any).process.env.API_KEY = (window as any).process.env.API_KEY || 'AIzaSyB5FaWPm7TTWqaq9JHpEpEvm9KQt7rGB-c';
}

// 3. Handle window.__RCM_API_KEY__ injection from MainActivity.java
window.addEventListener('load', () => {
    if ((window as any).__RCM_API_KEY__) {
        (window as any).process.env.API_KEY = (window as any).__RCM_API_KEY__;
    }
});

export {};

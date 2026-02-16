/**
 * SSR Polyfills
 * Provides browser API polyfills for server-side rendering
 */

// Polyfill for browser APIs during SSR
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {
    location: {
      href: 'https://ring-0cheats.org',
      origin: 'https://ring-0cheats.org',
      protocol: 'https:',
      host: 'ring-0cheats.org',
      hostname: 'ring-0cheats.org',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
      assign: () => {},
      replace: () => {},
      reload: () => {},
      toString: () => 'https://ring-0cheats.org',
    },
    document: {
      documentElement: {
        lang: 'en',
        dir: 'ltr',
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      getElementsByClassName: () => [],
      getElementsByTagName: () => [],
      createElement: () => ({}),
      createTextNode: () => ({}),
      body: {},
      head: {},
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  // @ts-ignore
  global.location = global.window.location;
  // @ts-ignore
  global.document = global.window.document;
  // @ts-ignore
  global.localStorage = global.window.localStorage;
}

export {};
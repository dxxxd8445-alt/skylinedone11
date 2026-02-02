"use client";

// Enhanced analytics tracker for real-time visitor monitoring
class AnalyticsTracker {
  private sessionId: string;
  private currentPage: string = '';
  private currentProduct: string | null = null;
  private activity: string = 'browsing';
  private startTime: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pageStartTime: number = Date.now();
  private isVisible: boolean = true;
  private clickCount: number = 0;
  private scrollDepth: number = 0;
  private maxScrollDepth: number = 0;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.init();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private init() {
    // Track initial page load
    this.trackPageView();
    
    // Set up heartbeat to keep session active (every 30 seconds)
    this.startHeartbeat();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (document.hidden) {
        this.stopHeartbeat();
        this.trackEvent('page_blur');
      } else {
        this.startHeartbeat();
        this.trackEvent('page_focus');
      }
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
      this.stopHeartbeat();
    });

    // Track hash changes (for SPA navigation)
    window.addEventListener('hashchange', () => {
      this.trackPageView();
    });

    // Track popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Track scroll depth
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Track clicks
    document.addEventListener('click', (e) => {
      this.clickCount++;
      this.trackEvent('click', {
        element: (e.target as HTMLElement)?.tagName?.toLowerCase(),
        x: e.clientX,
        y: e.clientY
      });
    });

    // Track mouse movement for heatmap (throttled)
    let mouseMoveTimeout: NodeJS.Timeout;
    document.addEventListener('mousemove', (e) => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        this.trackEvent('mouse_move', {
          x: e.clientX,
          y: e.clientY,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight
        });
      }, 1000); // Throttle to once per second
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) return;
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isVisible) {
        this.sendHeartbeat();
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private updateScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    this.scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
  }

  private async sendHeartbeat() {
    try {
      await fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          page: this.currentPage,
          product: this.currentProduct,
          activity: this.activity,
          timeOnPage: Math.floor((Date.now() - this.pageStartTime) / 1000),
          scrollDepth: this.maxScrollDepth,
          clicks: this.clickCount
        }),
        keepalive: true
      });
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  }

  private async sendTrackingData(eventType: string = 'page_view', eventData: any = {}) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          page: this.currentPage,
          product: this.currentProduct,
          activity: this.activity,
          eventType,
          eventData,
          value: eventData.value || 0
        }),
        keepalive: true
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Public methods for tracking different events
  trackPageView(page?: string) {
    this.currentPage = page || window.location.pathname;
    this.activity = 'browsing';
    this.currentProduct = null;
    
    // Extract product info from URL if on product page
    if (this.currentPage.includes('/store/') && this.currentPage.split('/').length > 3) {
      this.activity = 'viewing-product';
      this.currentProduct = this.extractProductFromUrl(this.currentPage);
    }
    
    this.sendTrackingData('page_view');
  }

  trackProductView(productName: string) {
    this.currentProduct = productName;
    this.activity = 'viewing-product';
    this.sendTrackingData('product_view', { product: productName });
  }

  trackAddToCart(productName: string, price?: number) {
    this.activity = 'in-cart';
    this.sendTrackingData('add_to_cart', { 
      product: productName, 
      value: price 
    });
  }

  trackCheckoutStart(cartValue?: number) {
    this.activity = 'checkout';
    this.sendTrackingData('checkout_start', { 
      value: cartValue 
    });
  }

  trackPurchase(orderValue: number, orderId?: string) {
    this.activity = 'completed';
    this.sendTrackingData('purchase', { 
      value: orderValue,
      orderId 
    });
  }

  trackEvent(eventType: string, eventData: any = {}) {
    this.sendTrackingData(eventType, eventData);
  }

  private extractProductFromUrl(url: string): string | null {
    const parts = url.split('/');
    if (parts.length >= 4 && parts[1] === 'store') {
      return parts[3]; // Return product slug
    }
    return null;
  }

  // Update activity manually
  setActivity(activity: 'browsing' | 'viewing-product' | 'in-cart' | 'checkout' | 'completed') {
    this.activity = activity;
  }

  // Get session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      currentPage: this.currentPage,
      currentProduct: this.currentProduct,
      activity: this.activity,
      timeOnSite: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }
}

// Create global instance
let tracker: AnalyticsTracker | null = null;

export function initAnalytics() {
  if (typeof window !== 'undefined' && !tracker) {
    tracker = new AnalyticsTracker();
  }
  return tracker;
}

export function getAnalytics() {
  return tracker || initAnalytics();
}

// Export individual tracking functions for convenience
export const trackPageView = (page?: string) => getAnalytics()?.trackPageView(page);
export const trackProductView = (productName: string) => getAnalytics()?.trackProductView(productName);
export const trackAddToCart = (productName: string, price?: number) => getAnalytics()?.trackAddToCart(productName, price);
export const trackCheckoutStart = (cartValue?: number) => getAnalytics()?.trackCheckoutStart(cartValue);
export const trackPurchase = (orderValue: number, orderId?: string) => getAnalytics()?.trackPurchase(orderValue, orderId);
export const trackEvent = (eventType: string, eventData?: any) => getAnalytics()?.trackEvent(eventType, eventData);
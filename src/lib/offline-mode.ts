// Offline mode detection and utilities

export function isOfflineMode(): boolean {
  // Check if we're running in offline build
  const isOfflineBuild = import.meta.env.VITE_OFFLINE_MODE === 'true';
  
  // Check if navigator is offline
  const isNetworkOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  
  // Check if running in SEB (Safe Exam Browser)
  const isSEB = typeof window !== 'undefined' && (
    navigator.userAgent.includes('SEB') ||
    window.location.search.includes('seb=true') ||
    window.name.includes('SEB')
  );
  
  return isOfflineBuild || isNetworkOffline || isSEB;
}

export function getOfflineAdminUrl(): string {
  return '/offline-admin';
}

export function shouldUseOfflineDatabase(): boolean {
  return isOfflineMode();
}
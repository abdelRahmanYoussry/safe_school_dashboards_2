/**
 * Auth Session Management System
 * - Auto-refresh tokens before expiry (every 13 minutes, expires at 15 min)
 * - Detect session expiry and emit events
 * - Store tokens securely
 * - Handle token revocation
 */

const TOKEN_REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes
const SESSION_EXPIRY_EVENT = "session-expired";
const TOKEN_REFRESHED_EVENT = "token-refreshed";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
}

class AuthSessionManager {
  private refreshIntervalId: NodeJS.Timeout | null = null;
  private tokenChangeListeners: Set<(tokens: AuthTokens | null) => void> = new Set();
  private sessionExpiredListeners: Set<() => void> = new Set();

  /**
   * Initialize session manager and start token refresh loop
   */
  init() {
    // Start auto-refresh loop
    this.startTokenRefresh();
    
    // Listen for visibility changes (tab switching)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        // User came back to tab - refresh token immediately
        this.refreshTokenNow();
      }
    });
  }

  /**
   * Store tokens and start refresh timer
   */
  setTokens(tokens: AuthTokens) {
    // Store in sessionStorage (cleared on browser close) for security
    sessionStorage.setItem("auth_tokens", JSON.stringify(tokens));
    
    // Notify listeners
    this.tokenChangeListeners.forEach(listener => listener(tokens));

    // Restart refresh timer
    this.stopTokenRefresh();
    this.startTokenRefresh();
  }

  /**
   * Get current tokens
   */
  getTokens(): AuthTokens | null {
    try {
      const stored = sessionStorage.getItem("auth_tokens");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear tokens on logout
   */
  clearTokens() {
    sessionStorage.removeItem("auth_tokens");
    this.stopTokenRefresh();
    this.tokenChangeListeners.forEach(listener => listener(null));
  }

  /**
   * Start auto-refresh loop
   */
  private startTokenRefresh() {
    if (this.refreshIntervalId) return;

    this.refreshIntervalId = setInterval(() => {
      this.refreshTokenNow();
    }, TOKEN_REFRESH_INTERVAL);
  }

  /**
   * Stop auto-refresh loop
   */
  private stopTokenRefresh() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  /**
   * Manually refresh token now
   */
  async refreshTokenNow() {
    const tokens = this.getTokens();
    if (!tokens) return;

    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (response.status === 401) {
        // Refresh token expired - session is gone
        this.clearTokens();
        this.notifySessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const newTokens: AuthTokens = {
        accessToken: data.data?.access_token || data.access_token,
        refreshToken: data.data?.refresh_token || data.refresh_token,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes from now
      };

      this.setTokens(newTokens);
    } catch (error) {
      console.error("Token refresh error:", error);
      // On network error, don't clear tokens yet - user might be offline
      // Wait for actual 401 response
    }
  }

  /**
   * Subscribe to token changes
   */
  onTokenChange(callback: (tokens: AuthTokens | null) => void) {
    this.tokenChangeListeners.add(callback);
    return () => this.tokenChangeListeners.delete(callback);
  }

  /**
   * Subscribe to session expiry events
   */
  onSessionExpired(callback: () => void) {
    this.sessionExpiredListeners.add(callback);
    return () => this.sessionExpiredListeners.delete(callback);
  }

  /**
   * Notify all listeners of session expiry
   */
  private notifySessionExpired() {
    this.sessionExpiredListeners.forEach(listener => listener());
  }
}

export const authSessionManager = new AuthSessionManager();

/**
 * Authentication Middleware
 * Handles route protection and authentication checks
 */
import { AuthService } from '../services/auth-service.js';
import { CookieManager } from './cookie-manager.js';

export class AuthMiddleware {
  constructor() {
    this.authService = new AuthService();
    this.cookieManager = new CookieManager();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    const tokens = this.cookieManager.getAuthTokens();
    
    if (!tokens.token || !tokens.refreshToken) {
      return false;
    }

    // Check if token is expired
    if (this.authService.isTokenExpired(tokens.token)) {
      // Try to refresh token
      this.refreshTokenIfNeeded();
      return false;
    }

    return true;
  }

  /**
   * Redirect to login page if not authenticated
   * @param {string} redirectTo - URL to redirect to after login
   */
  redirectToLogin(redirectTo = null) {
    const currentPath = window.location.pathname;
    const loginUrl = '/login.html';
    
    if (redirectTo) {
      this.cookieManager.setCookie('redirectAfterLogin', redirectTo, 24 * 60 * 60 * 1000); // 24 hours
    } else {
      this.cookieManager.setCookie('redirectAfterLogin', currentPath, 24 * 60 * 60 * 1000);
    }
    
    window.location.href = loginUrl;
  }

  /**
   * Redirect to dashboard after successful login
   */
  redirectAfterLogin() {
    const redirectPath = this.cookieManager.getCookie('redirectAfterLogin');
    const defaultPath = '/index.html';
    
    if (redirectPath && redirectPath !== '/login.html') {
      this.cookieManager.deleteCookie('redirectAfterLogin');
      window.location.href = redirectPath;
    } else {
      window.location.href = defaultPath;
    }
  }

  /**
   * Protect a route - redirect to login if not authenticated
   * @param {string} redirectTo - URL to redirect to after login
   * @returns {boolean} True if user is authenticated
   */
  protectRoute(redirectTo = null) {
    if (!this.isAuthenticated()) {
     // this.redirectToLogin(redirectTo);
      return false;
    }
    return true;
  }

  /**
   * Logout user and clear all authentication data
   */
  async logout() {
    try {
      const tokens = this.cookieManager.getAuthTokens();
      
      if (tokens.token) {
        await this.authService.logout(tokens.token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data regardless of API call success
      this.cookieManager.clearAuthTokens();
      this.cookieManager.deleteCookie('redirectAfterLogin');
      
      // Redirect to login page
      window.location.href = '/login.html';
    }
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded() {
    const tokens = this.cookieManager.getAuthTokens();
    
    if (!tokens.refreshToken) {
      return false;
    }

    try {
      const response = await this.authService.refreshToken(tokens.refreshToken);
      
      if (response.token) {
        // Save new token
        const tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.cookieManager.setCookie('token', response.token, tokenExpiry);
        
        if (response.refreshToken) {
          this.cookieManager.setCookie('refreshToken', response.refreshToken, tokenExpiry);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.cookieManager.clearAuthTokens();
    }
    
    return false;
  }

  /**
   * Get current user info from token
   * @returns {Object|null} User info or null
   */
  getCurrentUser() {
    const token = this.cookieManager.getCookie('token');
    
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.sub || payload.username,
        roles: payload.roles || [],
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes(role);
  }

  /**
   * Initialize authentication middleware
   * Call this on page load to check authentication status
   */
  init() {
    // Check if we're on a protected page
    const protectedPages = ['/index.html', '/dashboard.html', '/profile.html'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.includes(currentPath)) {
      this.protectRoute();
    }
  }
}

// Create global instance
export const authMiddleware = new AuthMiddleware();

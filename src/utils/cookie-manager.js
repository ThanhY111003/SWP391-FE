/**
 * Cookie Manager Utility
 * Handles cookie operations for token storage
 */
export class CookieManager {
  /**
   * Set a cookie with specified name, value, and expiration
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} expirationTime - Expiration time in milliseconds
   * @param {string} path - Cookie path (default: '/')
   * @param {boolean} secure - Secure flag (default: false for localhost)
   * @param {string} sameSite - SameSite attribute (default: 'Lax')
   */
  setCookie(name, value, expirationTime, path = '/', secure = false, sameSite = 'Lax') {
    const expires = new Date(Date.now() + expirationTime).toUTCString();
    const secureFlag = secure ? '; Secure' : '';
    const sameSiteFlag = sameSite ? `; SameSite=${sameSite}` : '';
    
    document.cookie = `${name}=${value}; expires=${expires}; path=${path}${secureFlag}${sameSiteFlag}`;
  }

  /**
   * Get cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  /**
   * Delete a cookie by setting its expiration to the past
   * @param {string} name - Cookie name
   * @param {string} path - Cookie path (default: '/')
   */
  deleteCookie(name, path = '/') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }

  /**
   * Delete multiple cookies
   * @param {string[]} names - Array of cookie names to delete
   * @param {string} path - Cookie path (default: '/')
   */
  deleteCookies(names, path = '/') {
    names.forEach(name => this.deleteCookie(name, path));
  }

  /**
   * Check if a cookie exists
   * @param {string} name - Cookie name
   * @returns {boolean} True if cookie exists
   */
  hasCookie(name) {
    return this.getCookie(name) !== null;
  }

  /**
   * Get all cookies as an object
   * @returns {Object} Object with cookie names as keys and values as values
   */
  getAllCookies() {
    const cookies = {};
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      });
    }
    return cookies;
  }

  /**
   * Clear all cookies (use with caution)
   * @param {string} path - Cookie path (default: '/')
   */
  clearAllCookies(path = '/') {
    const cookies = this.getAllCookies();
    Object.keys(cookies).forEach(name => {
      this.deleteCookie(name, path);
    });
  }

  /**
   * Set authentication tokens
   * @param {string} token - Access token
   * @param {string} refreshToken - Refresh token
   * @param {number} expirationTime - Expiration time in milliseconds
   */
  setAuthTokens(token, refreshToken, expirationTime) {
    this.setCookie('token', token, expirationTime);
    this.setCookie('refreshToken', refreshToken, expirationTime);
  }

  /**
   * Get authentication tokens
   * @returns {Object} Object with token and refreshToken
   */
  getAuthTokens() {
    return {
      token: this.getCookie('token'),
      refreshToken: this.getCookie('refreshToken')
    };
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens() {
    this.deleteCookies(['token', 'refreshToken']);
  }

  /**
   * Check if user has valid authentication tokens
   * @returns {boolean} True if both tokens exist
   */
  hasAuthTokens() {
    const tokens = this.getAuthTokens();
    return !!(tokens.token && tokens.refreshToken);
  }
}

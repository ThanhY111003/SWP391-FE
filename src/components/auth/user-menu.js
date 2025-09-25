/**
 * User Menu Component
 * Displays user information and logout functionality
 */
import { authMiddleware } from '../../utils/auth-middleware.js';

export class UserMenu {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.user = authMiddleware.getCurrentUser();
  }

  /**
   * Render user menu
   */
  render() {
    if (!this.container || !this.user) {
      return;
    }

    this.container.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fas fa-user me-2"></i>
          ${this.user.username}
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li>
            <h6 class="dropdown-header">
              <i class="fas fa-user-circle me-2"></i>
              ${this.user.username}
            </h6>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item" href="#" id="profileLink">
              <i class="fas fa-user me-2"></i>
              Profile
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" id="settingsLink">
              <i class="fas fa-cog me-2"></i>
              Settings
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-danger" href="#" id="logoutLink">
              <i class="fas fa-sign-out-alt me-2"></i>
              Logout
            </a>
          </li>
        </ul>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Attach event listeners to menu items
   */
  attachEventListeners() {
    const profileLink = document.getElementById('profileLink');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');

    if (profileLink) {
      profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleProfileClick();
      });
    }

    if (settingsLink) {
      settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSettingsClick();
      });
    }

    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogoutClick();
      });
    }
  }

  /**
   * Handle profile link click
   */
  handleProfileClick() {
    // Redirect to profile page
    window.location.href = '/profile.html';
  }

  /**
   * Handle settings link click
   */
  handleSettingsClick() {
    // Redirect to settings page
    window.location.href = '/settings.html';
  }

  /**
   * Handle logout link click
   */
  async handleLogoutClick() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await authMiddleware.logout();
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        authMiddleware.logout();
      }
    }
  }

  /**
   * Update user information
   */
  updateUser(user) {
    this.user = user;
    this.render();
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="spinner-border spinner-border-sm text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
    }
  }

  /**
   * Hide user menu
   */
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

/**
 * Initialize user menu on page load
 */
export function initUserMenu(containerId = 'userMenu') {
  const userMenu = new UserMenu(containerId);
  userMenu.render();
  return userMenu;
}

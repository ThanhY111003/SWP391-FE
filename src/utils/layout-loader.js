// Simple layout loader: injects shared header and footer into pages

async function fetchPartial(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) return '';
    return await res.text();
  } catch (_) {
    return '';
  }
}

export async function injectLayout() {
  // Skip on login page
  if (window.location.pathname.toLowerCase().includes('login.html')) {
    return;
  }

  const headerHtml = await fetchPartial('/partials/header.html');
  const footerHtml = await fetchPartial('/partials/footer.html');
  const sidebarHtml = await fetchPartial('/partials/sidebar.html');

  // Header: try known containers, else prepend to body
  if (headerHtml) {
    const headerContainer = document.querySelector('[data-include="header"], .top_nav, .nav_menu');
    if (headerContainer) {
      headerContainer.innerHTML = headerHtml;
    } else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = headerHtml;
      document.body.prepend(wrapper);
    }
  }

  // Footer: try known containers, else append to body
  if (footerHtml) {
    const footerContainer = document.querySelector('[data-include="footer"], footer, .footer_fixed, .footer_content');
    if (footerContainer) {
      footerContainer.innerHTML = footerHtml;
    } else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = footerHtml;
      document.body.appendChild(wrapper);
    }
  }

  // Sidebar: try known containers, else prepend to body
  if (sidebarHtml) {
    const sidebarContainer = document.querySelector('[data-include="sidebar"], .left_col, .col-md-3.left_col');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = sidebarHtml;
    } else {
      // If page has bootstrap layout, inject into a wrapper
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.innerHTML = `${sidebarHtml}<div id="layout-content" style="flex:1;min-height:100vh"></div>`;
      // Move current body children into layout-content
      const children = Array.from(document.body.childNodes);
      document.body.innerHTML = '';
      document.body.appendChild(wrapper);
      const content = document.getElementById('layout-content');
      children.forEach(node => content.appendChild(node));
    }
  }

  // After all parts are injected, (re)bind interactions
  bindLayoutInteractions();
}

function bindLayoutInteractions() {
  // Sidebar width toggle (nav-md <-> nav-sm)
  const menuToggle = document.getElementById('menu_toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      const body = document.body;
      if (body.classList.contains('nav-md')) {
        body.classList.remove('nav-md');
        body.classList.add('nav-sm');
      } else {
        body.classList.remove('nav-sm');
        body.classList.add('nav-md');
      }
    });
  }

  // Sidebar submenu expand/collapse
  const sidebar = document.getElementById('sidebar-menu');
  if (sidebar) {
    sidebar.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) { return; }
      const nextUl = link.nextElementSibling;
      if (nextUl && nextUl.classList && nextUl.classList.contains('child_menu')) {
        e.preventDefault();
        const isOpen = nextUl.style.display === 'block';
        nextUl.style.display = isOpen ? 'none' : 'block';
      }
    });
    // Ensure child menus are hidden by default for nav-sm
    if (document.body.classList.contains('nav-sm')) {
      sidebar.querySelectorAll('.child_menu').forEach(ul => ul.style.display = 'none');
    }
  }

  // Initialize Bootstrap dropdowns and tooltips on injected header
  if (window.bootstrap) {
    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
      try { new window.bootstrap.Dropdown(el); } catch (_) {}
    });
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      try { new window.bootstrap.Tooltip(el); } catch (_) {}
    });
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
      try { new window.bootstrap.Popover(el); } catch (_) {}
    });
  }
}

// Auto-run when ready (immediately if DOM already loaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => injectLayout());
} else {
  injectLayout();
}



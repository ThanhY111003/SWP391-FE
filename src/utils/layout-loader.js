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
}

// Auto-run after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
});



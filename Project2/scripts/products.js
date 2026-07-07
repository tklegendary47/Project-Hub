/**
 * Matimaku Mansions - Products Module
 * Handles loading, filtering, searching, and rendering of products
 */

(function() {
  'use strict';

  // State
  let allProducts = [];
  let currentCategory = 'All';
  let searchQuery = '';
  let searchTimeout = null;

  // DOM Elements
  const grid = document.getElementById('products-grid');
  const countDisplay = document.getElementById('product-count');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('product-search');
  const emptyState = document.getElementById('products-empty');

  /* ========================================================================
     Utility Functions
     ======================================================================== */

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} str - Raw string
   * @returns {string} Escaped string
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Format price with commas and dollar sign
   * @param {number} price - Raw price
   * @returns {string} Formatted price
   */
  function formatPrice(price) {
    return '$' + price.toLocaleString('en-US');
  }

  /**
   * Truncate text to specified length with ellipsis
   * @param {string} text - Input text
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /* ========================================================================
     Skeleton Loading
     ======================================================================== */

  function showSkeleton() {
    if (!grid) return;
    grid.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      skeleton.innerHTML = `
        <div class="skeleton__image"></div>
        <div class="skeleton__content">
          <div class="skeleton__line skeleton__line--short"></div>
          <div class="skeleton__line skeleton__line--medium"></div>
          <div class="skeleton__line skeleton__line--long"></div>
          <div class="skeleton__line skeleton__line--long"></div>
        </div>
      `;
      grid.appendChild(skeleton);
    }
  }

  function hideSkeleton() {
    // Skeleton is replaced when real products are rendered
  }

  /* ========================================================================
     Product Card Creation
     ======================================================================== */

  /**
   * Create HTML for a single product card
   * @param {Object} product - Product data
   * @returns {string} HTML string
   */
  function createProductCard(product) {
    const safeName = escapeHtml(product.name);
    const safeCategory = escapeHtml(product.category);
    const safeDescription = escapeHtml(truncateText(product.description, 80));
    const safeId = escapeHtml(product.id);
    const safeImage = escapeHtml(product.image);
    const formattedPrice = formatPrice(product.price);
    
    const whatsappText = encodeURIComponent(
      `Hi Matimaku Mansions, I'm interested in ordering: ${product.name} (${product.id}) - Price: ${formattedPrice}`
    );
    const whatsappUrl = `https://wa.me/263717549840?text=${whatsappText}`;

    return `
      <article class="product-card reveal" data-category="${safeCategory}">
        <div class="product-card__image-wrapper">
          <img 
            src="${safeImage}" 
            alt="${safeName} - ${safeCategory} by Matimaku Mansions" 
            class="product-card__image"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <div class="product-card__placeholder" style="display:none;">
            <span class="product-card__placeholder-text">M</span>
          </div>
        </div>
        <div class="product-card__content">
          <span class="product-card__category">${safeCategory}</span>
          <h3 class="product-card__name">${safeName}</h3>
          <p class="product-card__price">${formattedPrice}</p>
          <p class="product-card__description">${safeDescription}</p>
          <a 
            href="${whatsappUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-primary product-card__btn"
            aria-label="Order ${safeName} via WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order Now
          </a>
        </div>
      </article>
    `;
  }

  /* ========================================================================
     Render Products
     ======================================================================== */

  /**
   * Render products to the grid
   * @param {Array} products - Array of product objects
   */
  function renderProducts(products) {
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (products.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      updateProductCount(0, allProducts.length);
      return;
    }
    
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    const fragment = document.createDocumentFragment();
    
    products.forEach(function(product, index) {
      const cardHtml = createProductCard(product);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = cardHtml;
      const card = wrapper.firstElementChild;
      
      // Staggered reveal delay
      card.style.transitionDelay = (index * 50) + 'ms';
      
      fragment.appendChild(card);
    });
    
    grid.appendChild(fragment);
    
    // Trigger reveal animation
    requestAnimationFrame(function() {
      const cards = grid.querySelectorAll('.reveal');
      cards.forEach(function(card) {
        card.classList.add('active');
      });
    });
    
    updateProductCount(products.length, allProducts.length);
  }

  /* ========================================================================
     Filter & Search
     ======================================================================== */

  /**
   * Filter products by category
   * @param {string} category - Category name
   */
  function filterProducts(category) {
    currentCategory = category;
    
    // Update active button state
    filterButtons.forEach(function(btn) {
      btn.classList.remove('filter-btn--active');
      btn.setAttribute('aria-pressed', 'false');
      if (btn.dataset.category === category) {
        btn.classList.add('filter-btn--active');
        btn.setAttribute('aria-pressed', 'true');
      }
    });
    
    applyFilters();
  }

  /**
   * Search products by query
   * @param {string} query - Search string
   */
  function searchProducts(query) {
    searchQuery = query.toLowerCase().trim();
    applyFilters();
  }

  /**
   * Apply both category filter and search query
   */
  function applyFilters() {
    let filtered = allProducts;
    
    // Category filter
    if (currentCategory !== 'All') {
      filtered = filtered.filter(function(p) {
        return p.category === currentCategory;
      });
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(function(p) {
        const nameMatch = p.name.toLowerCase().includes(searchQuery);
        const descMatch = p.description.toLowerCase().includes(searchQuery);
        const catMatch = p.category.toLowerCase().includes(searchQuery);
        return nameMatch || descMatch || catMatch;
      });
    }
    
    renderProducts(filtered);
  }

  /**
   * Update product count display
   * @param {number} visible - Number of visible products
   * @param {number} total - Total number of products
   */
  function updateProductCount(visible, total) {
    if (countDisplay) {
      countDisplay.textContent = 'Showing ' + visible + ' of ' + total + ' products';
    }
  }

  /* ========================================================================
     Load Products
     ======================================================================== */

  function loadProducts() {
    showSkeleton();
    
    fetch('data/products.json')
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load products: ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        allProducts = data.products || [];
        hideSkeleton();
        renderProducts(allProducts);
      })
      .catch(function(error) {
        console.error('Error loading products:', error);
        if (grid) {
          grid.innerHTML = `
            <div class="products__empty" style="grid-column: 1 / -1;">
              <div class="products__empty-icon">⚠️</div>
              <h3 class="products__empty-title">Unable to Load Products</h3>
              <p class="products__empty-text">Please check your connection and refresh the page.</p>
            </div>
          `;
        }
      });
  }

  /* ========================================================================
     Event Listeners
     ======================================================================== */

  // Filter buttons
  filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterProducts(this.dataset.category);
    });
  });

  // Search input with debounce
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function() {
        searchProducts(searchInput.value);
      }, 300);
    });
    
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchProducts('');
        searchInput.blur();
      }
    });
  }

  /* ========================================================================
     Initialize
     ======================================================================== */
  
  // Load products when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
  } else {
    loadProducts();
  }

})();

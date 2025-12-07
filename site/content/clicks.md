---
date: 2024-02-24
title: Snapshots
description: Photodump
previewimage: https://i.imgur.com/KUet9BN.jpg
layout: page
---

<!-- <br/> -->

<!-- > 🚧 this page under maintenance  -->

<!-- # Gallery -->

> 📸 Am a bit lazy to put up a lot of pics here, so here is my [unsplash](https://unsplash.com/@adihegde), might update this page in a while. Currently using a Cannon EOS Rebel XSi (no idea about the lens) and a Sony a6700 with a Sony E PZ G 18-105 mm F4 G Lens

<div class="image-grid" id="image-grid">
</div>

<script>
(function() {
  'use strict';

  const GRID_ID = 'image-grid';
  const CONFIG_URL = '/static/images.json';

  /**
   * Fetch images.json with caching enabled
   */
  async function fetchConfig() {
    try {
      const response = await fetch(CONFIG_URL, {
        cache: 'default', // use browser cache
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Failed to load images config:', err);
      return null;
    }
  }

  /**
   * Generate image URLs from a source config
   * @param {Object} source - { baseUrl, prefix, range: [start, end], extension?: string }
   * @returns {Array<Object>} - array of { lowRes, highRes } URL pairs
   */
  function generateImageUrls(source) {
    const { baseUrl, prefix, range, extension = '.jpg' } = source;
    if (!baseUrl || !prefix || !Array.isArray(range) || range.length !== 2) {
      console.warn('Invalid source config:', source);
      return [];
    }

    const [start, end] = range;
    const urls = [];
    for (let i = start; i <= end; i++) {
      urls.push({
        lowRes: `${baseUrl}/small/${prefix}-${i}_small${extension}`,
        highRes: `${baseUrl}/${prefix}-${i}${extension}`
      });
    }
    return urls;
  }

  /**
   * Create an image element with progressive lazy loading
   * @param {Object} urlPair - { lowRes, highRes }
   * @returns {HTMLElement} - image wrapper div
   */
  function createImageElement(urlPair) {
    const { lowRes, highRes } = urlPair;
    const wrapper = document.createElement('div');
    wrapper.className = 'image-item';

    const img = document.createElement('img');
    img.src = lowRes; // load low-res first
    img.alt = 'Gallery image';
    img.loading = 'lazy'; // native lazy loading
    img.decoding = 'async';
    img.className = 'image-loading'; // optional: add class for blur effect

    // Load high-res image and swap when ready
    const highResImg = new Image();
    highResImg.onload = function() {
      img.src = highRes;
      img.className = 'image-loaded';
    };
    highResImg.onerror = function() {
      console.warn('Failed to load high-res image:', highRes);
      // Keep low-res version on error
    };
    
    // Start loading high-res once low-res is in viewport (triggered by lazy loading)
    img.addEventListener('load', function() {
      highResImg.src = highRes;
    }, { once: true });

    // Click handler opens full high-res image
    img.addEventListener('click', function() {
      window.open(highRes, '_blank');
    });

    // Error handling for low-res
    img.addEventListener('error', function() {
      console.warn('Failed to load image:', lowRes);
      wrapper.style.display = 'none';
    });

    wrapper.appendChild(img);
    return wrapper;
  }

  /**
   * Populate the grid with images
   * @param {Array<Object>} sources - array of source configs
   */
  function populateGrid(sources) {
    const grid = document.getElementById(GRID_ID);
    if (!grid) {
      console.error(`Element with id="${GRID_ID}" not found`);
      return;
    }

    // Clear existing content
    grid.innerHTML = '';

    // Generate all image URLs from all sources
    const allUrls = [];
    sources.forEach(source => {
      const urls = generateImageUrls(source);
      allUrls.push(...urls);
    });

    if (allUrls.length === 0) {
      grid.innerHTML = '<p>No images configured</p>';
      return;
    }

    // Create and append image elements
    const fragment = document.createDocumentFragment();
    allUrls.forEach(url => {
      fragment.appendChild(createImageElement(url));
    });
    grid.appendChild(fragment);

    console.log(`Loaded ${allUrls.length} images into grid`);
  }

  /**
   * Initialize the gallery
   */
  async function init() {
    const config = await fetchConfig();
    if (!config || !Array.isArray(config.sources)) {
      console.error('Invalid or missing sources in config');
      return;
    }

    populateGrid(config.sources);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
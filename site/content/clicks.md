---
date: 2024-02-24
title: Snapshots
description: Photodump
previewimage: https://i.imgur.com/KUet9BN.jpg
layout: page
---



> Camera gear: Cannon EOS Rebel XSi (no idea about the lens) and Sony a6700 with a Sony E PZ G 18-105 mm F4 G Lens
>
> Click on any image for the _high resolution version_. You can find my other stills on [unsplash](https://unsplash.com/@adihegde), this page just has some of the recent posts on unsplash :)

<div class="image-grid" id="image-grid"></div>

<script>
(() => {
  const grid = document.getElementById('image-grid');
  if (!grid) return;

  const url = 'https://unsplash.aditya-mh.workers.dev?username=adihegde&pages=1&per_page=10';

  const render = (images) => {
    if (!Array.isArray(images) || images.length === 0) {
      grid.innerHTML = '<p>No images found</p>';
      return;
    }

    const frag = document.createDocumentFragment();

    for (const imgData of images) {
      const wrap = document.createElement('div');
      wrap.className = 'image-item';

      const img = document.createElement('img');
      img.src = imgData.lowRes;
      img.alt = imgData.alt || `Photo ${imgData.id}`;
      img.loading = 'lazy';
      img.decoding = 'async';

      img.addEventListener('click', () => window.open(imgData.highRes, '_blank'));
      img.addEventListener('error', () => { wrap.style.display = 'none'; });

      wrap.appendChild(img);
      frag.appendChild(wrap);
    }

    grid.replaceChildren(frag);
  };

  const init = async () => {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      render(data?.images);
    } catch {
      render(null);
    }
  };

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
</script>

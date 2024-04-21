---
date: 2024-02-24
title: Snapshots
description: Photodump
previewimage: https://i.imgur.com/KUet9BN.jpg
type: page
---

# Snapshots

---

##### Pondicherry 2022
###### Camera: Canon Rebel EOS

<div class="image-grid">

![Pondi costal drive](https://i.imgur.com/EdVqF3s.jpg)

![Pondi costal view](https://i.imgur.com/K5RGcQI.jpg)

![Hillside drive](https://i.imgur.com/KUet9BN.jpg)

![Peaky hills](https://i.imgur.com/h5S0i45.jpg)

![Bay of bengal from a window with some trees](https://i.imgur.com/cgACPjM.jpg)

![Bay of bengal from a window](https://i.imgur.com/rwB61P4.jpg)

![More hills in tamil nadu](https://i.imgur.com/NTrFuRn.jpg)

![Railway Station](https://i.imgur.com/GJIXTg4.jpg)

</div>

---

##### /college
###### Camera: Canon Rebel, iPhone 12 & Canon Powershot

<div class="image-grid">

![Shot down wall](https://i.imgur.com/4aCMwYW.jpg)

![Window through the fort](https://i.imgur.com/A7OPUuM.jpg)

![Ghat descent on west cost](https://i.imgur.com/agAwA6L.jpg)

![Hole in the Wall in Kormangala is a vibe!](https://i.imgur.com/zLDGtul.jpg)

![HEHEHEHE](https://i.imgur.com/eCGcOri.jpg)

![Vidhan Soudha, which ive surprisingly never even after spending my whole life here](https://i.imgur.com/ohigp5U.jpg)

![Frist go meetup in bangalore with Sudhir and Nathan](https://i.imgur.com/G0JYhn1.jpg)

![Blurry snap from foss talk](https://i.imgur.com/7OAa8tn.jpg)

![First hackathon - hacknite](https://i.imgur.com/Yg3di6k.jpg)

![Foss talk with friends](https://i.imgur.com/WGTr4Wq.jpg)

![The sexy mall](https://i.imgur.com/UbeGLEd.jpg)

![The sexy mall with a tree](https://i.imgur.com/W4cJO40.jpg)

![Project expo presentation](https://i.imgur.com/JjjO75w.png)

![BeReal inside another](https://i.imgur.com/5HPnfMy.jpg)

</div>

---

##### /dev/random
###### Camera: Canon Rebel, iPhone 12 & Canon Powershot
###### Some really blurry pictures

<div class="image-grid">

![Keychron in some nice lighting](https://i.imgur.com/mroJJik.jpg)

![Black and white rocks](https://i.imgur.com/sMMx1f0.jpg)


![Keychron K2 V2](https://i.imgur.com/NVUKPKO.jpg)

![Cannon Rebel struggles](https://i.imgur.com/r1W9ohZ.jpg)

![Pondicherry Villa](https://i.imgur.com/Pu176PH.jpg)

![Ikea Bengaluru storage](https://i.imgur.com/HZ3hHs0.jpg)

![A really blurry picture](https://i.imgur.com/5Gu1EZQ.jpg)

</div>


<script>
    const galleryImages = document.querySelectorAll('img:not(#theme-toggle)');

    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
            // open source
            window.navigator.vibrate(500);
            window.open(image.src, '_blank');
        });
        // add lazy loading
        image.setAttribute('loading', 'lazy');
    });
</script>

<!-- Some chat GPT'd code for handling images -->
<!-- <div class="image-overlay">
    <span class="close">&times;</span>
    <img loading="lazy" src="" alt="Large image" class="large-image">
</div>

<script>
    const galleryImages = document.querySelectorAll('img:not(#theme-toggle)');
    const imageOverlay = document.querySelector('.image-overlay');
    const largeImage = document.querySelector('.large-image');
    const close = document.querySelector('.close');

    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
        imageOverlay.style.visibility = 'visible';
        imageOverlay.style.opacity = '1';
        largeImage.src = image.src;
        });
    });

    close.addEventListener('click', () => {
        imageOverlay.style.visibility = 'hidden';
        imageOverlay.style.opacity = '0';
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            imageOverlay.style.visibility = 'hidden';
            imageOverlay.style.opacity = '0';
        }
    });


</script> -->

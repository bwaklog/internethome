(function() {
    const target = document.getElementById('lastfm');
    if (!target) return;

    const fallbackImg = 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.jpg';

    const timeAgo = (uts) => {
        if (!uts) return '<img src="/static/visualizer.gif" alt="playing" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 0.3em; display: inline-block;"/> Scrobbling now';
        const diffMs = Math.max(0, Date.now() - Number(uts) * 1000);
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    fetch('https://lastfm.adihegde.com', { headers: { Accept: 'application/json' } })
        .then((r) => r.json())
        .then((data) => {
            const tracks = data?.result?.recenttracks?.track || [];
            const top5 = tracks.slice(0, 5);

            const container = document.createElement('div');

            const header = document.createElement('p');
            // header.style.fontSize = '1.05rem';
            // header.style.color = 'var(--color-text-dim, #666)';
            // header.style.fontFamily = "JuliaMono, monospace"
            header.style.marginBottom = '1rem';
            header.style.marginTop = '0';
            header.innerHTML = 'Recent scrobbles (<a href="https://www.last.fm/user/bwaklog" target="_blank" rel="noopener">lastfm</a>)';
            container.appendChild(header);

            const list = document.createElement('div');
            list.className = 'lastfm-list';

            top5.forEach((track, idx) => {
                const cover =
                    (track.image || []).find((img) => img.size === 'large')?.['#text'] ||
                    (track.image || [])[0]?.['#text'] ||
                    fallbackImg;

                const title = track.name || 'Unknown title';
                const artist = track.artist?.['#text'] || 'Unknown artist';
                const href = track.url || '#';
                const ago = timeAgo(track.date?.uts);
                const isNowPlaying = idx === 0 && !track.date;

                const row = document.createElement('div');
                row.className = 'lastfm-row';

                // if (isNowPlaying) {
                //     const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--inline-code-bg').trim();
                //     row.style.backgroundColor = bgColor;
                // }

                row.innerHTML = `
          <img class="cover" src="${cover}" alt="${title}" loading="lazy" />
          <div class="meta">
            <a class="title" href="${href}" target="_blank" rel="noopener">${title}</a>
            <p class="artist">${artist}</p>
          </div>
          <div class="time">${isNowPlaying ? ago : ago}</div>
        `;
                list.appendChild(row);
            });

            container.appendChild(list);
            target.innerHTML = '';
            target.appendChild(container);
        })
        .catch((err) => {
            console.error('Last.fm fetch failed:', err);
            target.textContent = 'Unable to load recent tracks.';
        });
})();

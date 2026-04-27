(function () {
  const target = document.getElementById("lastfm");
  if (!target) return;

  const formatDate = (uts) => {
    if (!uts)
      return '<img src="/static/visualizer.gif" alt="playing" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 0.3em; display: inline-block;"/> Scrobbling now';
    const date = new Date(Number(uts) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  fetch("https://lastfm.adihegde.com", {
    headers: { Accept: "application/json" },
  })
    .then((r) => r.json())
    .then((data) => {
      const tracks = data?.result?.recenttracks?.track || [];
      const top5 = tracks.slice(0, 5);

      const container = document.createElement("div");

      const header = document.createElement("p");
      header.style.marginBottom = "1rem";
      header.style.marginTop = "0";
      header.innerHTML =
        'Recent scrobbles (<a href="https://www.last.fm/user/bwaklog" target="_blank" rel="noopener">lastfm</a>)';
      container.appendChild(header);

      const list = document.createElement("div");
      list.className = "lastfm-list";

      top5.forEach((track, idx) => {
        const title = track.name || "Unknown title";
        const artist = track.artist?.["#text"] || "Unknown artist";
        const href = track.url || "#";
        const isNowPlaying = idx === 0 && !track.date;
        const dateStr = formatDate(track.date?.uts);

        const row = document.createElement("div");
        row.className = "lastfm-row";

        row.innerHTML = `
          <a class="title" href="${href}" target="_blank" rel="noopener">${title}</a>
          <span class="artist">by ${artist}</span>
        `;
        list.appendChild(row);
      });

      container.appendChild(list);
      target.innerHTML = "";
      target.appendChild(container);
    })
    .catch((err) => {
      console.error("Last.fm fetch failed:", err);
      target.textContent = "Unable to load recent tracks.";
    });
})();

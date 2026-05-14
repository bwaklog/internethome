(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const canvas = document.createElement("canvas");
  canvas.id = "life-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const mount = () => {
    if (!document.body) {
      return;
    }
    document.body.prepend(canvas);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return;
  }

  let cellSize = 8;
  let cols = 0;
  let rows = 0;
  let grid = [];
  let next = [];
  let backgroundColor = "#ffffff";
  let cellColor = "#000000";
  let lastTick = 0;

  const updateColors = () => {
    const styles = getComputedStyle(document.documentElement);
    backgroundColor =
      styles.getPropertyValue("--color-background").trim() || "#ffffff";
    cellColor = styles.getPropertyValue("--color-text-low").trim() || "#000000";
  };

  const createGrid = () =>
    Array.from({ length: rows }, () => new Uint8Array(cols));

  const seed = (density = 0.08) => {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        grid[y][x] = Math.random() < density ? 1 : 0;
      }
    }
  };

  let resizeScheduled = false;

  const getPageSize = () => {
    const doc = document.documentElement;
    const body = document.body;
    const width = window.innerWidth;
    const height = Math.max(
      doc.scrollHeight,
      doc.offsetHeight,
      body.scrollHeight,
      body.offsetHeight,
      window.innerHeight,
    );

    return { width, height };
  };

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = getPageSize();

    cellSize = width < 640 ? 6 : 8;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    cols = Math.max(1, Math.floor(width / cellSize));
    rows = Math.max(1, Math.floor(height / cellSize));
    grid = createGrid();
    next = createGrid();
    seed();
    draw();
  };

  const scheduleResize = () => {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      resize();
    });
  };

  const countNeighbors = (x, y) => {
    let sum = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        const nx = (x + dx + cols) % cols;
        const ny = (y + dy + rows) % rows;
        sum += grid[ny][nx];
      }
    }
    return sum;
  };

  const step = () => {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const neighbors = countNeighbors(x, y);
        const alive = grid[y][x] === 1;
        const nextAlive =
          (alive && (neighbors === 2 || neighbors === 3)) ||
          (!alive && neighbors === 3);
        next[y][x] = nextAlive ? 1 : 0;
      }
    }

    const tmp = grid;
    grid = next;
    next = tmp;
  };

  const draw = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = cellColor;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (grid[y][x]) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    ctx.restore();
  };

  const animate = (time) => {
    const tick = time - lastTick;
    if (tick >= 400) {
      step();
      draw();
      lastTick = time;
    }
    requestAnimationFrame(animate);
  };

  updateColors();
  resize();

  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (colorScheme.addEventListener) {
    colorScheme.addEventListener("change", () => {
      updateColors();
      draw();
    });
  }

  window.addEventListener("resize", scheduleResize);
  window.addEventListener("load", scheduleResize);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleResize).catch(() => {});
  }

  if ("ResizeObserver" in window && document.body) {
    const observer = new ResizeObserver(() => {
      scheduleResize();
    });
    observer.observe(document.body);
  }

  if (!prefersReducedMotion) {
    requestAnimationFrame(animate);
  }
})();

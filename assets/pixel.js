/* HARD MODE FOR HACKERS: shared palette and sprite maker.
   Every game in the collection uses only the colors in C. */
const C = {
  ink: "#0d0a26", night: "#14103a", indigo: "#2a1f6b", purple: "#6a3d9a", lavender: "#c58bff",
  magenta: "#b0247a", pop: "#ff4f9a", blush: "#ffb3d1", sun: "#ffd23f", orange: "#ff8a1c",
  cream: "#fff3b0", paper: "#ffffff", neon: "#38e8ff", teal: "#1282a2", deep: "#0a5c78",
  abyss: "#083f5e", safe: "#35e89b", danger: "#ff4d5e", skin: "#f2b28a", wood: "#8a4b2a"
};

/* Every sprite is text art. This turns it into a small canvas
   with a dark outline. Pass white = true for a hit-flash copy. */
function makeSprite(rows, colors, white) {
  const width = Math.max(...rows.map((row) => row.length));
  const canvas = document.createElement("canvas");
  canvas.width = width + 2;
  canvas.height = rows.length + 2;
  const paint = canvas.getContext("2d");
  const filled = (x, y) => rows[y] && colors[rows[y][x]];

  paint.fillStyle = C.ink;
  rows.forEach((row, y) => {
    for (let x = -1; x <= width; x++) {
      const touchesArt = filled(x, y) || filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1);
      if (touchesArt) paint.fillRect(x + 1, y + 1, 1, 1);
    }
  });
  [-1, rows.length].forEach((y) => {
    for (let x = 0; x < width; x++) {
      if (filled(x, y + (y < 0 ? 1 : -1))) paint.fillRect(x + 1, y + 1, 1, 1);
    }
  });

  rows.forEach((row, y) => {
    [...row].forEach((code, x) => {
      if (!colors[code]) return;
      paint.fillStyle = white ? C.paper : colors[code];
      paint.fillRect(x + 1, y + 1, 1, 1);
    });
  });
  return canvas;
}

function copySprite(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.setAttribute("aria-hidden", "true");
  canvas.getContext("2d").drawImage(image, 0, 0);
  return canvas;
}

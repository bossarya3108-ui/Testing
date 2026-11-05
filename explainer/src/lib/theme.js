"use strict";

const theme = {
  width: 1920,
  height: 1080,
  fps: 30,

  color: {
    bg0: "#03070f",
    bg1: "#061225",
    bg2: "#0a1d35",
    panel: "rgba(8, 21, 39, 0.82)",
    panelHi: "rgba(17, 38, 66, 0.72)",
    line: "rgba(96, 150, 220, 0.22)",
    lineStrong: "rgba(90, 162, 255, 0.55)",
    ink: "#eef5ff",
    muted: "#93a9c7",
    dim: "#617795",
    faint: "#3f5573",
    blue: "#2f7bff",
    blueSoft: "#5a9dff",
    cyan: "#35e0ff",
    cyanSoft: "#8aeeff",
    green: "#39e6a1",
    greenSoft: "#7cf0c3",
    amber: "#ffb547",
    red: "#ff5c74",
    white: "#ffffff",
    navy: "#071a30",
  },

  font: {
    body: "Inter",
    display: "Space Grotesk",
    mono: "JetBrains Mono",
  },
};

theme.fonts = {
  body: (size, weight = 400) => `${weight} ${size}px ${theme.font.body}`,
  display: (size, weight = 700) => `${weight} ${size}px ${theme.font.display}`,
  mono: (size, weight = 400) => `${weight} ${size}px ${theme.font.mono}`,
};

module.exports = theme;

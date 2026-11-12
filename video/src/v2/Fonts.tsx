import { useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// Inter Tight and JetBrains Mono (variable, OFL-1.1): the website's own files from @fontsource-variable.
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const faces = [
  { family: "Inter Tight", file: "fonts/inter-tight-latin-wght-normal.woff2", range: LATIN },
  { family: "Inter Tight", file: "fonts/inter-tight-latin-ext-wght-normal.woff2", range: LATIN_EXT },
  { family: "JetBrains Mono", file: "fonts/jetbrains-mono-latin-wght-normal.woff2", range: LATIN },
  { family: "JetBrains Mono", file: "fonts/jetbrains-mono-latin-ext-wght-normal.woff2", range: LATIN_EXT },
];

export const Fonts = () => {
  useState(() => {
    const handle = delayRender("Inter Tight, JetBrains Mono");
    Promise.all(
      faces.map((face) => {
        const font = new FontFace(face.family, `url(${staticFile(face.file)}) format("woff2")`, { weight: "100 900", unicodeRange: face.range });
        document.fonts.add(font);
        return font.load();
      }),
    ).then(() => continueRender(handle));
    return handle;
  });
  return null;
};

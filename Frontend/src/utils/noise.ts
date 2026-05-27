// Generates a simple SVG noise texture inline so no external file is needed
// Drop this into your public/ folder or use it to generate noise.svg
export const generateNoiseSVG = () => {
  const svgNoise = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#noise)" opacity="1"/>
</svg>`;
  const blob = new Blob([svgNoise], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
};

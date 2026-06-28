import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC = join(process.cwd(), 'public');
const svgBuffer = readFileSync(join(PUBLIC, 'favicon.svg'));

// All sizes needed for comprehensive device coverage
const icons = [
  // Standard favicons
  { name: 'favicon-16x16.png',   size: 16 },
  { name: 'favicon-32x32.png',   size: 32 },
  { name: 'favicon-48x48.png',   size: 48 },

  // Apple Touch Icons
  { name: 'apple-touch-icon.png',        size: 180 },
  { name: 'apple-touch-icon-76x76.png',  size: 76 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },  // iPad Pro
  { name: 'apple-touch-icon-180x180.png', size: 180 },

  // Android / PWA icons
  { name: 'icon-72.png',   size: 72 },
  { name: 'icon-96.png',   size: 96 },
  { name: 'icon-128.png',  size: 128 },
  { name: 'icon-144.png',  size: 144 },
  { name: 'icon-152.png',  size: 152 },
  { name: 'icon-192.png',  size: 192 },
  { name: 'icon-384.png',  size: 384 },
  { name: 'icon-512.png',  size: 512 },

  // Windows tile icons
  { name: 'mstile-70x70.png',   size: 70 },
  { name: 'mstile-150x150.png', size: 150 },
  { name: 'mstile-310x310.png', size: 310 },

  // Safari pinned tab (monochrome SVG is handled separately)
];

async function generateIcons() {
  console.log('🎨 Generating comprehensive favicon set from favicon.svg...\n');

  for (const icon of icons) {
    await sharp(svgBuffer, { density: 300 })
      .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(PUBLIC, icon.name));
    console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate favicon.ico (multi-size ICO using 16, 32, 48)
  // Sharp doesn't support ICO natively, so we create a 48x48 PNG as favicon.ico fallback
  await sharp(svgBuffer, { density: 300 })
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(PUBLIC, 'favicon.ico'));
  console.log('  ✅ favicon.ico (48x48 PNG fallback)');

  // Generate Safari pinned-tab SVG (monochrome version)
  const safariSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 12 84 L 12 88 L 34 88 L 88 16 L 88 12 L 66 12 Z" fill="black"/>
  <path d="M 12 16 L 12 12 L 34 12 L 45 26.67 L 32.5 43.33 Z" fill="black"/>
  <path d="M 88 84 L 88 88 L 66 88 L 55 73.33 L 67.5 56.67 Z" fill="black"/>
</svg>`;
  writeFileSync(join(PUBLIC, 'safari-pinned-tab.svg'), safariSvg);
  console.log('  ✅ safari-pinned-tab.svg (monochrome)');

  // Generate browserconfig.xml for Microsoft
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/mstile-70x70.png"/>
      <square150x150logo src="/mstile-150x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <TileColor>#0a0a0a</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  writeFileSync(join(PUBLIC, 'browserconfig.xml'), browserconfig);
  console.log('  ✅ browserconfig.xml');

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);

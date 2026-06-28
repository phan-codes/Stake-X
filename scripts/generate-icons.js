import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const svgBuffer = readFileSync(join(process.cwd(), 'public/logo-icon.svg'));

async function generateIcons() {
  console.log('Generating icons...');

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(process.cwd(), 'public/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png (180x180)');

  // Favicon 16x16
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(join(process.cwd(), 'public/favicon-16x16.png'));
  console.log('Generated favicon-16x16.png');

  // Favicon 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(process.cwd(), 'public/favicon-32x32.png'));
  console.log('Generated favicon-32x32.png');

  // PWA Icon 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(process.cwd(), 'public/icon-192.png'));
  console.log('Generated icon-192.png');

  // PWA Icon 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(process.cwd(), 'public/icon-512.png'));
  console.log('Generated icon-512.png');

  console.log('Done!');
}

generateIcons().catch(console.error);

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');
const iconsDir = join(publicDir, 'icons');
const splashDir = join(publicDir, 'splash');

// Icon sizes for PWA
const ICON_SIZES = [
  16, 32, 72, 96, 120, 128, 144, 152, 180, 192, 384, 512
];

// Maskable icons (safe area with 20% padding)
const MASKABLE_SIZES = [192, 512];

// iOS splash screen sizes
const SPLASH_SCREENS = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' }, // iPad Pro 11"
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' }, // iPad
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' }, // iPhone 14 Pro Max
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' }, // iPhone 14 Pro
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone 13/12 Pro
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' }, // iPhone 11 Pro Max
  { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },   // iPhone 11
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208.png' }, // iPhone 8 Plus
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },   // iPhone 8
  { width: 640, height: 1136, name: 'apple-splash-640-1136.png' },   // iPhone SE
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Create directories
  await mkdir(iconsDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });

  const logoPath = join(publicDir, 'logo.svg');

  try {
    // Generate standard icons
    console.log('📱 Generating standard icons...');
    for (const size of ICON_SIZES) {
      const filename = `icon-${size}x${size}.png`;
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 139, g: 92, b: 246, alpha: 1 } // #8b5cf6
        })
        .png()
        .toFile(join(iconsDir, filename));
      console.log(`  ✓ ${filename}`);
    }

    // Generate maskable icons (with safe area padding)
    console.log('\n🎭 Generating maskable icons...');
    for (const size of MASKABLE_SIZES) {
      const filename = `icon-maskable-${size}x${size}.png`;
      const padding = Math.floor(size * 0.2); // 20% padding for safe area
      const logoSize = size - (padding * 2);

      await sharp(logoPath)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 139, g: 92, b: 246, alpha: 1 }
        })
        .png()
        .toFile(join(iconsDir, filename));
      console.log(`  ✓ ${filename}`);
    }

    // Generate Apple Touch Icon
    console.log('\n🍎 Generating Apple Touch Icon...');
    await sharp(logoPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 139, g: 92, b: 246, alpha: 1 }
      })
      .png()
      .toFile(join(iconsDir, 'apple-touch-icon.png'));
    console.log('  ✓ apple-touch-icon.png');

    // Generate Favicon
    console.log('\n⭐ Generating favicon...');
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 139, g: 92, b: 246, alpha: 1 }
      })
      .png()
      .toFile(join(publicDir, 'favicon.ico'));
    console.log('  ✓ favicon.ico');

    // Generate iOS splash screens
    console.log('\n📱 Generating iOS splash screens...');
    for (const splash of SPLASH_SCREENS) {
      // Create splash screen with centered logo
      const logoSize = Math.min(splash.width, splash.height) * 0.4; // 40% of screen

      // Create background
      const background = await sharp({
        create: {
          width: splash.width,
          height: splash.height,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
        }
      }).png().toBuffer();

      // Create logo
      const logo = await sharp(logoPath)
        .resize(Math.floor(logoSize), Math.floor(logoSize), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      // Composite logo on background
      await sharp(background)
        .composite([{
          input: logo,
          top: Math.floor((splash.height - logoSize) / 2),
          left: Math.floor((splash.width - logoSize) / 2)
        }])
        .png()
        .toFile(join(splashDir, splash.name));

      console.log(`  ✓ ${splash.name}`);
    }

    console.log('\n✅ All icons generated successfully!');
    console.log(`\n📂 Icons location: ${iconsDir}`);
    console.log(`📂 Splash screens location: ${splashDir}\n`);

  } catch (error) {
    console.error('\n❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the generator
generateIcons();

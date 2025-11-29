/**
 * Script pour créer des icônes placeholder temporaires
 * Ces icônes seront remplacées par les vraies icônes plus tard
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = join(__dirname, '../public/icons');

// Couleurs KapKurtar
const backgroundColor = '#00A690';
const textColor = '#FFFFFF';

async function createPlaceholderIcons() {
  // Créer le dossier si nécessaire
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 Création des icônes placeholder PWA...\n');

  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}.png`);
    const fontSize = Math.floor(size * 0.35);
    const letterSpacing = Math.floor(size * 0.02);

    // Créer un SVG avec le texte "KK"
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}" rx="${size * 0.15}"/>
        <text
          x="50%"
          y="55%"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="${textColor}"
          text-anchor="middle"
          dominant-baseline="middle"
          letter-spacing="${letterSpacing}"
        >KK</text>
      </svg>
    `;

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✅ icon-${size}.png créé`);
    } catch (error) {
      console.error(`❌ Erreur pour icon-${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 Icônes placeholder créées!');
  console.log('\n📝 Pour utiliser vos vraies icônes:');
  console.log('1. Placez votre logo dans public/icons/icon-source.png');
  console.log('2. Exécutez: npm run generate-icons');
}

createPlaceholderIcons().catch(console.error);

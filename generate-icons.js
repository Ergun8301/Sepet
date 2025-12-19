import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
  // Tailles Android
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  // Tailles iOS
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
  // Favicon
  { size: 32, name: 'favicon-32.png' },
  { size: 16, name: 'favicon-16.png' },
  // Splash screens iOS (plus grandes tailles)
  { size: 1024, name: 'icon-1024.png' },
];

const svgPath = path.join(__dirname, 'public/icons/icon.svg');
const outputDir = path.join(__dirname, 'public/icons');

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Créé: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Erreur pour ${name}:`, error.message);
    }
  }

  console.log('\n✨ Toutes les icônes ont été générées!');
  console.log('📁 Dossier: public/icons/');
}

generateIcons();

/**
 * Script pour générer les icônes PWA
 *
 * Usage:
 * 1. Placer l'image source (icon-source.png) dans public/icons/
 * 2. npm run generate-icons
 *
 * Ou télécharger depuis Supabase:
 * curl -o public/icons/icon-source.png "https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON.png"
 * npm run generate-icons
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = join(__dirname, '../public/icons');
const sourceImage = join(iconsDir, 'icon-source.png');

async function generateIcons() {
  // Créer le dossier si nécessaire
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
  }

  // Vérifier si l'image source existe
  if (!existsSync(sourceImage)) {
    console.error('❌ Image source non trouvée: public/icons/icon-source.png');
    console.log('\nPour télécharger le logo depuis Supabase:');
    console.log('curl -o public/icons/icon-source.png "https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON.png"');
    process.exit(1);
  }

  console.log('🎨 Génération des icônes PWA...\n');

  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}.png`);

    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 166, b: 144, alpha: 1 } // #00A690
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ icon-${size}.png créé`);
    } catch (error) {
      console.error(`❌ Erreur pour icon-${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 Icônes PWA générées avec succès!');
}

generateIcons().catch(console.error);

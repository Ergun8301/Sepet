import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloads = [
  {
    url: 'https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON.png',
    dest: path.join(__dirname, 'public/icons/favicon.png')
  },
  {
    url: 'https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/KK%20fond%20vert%20(6).png',
    dest: path.join(__dirname, 'public/icons/logo-splash.png')
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Téléchargé: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('📥 Téléchargement des logos KapKurtar...\n');

  for (const { url, dest } of downloads) {
    try {
      await downloadFile(url, dest);
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n✨ Terminé!');
}

downloadAll();

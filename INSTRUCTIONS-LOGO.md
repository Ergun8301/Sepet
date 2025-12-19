# 📥 Comment ajouter le vrai logo KapKurtar

Le téléchargement automatique est bloqué. Voici comment faire manuellement :

## Option 1 : Upload manuel (RAPIDE)

1. **Téléchargez le logo** sur votre ordinateur :
   ```
   https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON.png
   ```

2. **Placez le fichier** dans le dossier du projet :
   ```
   public/icons/logo-source.png
   ```

3. **Régénérez les icônes** :
   ```bash
   node generate-icons-from-logo.js
   ```

4. **Rebuild** :
   ```bash
   npm run build
   ```

## Option 2 : Utiliser l'icône "KK" actuelle

Si vous voulez garder l'icône "KK" temporaire, rien à faire !
Elle fonctionne déjà parfaitement.

---

**Note** : Une fois le logo placé, je régénérerai automatiquement toutes les tailles (192px, 512px, Apple Touch Icons, etc.)

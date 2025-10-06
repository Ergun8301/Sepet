# Geocoding Scripts

## geocode-clients.ts

Ce script automatise le géocodage des clients dont la localisation GPS n'a pas encore été définie.

## Fonctionnement

1. Se connecte à Supabase avec les variables d'environnement.
2. Récupère tous les clients où `location IS NULL`.
3. Pour chaque client :
   - Construit une adresse complète à partir de `street`, `postal_code`, `city`, `country`.
   - Appelle l'API Nominatim d'OpenStreetMap.
   - Met à jour la base de données avec les coordonnées GPS ou le statut d'erreur.
4. Respecte la limite d'une requête par seconde (politique Nominatim).

## Utilisation

```bash
npm run geocode

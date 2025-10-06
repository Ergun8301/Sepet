# Geocoding Scripts

## geocode-clients.ts

Ce script automatise le géocodage des clients dont la localisation GPS n'a pas encore été définie.

### Fonctionnement

1. Se connecte à Supabase avec les variables d'environnement
2. Récupère tous les clients où `location IS NULL`
3. Pour chaque client :
   - Construit une adresse complète à partir de `street`, `postal_code`, `city`, `country`
   - Appelle l'API Nominatim d'OpenStreetMap
   - Met à jour la base de données avec les coordonnées GPS ou le statut d'erreur
4. Respecte la limite de taux de 1 requête par seconde (politique Nominatim)

### Utilisation

```bash
npm run geocode
```

### Variables d'environnement requises

- `VITE_SUPABASE_URL` : URL de votre instance Supabase
- `VITE_SUPABASE_ANON_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` : Clé d'authentification

### Statuts de géocodage

- `success` : Coordonnées GPS trouvées et enregistrées
- `not_found` : Adresse non trouvée par Nominatim
- `http_error` : Erreur lors de l'appel API
- `NULL` : Pas encore géocodé

### Notes importantes

- Le script respecte la politique d'utilisation équitable de Nominatim
- Pause de 1 seconde entre chaque requête
- User-Agent personnalisé : `resqfood-geocoder/1.0`
- Les résultats sont enregistrés immédiatement après chaque géocodage

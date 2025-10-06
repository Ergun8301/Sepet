# Geocoding Scripts

Automatisation du géocodage des clients et marchands via l'API Nominatim d'OpenStreetMap.

## Scripts disponibles

### 1. geocode-clients.ts

Géocode uniquement les clients.

```bash
npm run geocode
```

### 2. geocode-merchants.ts

Géocode uniquement les marchands.

```bash
npm run geocode:merchants
```

### 3. geocode-all.ts

Géocode à la fois les clients ET les marchands en une seule exécution.

```bash
npm run geocode:all
```

## Fonctionnement

1. Se connecte à Supabase avec les variables d'environnement
2. Récupère toutes les entrées où `location IS NULL`
3. Pour chaque entrée :
   - Construit une adresse complète à partir de `street`, `postal_code`, `city`, `country`
   - Appelle l'API Nominatim d'OpenStreetMap
   - Met à jour la base de données avec les coordonnées GPS ou le statut d'erreur
4. Respecte la limite de taux de 1 requête par seconde (politique Nominatim)

## Variables d'environnement requises

- `SUPABASE_URL` : URL de votre instance Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role pour les permissions complètes

## Statuts de géocodage

- `success` : Coordonnées GPS trouvées et enregistrées
- `not_found` : Adresse non trouvée par Nominatim
- `http_error` : Erreur lors de l'appel API
- `NULL` : Pas encore géocodé

## Edge Function Supabase (Planification automatique)

Une Edge Function Supabase est déployée pour exécuter le géocodage automatiquement.

### URL de la fonction

```
https://xrqmqfiqtyskbkmxydnc.supabase.co/functions/v1/geocode-scheduled
```

### Test manuel

```bash
curl -X POST "https://xrqmqfiqtyskbkmxydnc.supabase.co/functions/v1/geocode-scheduled" \
  -H "Authorization: Bearer VOTRE_ANON_KEY"
```

### Planification CRON (chaque nuit à 02h Europe/Paris)

Pour activer la planification automatique, vous devez configurer un CRON job dans Supabase :

1. Allez dans votre projet Supabase Dashboard
2. Naviguez vers **Database** > **Extensions**
3. Activez l'extension `pg_cron` si elle n'est pas déjà activée
4. Allez dans **SQL Editor** et exécutez :

```sql
-- Créer une fonction wrapper qui appelle l'Edge Function
CREATE OR REPLACE FUNCTION trigger_geocoding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response text;
BEGIN
  SELECT content::text INTO response
  FROM http((
    'POST',
    'https://xrqmqfiqtyskbkmxydnc.supabase.co/functions/v1/geocode-scheduled',
    ARRAY[http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))],
    'application/json',
    '{}'
  )::http_request);

  RAISE NOTICE 'Geocoding triggered: %', response;
END;
$$;

-- Planifier l'exécution chaque nuit à 02h (Europe/Paris = UTC+1 ou UTC+2 selon saison)
-- Pour 02h Europe/Paris en hiver (UTC+1) = 01h UTC
-- Pour 02h Europe/Paris en été (UTC+2) = 00h UTC
-- On utilise 01h UTC comme compromis
SELECT cron.schedule(
  'nightly-geocoding',
  '0 1 * * *',  -- Tous les jours à 01h UTC (02h CET / 03h CEST)
  'SELECT trigger_geocoding();'
);
```

### Vérifier les tâches CRON planifiées

```sql
SELECT * FROM cron.job;
```

### Désactiver la planification

```sql
SELECT cron.unschedule('nightly-geocoding');
```

## Notes importantes

- Le script respecte la politique d'utilisation équitable de Nominatim
- Pause de 1 seconde entre chaque requête
- User-Agent personnalisé : `resqfood-geocoder/1.0`
- Les résultats sont enregistrés immédiatement après chaque géocodage
- L'Edge Function est accessible publiquement (pas de vérification JWT)

# Correction du flux d'inscription - "Database error saving new user"

## Problème identifié

L'erreur "Database error saving new user" était causée par un problème de timing dans le flux d'inscription :

1. Lorsqu'un utilisateur s'inscrit via `supabase.auth.signUp()`, un compte est créé dans `auth.users`
2. Un trigger de base de données (`handle_new_user`) s'exécute automatiquement pour créer le profil correspondant dans `merchants` ou `clients`
3. **Le problème** : Le code frontend continuait immédiatement après `signUp()` sans attendre que le trigger termine son travail
4. Cela causait une violation de contrainte de clé étrangère si d'autres opérations tentaient d'accéder au profil avant qu'il soit créé

## Solution implémentée

### 1. Polling de vérification

Au lieu d'attendre un délai fixe (500ms), le code vérifie maintenant activement que le profil a bien été créé :

```typescript
// Wait for the profile to be created by the trigger
// Poll the database to confirm the merchant record exists
let merchantExists = false;
let attempts = 0;
const maxAttempts = 10;

while (!merchantExists && attempts < maxAttempts) {
  attempts++;
  await new Promise(resolve => setTimeout(resolve, 300));

  const { data: merchant, error: checkError } = await supabase
    .from('merchants')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (merchant && !checkError) {
    merchantExists = true;
  }
}

if (!merchantExists) {
  throw new Error('Profile creation timeout. Please contact support.');
}
```

### 2. Gestion d'erreur améliorée

- Maximum 10 tentatives (3 secondes au total)
- Vérification active au lieu d'attente passive
- Message d'erreur clair si le timeout est atteint

### 3. Flux robuste

1. ✅ Création du compte auth avec `signUp()`
2. ✅ Récupération de l'ID utilisateur
3. ✅ Polling pour vérifier que le profil existe
4. ✅ Définition de la localisation (optionnelle)
5. ✅ Redirection vers le dashboard

## Fichiers modifiés

- `src/pages/MerchantAuthPage.tsx` - Flux d'inscription marchands
- `src/pages/CustomerAuthPage.tsx` - Flux d'inscription clients

## Avantages

- ✅ Élimine les erreurs de timing
- ✅ Robuste face aux variations de latence réseau
- ✅ Détection précoce des problèmes
- ✅ Meilleure expérience utilisateur
- ✅ Pas de modification nécessaire en base de données

## Test

Pour tester la correction :

1. Aller sur `/merchant/auth`
2. Remplir le formulaire d'inscription
3. Soumettre le formulaire
4. Le système attend maintenant activement la création du profil
5. Redirection automatique vers le dashboard une fois le profil confirmé

Le même flux fonctionne pour les clients sur `/customer/auth`.

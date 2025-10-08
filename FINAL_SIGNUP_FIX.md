# Correctif Final - Inscription Merchant

## Modifications appliquées

### 1. Logs détaillés et diagnostic complet

Le code d'inscription merchant a été instrumenté avec des logs très détaillés à chaque étape :

```typescript
// 1. Au début de la soumission
console.log('=== FORM SUBMISSION ===');
console.log('Form data snapshot:', formData);

// 2. Avant l'appel signUp
console.log('=== SIGNUP OPTIONS.DATA ===', signUpOptions.data);
console.log('Company name value:', signUpOptions.data.company_name);
console.log('User type value:', signUpOptions.data.user_type);

// 3. Après l'appel signUp
console.log('=== SIGNUP RESPONSE ===');
console.log('User ID:', authData?.user?.id);
console.log('User metadata:', authData?.user?.user_metadata);
console.log('Raw user metadata:', authData?.user?.raw_user_meta_data);

// 4. Pendant le polling
console.log('=== PROFILE POLLING ===');
console.log('POLL id =', userId);
console.log('Query result:', { merchant, error });

// 5. Si timeout
console.log('=== ATTEMPTING FALLBACK: EDGE FUNCTION ===');
```

### 2. Structure du signUp payload (code exact)

```typescript
const signUpOptions = {
  data: {
    user_type: 'merchant',
    company_name: formData.company_name,  // snake_case ✓
    first_name: formData.first_name,      // snake_case ✓
    last_name: formData.last_name,        // snake_case ✓
    phone: formData.phone,
    street: formData.street,              // PAS "address" ✓
    city: formData.city,
    postal_code: formData.postal_code,    // snake_case ✓
    country: formData.country || 'FR'
  },
  emailRedirectTo: `${window.location.origin}/merchant/dashboard`
};

const { data: authData, error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: signUpOptions
});
```

**Vérifications** :
- ✅ Toutes les clés en snake_case
- ✅ `company_name` pas `name` ou `companyName`
- ✅ `street` pas `address`
- ✅ `postal_code` pas `postalCode`
- ✅ Les données sont dans `options.data` (devient `raw_user_meta_data`)

### 3. Polling amélioré

Le polling vérifie maintenant plus de détails :

```typescript
const { data: merchant, error: checkError } = await supabase
  .from('merchants')
  .select('id, company_name, email, created_at')
  .eq('id', userId)
  .maybeSingle();

console.log('Query result:', {
  hasMerchant: !!merchant,
  merchant: merchant,
  hasError: !!checkError,
  errorDetails: checkError
});
```

### 4. Edge Function de secours (Garde-fou)

Une Edge Function `create-merchant-profile` a été déployée. Si le trigger échoue après 3 secondes, le code appelle automatiquement cette fonction pour créer le profil manuellement.

```typescript
// Appelée automatiquement si le polling timeout
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/create-merchant-profile`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      email: formData.email,
      company_name: formData.company_name,
      // ... autres champs
    })
  }
);
```

Cette fonction utilise la `SERVICE_ROLE_KEY` pour contourner complètement les RLS et garantir l'insertion.

## Instructions de test

### 1. Ouvrir la console du navigateur

Appuyez sur **F12** et allez dans l'onglet **Console**.

### 2. Naviguer vers la page d'inscription

Allez sur `/merchant/auth` et cliquez sur "Register as Partner".

### 3. Remplir le formulaire

**Données de test** :
- Email : `newtest@example.com` (utilisez un email unique à chaque test)
- Password : `test123456` (minimum 6 caractères)
- Company Name : `Test Restaurant` **← IMPORTANT : ne pas laisser vide**
- First Name : `John`
- Last Name : `Doe`
- Phone : `0123456789` (optionnel)
- Street : `123 rue de Test` (optionnel)
- City : `Paris` (optionnel)
- Postal Code : `75001` (optionnel)
- Country : `FR` (par défaut)

### 4. Soumettre et copier les logs

Après avoir soumis le formulaire, **copiez TOUS les logs** de la console, notamment :

```
=== FORM SUBMISSION ===
Form data snapshot: { ... }

=== MERCHANT SIGNUP DEBUG ===
Email: ...
Password length: ...

=== SIGNUP OPTIONS.DATA ===
{
  "user_type": "merchant",
  "company_name": "...",
  ...
}
Company name value: ...
User type value: ...

=== SIGNUP RESPONSE ===
Has data: true/false
Has user: true/false
User ID: ...
User metadata: { ... }
Raw user metadata: { ... }

=== PROFILE POLLING ===
POLL id = ...
--- Polling attempt 1/10 ---
Query result: { ... }
```

### 5. Vérifier dans Supabase Dashboard

Après l'inscription, vérifier :

1. **Authentication → Users** :
   - Un nouvel utilisateur doit apparaître avec l'email utilisé
   - Cliquer sur l'utilisateur et vérifier **User Metadata**
   - Doit contenir : `{ "user_type": "merchant", "company_name": "...", ... }`

2. **Table Editor → merchants** :
   - Une nouvelle ligne doit exister avec :
   - `id` = l'ID de l'utilisateur auth
   - `company_name` = la valeur saisie (pas NULL)
   - `email` = l'email utilisé

## Critères d'acceptation (AA)

✅ **Succès si** :
1. L'utilisateur apparaît dans `auth.users`
2. `raw_user_meta_data` contient `user_type: 'merchant'` et `company_name: '...'`
3. Une ligne existe dans `public.merchants` avec `id = auth.user.id`
4. Le champ `company_name` dans merchants n'est pas NULL
5. Le polling trouve le profil en moins de 3 secondes

❌ **Échec si** :
1. L'utilisateur n'est pas créé dans `auth.users`
2. Le profil merchant n'est pas créé (ni par le trigger ni par l'Edge Function)
3. Le champ `company_name` est NULL dans la table merchants
4. Une erreur apparaît dans la console

## Résolution des problèmes

### Si "User already registered"
- **Cause** : L'email existe déjà
- **Solution** : Utiliser un autre email ou supprimer l'utilisateur dans Supabase Dashboard → Authentication → Users

### Si "Password should be at least 6 characters"
- **Cause** : Mot de passe trop court
- **Solution** : Utiliser un mot de passe de 6+ caractères

### Si le trigger ne s'exécute pas
- **Solution** : L'Edge Function de secours s'exécutera automatiquement après 3 secondes
- Vérifier les logs : `=== ATTEMPTING FALLBACK: EDGE FUNCTION ===`

### Si le profil n'est toujours pas créé
- Vérifier que `company_name` n'est pas vide dans le formulaire
- Vérifier les logs de la console pour voir le contenu exact de `options.data`
- Vérifier dans Supabase Dashboard que les métadonnées sont bien enregistrées

## Fichiers modifiés

- `src/pages/MerchantAuthPage.tsx` : Logs détaillés + fallback Edge Function
- `supabase/functions/create-merchant-profile/` : Edge Function de secours
- `supabase/migrations/fix_trigger_permissions_and_rls.sql` : Permissions et logs trigger

## Prochaine étape

**Merci de faire un test d'inscription maintenant et de copier ici** :

1. Tous les logs de la console (voir section "Instructions de test" ci-dessus)
2. Une capture d'écran de `auth.users` avec les User Metadata
3. Une capture d'écran de la table `merchants` avec la nouvelle ligne

Avec ces informations, nous pourrons confirmer que tout fonctionne ou identifier précisément ce qui reste à corriger.

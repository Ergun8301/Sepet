# Guide de débogage - Inscription Merchant

## Problème actuel

L'erreur "Database error saving new user" persiste et **aucun utilisateur n'apparaît dans auth.users** côté Supabase.

Cela signifie que l'appel `signUp()` échoue **AVANT** même la création du compte auth, donc avant que le trigger ne soit appelé.

## Logs de débogage ajoutés

Des logs complets ont été ajoutés dans `src/pages/MerchantAuthPage.tsx` pour diagnostiquer le problème.

### Comment déboguer

1. **Ouvrir la console du navigateur** (F12 → Console)
2. **Aller sur** `/merchant/auth`
3. **Cliquer sur** "Register as Partner"
4. **Remplir le formulaire** avec des données de test :
   - Email : `test@example.com`
   - Mot de passe : `test123456` (min 6 caractères)
   - Company name : `Test Company`
   - First/Last name : `John Doe`
   - Autres champs optionnels

5. **Soumettre le formulaire**

6. **Dans la console, vous verrez** :

```
=== MERCHANT SIGNUP DEBUG ===
Email: test@example.com
Password length: 10
Form data: { user_type: 'merchant', company_name: '...', ... }
SignUp payload: { "email": "...", "password": "...", "options": {...} }
SignUp response: { hasData: true/false, hasUser: true/false, ... }
```

7. **Si erreur, vous verrez** :

```
=== SIGNUP ERROR ===
Error object: {...}
Error message: "exact error message from Supabase"
Full error: {...}
```

## Ce que nous cherchons dans les logs

### 1. Vérifier que l'appel part bien

Le log `SignUp payload:` doit montrer :
- ✅ Email correct
- ✅ Password non vide
- ✅ `options.data.user_type = 'merchant'`
- ✅ Toutes les données du formulaire

### 2. Vérifier la réponse Supabase

Le log `SignUp response:` doit indiquer :
- Si `hasError: true` → Lire `errorMessage` pour savoir pourquoi
- Si `hasUser: false` → L'utilisateur n'a pas été créé
- Si `userId` est présent → L'utilisateur a été créé

### 3. Erreurs possibles

#### Erreur : "User already registered"
- **Cause** : L'email existe déjà
- **Solution** : Utiliser un autre email ou supprimer l'utilisateur existant dans Supabase

#### Erreur : "Password should be at least 6 characters"
- **Cause** : Mot de passe trop court
- **Solution** : Utiliser un mot de passe de 6+ caractères

#### Erreur : "Invalid email"
- **Cause** : Format d'email invalide
- **Solution** : Vérifier le format de l'email

#### Erreur : "Signups not allowed for this instance"
- **Cause** : Les inscriptions sont désactivées dans Supabase
- **Solution** : Aller dans Supabase Dashboard → Authentication → Settings → Enable "Allow new users to sign up"

#### Erreur : "Database error" ou erreur RLS
- **Cause** : Problème de politiques RLS ou trigger
- **Solution** : Vérifier les migrations et permissions (déjà corrigé)

## Corrections déjà appliquées

### 1. Flux d'inscription avec polling
- ✅ Attend activement la création du profil (10 tentatives × 300ms)
- ✅ Vérifie que le profil existe avant de continuer
- ✅ Gestion d'erreur robuste

### 2. Trigger de base de données
- ✅ Fonction `handle_new_user()` avec SECURITY DEFINER
- ✅ Permissions `supabase_auth_admin` accordées
- ✅ Logs RAISE NOTICE ajoutés pour débogage
- ✅ Gestion d'erreur avec EXCEPTION WHEN OTHERS

### 3. Politiques RLS
- ✅ Politiques dupliquées supprimées
- ✅ Politiques INSERT permettent aux utilisateurs d'insérer leurs propres données
- ✅ Politiques SELECT permettent la lecture publique

### 4. Logs frontend
- ✅ Logs avant l'appel signUp
- ✅ Logs du payload complet
- ✅ Logs de la réponse complète
- ✅ Logs de chaque tentative de polling
- ✅ Logs détaillés des erreurs

## Prochaines étapes

**IMPORTANT** : Merci de faire un test d'inscription et de **copier TOUS les logs de la console** ici.

Les logs nous diront exactement :
1. Si l'appel `signUp()` est correctement formaté
2. Si Supabase accepte ou rejette la requête
3. Le message d'erreur exact (pas juste "Database error")
4. Si l'utilisateur est créé dans auth.users
5. Si le trigger s'exécute et réussit/échoue

Avec ces informations, nous pourrons identifier la cause exacte du problème.

## Configuration Supabase à vérifier

Si les logs montrent que Supabase rejette la requête, vérifier dans le Dashboard Supabase :

1. **Authentication → Settings** :
   - ✅ "Enable email provider" doit être activé
   - ✅ "Allow new users to sign up" doit être activé
   - ⚠️ "Confirm email" devrait être **désactivé** pour les tests

2. **Authentication → URL Configuration** :
   - Vérifier que les redirects sont configurés (optionnel pour tests)

3. **Project Settings → API** :
   - Vérifier que l'ANON_KEY correspond bien à celle dans `.env`
   - Vérifier que l'URL correspond bien à celle dans `.env`

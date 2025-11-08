# 🔍 RAPPORT D'ANOMALIES - SEPET

**Date :** 8 Novembre 2025
**Statut :** Analyse en LECTURE SEULE (aucune modification)

---

## 🚨 PROBLÈMES IDENTIFIÉS

### **1. RÉSERVATION NE FONCTIONNE PAS** ❌ CRITIQUE

**Fichier :** `src/api/reservations.ts`
**Lignes :** 47-62

**Problème :**
L'appel RPC `create_reservation_dynamic` est **désactivé** et remplacé par une **simulation** :

```typescript
// 🔇 Désactivé car déjà appelé dans OfferDetailsModal
// const { data, error } = await supabase.rpc('create_reservation_dynamic', {
//   p_client_id: userId,
//   p_offer_id: offerId,
//   p_quantity: quantity,
// });

// Simulation de succès pour ne pas casser la logique du front
const reservationData = {
  reservation_id: 'fake',
  offer_title: 'simulation',
  merchant_id: merchantId,
  new_quantity: 0,
};

return { success: true, data: reservationData };
```

**Impact :**
- Les réservations ne sont PAS enregistrées dans la base de données
- Les marchands ne voient pas les réservations
- Les clients ne peuvent pas réserver réellement

---

**Fichier :** `src/components/OfferDetailsModal.tsx`
**Lignes :** 149-159

**Problème secondaire :**
Le modal fait un **INSERT direct** dans la table `reservations` au lieu d'utiliser la RPC :

```typescript
const { data: reservation, error: reservationError } = await supabase
  .from('reservations')
  .insert([
    {
      offer_id: offer.offer_id,
      client_id: profileData.id,
      status: 'pending',
    },
  ])
  .select()
  .single();
```

**Conséquence :**
Si les RLS (Row Level Security) policies ne sont pas configurées pour autoriser les INSERT directs, ça échoue avec une erreur **"new row violates row-level security policy"**.

---

### **CAUSE RACINE :**

**🔴 PROBLÈME MAJEUR IDENTIFIÉ :**

La policy RLS pour `reservations` (fichier `20251006182945_add_all_policies_and_triggers.sql`, ligne 16) :

```sql
CREATE POLICY "Clients can create reservations"
  ON public.reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());
```

**Vérifie que `client_id = auth.uid()`.**

MAIS dans `OfferDetailsModal.tsx` (lignes 136-156), le code insert :

```typescript
const { data: profileData } = await supabase
  .from('profiles')
  .select('id')
  .eq('auth_id', user.id)
  .eq('role', 'client')
  .maybeSingle();

// ...

.insert([{
  client_id: profileData.id,  // ← profiles.id (UUID différent !)
  // ...
}])
```

**Le problème :**
- `auth.uid()` retourne l'ID Supabase Auth (exemple : `fc215a2b-8fd6-4148-a1c4-4be4123cbebd`)
- `profileData.id` retourne l'ID de la table `profiles` (exemple : `437ae2c3-a864-40c6-ac3d-a49aa6d49b27`)

**Ces deux IDs sont DIFFÉRENTS !**

La policy vérifie `client_id = auth.uid()`, mais on essaie d'insérer `profiles.id` dans `client_id`.
Résultat : **RLS policy violation → INSERT échoué.**

---

**Deuxième problème :**
Le code essaie d'appeler `create_reservation_dynamic` (désactivé dans `reservations.ts`), mais cette fonction **n'existe même pas** dans Supabase ! La seule fonction qui existe est `create_reservation_with_stock_check`.

---

### **SOLUTION (à implémenter plus tard) :**

**Option A : Utiliser la RPC `create_reservation_with_stock_check` (RECOMMANDÉ)**

Dans `OfferDetailsModal.tsx` (ligne 127), remplacer tout le bloc `handleReserve` par :

```typescript
const handleReserve = async () => {
  if (!user) {
    setToast({ message: '⚠️ Connectez-vous pour réserver', type: 'error' });
    return;
  }

  setIsReserving(true);

  try {
    // Récupérer le profil client
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .eq('role', 'client')
      .maybeSingle();

    if (profileError || !profileData) {
      setToast({ message: '❌ Profil client introuvable', type: 'error' });
      setIsReserving(false);
      return;
    }

    // ✅ UTILISER LA RPC FUNCTION
    const { data, error } = await supabase.rpc('create_reservation_with_stock_check', {
      p_client_id: profileData.id,
      p_merchant_id: offer.merchant_id,
      p_offer_id: offer.offer_id,
      p_quantity: 1
    });

    if (error) throw error;

    // Vérifier le résultat
    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      setToast({ message: `❌ ${result.error}`, type: 'error' });
      setIsReserving(false);
      return;
    }

    setToast({ message: '✅ Réservation confirmée !', type: 'success' });
    setTimeout(() => onClose(), 1500);

  } catch (error: any) {
    console.error('❌ Erreur réservation:', error);
    setToast({ message: error.message || '❌ Erreur lors de la réservation', type: 'error' });
  } finally {
    setIsReserving(false);
  }
};
```

**Pourquoi cette option est meilleure :**
- ✅ Bypass les RLS policies (SECURITY DEFINER)
- ✅ Gestion atomique du stock (évite l'overbooking)
- ✅ Crée automatiquement la notification au marchand
- ✅ Gère les erreurs proprement

---

**Option B : Fixer la RLS policy (ALTERNATIVE)**

Si tu veux continuer avec l'INSERT direct, modifie la policy dans Supabase :

```sql
-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Clients can create reservations" ON public.reservations;

-- Créer la nouvelle policy qui vérifie profiles.id
CREATE POLICY "Clients can create reservations"
  ON public.reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM profiles WHERE auth_id = auth.uid() AND role = 'client'
    )
  );
```

**Inconvénients de cette option :**
- ❌ Pas de gestion atomique du stock
- ❌ Pas de notification automatique
- ❌ Risque d'overbooking (race condition)

---

## 🔔 NOTIFICATIONS PAS INSTANTANÉES

**Fichier :** `src/hooks/useClientNotifications.ts`

**Diagnostic :**
Le code Realtime est **correct** et bien configuré (lignes 64-124) :
- ✅ Connexion au canal Realtime
- ✅ Écoute des INSERT sur `notifications`
- ✅ Filtre sur `recipient_id`
- ✅ Appel du son à la ligne 94

**Problème :**
Le son ne joue pas immédiatement **à cause des politiques autoplay des navigateurs**.

---

**Fichier :** `src/hooks/useNotificationSound.ts`

**Explication :**
Les navigateurs modernes (Chrome, Firefox, Safari) **bloquent l'autoplay audio** par défaut.
Le son ne peut jouer que si :
1. L'utilisateur a **interagi** avec la page (clic, touche)
2. OU l'audio est en mode **muted**

**Code actuel (lignes 9-10) :**
```typescript
audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3");
audioRef.current.volume = 0.7; // ← Volume non muted
```

---

### **POURQUOI ÇA NE MARCHE PAS :**

1. **Si l'utilisateur n'a pas cliqué sur la page :**
   - Le navigateur bloque le son
   - L'erreur apparaît dans la console : `"play() failed because the user didn't interact with the document first"`

2. **Besoin de recharger la page :**
   - Après rechargement, si tu cliques quelque part, le son peut jouer
   - Mais sans interaction, toujours bloqué

---

### **SOLUTION (à implémenter plus tard) :**

**Option A : Demander une interaction utilisateur**
Ajouter un bouton "Activer les notifications" que l'utilisateur clique une fois.

**Option B : Mode silencieux + permission**
```typescript
// Démarrer en mode muted
audioRef.current.muted = true;
await audioRef.current.play();

// Demander permission
audioRef.current.muted = false;
audioRef.current.volume = 0.7;
```

**Option C : Utiliser l'API Notifications natives**
```typescript
if ("Notification" in window && Notification.permission === "granted") {
  new Notification("Nouvelle offre !", {
    body: "Une offre près de chez vous",
    icon: "/logo.png",
    sound: "/notification.mp3"
  });
}
```

---

## ✅ MISE EN LIGNE DE PRODUITS (OK)

**Fichier :** `src/pages/MerchantDashboardPage.tsx`
**Lignes :** 399-477

**Diagnostic :**
Le code de publication d'offres est **correct** :
- ✅ Récupère le profil marchand
- ✅ Upload d'image
- ✅ INSERT dans `offers`
- ✅ Gestion d'erreurs

**Aucun problème identifié.**

---

## 📊 AUTRES OBSERVATIONS

### **1. Slider rayon (z-index)**
**Fichier :** `src/pages/OffersPage.tsx` (ligne ~700)

**Actuel :**
```tsx
<div className="... z-[1600] ...">
  <input type="range" ... />
</div>
```

**Problème potentiel :**
Si un modal a `z-[2000]`, le slider peut passer par-dessus.

**Remarque :** Tu as mentionné que le slider passait par-dessus dans la nouvelle version, mais dans la version actuelle, il est à `z-[1600]`, ce qui devrait être OK si le modal est à `z-[2000]` ou plus.

---

### **2. Dashboard Marchand - Tri des offres**
**Fichier :** `src/pages/MerchantDashboardPage.tsx`
**Lignes :** 317-363

**Actuel :**
Le tri est fait par `updated_at DESC` (ligne 326), ce qui est **correct**.
Les offres sont séparées en 2 catégories (actives/inactives) aux lignes 333-356.

**Aucun problème identifié.**

---

### **3. Modal OfferDetailsModal**
**Fichier :** `src/components/OfferDetailsModal.tsx`

**Observations :**
- ✅ Barre de progression présente (lignes 98-118)
- ✅ Calcul du temps restant (lignes 89-96)
- ✅ Bouton GPS fonctionnel (lignes 120-125)
- ✅ Charge les autres offres du marchand (lignes 58-82)
- ❌ **Pas de modal connexion si non authentifié** (ligne 129 : juste un toast)
- ❌ **Pas de changement d'offre sans fermer le modal** (manque la logique)

---

## 📋 RÉSUMÉ DES ANOMALIES

| Problème | Gravité | Fichier | Solution |
|----------|---------|---------|----------|
| Réservation ne fonctionne pas | 🔴 CRITIQUE | `reservations.ts` + `OfferDetailsModal.tsx` | Utiliser RPC `create_reservation_dynamic` |
| Son notifications bloqué | 🟡 MOYEN | `useNotificationSound.ts` | Demander interaction utilisateur OU API Notifications |
| Notifications pas instantanées | 🟢 NORMAL | Aucun (comportement navigateur) | Recharger nécessaire si pas d'interaction |
| Modal pas de changement offre | 🟡 MOYEN | `OfferDetailsModal.tsx` | Ajouter props `onOfferChange` |
| Pas de modal connexion | 🟡 MOYEN | `OfferDetailsModal.tsx` | Ajouter modal au lieu de toast |

---

## 🎯 RECOMMANDATIONS

### **PRIORITÉ 1 : Fixer les réservations**
C'est le problème le plus grave. Sans ça, l'application ne peut pas fonctionner.

**Action :**
- Réactiver l'appel RPC dans `OfferDetailsModal.tsx`
- Ou fixer les RLS policies pour autoriser les INSERT directs

### **PRIORITÉ 2 : Améliorer les notifications**
Ajouter un bouton "Activer les notifications" pour débloquer le son.

### **PRIORITÉ 3 : Améliorer le modal**
- Ajouter modal connexion (au lieu du toast)
- Permettre de changer d'offre sans fermer le modal

---

## ⚠️ IMPORTANT

**AUCUNE MODIFICATION N'A ÉTÉ FAITE.**
Ce rapport est une **analyse en lecture seule**.

Pour corriger ces problèmes, il faudra :
1. Modifier le code TypeScript
2. Potentiellement ajuster les RLS policies Supabase (pour réservations)

---

**Fin du rapport.**

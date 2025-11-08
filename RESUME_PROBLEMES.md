# 📋 RÉSUMÉ DES PROBLÈMES - VERSION SIMPLE

**Date :** 8 Novembre 2025

---

## 🚨 PROBLÈME #1 : RÉSERVATIONS NE FONCTIONNENT PAS

**Pourquoi ça marche pas :**

Le code essaie d'insérer une réservation avec `profileData.id`, mais Supabase vérifie que `client_id = auth.uid()`.

**Ces deux IDs sont différents !**

```
auth.uid()        = fc215a2b-8fd6-4148-a1c4-4be4123cbebd  (ID Auth Supabase)
profileData.id    = 437ae2c3-a864-40c6-ac3d-a49aa6d49b27  (ID dans table profiles)
```

La policy RLS dit : "Vérifie que `client_id = auth.uid()`"
Le code met : `client_id = profileData.id`

Résultat → **REFUSÉ par Supabase** ❌

---

**Pour corriger (plus tard) :**

**Fichier :** `src/components/OfferDetailsModal.tsx`
**Ligne :** 127 (fonction `handleReserve`)

**Remplacer l'INSERT direct par l'appel RPC :**

```typescript
// ❌ ENLEVER ÇA :
const { data: reservation, error: reservationError } = await supabase
  .from('reservations')
  .insert([...])

// ✅ REMPLACER PAR :
const { data, error } = await supabase.rpc('create_reservation_with_stock_check', {
  p_client_id: profileData.id,
  p_merchant_id: offer.merchant_id,
  p_offer_id: offer.offer_id,
  p_quantity: 1
});
```

---

## 🔔 PROBLÈME #2 : SON NOTIFICATIONS BLOQUÉ

**Pourquoi ça marche pas :**

Les navigateurs (Chrome, Firefox) **bloquent les sons automatiques** par défaut.

Le son peut jouer SEULEMENT si :
- L'utilisateur a **cliqué** sur la page au moins une fois
- OU le son est en mode **muted**

**C'est pas un bug de ton code**, c'est une protection des navigateurs.

---

**Pour corriger (plus tard) :**

**Option 1 : Demander un clic utilisateur**
Ajouter un bouton "Activer les notifications sonores" que l'utilisateur clique une fois.

**Option 2 : Utiliser les notifications natives**
```typescript
if (Notification.permission === "granted") {
  new Notification("Nouvelle offre !", {
    body: "Une offre près de chez vous",
    icon: "/logo.png"
  });
}
```

---

## 🔄 PROBLÈME #3 : NOTIFICATIONS PAS INSTANTANÉES

**Pourquoi ça marche pas :**

En fait... **ça marche !** ✅

Le problème c'est que si tu n'as pas cliqué sur la page, le navigateur :
1. Bloque le son (voir problème #2)
2. Met les notifications en pause

**Solution actuelle :** Recharger la page.

**Meilleure solution (plus tard) :** Demander l'interaction utilisateur au chargement.

---

## ✅ CE QUI FONCTIONNE DÉJÀ

- ✅ Création d'offres (marchands)
- ✅ Affichage des offres (clients)
- ✅ Carte Mapbox
- ✅ Géolocalisation
- ✅ Notifications Realtime (structure)
- ✅ Dashboard marchand
- ✅ Authentification

---

## 🎯 CE QU'IL FAUT FAIRE (PAR ORDRE DE PRIORITÉ)

### **1. Fixer les réservations** (30 min)
Remplacer l'INSERT direct par l'appel RPC dans `OfferDetailsModal.tsx`

### **2. Améliorer les notifications** (1h)
Ajouter un bouton "Activer les notifications" + utiliser l'API Notifications natives

### **3. Améliorer le modal** (2h)
- Ajouter modal connexion (au lieu du toast)
- Permettre de changer d'offre sans fermer

---

## 📁 FICHIERS CONCERNÉS

| Fichier | Problème | Action |
|---------|----------|--------|
| `src/components/OfferDetailsModal.tsx` | Réservations | Utiliser RPC au lieu d'INSERT |
| `src/hooks/useNotificationSound.ts` | Son bloqué | Demander interaction utilisateur |
| `src/api/reservations.ts` | Code désactivé | Réactiver ou supprimer |

---

## 🚀 POUR DÉBUGGER TOI-MÊME

### **Console F12 - Erreurs à chercher :**

**Réservations :**
```
"new row violates row-level security policy for table 'reservations'"
```

**Notifications sonores :**
```
"play() failed because the user didn't interact with the document first"
"NotAllowedError: The play() request was interrupted by a call to pause()"
```

---

**Pour voir plus de détails techniques, lis le fichier `RAPPORT_ANOMALIES.md`.**

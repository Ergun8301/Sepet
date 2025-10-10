# Guide d'utilisation de la carte avec géolocalisation

## Nouvelles fonctionnalités ajoutées

### 1. Bouton "Voir la carte"
- **Emplacement** : Dans la section "Offres à proximité" (visible uniquement si vous avez des offres proches)
- **Action** : Cliquez sur le bouton vert "Voir la carte" pour ouvrir la carte interactive

### 2. Bouton de géolocalisation "📍 Me géolocaliser"
- **Emplacement** : En haut de la carte, dans une barre bleue
- **Action** : Cliquez pour centrer la carte sur votre position GPS actuelle
- **Note** : Le bouton disparaît automatiquement après activation

### 3. Marqueurs distincts
- **Marqueur BLEU** : Votre position actuelle
- **Marqueur VERT** : Les offres disponibles
- **Marqueur ROUGE** : L'offre sélectionnée/mise en évidence

### 4. Interactions
- Cliquez sur n'importe quel marqueur d'offre (vert) pour voir les détails
- Utilisez le slider de rayon pour ajuster la zone de recherche (10-50 km)
- Le cercle vert autour de votre position montre le rayon de recherche

## Comment tester

### Étape 1 : Se connecter en tant que client
1. Allez sur `/customer/auth`
2. Connectez-vous avec un compte client existant

### Étape 2 : Activer la géolocalisation (si ce n'est pas déjà fait)
1. Si vous n'avez pas encore de position enregistrée, cliquez sur "Activer la géolocalisation"
2. Autorisez l'accès à votre position dans le navigateur

### Étape 3 : Voir les offres sur la carte
1. Depuis la page des offres (`/customer/offers`)
2. Dans la section "Offres à proximité", cliquez sur le bouton vert "Voir la carte"
3. La carte s'affiche avec toutes les offres dans le rayon défini

### Étape 4 : Utiliser la géolocalisation en temps réel
1. Sur la carte, cliquez sur le bouton bleu "�� Me géolocaliser"
2. Autorisez l'accès à votre position si demandé
3. La carte se centre automatiquement sur votre position GPS actuelle

## Notes techniques

- La géolocalisation utilise l'API navigator.geolocation du navigateur
- Aucune modification de la base de données n'a été effectuée
- Toute la logique est côté front-end
- Compatible mobile et desktop
- Fonctionne même en HTTPS (requis pour la géolocalisation)

## Résolution des problèmes

### Le bouton "Voir la carte" n'apparaît pas
- Vérifiez que vous êtes connecté en tant que client
- Vérifiez que vous avez au moins une offre à proximité
- Assurez-vous d'avoir activé votre géolocalisation initiale

### La géolocalisation ne fonctionne pas
- Vérifiez que votre navigateur supporte la géolocalisation
- Assurez-vous d'avoir autorisé l'accès à votre position
- Vérifiez que vous êtes sur une connexion HTTPS (la géolocalisation est bloquée en HTTP)
- Essayez de rafraîchir la page (Ctrl+F5) pour vider le cache

### Les marqueurs ne s'affichent pas
- Vérifiez votre connexion internet (les icônes sont chargées depuis un CDN)
- Essayez d'augmenter le rayon de recherche
- Vérifiez qu'il y a des offres actives dans la base de données

## Fichiers modifiés

- `src/components/OffersMap.tsx` : Ajout du bouton de géolocalisation et des icônes distinctes
- `src/pages/CustomerOffersPage.tsx` : Ajout du bouton "Voir la carte"

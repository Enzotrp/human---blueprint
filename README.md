# Human Blueprint
> Outil psychométrique DISC + Ikigai pour étudiants en école de commerce.

---

## 🚀 Déploiement sur Vercel (guide complet)

### Prérequis
- Un compte [GitHub](https://github.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit — connecte-toi avec GitHub)
- Une clé API Anthropic — obtiens-la sur [console.anthropic.com](https://console.anthropic.com)

---

### Étape 1 — Préparer le projet sur GitHub

1. Va sur [github.com](https://github.com) → **New repository**
2. Nomme-le `human-blueprint`, coche **Private** (recommandé), clique **Create**
3. Sur ta machine, ouvre un terminal dans le dossier du projet et exécute :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/human-blueprint.git
git push -u origin main
```

---

### Étape 2 — Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **Add New Project**
2. Clique **Import** en face de ton repo `human-blueprint`
3. Vercel détecte automatiquement Vite → laisse les paramètres par défaut
4. **Ne clique pas encore sur Deploy** — il faut d'abord ajouter la clé API

---

### Étape 3 — Ajouter la clé API Anthropic (crucial)

Dans la page de configuration Vercel (avant de déployer) :

1. Clique sur **Environment Variables**
2. Ajoute cette variable :
   - **Name** : `ANTHROPIC_API_KEY`
   - **Value** : `sk-ant-xxxxxxxxxxxx` (ta clé API Anthropic)
   - **Environment** : ✅ Production ✅ Preview ✅ Development
3. Clique **Save**

> ⚠️ La clé ne sera **jamais visible** dans le code frontend — elle reste côté serveur.

---

### Étape 4 — Déployer

Clique **Deploy**. Vercel build le projet (~1 min) et te donne une URL de type :
```
https://human-blueprint-xxxxxxx.vercel.app
```

Partage cette URL à tes étudiants — l'outil est immédiatement accessible.

---

### Étape 5 — Domaine personnalisé (optionnel)

Dans Vercel → Settings → Domains, tu peux ajouter un domaine personnalisé type :
```
blueprint.ton-ecole.fr
```

---

## 🛠 Développement local

Pour tester en local avant de déployer :

```bash
npm install
```

Crée un fichier `.env.local` à la racine :
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Lance le serveur de développement Vercel (pour que les fonctions `/api` fonctionnent) :
```bash
npx vercel dev
```

L'app tourne sur `http://localhost:3000`

---

## 📁 Structure du projet

```
human-blueprint/
├── api/
│   └── synthesize.js      ← Proxy sécurisé vers Anthropic (côté serveur)
├── src/
│   ├── main.jsx            ← Point d'entrée React
│   └── App.jsx             ← Application complète
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 🔒 Sécurité

- La clé API Anthropic n'est **jamais exposée** côté client
- Toutes les requêtes IA passent par `/api/synthesize` (Vercel serverless)
- Aucune donnée utilisateur n'est stockée — tout est éphémère côté session

---

## ✏️ Personnalisation

Pour adapter l'outil à ton école :
- **Nom de l'école** : cherche `Toulouse Business School` dans `App.jsx`
- **Couleurs** : modifie les variables CSS dans la constante `GS` (début de `App.jsx`)
- **Questions DISC** : tableau `QS` dans `App.jsx`
- **Niveaux académiques** : balises `<option>` dans la section "Contexte"

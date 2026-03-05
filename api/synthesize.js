// api/synthesize.js
// Vercel Serverless Function — proxy sécurisé vers l'API Anthropic
// La clé API reste côté serveur, jamais exposée au navigateur.

export default async function handler(req, res) {
  // CORS — autorise uniquement les requêtes du même domaine en production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API non configurée. Ajoute ANTHROPIC_API_KEY dans les variables d\'environnement Vercel.' });
  }

  try {
    const { scores, ikigai, context, dom } = req.body;

    if (!scores || !ikigai || !context) {
      return res.status(400).json({ error: 'Données manquantes dans la requête.' });
    }

    const DISC_NAMES = { D: 'Dominance', I: 'Influence', S: 'Stabilite', C: 'Conformite' };
    const EDGE = {
      D: "Capacite a trancher sous pression, assumer la responsabilite finale et creer une dynamique là ou l'IA hesite.",
      I: "Faculte a mobiliser les personnes, creer de la confiance et adapter son message a l'humain en face.",
      S: "Ancrage dans l'equipe, lecture fine des tensions humaines et constance dans la duree.",
      C: "Rigueur pour detecter l'erreur cachee, sens de la qualite systemique et capacite a poser les bonnes questions avant d'agir.",
    };

    const prompt = `Tu es un coach psychometrique neutre pour etudiants en ecole de commerce. Analyse ce profil et genere une synthese factuelle, precise, personnalisee. Reponds en francais, UNIQUEMENT en JSON valide.

SCORES DISC (0-100) :
D (Dominance)=${scores.D} | I (Influence)=${scores.I} | S (Stabilite)=${scores.S} | C (Conformite)=${scores.C}
Style dominant : ${dom} (${DISC_NAMES[dom]})
Capacite humaine distinctive de ce style : ${EDGE[dom]}

IKIGAI :
Passions (ce que j aime) : ${ikigai.love}
Forces (ce en quoi j excelle) : ${ikigai.good}
Valeurs et impact (ce dont le monde a besoin) : ${ikigai.need}
Viabilite economique (ce pour quoi je peux etre remunere) : ${ikigai.paid}

CONTEXTE ETUDIANT :
Formation et specialite : ${context.promo}
Niveau academique : ${context.level}
Question a clarifier : ${context.question || 'non precisee'}

Retourne ce JSON et rien d autre (pas de markdown, pas de backticks, pas de commentaires) :
{"identity":"string","behavioral":"string","dom":"${dom}","ikigaiCore":"string","humanEdge":"string","careers":[{"t":"string","r":"string","s":80}],"aiStrategies":[{"t":"string","d":"string"}],"actions":[{"t":"string","d":"string","cat":"Competence","when":"Ce mois"}],"question":"string"}

Regles absolues :
- Exactement 4 careers avec des fitScore varies entre 68 et 94
- Exactement 4 aiStrategies
- Exactement 3 actions avec cat parmi : Competence, Reseau, Projet
- when parmi : Cette semaine, Ce mois, Dans 3 mois
- Tout le contenu en francais
- JSON pur uniquement, aucun texte avant ou apres
- Chaque champ doit etre specifique a CE profil, aucune generalite`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: 'Tu es un assistant qui retourne uniquement du JSON valide, sans aucun texte avant ou apres, sans balises markdown.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({
        error: `Erreur API Anthropic (${anthropicRes.status}): ${errText.slice(0, 300)}`
      });
    }

    const data = await anthropicRes.json();

    if (!data.content?.[0]?.text) {
      return res.status(502).json({ error: 'Réponse inattendue de l\'API Anthropic.' });
    }

    // Nettoyage et extraction du JSON
    let raw = data.content[0].text.trim();
    raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return res.status(502).json({ error: `JSON introuvable dans la réponse. Extrait: ${raw.slice(0, 200)}` });
    }
    raw = raw.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(502).json({ error: `Erreur de parsing JSON: ${e.message}. Extrait: ${raw.slice(0, 200)}` });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: `Erreur serveur: ${err.message}` });
  }
}

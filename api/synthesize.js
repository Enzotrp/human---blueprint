// api/synthesize.js
// Vercel Serverless Function — proxy sécurisé vers l'API Anthropic

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Clé API non configurée." });

  try {
    const { scores, ikigai, context, dom } = req.body;
    if (!scores || !ikigai || !context) return res.status(400).json({ error: 'Données manquantes.' });

    const DISC_NAMES = { D:'Dominance', I:'Influence', S:'Stabilite', C:'Conformite' };
    const EDGE = {
      D: "Capacite a trancher sous pression, assumer la responsabilite finale et creer une dynamique.",
      I: "Faculte a mobiliser les personnes, creer de la confiance et adapter son message a l humain.",
      S: "Ancrage dans l equipe, lecture fine des tensions humaines et constance dans la duree.",
      C: "Rigueur pour detecter l erreur cachee et capacite a poser les bonnes questions avant d agir.",
    };

    const prompt = `Tu es un coach psychometrique expert pour etudiants en ecole de commerce. Analyse ce profil et genere une synthese complete. Reponds UNIQUEMENT en JSON valide, sans markdown ni backticks.

SCORES DISC (0-100) :
D=${scores.D} | I=${scores.I} | S=${scores.S} | C=${scores.C}
Style dominant : ${dom} (${DISC_NAMES[dom]}) — ${EDGE[dom]}

IKIGAI — reponses brutes de l etudiant :
[AIME] ${ikigai.love}
[DOUE] ${ikigai.good}
[BESOIN] ${ikigai.need}
[REMUNERE] ${ikigai.paid}

CONTEXTE : ${context.promo} | ${context.level} | Question: ${context.question || 'non precisee'}

STRUCTURE JSON EXACTE a retourner :
{
  "identity": "phrase poetique-factuelle sur la nature profonde (pas de notation DISC technique)",
  "behavioral": "2-3 phrases sur comment cette personne fonctionne selon son DISC",
  "dom": "${dom}",
  "ikigaiCore": "2-3 phrases sur la convergence au centre de son Ikigai",
  "humanEdge": "2-3 phrases sur son bouclier face a l automatisation",
  "venn": {
    "love": ["mot-cle1","mot-cle2","mot-cle3","mot-cle4","mot-cle5"],
    "good": ["mot-cle1","mot-cle2","mot-cle3","mot-cle4","mot-cle5"],
    "need": ["mot-cle1","mot-cle2","mot-cle3","mot-cle4","mot-cle5"],
    "paid": ["mot-cle1","mot-cle2","mot-cle3","mot-cle4","mot-cle5"],
    "passion":  ["mot-cle1","mot-cle2"],
    "mission":  ["mot-cle1","mot-cle2"],
    "metier":   ["mot-cle1","mot-cle2"],
    "vocation": ["mot-cle1","mot-cle2"]
  },
  "careers": [{"t":"titre","r":"2 phrases rationale","s":80}],
  "aiStrategies": [{"t":"titre court","d":"2 phrases comment ce profil pilote l IA"}],
  "actions": [{"t":"titre action","d":"1 phrase","cat":"Competence","when":"Ce mois"}],
  "question": "question profonde personnalisee pour la prochaine etape"
}

REGLES pour le champ "venn" :
- "love","good","need","paid" : exactement 5 mots-cles courts (1 a 3 mots max chacun) qui RESUMENT les reponses de l etudiant. Tu peux reformuler ou synthetiser, pas seulement copier-coller.
- "passion" = ce qui est a la fois aime ET ou l etudiant est doue : 2 mots-cles
- "mission" = ce qui est aime ET utile au monde : 2 mots-cles
- "metier" = ce ou l etudiant est doue ET peut etre remunere : 2 mots-cles
- "vocation" = ce dont le monde a besoin ET qui peut etre remunere : 2 mots-cles
- Tous les mots-cles en francais, concis, percutants

AUTRES REGLES :
- Exactement 4 careers, fitScore entre 68 et 94, varies
- Exactement 4 aiStrategies
- Exactement 3 actions, cat parmi : Competence, Reseau, Projet
- when parmi : Cette semaine, Ce mois, Dans 3 mois
- JSON pur uniquement, aucun texte hors JSON

REGLES POUR LA NUANCE ET L AUTHENTICITE :
- Dans "behavioral" : identifie AU MOINS UNE tension ou contradiction interne. Ex : profil D eleve + valeurs d empathie = risque de brutalite non intentionnelle. Profil I + besoin de sens = risque de dispersion. Nomme-la clairement, sans jugement.
- Dans "ikigaiCore" : souleve une zone de flou ou de tension dans l ikigai. Ex : passion pour X mais viabilite economique floue. Ou : fort besoin d impact mais peur de s exposer. Pose une vraie question ouverte a la fin.
- Dans "humanEdge" : sois specifique et ancre dans CE profil — pas de formulation generique. Donne un exemple concret de situation ou cet humain sera irreplacable la ou l IA echoue.
- Evite absolument les formulations "vous etes quelqu un qui..." generiques. Chaque phrase doit etre impossible a coller sur un profil different.`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: 'Tu retournes uniquement du JSON valide, sans texte avant ou apres, sans balises markdown.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({ error: `Erreur API Anthropic (${anthropicRes.status}): ${errText.slice(0,300)}` });
    }

    const data = await anthropicRes.json();
    if (!data.content?.[0]?.text) return res.status(502).json({ error: "Réponse inattendue de l'API." });

    let raw = data.content[0].text.trim();
    raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
    if (s === -1 || e === -1) return res.status(502).json({ error: `JSON introuvable. Extrait: ${raw.slice(0,200)}` });
    raw = raw.slice(s, e + 1);

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch (err) { return res.status(502).json({ error: `Parsing JSON: ${err.message}. Extrait: ${raw.slice(0,200)}` }); }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: `Erreur serveur: ${err.message}` });
  }
}

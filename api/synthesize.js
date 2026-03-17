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

    const level    = context.level    || "";
    const exp      = context.exp      || "Aucune expérience";
    const diplomas = context.diplomas || "";

    const isReconversion = level.includes("Reconversion") || exp.includes("reconversion") || exp.includes("7 ans");
    const isMaster       = level.includes("Master") || level.includes("MSc") || level.includes("MBA");
    const hasSeniorExp   = exp.includes("7 ans") || exp.includes("3 à 7");

    const calibration = isReconversion
      ? `Profil en reconversion (${exp}). Valorise le bagage existant tout en étant honnête sur ce qui reste à construire.`
      : isMaster
      ? `Profil ${level}${hasSeniorExp ? ` avec ${exp} d'expérience` : ""}. Niveau de maturité attendu élevé — sois exigeant en conséquence.`
      : `Profil ${level}. Début de parcours — sois encourageant mais lucide sur ce qui manque encore.`;

    const prompt = `Tu es un expert en développement personnel et en orientation professionnelle. Ton rôle est d'analyser un profil psychométrique avec impartialité et bienveillance — comme un bon coach ou psychologue : tu dis la vérité, avec du tact, sans violence mais sans complaisance non plus. Tu n'es pas là pour rassurer à tout prix. Tu es là pour aider la personne à se voir clairement.

RÈGLE FONDAMENTALE : Analyse les données telles qu'elles sont. Ne projette pas de qualités absentes. Ne fabrique pas de cohérence qui n'existe pas. Si le profil est cohérent, dis-le. S'il est contradictoire ou flou, dis-le aussi. La personne grandit en se voyant avec justesse, pas en recevant un miroir flatteur.

SCORES DISC (0-100) :
D=${scores.D} | I=${scores.I} | S=${scores.S} | C=${scores.C}
Style dominant déclaré : ${dom} (${DISC_NAMES[dom]})

IKIGAI — réponses exactes de la personne (analyse CE QU'ELLE A ÉCRIT, rien d'autre) :
[CE QUE J'AIME] ${ikigai.love}
[CE EN QUOI JE SUIS DOUÉ] ${ikigai.good}
[CE DONT LE MONDE A BESOIN] ${ikigai.need}
[CE QUI PEUT ME FAIRE VIVRE] ${ikigai.paid}

CONTEXTE :
Formation : ${context.promo}
Niveau : ${level}
Expérience pro : ${exp}
Diplômes : ${diplomas || "non renseigné"}
Question à clarifier : ${context.question || "non précisée"}

CALIBRATION : ${calibration}

INSTRUCTIONS PAR SECTION :

"identity" : 2-3 phrases qui décrivent la nature de cette personne à partir de CE QUE LES DONNÉES MONTRENT — pas ce qu'on voudrait qu'elle soit. Langage humain, pas de jargon psychologique.

"coherence" : Évalue la cohérence interne du profil. Est-ce que le DISC et l'Ikigai se confirment mutuellement ? Est-ce que les réponses Ikigai sont précises et ancrées dans du concret, ou vagues et génériques ? La personne semble-t-elle bien se connaître ? Sois direct mais sans jugement. 1-2 phrases.

"behavioral" : Le mode de fonctionnement réel — forces ET zones d'attention. Ne gomme pas les tensions si elles existent dans les scores. Une zone d'attention formulée avec bienveillance : pas une accusation, mais une information utile.

"ikigaiCore" : Analyse la convergence — ou l'absence de convergence — entre les 4 piliers Ikigai. Si une zone est absente ou contradictoire dans les réponses de la personne, nomme-le. Termine par une question ouverte qui invite à aller plus loin.

"humanEdge" : C'est la section la plus importante — et la plus honnête. Trois cas possibles :
  1. Si les données montrent un vrai différenciateur humain (ancré dans les réponses concrètes, pas dans le type DISC générique) : nomme-le précisément avec un exemple concret.
  2. Si le potentiel existe mais n'est pas encore développé : dis-le clairement — "voici ce que tu pourrais développer, et voici ce qui manque encore".
  3. Si le profil actuel ne montre pas de différenciateur fort face à l'IA : dis-le avec tact — ce n'est pas un verdict, c'est un point de départ. Indique ce sur quoi travailler.
  Ne fabrique jamais un Human Edge qui n'est pas dans les données. 2-3 phrases.

"venn" : 5 mots-clés courts par pilier, extraits et reformulés à partir des réponses réelles. Intersections : 2 mots-clés chacune. Si un pilier est vide ou trop vague dans les réponses, les mots-clés doivent refléter cette imprécision.

"careers" : 4 pistes de métier ancrées dans CE profil spécifique — pas dans un type DISC générique. Si les données sont insuffisantes pour proposer des pistes précises, propose des directions larges avec une note honnête sur pourquoi c'est difficile à préciser. fitScore basé sur la vraie convergence des données, pas gonflé artificiellement.

"aiStrategies" : 4 façons concrètes dont cette personne — avec son profil réel — peut utiliser l'IA comme levier. Adapté au niveau (${level}).

"actions" : 3 actions concrètes, faisables, qui adressent ce que les données révèlent — y compris les zones de travail identifiées. Pas uniquement des actions de renforcement des points forts.

"question" : Une seule question, personnalisée à CE profil, qui crée un léger inconfort constructif — le genre de question qu'un bon coach poserait à la fin d'une séance pour que la personne continue à réfléchir seule.

STRUCTURE JSON EXACTE (rien d'autre, pas de markdown) :
{
  "identity": "...",
  "coherence": "...",
  "behavioral": "...",
  "dom": "${dom}",
  "ikigaiCore": "...",
  "humanEdge": "...",
  "venn": {
    "love": ["","","","",""],
    "good": ["","","","",""],
    "need": ["","","","",""],
    "paid": ["","","","",""],
    "passion":  ["",""],
    "mission":  ["",""],
    "metier":   ["",""],
    "vocation": ["",""]
  },
  "careers": [{"t":"","r":"","s":0}],
  "aiStrategies": [{"t":"","d":""}],
  "actions": [{"t":"","d":"","cat":"","when":""}],
  "question": "..."
}

careers : exactement 4. fitScore entre 45 et 92 — reflet honnête de la convergence, pas systématiquement élevé.
aiStrategies : exactement 4.
actions : exactement 3. cat parmi Compétence/Réseau/Projet. when parmi Cette semaine/Ce mois/Dans 3 mois.
JSON pur uniquement, sans texte avant ou après.`;

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
        system: 'Tu es un expert en développement personnel. Tu retournes uniquement du JSON valide, sans texte avant ou après, sans balises markdown. Tu analyses les données telles qu\'elles sont — avec bienveillance mais sans complaisance.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({ error: `Erreur API (${anthropicRes.status}): ${errText.slice(0,300)}` });
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

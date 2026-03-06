// api/synthesize.js — Vercel Serverless Function

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

    // Calibration du niveau de maturité pour adapter les propositions
    const level = context.level || "";
    const exp   = context.exp   || "Aucune expérience";
    const diplomas = context.diplomas || "";

    const isJunior    = level.includes("Bachelor") || level.includes("1ère");
    const isMaster    = level.includes("Master") || level.includes("MSc") || level.includes("MBA");
    const isReconversion = level.includes("Reconversion") || exp.includes("reconversion") || exp.includes("7 ans");
    const hasSeniorExp   = exp.includes("7 ans") || exp.includes("3 à 7");

    const calibration = isReconversion
      ? `Profil en reconversion avec experience professionnelle significative (${exp}). Adapte les propositions a quelqu un qui repart sur de nouvelles bases avec un bagage metier reel — pas un etudiant classique. Les pistes de carriere doivent valoriser l experience anterieure et la combiner avec les nouvelles ambitions.`
      : isMaster
      ? `Profil ${level}${hasSeniorExp ? ` avec ${exp} d experience` : ""}. Propose des pistes de carriere ambitieuses et specifiques (postes, secteurs, responsabilites) coherentes avec ce niveau. Evite les suggestions trop generiques ou de niveau debutant.`
      : `Profil ${level}. Propositions adaptees a quelqu un en debut de parcours : focus sur la construction des premieres experiences, les stages, les choix de specialisation.`;

    const prompt = `Tu es un coach d orientation expert pour etudiants en ecole de commerce et en reconversion. Analyse ce profil et genere une synthese precise et personnalisee. Reponds UNIQUEMENT en JSON valide, sans markdown ni backticks.

SCORES DISC (0-100) :
D=${scores.D} | I=${scores.I} | S=${scores.S} | C=${scores.C}
Style dominant : ${dom} (${DISC_NAMES[dom]}) — ${EDGE[dom]}

IKIGAI — reponses de la personne :
[AIME] ${ikigai.love}
[DOUE] ${ikigai.good}
[BESOIN] ${ikigai.need}
[REMUNERE] ${ikigai.paid}

CONTEXTE :
Formation : ${context.promo}
Niveau : ${level}
Experience pro : ${exp}
Diplomes obtenus : ${diplomas || "non renseigne"}
Question a clarifier : ${context.question || "non precisee"}

CALIBRATION OBLIGATOIRE : ${calibration}

STRUCTURE JSON EXACTE a retourner :
{
  "identity": "2-3 phrases poetiques-factuelles sur la nature profonde. Pas de notation DISC technique. Langage humain et accessible.",
  "behavioral": "2-3 phrases sur le mode de fonctionnement. Inclure UNE nuance constructive si pertinent — une zone de vigilance formulee avec bienveillance, comme un ami lucide qui te dit quelque chose d utile. Ne pas inventer une tension qui n existe pas : si le profil est coherent, dis-le.",
  "dom": "${dom}",
  "ikigaiCore": "2-3 phrases sur la convergence Ikigai. Si une zone reste floue ou merite d etre approfondie, le mentionner comme une piste de reflexion ouverte, pas comme un probleme.",
  "humanEdge": "2-3 phrases tres specifiques a CE profil sur ce qui le rend irreplacable face a l automatisation. Exemple concret obligatoire.",
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
  "careers": [{"t":"titre poste precis","r":"2 phrases pourquoi ce profil EST fait pour ce role — ancre dans le DISC et l Ikigai de la personne","s":80}],
  "aiStrategies": [{"t":"titre court","d":"2 phrases concretement comment ce profil specifique peut utiliser l IA comme levier"}],
  "actions": [{"t":"titre action","d":"1 phrase concrete et faisable","cat":"Competence","when":"Ce mois"}],
  "question": "Une seule question ouverte et profonde, personnalisee a ce profil, pour alimenter la reflexion apres le test"
}

REGLES venn : 5 mots-cles courts (1-3 mots) par pilier, reformules et synthetises par toi. Intersections : 2 mots-cles chacune.

REGLES careers : exactement 4, fitScore entre 68 et 94 varies. ADAPTER AU NIVEAU : ${isReconversion ? "postes de transition ou de pivot valorisant l experience" : isMaster ? "postes a responsabilite, management, expertise sectorielle" : "premiers postes, stages longue duree, VIE, junior"}.

REGLES aiStrategies : exactement 4, specifiques au profil DISC dominant.
REGLES actions : exactement 3, cat parmi Competence/Reseau/Projet, when parmi Cette semaine/Ce mois/Dans 3 mois.
JSON pur uniquement.`;

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

import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, ChevronLeft, Download, Sparkles, Heart, Globe, Star,
  Briefcase, Brain, Zap, Eye, RefreshCw, Shield, Target, ArrowRight,
  CheckCircle, Users, Lightbulb, TrendingUp, Award, Clock
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLES GLOBAUX
───────────────────────────────────────────── */
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy:   #0D1B2E;
  --navy2:  #162540;
  --navy3:  #1E3355;
  --gold:   #C9A96E;
  --gold2:  #B8935A;
  --cream:  #FAF8F4;
  --cream2: #F0EDE6;
  --slate:  #64748B;
  --slate2: #94A3B8;
  --border: #E2DDD6;
  --white:  #FFFFFF;
}

.fd { font-family: 'Playfair Display', Georgia, serif; }
.fb { font-family: 'DM Sans', system-ui, sans-serif; }

@keyframes up   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
@keyframes spin { to   { transform: rotate(360deg) } }
@keyframes glow { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes bar  { from { width:0 } to { width: var(--w) } }

.au  { animation: up .7s cubic-bezier(.16,1,.3,1) both; }
.d1  { animation-delay: .05s; }
.d2  { animation-delay: .15s; }
.d3  { animation-delay: .28s; }
.d4  { animation-delay: .44s; }
.d5  { animation-delay: .62s; }
.spin-it  { animation: spin 1.2s linear infinite; }
.glow-it  { animation: glow 2.8s ease-in-out infinite; }

/* Cartes de mots DISC */
.wcard {
  border: 1.5px solid var(--border);
  background: var(--white);
  border-radius: 12px;
  padding: 20px 16px;
  cursor: default;
  transition: border-color .2s, box-shadow .2s, transform .15s;
}
.wcard:hover { border-color: var(--gold); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,169,110,.1); }
.wcard.most  { border-color: var(--navy)!important; background: var(--navy)!important; }
.wcard.least { border-color: var(--gold)!important; background: #FBF7F0!important; }

/* Boutons */
.bp {
  padding: 13px 28px; background: var(--navy); color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background .2s, transform .15s;
}
.bp:hover { background: var(--navy3); transform: translateY(-1px); }
.bs {
  padding: 13px 24px; background: transparent; color: var(--slate);
  border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  display: inline-flex; align-items: center; gap: 8px;
  transition: border-color .2s, color .2s;
}
.bs:hover { border-color: var(--slate2); color: var(--navy); }
.bg {
  padding: 13px 28px; background: var(--gold); color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background .2s, transform .15s;
}
.bg:hover { background: var(--gold2); transform: translateY(-1px); }

textarea, input, select {
  font-family: 'DM Sans', sans-serif;
  transition: border-color .2s, box-shadow .2s;
}
textarea:focus, input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(201,169,110,.18);
}

.score-bar { height: 3px; border-radius: 2px; background: var(--cream2); overflow: hidden; }
.score-bar-fill {
  height: 100%; border-radius: 2px; background: var(--gold);
  animation: bar .9s cubic-bezier(.16,1,.3,1) both;
}

/* ── Jauges DISC animées ── */
@keyframes gauge-fill {
  from { width: 0% }
  to   { width: var(--target) }
}
.disc-gauge-track {
  height: 10px; border-radius: 8px;
  background: var(--cream2); overflow: hidden;
  position: relative;
}
.disc-gauge-fill {
  height: 100%; border-radius: 8px;
  width: 0%;
  animation: gauge-fill 1.2s cubic-bezier(.16,1,.3,1) forwards;
}



/* Grilles responsives */
@media(max-width:700px) {
  .r2 { grid-template-columns: 1fr!important; }
}

@media print {
  .no-print { display: none!important; }
  .print-section { break-inside: avoid; }
  body { background: white!important; }
}
`;

/* ─────────────────────────────────────────────
   DONNÉES DISC — 28 questions choix forcé
───────────────────────────────────────────── */
const QS = [
  { id:1,  w:[{t:"Audacieux",d:"D"},{t:"Expressif",d:"I"},{t:"Chaleureux",d:"S"},{t:"Minutieux",d:"C"}]},
  { id:2,  w:[{t:"Décidé",d:"D"},{t:"Sociable",d:"I"},{t:"Patient",d:"S"},{t:"Appliqué",d:"C"}]},
  { id:3,  w:[{t:"Affirmé",d:"D"},{t:"Persuasif",d:"I"},{t:"Doux",d:"S"},{t:"Prudent",d:"C"}]},
  { id:4,  w:[{t:"Compétitif",d:"D"},{t:"Enthousiaste",d:"I"},{t:"Fiable",d:"S"},{t:"Organisé",d:"C"}]},
  { id:5,  w:[{t:"Direct",d:"D"},{t:"Ouvert",d:"I"},{t:"Harmonieux",d:"S"},{t:"Analytique",d:"C"}]},
  { id:6,  w:[{t:"Résolu",d:"D"},{t:"Spontané",d:"I"},{t:"Constant",d:"S"},{t:"Honnête",d:"C"}]},
  { id:7,  w:[{t:"Exigeant",d:"D"},{t:"Inspirant",d:"I"},{t:"Serein",d:"S"},{t:"Logique",d:"C"}]},
  { id:8,  w:[{t:"Pionnier",d:"D"},{t:"Entraînant",d:"I"},{t:"Stable",d:"S"},{t:"Structuré",d:"C"}]},
  { id:9,  w:[{t:"Indépendant",d:"D"},{t:"Engageant",d:"I"},{t:"Coopératif",d:"S"},{t:"Attentif",d:"C"}]},
  { id:10, w:[{t:"Déterminé",d:"D"},{t:"Pétillant",d:"I"},{t:"Loyal",d:"S"},{t:"Discipliné",d:"C"}]},
  { id:11, w:[{t:"Aventureux",d:"D"},{t:"Communicatif",d:"I"},{t:"Modeste",d:"S"},{t:"Objectif",d:"C"}]},
  { id:12, w:[{t:"Énergique",d:"D"},{t:"Magnétique",d:"I"},{t:"Tolérant",d:"S"},{t:"Complet",d:"C"}]},
  { id:13, w:[{t:"Autonome",d:"D"},{t:"Animé",d:"I"},{t:"Sincère",d:"S"},{t:"Précis",d:"C"}]},
  { id:14, w:[{t:"Ambitieux",d:"D"},{t:"Enjoué",d:"I"},{t:"Équilibré",d:"S"},{t:"Réfléchi",d:"C"}]},
  { id:15, w:[{t:"Franc",d:"D"},{t:"Jovial",d:"I"},{t:"Décontracté",d:"S"},{t:"Méthodique",d:"C"}]},
  { id:16, w:[{t:"Courageux",d:"D"},{t:"Optimiste",d:"I"},{t:"Bienveillant",d:"S"},{t:"Perfectionniste",d:"C"}]},
  { id:17, w:[{t:"Orienté résultats",d:"D"},{t:"Dynamique",d:"I"},{t:"Protecteur",d:"S"},{t:"Ordonné",d:"C"}]},
  { id:18, w:[{t:"Téméraire",d:"D"},{t:"Convaincant",d:"I"},{t:"Empathique",d:"S"},{t:"Rationnel",d:"C"}]},
  { id:19, w:[{t:"Actif",d:"D"},{t:"Positif",d:"I"},{t:"Prévisible",d:"S"},{t:"Exact",d:"C"}]},
  { id:20, w:[{t:"Autoritaire",d:"D"},{t:"Rayonnant",d:"I"},{t:"Accommodant",d:"S"},{t:"Consciencieux",d:"C"}]},
  { id:21, w:[{t:"Ferme",d:"D"},{t:"Généreux",d:"I"},{t:"Paisible",d:"S"},{t:"Scrupuleux",d:"C"}]},
  { id:22, w:[{t:"Décisif",d:"D"},{t:"Vibrant",d:"I"},{t:"Solidaire",d:"S"},{t:"Mesuré",d:"C"}]},
  { id:23, w:[{t:"Volontaire",d:"D"},{t:"Créatif",d:"I"},{t:"Attentionné",d:"S"},{t:"Rigoureux",d:"C"}]},
  { id:24, w:[{t:"Tenace",d:"D"},{t:"Curieux",d:"I"},{t:"Prévenant",d:"S"},{t:"Systématique",d:"C"}]},
  { id:25, w:[{t:"Assertif",d:"D"},{t:"Stimulant",d:"I"},{t:"Rassurant",d:"S"},{t:"Factuel",d:"C"}]},
  { id:26, w:[{t:"Persévérant",d:"D"},{t:"Expansif",d:"I"},{t:"Conciliant",d:"S"},{t:"Précautionneux",d:"C"}]},
  { id:27, w:[{t:"Proactif",d:"D"},{t:"Inspiré",d:"I"},{t:"Disponible",d:"S"},{t:"Sensé",d:"C"}]},
  { id:28, w:[{t:"Incisif",d:"D"},{t:"Vivace",d:"I"},{t:"Calme",d:"S"},{t:"Pointilleux",d:"C"}]},
];

// Chaque pilier Ikigai = 2 micro-questions combinées en une réponse
const IKIGAI = [
  {
    k:"love", title:"Ce que tu aimes", label:"Passions intérieures", Icon:Heart, color:"#C0586A",
    subs:[
      {
        q:"Quand tu perds la notion du temps, tu fais quoi ?",
        hint:"Pense à tes loisirs, sujets de curiosité, activités où tu es pleinement toi-même.",
        ph:"Ex : écrire, débattre d'idées, organiser des événements, créer des trucs, explorer des pays…"
      },
      {
        q:"Qu'est-ce que tu adorerais faire même si on ne te payait pas ?",
        hint:"Ce qui te donne de l'énergie, pas ce que tu crois devoir répondre.",
        ph:"Ex : accompagner des gens, résoudre des problèmes complexes, raconter des histoires…"
      }
    ]
  },
  {
    k:"good", title:"Ce en quoi tu excelles", label:"Forces naturelles", Icon:Star, color:"#4A7CC0",
    subs:[
      {
        q:"Pour quoi les autres te demandent-ils de l'aide ?",
        hint:"Ce qui te vient naturellement mais impressionne les autres. Pas besoin d'être diplômé pour ça.",
        ph:"Ex : écouter, convaincre, analyser, organiser, créer, expliquer clairement…"
      },
      {
        q:"Quelle compétence as-tu développée sans vraiment t'en rendre compte ?",
        hint:"Ce qui t'est devenu évident mais que beaucoup trouvent difficile.",
        ph:"Ex : gérer des conflits, visualiser des données, comprendre les gens rapidement…"
      }
    ]
  },
  {
    k:"need", title:"Ce dont le monde a besoin", label:"Valeurs & impact", Icon:Globe, color:"#3D9E70",
    subs:[
      {
        q:"Quel problème t'énerve ou te touche vraiment dans le monde ?",
        hint:"Ce qui te révolte, t'indigne ou t'inspire à agir. Petit ou grand, local ou global.",
        ph:"Ex : le manque de sens au travail, les inégalités d'éducation, la déconnexion humaine…"
      },
      {
        q:"Quel changement voudrais-tu voir dans 10 ans — et que tu aimerais contribuer à créer ?",
        hint:"Sois sincère, même si ça paraît ambitieux.",
        ph:"Ex : des organisations plus humaines, des jeunes qui savent qui ils sont, plus de créativité…"
      }
    ]
  },
  {
    k:"paid", title:"Ce qui peut te faire vivre", label:"Potentiel économique", Icon:Briefcase, color:"#B8862A",
    subs:[
      {
        q:"Si tu combinais ce que tu aimes + ce en quoi tu es doué, quel métier ou mission ça pourrait donner ?",
        hint:"Pas besoin que ce soit parfait. Brainstorme librement.",
        ph:"Ex : consultant, formateur, entrepreneur social, créateur de contenu, coach, directeur artistique…"
      },
      {
        q:"Pour quoi des entreprises ou des personnes seraient prêtes à te payer ?",
        hint:"Pense à la valeur que tu crées naturellement pour les autres.",
        ph:"Ex : clarifier des idées complexes, motiver une équipe, concevoir des expériences, analyser des données…"
      }
    ]
  },
];

const DM = {
  D:{name:"Dominance",   short:"Dominant",  color:"#C05050", bg:"#FEF2F2", desc:"Décidé · Direct · Orienté résultats"},
  I:{name:"Influence",   short:"Influent",  color:"#C07030", bg:"#FFF7ED", desc:"Enthousiaste · Persuasif · Social"},
  S:{name:"Stabilité",   short:"Stable",    color:"#2A9060", bg:"#F0FDF4", desc:"Patient · Constant · Empathique"},
  C:{name:"Conformité",  short:"Consciencieux", color:"#2A80C0", bg:"#EFF6FF", desc:"Analytique · Précis · Orienté qualité"},
};

const EDGE = {
  D:"Votre capacité à trancher sous pression, à assumer la responsabilité finale et à créer une dynamique là où l'IA hésite, est irremplaçable. Les algorithmes optimisent — vous, vous décidez et vous engagez.",
  I:"Votre faculté à mobiliser les personnes, à créer de la confiance et à adapter votre message à l'humain en face de vous dépasse toute simulation. La relation authentique est votre territoire exclusif.",
  S:"Votre ancrage dans l'équipe, votre lecture fine des tensions humaines et votre constance dans la durée constituent un ciment social que les outils IA ne peuvent ni calculer ni reproduire.",
  C:"Votre rigueur pour détecter l'erreur cachée, votre sens de la qualité systémique et votre capacité à poser les bonnes questions avant d'agir vous rendent indispensable là où la précision a des conséquences réelles.",
};

/* ─────────────────────────────────────────────
   ALGORITHME DISC
───────────────────────────────────────────── */
function calcDisc(ans) {
  const m={D:0,I:0,S:0,C:0}, l={D:0,I:0,S:0,C:0};
  ans.forEach(a=>{ m[a.md]++; l[a.ld]++; });
  const s={};
  ["D","I","S","C"].forEach(d=>{
    // 28 questions : plage -28 à +28, soit 56 points au total
    s[d]=Math.max(0,Math.min(100,Math.round(((m[d]-l[d]+28)/56)*100)));
  });
  return s;
}

/* ─────────────────────────────────────────────
   EXTRACTION MOTS-CLÉS IKIGAI
───────────────────────────────────────────── */
function extractKeywords(text, max=6) {
  if (!text) return [];
  return [...new Set(
    text.split(/[,\n;/•·]+/)
      .map(s => s.trim().replace(/^[-–—*]\s*/, ''))
      .filter(s => s.length > 2 && s.length < 60)
  )].slice(0, max);
}

function intersectKeywords(t1, t2, max=2) {
  const k1 = extractKeywords(t1, 12), k2 = extractKeywords(t2, 12);
  const common = k1.filter(a => k2.some(b =>
    b.toLowerCase().includes(a.toLowerCase().slice(0,5)) ||
    a.toLowerCase().includes(b.toLowerCase().slice(0,5))
  ));
  if (common.length < max) {
    const fill = [...k1.slice(0,2), ...k2.slice(0,1)].filter(k => !common.includes(k));
    return [...common, ...fill].slice(0, max);
  }
  return common.slice(0, max);
}

/* ─────────────────────────────────────────────
   VENN IKIGAI — VERSION HTML (écran, animée)
───────────────────────────────────────────── */
function Venn({ venn }) {
  // Mots-clés extraits et synthétisés par l'IA
  const love     = venn?.love     || [];
  const good     = venn?.good     || [];
  const need     = venn?.need     || [];
  const paid     = venn?.paid     || [];
  const passion  = venn?.passion  || [];
  const mission  = venn?.mission  || [];
  const metier   = venn?.metier   || [];
  const vocation = venn?.vocation || [];

  const KW = ({ words, color }) => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
      {words.map((w,i) => (
        <span key={i} style={{
          fontSize:"10px", color, fontFamily:"DM Sans,sans-serif",
          fontWeight:500, lineHeight:1.4, textAlign:"center",
        }}>{w}</span>
      ))}
    </div>
  );

  const Inter = ({ words, label, color }) => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
      <span style={{fontSize:"8px",color,fontStyle:"italic",fontWeight:600,
        fontFamily:"DM Sans,sans-serif",opacity:.8}}>{label}</span>
      {words.map((w,i) => (
        <span key={i} style={{fontSize:"9px",color,fontFamily:"DM Sans,sans-serif",
          fontWeight:400,lineHeight:1.3,textAlign:"center",opacity:.75}}>{w}</span>
      ))}
    </div>
  );

  const C = "#C0586A", B = "#4A7CC0", G = "#3D9E70", O = "#B8862A";

  return (
    <div style={{position:"relative",width:"100%",maxWidth:"420px",
      margin:"0 auto",aspectRatio:"1/1",userSelect:"none"}}>

      {/* ── 4 CERCLES ── */}
      {[
        {left:"4%", top:"4%",   bg:C+"22", border:`1.5px solid ${C}55`},
        {left:"46%",top:"4%",   bg:B+"22", border:`1.5px solid ${B}55`},
        {left:"4%", top:"46%",  bg:G+"22", border:`1.5px solid ${G}55`},
        {left:"46%",top:"46%",  bg:O+"22", border:`1.5px solid ${O}55`},
      ].map((s,i) => (
        <div key={i} style={{
          position:"absolute", width:"56%", height:"56%",
          borderRadius:"50%", background:s.bg, border:s.border,
          left:s.left, top:s.top,
        }}/>
      ))}

      {/* ── TITRES ── */}
      <div style={{position:"absolute",top:"1%",left:"3%",
        fontSize:"10px",fontWeight:700,color:C,fontFamily:"DM Sans,sans-serif"}}>
        Ce que j'aime
      </div>
      <div style={{position:"absolute",top:"1%",right:"2%",
        fontSize:"10px",fontWeight:700,color:B,fontFamily:"DM Sans,sans-serif",textAlign:"right"}}>
        En quoi je suis doué
      </div>
      <div style={{position:"absolute",bottom:"1%",left:"3%",
        fontSize:"10px",fontWeight:700,color:G,fontFamily:"DM Sans,sans-serif"}}>
        Ce dont le monde a besoin
      </div>
      <div style={{position:"absolute",bottom:"1%",right:"2%",
        fontSize:"10px",fontWeight:700,color:O,fontFamily:"DM Sans,sans-serif",textAlign:"right"}}>
        Ce qui peut me faire vivre
      </div>

      {/* ── MOTS-CLÉS CERCLES (zones exclusives) ── */}
      <div style={{position:"absolute",top:"14%",left:"7%",width:"24%"}}>
        <KW words={love} color={C}/>
      </div>
      <div style={{position:"absolute",top:"14%",right:"7%",width:"24%"}}>
        <KW words={good} color={B}/>
      </div>
      <div style={{position:"absolute",bottom:"14%",left:"7%",width:"24%"}}>
        <KW words={need} color={G}/>
      </div>
      <div style={{position:"absolute",bottom:"14%",right:"7%",width:"24%"}}>
        <KW words={paid} color={O}/>
      </div>

      {/* ── INTERSECTIONS ── */}
      {/* Passion : haut centre */}
      <div style={{position:"absolute",top:"16%",left:"50%",
        transform:"translateX(-50%)",width:"18%",textAlign:"center"}}>
        <Inter words={passion} label="Passion" color="#9B5070"/>
      </div>
      {/* Mission : centre gauche */}
      <div style={{position:"absolute",top:"50%",left:"16%",
        transform:"translateY(-50%)",width:"18%",textAlign:"center"}}>
        <Inter words={mission} label="Mission" color="#488070"/>
      </div>
      {/* Métier : centre droit */}
      <div style={{position:"absolute",top:"50%",right:"16%",
        transform:"translateY(-50%)",width:"18%",textAlign:"center"}}>
        <Inter words={metier} label="Métier" color="#507090"/>
      </div>
      {/* Vocation : bas centre */}
      <div style={{position:"absolute",bottom:"16%",left:"50%",
        transform:"translateX(-50%)",width:"18%",textAlign:"center"}}>
        <Inter words={vocation} label="Vocation" color="#8A7830"/>
      </div>

      {/* ── CENTRE IKIGAI ── */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        width:"17%",height:"17%",borderRadius:"50%",
        background:"rgba(201,169,110,.15)",
        border:"2px solid #C9A96E",
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        textAlign:"center",zIndex:10,
      }}>
        <span style={{fontSize:"9px",fontWeight:600,color:"#8B6A30",
          fontFamily:"Playfair Display,serif",lineHeight:1}}>IKIGAI</span>
        <span style={{fontSize:"6px",color:"#A07840",
          fontFamily:"DM Sans,sans-serif",lineHeight:1.2,marginTop:"2px"}}>
          Raison d'être
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESSION
───────────────────────────────────────────── */
function prog(ph,qi,is){
  if(ph==="home")        return 0;
  if(ph==="disc-in")     return 3;
  if(ph==="disc")        return 3+(qi/28)*34;
  if(ph==="ik-in")       return 38;
  if(ph==="ik")          return 38+((is+1)/4)*27;
  if(ph==="ctx")         return 68;
  if(ph==="wait"||ph==="out") return 100;
  return 0;
}

/* ─────────────────────────────────────────────
   WRAPPER SECTION
───────────────────────────────────────────── */
function Sec({children, bg="#FAF8F4", center=true}){
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:center?"center":"flex-start",justifyContent:"center",
      padding:"60px 24px",background:bg}}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT BADGE
───────────────────────────────────────────── */
function Badge({color,bg,label}){
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:"6px",
      padding:"4px 12px",background:bg,borderRadius:"999px",
      fontSize:"11px",fontWeight:600,color,fontFamily:"DM Sans,sans-serif",
      letterSpacing:"0.5px"}}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   APPLICATION
───────────────────────────────────────────── */
export default function App(){
  const [ph,  setPh]  = useState("home");
  // Ordre mélangé des 4 mots par question — calculé une fois au chargement
  const [shuffled] = useState(() =>
    QS.map(q => {
      const indices = [0,1,2,3];
      // Fisher-Yates shuffle
      for (let i = 3; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return indices.map(i => q.w[i]);
    })
  );
  const [qi,  setQi]  = useState(0);
  const [ans, setAns] = useState([]);
  const [cur, setCur] = useState({md:null,ld:null});
  const [is,  setIs]  = useState(0);   // index pilier ikigai (0-3)
  const [iss, setIss] = useState(0);   // index sous-question (0-1)
  const [ik,  setIk]  = useState({love:["",""],good:["",""],need:["",""],paid:["",""]});
  const [ctx, setCtx] = useState({promo:"",level:"",exp:"",diplomas:"",question:""});
  const [sc,  setSc]  = useState(null);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);

  const p    = prog(ph,qi,is);
  const q    = QS[qi];
  const step = IKIGAI[is];

  /* DISC */
  const pickM = d => setCur(v=>({md:v.md===d?null:d, ld:v.ld===d?null:v.ld}));
  const pickL = d => setCur(v=>({ld:v.ld===d?null:d, md:v.md===d?null:v.md}));

  const discNext = () => {
    const na=[...ans,cur];
    setAns(na); setCur({md:null,ld:null});
    if(qi<27) setQi(qi+1);
    else { setSc(calcDisc(na)); setPh("ik-in"); }
  };
  const discBack = () => {
    if(qi>0){ const p=ans[ans.length-1]; setCur({md:p.md,ld:p.ld}); setAns(ans.slice(0,-1)); setQi(qi-1); }
    else setPh("disc-in");
  };

  /* Synthèse IA — appel vers le backend Vercel sécurisé */
  const runSynth = async(scores,ikigai,context)=>{
    setErr(null);
    const dom = ["D","I","S","C"].reduce((a,d)=>scores[d]>scores[a]?d:a,"D");

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, ikigai, context, dom }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || `Erreur serveur (${res.status})`);
        return;
      }

      setOut(data);
      setPh("out");

    } catch(networkErr) {
      setErr(`Erreur réseau : ${networkErr.message}`);
    }
  };

  const goProcess=()=>{ setPh("wait"); runSynth(sc, {
          love: ik.love.filter(Boolean).join(' / '),
          good: ik.good.filter(Boolean).join(' / '),
          need: ik.need.filter(Boolean).join(' / '),
          paid: ik.paid.filter(Boolean).join(' / '),
        }, {
          promo:    ctx.promo,
          level:    ctx.level,
          exp:      ctx.exp,
          diplomas: ctx.diplomas,
          question: ctx.question,
        }); };
  const reset=()=>{
    setPh("home");setQi(0);setAns([]);setCur({md:null,ld:null});
    setIs(0);setIss(0);setIk({love:["",""],good:["",""],need:["",""],paid:["",""]});
    setCtx({promo:"",level:"",exp:"",diplomas:"",question:""});setSc(null);setOut(null);
  };

  /* ── GÉNÉRATION SVG VENN POUR EXPORT (utilise mots-clés IA) ── */
  const generateVennSVG = (vennData) => {
    const trunc = (s, n=20) => s && s.length > n ? s.slice(0,n-1)+"…" : (s||"");
    const listRows = (kws, x, y, color) => (kws||[]).map((k,i) =>
      `<text x="${x}" y="${y + i*13}" text-anchor="middle" font-size="9" fill="${color}" font-family="DM Sans,sans-serif">${trunc(k)}</text>`
    ).join("");
    const interRows = (kws, x, y, color) => (kws||[]).map((k,i) =>
      `<text x="${x}" y="${y + i*12}" text-anchor="middle" font-size="8" fill="${color}" font-family="DM Sans,sans-serif" font-style="italic">${trunc(k,16)}</text>`
    ).join("");

    const love     = vennData?.love     || [];
    const good     = vennData?.good     || [];
    const need     = vennData?.need     || [];
    const paid     = vennData?.paid     || [];
    const passion  = vennData?.passion  || [];
    const mission  = vennData?.mission  || [];
    const metier   = vennData?.metier   || [];
    const vocation = vennData?.vocation || [];

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" style="width:100%;max-width:500px;display:block;margin:0 auto">
      <defs>
        <radialGradient id="g1"><stop offset="0%" stop-color="#C0586A" stop-opacity="0.15"/><stop offset="100%" stop-color="#C0586A" stop-opacity="0.04"/></radialGradient>
        <radialGradient id="g2"><stop offset="0%" stop-color="#4A7CC0" stop-opacity="0.15"/><stop offset="100%" stop-color="#4A7CC0" stop-opacity="0.04"/></radialGradient>
        <radialGradient id="g3"><stop offset="0%" stop-color="#3D9E70" stop-opacity="0.15"/><stop offset="100%" stop-color="#3D9E70" stop-opacity="0.04"/></radialGradient>
        <radialGradient id="g4"><stop offset="0%" stop-color="#B8862A" stop-opacity="0.15"/><stop offset="100%" stop-color="#B8862A" stop-opacity="0.04"/></radialGradient>
      </defs>
      <circle cx="222" cy="222" r="155" fill="url(#g1)" stroke="#C0586A" stroke-width="1.5"/>
      <circle cx="378" cy="222" r="155" fill="url(#g2)" stroke="#4A7CC0" stroke-width="1.5"/>
      <circle cx="222" cy="378" r="155" fill="url(#g3)" stroke="#3D9E70" stroke-width="1.5"/>
      <circle cx="378" cy="378" r="155" fill="url(#g4)" stroke="#B8862A" stroke-width="1.5"/>
      <circle cx="300" cy="300" r="42" fill="#C9A96E18" stroke="#C9A96E" stroke-width="2"/>
      <text x="300" y="296" text-anchor="middle" font-size="12" fill="#8B6A30" font-family="serif" font-weight="600">IKIGAI</text>
      <text x="300" y="310" text-anchor="middle" font-size="8" fill="#A07840" font-family="sans-serif">Raison d'être</text>
      <text x="150" y="62" text-anchor="middle" font-size="12" fill="#C0586A" font-family="sans-serif" font-weight="700">Ce que j'aime</text>
      <text x="450" y="62" text-anchor="middle" font-size="12" fill="#4A7CC0" font-family="sans-serif" font-weight="700">En quoi je suis doué</text>
      <text x="150" y="556" text-anchor="middle" font-size="12" fill="#3D9E70" font-family="sans-serif" font-weight="700">Ce dont le monde a besoin</text>
      <text x="450" y="556" text-anchor="middle" font-size="12" fill="#B8862A" font-family="sans-serif" font-weight="700">Ce qui peut me faire vivre</text>
      ${listRows(love, 148, 108 - love.length*6, "#B04060")}
      ${listRows(good, 452, 108 - good.length*6, "#3A6CB0")}
      ${listRows(need, 148, 398 - need.length*6, "#2D8E60")}
      ${listRows(paid, 452, 398 - paid.length*6, "#A87620")}
      <text x="300" y="148" text-anchor="middle" font-size="9" fill="#7B4060" font-family="sans-serif" font-style="italic" font-weight="600">Passion</text>
      ${interRows(passion, 300, 162, "#8B5070")}
      <text x="180" y="305" text-anchor="middle" font-size="9" fill="#487060" font-family="sans-serif" font-style="italic" font-weight="600">Mission</text>
      ${interRows(mission, 180, 319, "#508070")}
      <text x="420" y="305" text-anchor="middle" font-size="9" fill="#506890" font-family="sans-serif" font-style="italic" font-weight="600">Métier</text>
      ${interRows(metier, 420, 319, "#607090")}
      <text x="300" y="452" text-anchor="middle" font-size="9" fill="#7A6820" font-family="sans-serif" font-style="italic" font-weight="600">Vocation</text>
      ${interRows(vocation, 300, 466, "#8A7830")}
    </svg>`;
  };

  /* ── EXPORT HTML ── */
  const downloadBilan = () => {
    if (!out || !sc) return;
    const dom = out.dom || "D";
    const discRows = ["D","I","S","C"].map(d => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:${
          {D:"#C05050",I:"#C07030",S:"#2A9060",C:"#2A80C0"}[d]
        }">${d}</td>
        <td style="padding:8px 12px;color:#475569">${
          {D:"Dominance",I:"Influence",S:"Stabilité",C:"Conformité"}[d]
        }</td>
        <td style="padding:8px 12px">
          <div style="background:#F0EDE6;border-radius:4px;height:8px;width:100%;overflow:hidden">
            <div style="background:#C9A96E;height:100%;width:${sc[d]}%;border-radius:4px"></div>
          </div>
        </td>
        <td style="padding:8px 12px;font-weight:600;color:#0D1B2E;text-align:right">${sc[d]}</td>
      </tr>`).join("");

    const careerRows = (out.careers||[]).map((c,i) => `
      <div style="margin-bottom:16px;padding:20px;background:#FAF8F4;border-radius:10px;border-left:4px solid #C9A96E">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#0D1B2E">${c.t}</strong>
          <span style="background:#C9A96E22;color:#B8862A;font-weight:700;padding:3px 10px;border-radius:20px;font-size:13px">${c.s}%</span>
        </div>
        <p style="color:#64748B;font-size:14px;line-height:1.7">${c.r}</p>
      </div>`).join("");

    const aiRows = (out.aiStrategies||[]).map((s,i) => `
      <div style="margin-bottom:12px;padding:16px 20px;background:#FAF8F4;border-radius:10px;display:flex;gap:14px">
        <span style="font-weight:700;color:#C9A96E;font-size:16px;min-width:24px">${i+1}.</span>
        <div>
          <p style="font-weight:600;color:#0D1B2E;margin-bottom:4px">${s.t}</p>
          <p style="color:#64748B;font-size:13px;line-height:1.7">${s.d}</p>
        </div>
      </div>`).join("");

    const actionRows = (out.actions||[]).map((a,i) => {
      const catColor = {Compétence:"#3D9E70",Réseau:"#4A7CC0",Projet:"#C9A96E"}[a.cat]||"#94A3B8";
      return `
      <div style="margin-bottom:12px;padding:16px 20px;background:#FAF8F4;border-radius:10px;border-left:4px solid ${catColor}">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;flex-wrap:wrap">
          <strong style="color:#0D1B2E">${a.t}</strong>
          <span style="font-size:11px;font-weight:700;color:${catColor};background:${catColor}20;padding:2px 8px;border-radius:20px;text-transform:uppercase">${a.cat}</span>
          <span style="font-size:11px;color:#94A3B8">⏱ ${a.when}</span>
        </div>
        <p style="color:#64748B;font-size:13px;line-height:1.6">${a.d}</p>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Mon Bilan Humain – Human Blueprint</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#FAF8F4;color:#0D1B2E;padding:0}
  .page{max-width:800px;margin:0 auto;padding:48px 40px}
  h1,h2,h3{font-family:'Playfair Display',Georgia,serif}
  .hero{background:linear-gradient(135deg,#0D1B2E,#162540);padding:48px 40px;border-radius:16px;margin-bottom:36px;text-align:center}
  .hero h1{color:#FAF8F4;font-size:36px;font-style:italic;margin-bottom:16px;line-height:1.3}
  .hero p{color:#C9A96E;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:10px}
  .hero .badge{display:inline-block;background:rgba(201,169,110,.15);border:1px solid rgba(201,169,110,.3);color:#C9A96E;padding:6px 18px;border-radius:999px;font-size:12px;margin-top:16px}
  .section{background:#FFFFFF;border-radius:14px;padding:32px;margin-bottom:20px;border:1px solid #E2DDD6}
  .section-label{font-size:9px;letter-spacing:3px;color:#94A3B8;text-transform:uppercase;margin-bottom:12px}
  .section h2{font-size:26px;font-weight:400;color:#0D1B2E;margin-bottom:16px}
  .section p{font-size:15px;color:#475569;line-height:1.8;font-weight:300}
  .edge{background:linear-gradient(135deg,#0D1B2E,#162540);border-radius:14px;padding:32px;margin-bottom:20px}
  .edge h2{color:#FAF8F4;font-size:26px;font-weight:400;margin-bottom:16px}
  .edge p{color:#94A3B8;font-size:15px;line-height:1.8;font-weight:300}
  table{width:100%;border-collapse:collapse}
  td{border-bottom:1px solid #F0EDE6}
  .question-box{background:#FFFFFF;border-radius:14px;padding:36px;margin-bottom:20px;border:1px solid #E2DDD6;text-align:center}
  .question-box h2{font-size:24px;font-style:italic;font-weight:400;color:#0D1B2E;line-height:1.5;max-width:600px;margin:0 auto}
  .footer{text-align:center;padding:24px;color:#94A3B8;font-size:11px;border-top:1px solid #E2DDD6;margin-top:32px}
  @media print{body{background:white}.page{padding:20px}button{display:none}}
  .print-btn{display:block;margin:0 auto 32px;padding:12px 32px;background:#0D1B2E;color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;font-weight:500}
  .print-btn:hover{background:#162540}
</style>
</head>
<body>
<div class="page">
  <button class="print-btn" onclick="window.print()">🖨 Imprimer / Sauvegarder en PDF</button>

  <div class="hero">
    <p>Bilan Humain Personnel · Human Blueprint</p>
    <h1>« ${(out.identity||"").replace(/</g,"&lt;")} »</h1>
    <div class="badge">Style dominant : ${ {D:"Dominance",I:"Influence",S:"Stabilité",C:"Conformité"}[dom] } — ${ {D:"Décidé · Direct · Orienté résultats",I:"Enthousiaste · Persuasif · Social",S:"Patient · Constant · Empathique",C:"Analytique · Précis · Orienté qualité"}[dom] }</div>
  </div>

  <div class="section">
    <p class="section-label">Profil DISC</p>
    <h2>Architecture Comportementale</h2>
    <table style="margin-bottom:20px">${discRows}</table>
    <p>${(out.behavioral||"").replace(/</g,"&lt;")}</p>
  </div>

  <div class="section">
    <p class="section-label">Carte Ikigai Personnalisée</p>
    <h2>Ta Raison d'Être</h2>
    <p style="margin-bottom:24px">${(out.ikigaiCore||"").replace(/</g,"&lt;")}</p>
    <div style="text-align:center;margin:28px 0">
      ${generateVennSVG(out.venn)}
    </div>
  </div>

  <div class="edge">
    <p style="font-size:9px;letter-spacing:3px;color:#C9A96E;text-transform:uppercase;margin-bottom:12px">Ton bouclier face à l'automatisation</p>
    <h2>L'Atout Humain</h2>
    <p>${(out.humanEdge||"").replace(/</g,"&lt;")}</p>
  </div>

  <div class="section">
    <p class="section-label">Voies Professionnelles Alignées</p>
    <h2>Carrières</h2>
    ${careerRows}
  </div>

  <div class="section">
    <p class="section-label">Stratégies de Collaboration avec l'IA</p>
    <h2>Comment Piloter l'IA</h2>
    ${aiRows}
  </div>

  <div class="section">
    <p class="section-label">Plan d'Action Immédiat</p>
    <h2>Tes 3 Prochaines Actions</h2>
    ${actionRows}
  </div>

  <div class="question-box">
    <p style="font-size:9px;letter-spacing:3px;color:#C9A96E;text-transform:uppercase;margin-bottom:14px">Pour ta réflexion</p>
    <h2>« ${(out.question||"").replace(/</g,"&lt;")} »</h2>
  </div>

  <div class="footer">
    <p>Human Blueprint · INSEEC / SUPDEPUB · Données traitées localement — aucun stockage externe</p>
    <p style="margin-top:6px">Généré le ${new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</p>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], {type:"text/html;charset=utf-8"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `bilan-humain-${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };




  /* ══════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════ */
  return (
    <div className="fb" style={{background:"#FAF8F4",minHeight:"100vh"}}>
      <style>{GS}</style>

      {/* BARRE DE PROGRESSION */}
      {ph!=="home"&&(
        <div className="no-print" style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:"2px",background:"#E2DDD6"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#C9A96E,#E0C080)",width:`${p}%`,transition:"width .5s ease"}}/>
        </div>
      )}

      {/* ══════════ ACCUEIL ══════════ */}
      {ph==="home"&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",padding:"60px 24px",
          background:"linear-gradient(160deg,#08111E 0%,#0D1B2E 50%,#162540 100%)"}}>
          <div style={{maxWidth:"560px",width:"100%",textAlign:"center"}}>

            {/* Icône + eyebrow */}
            <div className="au">
              <div style={{width:"56px",height:"56px",borderRadius:"50%",margin:"0 auto 24px",
                background:"rgba(201,169,110,.1)",border:"1px solid rgba(201,169,110,.3)",
                display:"flex",alignItems:"center",justifyContent:"center"}} className="glow-it">
                <Eye size={24} color="#C9A96E"/>
              </div>
              <p style={{fontSize:"9px",letterSpacing:"5px",color:"#C9A96E",
                textTransform:"uppercase",marginBottom:"40px"}}>
                Human Blueprint · INSEEC / SUPDEPUB
              </p>
            </div>

            {/* Titre */}
            <h1 className="fd au d1" style={{fontSize:"clamp(44px,7vw,78px)",fontWeight:400,
              color:"#FAF8F4",lineHeight:.98,marginBottom:"24px",letterSpacing:"-0.5px"}}>
              Connais-toi<br/><em style={{color:"#C9A96E"}}>toi-même.</em>
            </h1>

            {/* Accroche */}
            <p className="au d2" style={{fontSize:"16px",color:"#94A3B8",lineHeight:1.8,
              maxWidth:"460px",margin:"0 auto 40px",fontWeight:300}}>
              En 15 minutes, découvre comment tu fonctionnes,
              ce qui te donne de l'énergie et où tu pourrais aller.
            </p>

            {/* Posture */}
            <div className="au d3" style={{
              background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,255,255,.08)",
              borderRadius:"16px",padding:"22px 24px",
              marginBottom:"16px",textAlign:"left",
            }}>
              <p style={{fontSize:"9px",letterSpacing:"2.5px",textTransform:"uppercase",
                color:"#475569",fontWeight:600,marginBottom:"14px",textAlign:"center"}}>
                Pour en tirer le maximum
              </p>
              {[
                ["comme tu es vraiment", "Réponds ", ", pas comme tu voudrais être vu·e."],
                ["prends le temps", "Sur l'Ikigai, ", " — les réponses courtes donnent des résultats creux."],
                ["pas de bonne ou mauvaise réponse", "Il n'y a ", " — seulement la tienne."],
              ].map(([bold, before, after], i, arr)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"flex-start",gap:"14px",
                  padding:"10px 0",
                  borderBottom: i<arr.length-1 ? "1px solid rgba(255,255,255,.05)" : "none",
                }}>
                  <div style={{width:"18px",height:"18px",borderRadius:"50%",flexShrink:0,
                    border:"1.5px solid rgba(201,169,110,.4)",marginTop:"2px"}}/>
                  <p style={{fontSize:"13px",color:"#94A3B8",lineHeight:1.6,fontWeight:300}}>
                    {before}<strong style={{color:"#E2E8F0",fontWeight:500}}>{bold}</strong>{after}
                  </p>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="au d3" style={{
              display:"flex",alignItems:"flex-start",gap:"12px",
              padding:"0 4px",marginBottom:"44px",textAlign:"left",
            }}>
              <div style={{width:"2px",minHeight:"32px",background:"rgba(201,169,110,.3)",
                borderRadius:"2px",flexShrink:0,marginTop:"2px"}}/>
              <p style={{fontSize:"12px",color:"#475569",lineHeight:1.65,fontStyle:"italic"}}>
                <strong style={{fontStyle:"normal",color:"#C9A96E",fontWeight:500}}>
                  Premier miroir, pas vérité absolue.
                </strong>{" "}
                Ce bilan lance une réflexion — il ne te définit pas.
              </p>
            </div>

            {/* CTA */}
            <div className="au d4">
              <button className="bg" onClick={()=>setPh("disc-in")}
                style={{fontSize:"15px",padding:"15px 44px",borderRadius:"9px"}}>
                Commencer l'évaluation <ChevronRight size={18}/>
              </button>
              <div style={{marginTop:"16px",display:"flex",alignItems:"center",
                justifyContent:"center",gap:"6px"}}>
                <Shield size={12} color="#334155"/>
                <p style={{fontSize:"11px",color:"#334155"}}>
                  Aucune donnée stockée — tout est effacé à la fermeture
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════ INTRO DISC ══════════ */}
      {ph==="disc-in"&&(
        <Sec>
          <div className="au" style={{maxWidth:"520px",width:"100%"}}>
            <Badge color="#C9A96E" bg="rgba(201,169,110,.1)" label="MODULE 01 · ÉVALUATION COMPORTEMENTALE"/>
            <h2 className="fd au d1" style={{fontSize:"clamp(38px,5vw,58px)",fontWeight:400,
              color:"#0D1B2E",lineHeight:1.05,margin:"18px 0 20px"}}>
              Test DISC
            </h2>
            <p className="au d2" style={{fontSize:"15px",color:"#64748B",lineHeight:1.8,
              marginBottom:"24px",fontWeight:300}}>
              Tu vas voir <strong style={{color:"#0D1B2E"}}>20 séries</strong> de quatre descripteurs
              de personnalité. Pour chaque série, indique le mot qui te ressemble le{" "}
              <strong style={{color:"#0D1B2E"}}>plus</strong> et celui qui te ressemble le{" "}
              <strong style={{color:"#C9A96E"}}>moins</strong>, selon ta nature profonde dans
              tous les contextes de vie.
            </p>
            <div className="au d2" style={{background:"#FFFFFF",border:"1px solid #E2DDD6",
              borderRadius:"12px",padding:"24px",marginBottom:"32px"}}>
              <p style={{fontSize:"13px",color:"#64748B",lineHeight:1.8}}>
                <strong style={{color:"#0D1B2E"}}>Principe :</strong> Il n'y a ni bonne ni mauvaise réponse.
                Ce n'est pas un test de valeur — c'est un miroir. Fais confiance à ta première intuition
                et réponds selon qui tu es, pas selon qui tu voudrais être.
              </p>
            </div>
            <div className="au d3" style={{display:"flex",gap:"10px"}}>
              <button className="bs" onClick={()=>setPh("home")}><ChevronLeft size={16}/> Retour</button>
              <button className="bp" onClick={()=>setPh("disc")}>Démarrer <ChevronRight size={16}/></button>
            </div>
          </div>
        </Sec>
      )}

      {/* ══════════ QUESTIONS DISC ══════════ */}
      {ph==="disc"&&(
        <Sec>
          <div style={{maxWidth:"640px",width:"100%"}}>
            {/* Progress dots */}
            <div style={{display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:"40px"}}>
              <p style={{fontSize:"11px",color:"#94A3B8",letterSpacing:"2px",textTransform:"uppercase"}}>
                Question {qi+1} / 20
              </p>
              <div style={{display:"flex",gap:"3px",flexWrap:"wrap",maxWidth:"180px",justifyContent:"flex-end"}}>
                {QS.map((_,i)=>(
                  <div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",
                    background:i<qi?"#C9A96E":i===qi?"#0D1B2E":"#E2DDD6",
                    transition:"background .3s"}}/>
                ))}
              </div>
            </div>

            <h3 className="fd" style={{fontSize:"clamp(24px,3.5vw,36px)",fontWeight:400,
              color:"#0D1B2E",lineHeight:1.2,marginBottom:"8px"}}>
              Quel mot reflète le mieux ta nature profonde ?
            </h3>
            <p style={{fontSize:"13px",color:"#94A3B8",marginBottom:"32px",fontWeight:300}}>
              Sélectionne{" "}
              <span style={{color:"#0D1B2E",fontWeight:600}}>le plus</span> et{" "}
              <span style={{color:"#C9A96E",fontWeight:600}}>le moins</span> qui te ressemble
            </p>

            {/* Grille 2x2 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"36px"}}>
              {shuffled[qi].map((w,i)=>{
                const isM=cur.md===w.d, isL=cur.ld===w.d;
                return(
                  <div key={i} className={`wcard${isM?" most":isL?" least":""}`}>
                    <p className="fd" style={{fontSize:"21px",fontWeight:isM?500:400,
                      marginBottom:"16px",color:isM?"#FFFFFF":"#0D1B2E",lineHeight:1.2}}>
                      {w.t}
                    </p>
                    <div style={{display:"flex",gap:"7px"}}>
                      <button onClick={()=>pickM(w.d)} style={{flex:1,padding:"7px 0",
                        borderRadius:"6px",border:`1px solid ${isM?"rgba(255,255,255,.3)":"rgba(13,27,46,.2)"}`,
                        fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",cursor:"pointer",
                        textTransform:"uppercase",fontFamily:"DM Sans,sans-serif",
                        background:isM?"rgba(255,255,255,.12)":"transparent",
                        color:isM?"rgba(255,255,255,.9)":"rgba(13,27,46,.5)",
                        transition:"all .15s"}}>Plus</button>
                      <button onClick={()=>pickL(w.d)} style={{flex:1,padding:"7px 0",
                        borderRadius:"6px",border:`1px solid ${isL?"rgba(201,169,110,.6)":"rgba(201,169,110,.3)"}`,
                        fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",cursor:"pointer",
                        textTransform:"uppercase",fontFamily:"DM Sans,sans-serif",
                        background:isL?"rgba(201,169,110,.12)":"transparent",
                        color:isL?"#B8862A":"rgba(201,169,110,.6)",
                        transition:"all .15s"}}>Moins</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <button className="bs" onClick={discBack}><ChevronLeft size={16}/> Retour</button>
              <button onClick={discNext} disabled={!cur.md||!cur.ld} style={{
                padding:"13px 28px",border:"none",borderRadius:"8px",fontSize:"14px",
                fontWeight:500,fontFamily:"DM Sans,sans-serif",
                display:"inline-flex",alignItems:"center",gap:"8px",
                background:cur.md&&cur.ld?"#0D1B2E":"#E2DDD6",
                color:cur.md&&cur.ld?"#fff":"#94A3B8",
                cursor:cur.md&&cur.ld?"pointer":"not-allowed",transition:"all .2s"}}>
                {qi===27?"Terminer le module":"Suivant"} <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </Sec>
      )}

      {/* ══════════ INTRO IKIGAI ══════════ */}
      {ph==="ik-in"&&(
        <Sec>
          <div className="au" style={{maxWidth:"520px",width:"100%"}}>
            <Badge color="#C9A96E" bg="rgba(201,169,110,.1)" label="MODULE 02 · CADRE DE SENS"/>
            <h2 className="fd au d1" style={{fontSize:"clamp(38px,5vw,58px)",fontWeight:400,
              color:"#0D1B2E",lineHeight:1.05,margin:"18px 0 20px"}}>
              L'Ikigai
            </h2>
            <p className="au d2" style={{fontSize:"15px",color:"#64748B",lineHeight:1.8,
              marginBottom:"20px",fontWeight:300}}>
              L'<em>Ikigai</em> (生き甲斐) est la philosophie japonaise de la raison d'être —
              le point de convergence entre ce que tu aimes, ce en quoi tu excelles,
              ce dont le monde a besoin et ce qui peut te faire vivre.
            </p>
            <div className="au d2" style={{background:"#FFFFFF",border:"1px solid #E2DDD6",
              borderRadius:"12px",padding:"24px",marginBottom:"32px"}}>
              <p style={{fontSize:"13px",color:"#64748B",lineHeight:1.8}}>
                <strong style={{color:"#0D1B2E"}}>Prends le temps nécessaire.</strong>{" "}
                Ces 4 réflexions sont le fondement de ton bilan. Plus tu es sincère et précis,
                plus ta synthèse sera juste et utile. Il n'y a pas de bonne réponse — seulement la tienne.
              </p>
            </div>
            <div className="au d3" style={{display:"flex",gap:"10px"}}>
              <button className="bs" onClick={()=>{setPh("disc");setQi(19)}}><ChevronLeft size={16}/> Retour</button>
              <button className="bp" onClick={()=>setPh("ik")}>Commencer <ChevronRight size={16}/></button>
            </div>
          </div>
        </Sec>
      )}

      {/* ══════════ ÉTAPES IKIGAI ══════════ */}
      {ph==="ik"&&(
        <Sec>
          <div style={{maxWidth:"600px",width:"100%"}}>
            {/* Barre d'étapes */}
            <div style={{display:"flex",gap:"6px",marginBottom:"40px"}}>
              {IKIGAI.map((s,i)=>(
                <div key={i} style={{flex:1,height:"2.5px",borderRadius:"2px",
                  background:i<=is?s.color:"#E2DDD6",transition:"background .4s"}}/>
              ))}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px"}}>
              <div style={{width:"46px",height:"46px",borderRadius:"50%",flexShrink:0,
                background:`${step.color}14`,border:`1px solid ${step.color}40`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <step.Icon size={20} color={step.color}/>
              </div>
              <div>
                <p style={{fontSize:"9px",letterSpacing:"2.5px",color:step.color,
                  textTransform:"uppercase",marginBottom:"2px"}}>
                  Étape {is+1} / 4 · {step.label}
                </p>
                <h3 className="fd" style={{fontSize:"clamp(26px,3.5vw,40px)",
                  fontWeight:400,color:"#0D1B2E",lineHeight:1.1}}>{step.title}</h3>
              </div>
            </div>

            {/* Micro-questions du pilier */}
            {step.subs.map((sub, si) => {
              const val = ik[step.k][si] || "";
              const minLen = 30;
              const done = val.length >= minLen;
              const isActive = si === iss;
              const isPast   = si < iss;
              return (
                <div key={si} style={{
                  marginBottom:"20px",
                  opacity: isActive||isPast ? 1 : 0.4,
                  transition:"opacity .3s",
                }}>
                  {/* Numéro + question */}
                  <div style={{display:"flex",alignItems:"flex-start",gap:"12px",marginBottom:"10px"}}>
                    <div style={{
                      width:"24px",height:"24px",borderRadius:"50%",flexShrink:0,marginTop:"1px",
                      background: isPast ? step.color : isActive ? step.color+"22" : "#E2DDD6",
                      border:`1.5px solid ${isPast||isActive ? step.color : "#E2DDD6"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      {isPast
                        ? <span style={{fontSize:"11px",color:"#fff",fontWeight:700}}>✓</span>
                        : <span style={{fontSize:"11px",color:step.color,fontWeight:700}}>{si+1}</span>
                      }
                    </div>
                    <div>
                      <p style={{fontSize:"15px",fontWeight:500,color:"#0D1B2E",
                        lineHeight:1.4,marginBottom:"4px"}}>{sub.q}</p>
                      <p style={{fontSize:"12px",color:"#94A3B8",fontStyle:"italic",
                        lineHeight:1.5}}>{sub.hint}</p>
                    </div>
                  </div>

                  {/* Zone de réponse — visible seulement si active */}
                  {isActive && (
                    <>
                      <textarea
                        value={val}
                        onChange={e=>setIk(v=>({...v,[step.k]:v[step.k].map((x,j)=>j===si?e.target.value:x)}))}
                        placeholder={sub.ph} rows={3}
                        style={{width:"100%",padding:"16px 18px",
                          border:`1.5px solid ${done?"#E2DDD6":step.color+"60"}`,
                          borderRadius:"10px",fontSize:"14px",color:"#0D1B2E",
                          background:"#FFFFFF",lineHeight:1.7,resize:"vertical",
                          transition:"border-color .2s"}}
                        onFocus={e=>e.target.style.borderColor=step.color}
                        onBlur={e=>e.target.style.borderColor=done?"#E2DDD6":step.color+"60"}
                      />
                      <div style={{display:"flex",justifyContent:"space-between",
                        alignItems:"center",marginTop:"8px"}}>
                        <p style={{fontSize:"11px",color: done?"#2A9060":"#94A3B8"}}>
                          {done ? "✓ Bien — tu peux encore enrichir" : `Encore ${minLen-val.length} mots min.`}
                        </p>
                        {si < step.subs.length-1 && done && (
                          <button onClick={()=>setIss(si+1)}
                            style={{padding:"7px 16px",background:step.color,color:"#fff",
                              border:"none",borderRadius:"6px",fontSize:"12px",
                              fontWeight:500,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
                            Question suivante →
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Résumé réponse si passée */}
                  {isPast && (
                    <div style={{marginLeft:"36px",padding:"10px 14px",
                      background:step.color+"0A",borderRadius:"8px",
                      border:`1px solid ${step.color}20`,
                      display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
                      <p style={{fontSize:"13px",color:"#475569",lineHeight:1.6,
                        fontStyle:"italic",flex:1}}>{val}</p>
                      <button onClick={()=>setIss(si)}
                        style={{fontSize:"10px",color:step.color,background:"none",
                          border:"none",cursor:"pointer",flexShrink:0,paddingTop:"2px"}}>
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Navigation pilier */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px"}}>
              <button className="bs" onClick={()=>{
                if(iss>0){setIss(0);}
                else if(is>0){setIs(is-1);setIss(1);}
                else{setPh("ik-in");}
              }}>
                <ChevronLeft size={16}/> Retour
              </button>
              {(() => {
                const allFilled = step.subs.every((_,si)=>(ik[step.k][si]||"").length>=30);
                const label = is===3 ? "Terminer l'Ikigai" : "Pilier suivant";
                return (
                  <button
                    onClick={()=>{if(is<3){setIs(is+1);setIss(0);}else{setPh("ctx");}}}
                    disabled={!allFilled}
                    style={{padding:"13px 28px",border:"none",borderRadius:"8px",fontSize:"14px",
                      fontWeight:500,fontFamily:"DM Sans,sans-serif",
                      display:"inline-flex",alignItems:"center",gap:"8px",
                      background:allFilled?"#0D1B2E":"#E2DDD6",
                      color:allFilled?"#fff":"#94A3B8",
                      cursor:allFilled?"pointer":"not-allowed",transition:"all .2s"}}>
                    {label} <ChevronRight size={16}/>
                  </button>
                );
              })()}
            </div>
          </div>
        </Sec>
      )}

      {/* ══════════ CONTEXTE ÉTUDIANT ══════════ */}
      {ph==="ctx"&&(
        <Sec>
          <div className="au" style={{maxWidth:"500px",width:"100%"}}>
            <Badge color="#C9A96E" bg="rgba(201,169,110,.1)" label="ÉTAPE FINALE · CALIBRATION"/>
            <h2 className="fd au d1" style={{fontSize:"clamp(34px,4.5vw,50px)",fontWeight:400,
              color:"#0D1B2E",lineHeight:1.1,margin:"18px 0 16px"}}>
              Ton parcours
            </h2>
            <p className="au d2" style={{fontSize:"14px",color:"#64748B",lineHeight:1.8,
              marginBottom:"32px",fontWeight:300}}>
              Ces informations ancrent ta synthèse dans ta réalité actuelle.
              Il n'existe pas de profil supérieur — seulement le tien.
            </p>

            <div className="au d2" style={{display:"flex",flexDirection:"column",gap:"20px",marginBottom:"36px"}}>
              {[
                {
                  label:"Spécialité / Programme",
                  el:<input value={ctx.promo}
                    onChange={e=>setCtx(v=>({...v,promo:e.target.value}))}
                    placeholder="ex. : Marketing, Finance, RH, Management…"
                    style={{width:"100%",padding:"13px 16px",border:"1.5px solid #E2DDD6",
                      borderRadius:"9px",fontSize:"14px",color:"#0D1B2E",background:"#FFFFFF"}}
                    onFocus={e=>e.target.style.borderColor="#0D1B2E"}
                    onBlur={e=>e.target.style.borderColor="#E2DDD6"}/>
                },
                {
                  label:"Niveau actuel",
                  el:<select value={ctx.level}
                    onChange={e=>setCtx(v=>({...v,level:e.target.value}))}
                    style={{width:"100%",padding:"13px 16px",border:"1.5px solid #E2DDD6",
                      borderRadius:"9px",fontSize:"14px",background:"#FFFFFF",
                      color:ctx.level?"#0D1B2E":"#94A3B8",appearance:"none"}}
                    onFocus={e=>e.target.style.borderColor="#0D1B2E"}
                    onBlur={e=>e.target.style.borderColor="#E2DDD6"}>
                    <option value="">Sélectionne ton niveau…</option>
                    <option>Bachelor 1ère année</option>
                    <option>Bachelor 2ème année</option>
                    <option>Bachelor 3ème année</option>
                    <option>Master / MSc 1ère année (Bac+4)</option>
                    <option>Master / MSc 2ème année (Bac+5)</option>
                    <option>MBA / Programme Grande École</option>
                    <option>Alternance / Apprentissage</option>
                    <option>Reconversion professionnelle</option>
                    <option>Autre parcours</option>
                  </select>
                },
                {
                  label:"Expérience professionnelle",
                  el:<select value={ctx.exp}
                    onChange={e=>setCtx(v=>({...v,exp:e.target.value}))}
                    style={{width:"100%",padding:"13px 16px",border:"1.5px solid #E2DDD6",
                      borderRadius:"9px",fontSize:"14px",background:"#FFFFFF",
                      color:ctx.exp?"#0D1B2E":"#94A3B8",appearance:"none"}}
                    onFocus={e=>e.target.style.borderColor="#0D1B2E"}
                    onBlur={e=>e.target.style.borderColor="#E2DDD6"}>
                    <option value="">Ton niveau d'expérience pro…</option>
                    <option>Aucune expérience (stages uniquement)</option>
                    <option>1 à 3 ans</option>
                    <option>3 à 7 ans</option>
                    <option>7 ans et plus</option>
                    <option>En reconversion (ancienne carrière)</option>
                  </select>
                },
                {
                  label:"Diplômes et formations obtenus (optionnel)",
                  el:<input value={ctx.diplomas}
                    onChange={e=>setCtx(v=>({...v,diplomas:e.target.value}))}
                    placeholder="ex. : Licence LEA, BTS Commerce, Master Finance…"
                    style={{width:"100%",padding:"13px 16px",border:"1.5px solid #E2DDD6",
                      borderRadius:"9px",fontSize:"14px",color:"#0D1B2E",background:"#FFFFFF"}}
                    onFocus={e=>e.target.style.borderColor="#0D1B2E"}
                    onBlur={e=>e.target.style.borderColor="#E2DDD6"}/>
                },
                {
                  label:"Quelle question cherches-tu à clarifier ?",
                  el:<textarea value={ctx.question}
                    onChange={e=>setCtx(v=>({...v,question:e.target.value}))}
                    placeholder="ex. : Quel secteur choisir ? Comment me différencier ? Quel stage cible ?"
                    rows={3}
                    style={{width:"100%",padding:"13px 16px",border:"1.5px solid #E2DDD6",
                      borderRadius:"9px",fontSize:"14px",color:"#0D1B2E",
                      background:"#FFFFFF",resize:"vertical",lineHeight:1.6}}
                    onFocus={e=>e.target.style.borderColor="#0D1B2E"}
                    onBlur={e=>e.target.style.borderColor="#E2DDD6"}/>
                },
              ].map(({label,el},i)=>(
                <div key={i}>
                  <label style={{display:"block",fontSize:"9px",letterSpacing:"2px",
                    color:"#94A3B8",textTransform:"uppercase",marginBottom:"8px",fontWeight:600}}>
                    {label}
                  </label>
                  {el}
                </div>
              ))}
            </div>

            <div className="au d3" style={{display:"flex",gap:"10px"}}>
              <button className="bs" onClick={()=>setPh("ik")}><ChevronLeft size={16}/> Retour</button>
              <button className="bg" onClick={goProcess}
                disabled={!ctx.promo||!ctx.level}
                style={{opacity:ctx.promo&&ctx.level?1:.45,
                  cursor:ctx.promo&&ctx.level?"pointer":"not-allowed"}}>
                Générer mon Bilan <Sparkles size={17}/>
              </button>
            </div>
          </div>
        </Sec>
      )}

      {/* ══════════ TRAITEMENT ══════════ */}
      {ph==="wait"&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",padding:"60px 24px",
          background:"linear-gradient(160deg,#08111E,#0D1B2E,#162540)"}}>
          <div style={{textAlign:"center",maxWidth:"400px"}}>
            {!err?(
              <>
                <div style={{width:"64px",height:"64px",borderRadius:"50%",margin:"0 auto 32px",
                  border:"2px solid rgba(201,169,110,.2)",borderTopColor:"#C9A96E"}} className="spin-it"/>
                <h3 className="fd" style={{fontSize:"38px",fontWeight:400,color:"#FAF8F4",
                  marginBottom:"16px",letterSpacing:"-.3px"}}>
                  Synthèse en cours…
                </h3>
                <p style={{fontSize:"13px",color:"#475569",lineHeight:1.8,fontWeight:300}}>
                  Analyse de l'intersection entre ton profil DISC, tes moteurs Ikigai
                  et ton contexte académique. Construction de ton bilan humain…
                </p>
              </>
            ):(
              <>
                <div style={{width:"60px",height:"60px",borderRadius:"50%",margin:"0 auto 24px",
                  background:"rgba(192,80,80,.12)",border:"1px solid rgba(192,80,80,.3)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Zap size={26} color="#FCA5A5"/>
                </div>
                <h3 className="fd" style={{fontSize:"30px",fontWeight:400,color:"#FCA5A5",marginBottom:"12px"}}>
                  Synthèse échouée
                </h3>
                <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:"10px",padding:"14px",marginBottom:"24px",textAlign:"left"}}>
                  <p style={{fontSize:"11px",color:"#94A3B8",lineHeight:1.7,
                    wordBreak:"break-word",fontFamily:"monospace"}}>{err}</p>
                </div>
                <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
                  <button className="bg" onClick={()=>runSynth(sc,ik,ctx)}>
                    Réessayer <ChevronRight size={16}/>
                  </button>
                  <button className="bs" onClick={()=>setPh("ctx")}
                    style={{color:"#94A3B8",borderColor:"rgba(255,255,255,.15)"}}>
                    <ChevronLeft size={16}/> Retour
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════ RÉSULTATS ══════════ */}
      {ph==="out"&&out&&(
        <div style={{background:"#FAF8F4",minHeight:"100vh",paddingBottom:"80px"}}>

          {/* ── HERO ── */}
          <div style={{background:"linear-gradient(160deg,#08111E,#0D1B2E,#162540)",
            padding:"72px 24px 56px",textAlign:"center"}}>
            <p style={{fontSize:"9px",letterSpacing:"5px",color:"#C9A96E",
              textTransform:"uppercase",marginBottom:"20px"}}>Bilan Humain Personnel</p>
            <h2 className="fd" style={{fontSize:"clamp(18px,3.5vw,38px)",fontWeight:400,
              fontStyle:"italic",color:"#FAF8F4",lineHeight:1.4,
              maxWidth:"680px",margin:"0 auto 20px"}}>
              « {out.identity} »
            </h2>
            <div style={{display:"inline-flex",alignItems:"center",gap:"8px",
              padding:"7px 18px",background:"rgba(201,169,110,.1)",
              border:"1px solid rgba(201,169,110,.3)",borderRadius:"999px"}}>
              <span style={{width:"7px",height:"7px",borderRadius:"50%",
                background:DM[out.dom]?.color||"#C9A96E"}}/>
              <p style={{fontSize:"12px",color:"#C9A96E",fontWeight:500}}>
                Style dominant : {DM[out.dom]?.name} — {DM[out.dom]?.desc}
              </p>
            </div>
          </div>

          <div style={{maxWidth:"880px",margin:"0 auto",padding:"44px 24px",
            display:"flex",flexDirection:"column",gap:"24px"}}>

            {/* ── DISC — pleine largeur ── */}
            <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"36px",border:"1px solid #E2DDD6"}}>
              <p style={{fontSize:"9px",letterSpacing:"2.5px",color:"#94A3B8",
                textTransform:"uppercase",marginBottom:"28px"}}>Profil DISC</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"28px 48px"}}>
                {["D","I","S","C"].map((d,i)=>(
                  <div key={d}>
                    <div style={{display:"flex",justifyContent:"space-between",
                      alignItems:"baseline",marginBottom:"8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <span style={{fontSize:"14px",fontWeight:700,color:DM[d].color}}>{d}</span>
                        <span style={{fontSize:"13px",color:"#475569",fontWeight:500}}>{DM[d].name}</span>
                      </div>
                      <span className="fd" style={{fontSize:"24px",fontWeight:400,color:DM[d].color}}>{sc[d]}</span>
                    </div>
                    <div className="disc-gauge-track" style={{height:"12px"}}>
                      <div className="disc-gauge-fill" style={{
                        "--target":`${sc[d]}%`,
                        background:`linear-gradient(90deg,${DM[d].color}88,${DM[d].color})`,
                        animationDelay:`${0.3+i*0.2}s`,
                      }}/>
                    </div>
                    <p style={{fontSize:"11px",color:"#94A3B8",marginTop:"6px"}}>{DM[d].desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── VENN IKIGAI — pleine largeur, zoomable mobile ── */}
            <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"36px",border:"1px solid #E2DDD6"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
                <p style={{fontSize:"9px",letterSpacing:"2.5px",color:"#94A3B8",textTransform:"uppercase"}}>
                  Carte Ikigai Personnalisée
                </p>
                <p style={{fontSize:"10px",color:"#C4B8A8",fontStyle:"italic"}}>
                  📱 Pince pour zoomer
                </p>
              </div>
              <div style={{
                overflow:"auto", WebkitOverflowScrolling:"touch",
                touchAction:"pinch-zoom", cursor:"zoom-in",
                maxHeight:"520px",
              }}>
                <div style={{minWidth:"340px"}}>
                  <Venn venn={out.venn}/>
                </div>
              </div>
            </div>

            {/* ── PROFIL COMPORTEMENTAL ── */}
            <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"36px",border:"1px solid #E2DDD6"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px"}}>
                <div style={{width:"38px",height:"38px",borderRadius:"50%",
                  background:"rgba(13,27,46,.04)",border:"1px solid rgba(13,27,46,.1)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Brain size={18} color="#0D1B2E"/>
                </div>
                <h4 className="fd" style={{fontSize:"26px",fontWeight:400,color:"#0D1B2E"}}>
                  Architecture Comportementale
                </h4>
              </div>
              <p style={{fontSize:"15px",color:"#475569",lineHeight:1.85,fontWeight:300}}>
                {out.behavioral}
              </p>
            </div>

            {/* ── INTERSECTION IKIGAI ── */}
            <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"36px",border:"1px solid #E2DDD6"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px"}}>
                <div style={{width:"38px",height:"38px",borderRadius:"50%",
                  background:"rgba(201,169,110,.08)",border:"1px solid rgba(201,169,110,.25)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Sparkles size={18} color="#C9A96E"/>
                </div>
                <h4 className="fd" style={{fontSize:"26px",fontWeight:400,color:"#0D1B2E"}}>
                  Intersection Ikigai
                </h4>
              </div>
              <p style={{fontSize:"15px",color:"#475569",lineHeight:1.85,fontWeight:300}}>
                {out.ikigaiCore}
              </p>
            </div>

            {/* ══ HUMAN EDGE — carte dark featured ══ */}
            <div style={{background:"linear-gradient(135deg,#0D1B2E,#162540)",
              borderRadius:"16px",padding:"40px",position:"relative",overflow:"hidden",
              border:"1px solid rgba(201,169,110,.15)"}}>
              <div style={{position:"absolute",top:-40,right:-40,width:"180px",height:"180px",
                borderRadius:"50%",background:"rgba(201,169,110,.04)"}}/>
              <div style={{position:"absolute",bottom:-30,left:-30,width:"120px",height:"120px",
                borderRadius:"50%",background:"rgba(201,169,110,.03)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"50%",
                  background:"rgba(201,169,110,.12)",border:"1px solid rgba(201,169,110,.35)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Shield size={20} color="#C9A96E"/>
                </div>
                <div>
                  <p style={{fontSize:"9px",letterSpacing:"3px",color:"#C9A96E",
                    textTransform:"uppercase",marginBottom:"2px"}}>Ton bouclier face à l'automatisation</p>
                  <h4 className="fd" style={{fontSize:"26px",fontWeight:400,color:"#FAF8F4"}}>
                    L'Atout Humain
                  </h4>
                </div>
              </div>
              <p style={{fontSize:"15px",color:"#94A3B8",lineHeight:1.85,fontWeight:300,
                marginBottom:"20px"}}>{out.humanEdge}</p>
              {/* Extrait du profil DISC dominant */}
              <div style={{background:"rgba(201,169,110,.07)",border:"1px solid rgba(201,169,110,.15)",
                borderRadius:"10px",padding:"16px 20px"}}>
                <p style={{fontSize:"12px",color:"#C9A96E",fontWeight:500,marginBottom:"4px",
                  fontFamily:"DM Sans,sans-serif"}}>
                  Capacité irremplaçable · Style {DM[out.dom]?.name}
                </p>
                <p style={{fontSize:"13px",color:"#94A3B8",lineHeight:1.7,fontWeight:300}}>
                  {EDGE[out.dom]}
                </p>
              </div>
            </div>

            {/* ── VOIES PROFESSIONNELLES ── */}
            <div>
              <p style={{fontSize:"9px",letterSpacing:"2.5px",color:"#94A3B8",
                textTransform:"uppercase",marginBottom:"16px"}}>
                Voies Professionnelles Alignées
              </p>
              <div className="r2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                {out.careers?.map((c,i)=>(
                  <div key={i} style={{background:"#FFFFFF",borderRadius:"14px",padding:"26px",
                    border:"1px solid #E2DDD6",transition:"box-shadow .2s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(13,27,46,.07)";e.currentTarget.style.transform="translateY(-2px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",
                      alignItems:"flex-start",marginBottom:"12px"}}>
                      <h5 className="fd" style={{fontSize:"22px",fontWeight:500,color:"#0D1B2E",
                        lineHeight:1.2,flex:1,marginRight:"10px"}}>{c.t}</h5>
                      <span style={{fontSize:"12px",fontWeight:600,color:"#C9A96E",
                        padding:"3px 10px",background:"rgba(201,169,110,.1)",
                        borderRadius:"999px",flexShrink:0,fontFamily:"DM Sans,sans-serif"}}>
                        {c.s}%
                      </span>
                    </div>
                    <div className="score-bar" style={{marginBottom:"14px"}}>
                      <div className="score-bar-fill" style={{"--w":`${c.s}%`}}/>
                    </div>
                    <p style={{fontSize:"13px",color:"#64748B",lineHeight:1.7,fontWeight:300}}>{c.r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── STRATÉGIES IA ── */}
            <div>
              <p style={{fontSize:"9px",letterSpacing:"2.5px",color:"#94A3B8",
                textTransform:"uppercase",marginBottom:"16px"}}>
                Stratégies de Collaboration avec l'IA
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {out.aiStrategies?.map((s,i)=>(
                  <div key={i} style={{background:"#FFFFFF",borderRadius:"12px",padding:"22px",
                    border:"1px solid #E2DDD6",display:"flex",gap:"16px",alignItems:"flex-start"}}>
                    <div style={{width:"32px",height:"32px",borderRadius:"50%",flexShrink:0,
                      background:"#F5F3EE",border:"1px solid #E2DDD6",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Zap size={14} color="#C9A96E"/>
                    </div>
                    <div>
                      <p style={{fontSize:"14px",fontWeight:600,color:"#0D1B2E",marginBottom:"6px"}}>
                        {s.t}
                      </p>
                      <p style={{fontSize:"13px",color:"#64748B",lineHeight:1.7,fontWeight:300}}>
                        {s.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PLAN D'ACTION ── */}
            <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"36px",
              border:"1px solid #E2DDD6"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
                <div style={{width:"38px",height:"38px",borderRadius:"50%",
                  background:"rgba(42,128,192,.06)",border:"1px solid rgba(42,128,192,.2)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Target size={18} color="#2A80C0"/>
                </div>
                <h4 className="fd" style={{fontSize:"26px",fontWeight:400,color:"#0D1B2E"}}>
                  Plan d'Action Immédiat
                </h4>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                {out.actions?.map((a,i)=>{
                  const catColor = {
                    "Compétence":"#3D9E70","Réseau":"#4A7CC0","Projet":"#C9A96E"
                  }[a.cat]||"#94A3B8";
                  const whenIcon = a.when?.includes("semaine")?Clock:
                    a.when?.includes("mois")?TrendingUp:Award;
                  const WIcon = whenIcon;
                  return(
                    <div key={i} style={{display:"flex",gap:"16px",alignItems:"flex-start",
                      padding:"20px",background:"#FAF8F4",borderRadius:"12px",
                      border:"1px solid #E2DDD6"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,
                        background:"#FFFFFF",border:`2px solid ${catColor}`,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:"14px",fontWeight:700,color:catColor,
                          fontFamily:"DM Sans,sans-serif"}}>{i+1}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",
                          gap:"8px",flexWrap:"wrap",marginBottom:"6px"}}>
                          <p style={{fontSize:"14px",fontWeight:600,color:"#0D1B2E"}}>{a.t}</p>
                          <span style={{fontSize:"9px",fontWeight:700,color:catColor,
                            padding:"2px 8px",background:`${catColor}14`,
                            borderRadius:"999px",letterSpacing:"1px",
                            textTransform:"uppercase",fontFamily:"DM Sans,sans-serif"}}>
                            {a.cat}
                          </span>
                        </div>
                        <p style={{fontSize:"13px",color:"#64748B",lineHeight:1.7,
                          fontWeight:300,marginBottom:"8px"}}>{a.d}</p>
                        <div style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>
                          <WIcon size={11} color="#94A3B8"/>
                          <p style={{fontSize:"11px",color:"#94A3B8",fontWeight:500}}>{a.when}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── QUESTION DE RÉFLEXION ── */}
            <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"44px",
              border:"1px solid #E2DDD6",textAlign:"center"}}>
              <div style={{width:"42px",height:"42px",borderRadius:"50%",
                background:"rgba(201,169,110,.08)",border:"1px solid rgba(201,169,110,.25)",
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <Lightbulb size={18} color="#C9A96E"/>
              </div>
              <p style={{fontSize:"9px",letterSpacing:"3px",color:"#C9A96E",
                textTransform:"uppercase",marginBottom:"16px"}}>Pour ta réflexion</p>
              <p className="fd" style={{fontSize:"clamp(18px,2.8vw,28px)",fontWeight:400,
                color:"#0D1B2E",lineHeight:1.5,fontStyle:"italic",
                maxWidth:"540px",margin:"0 auto"}}>
                « {out.question} »
              </p>
            </div>

            {/* ── ACTIONS ── */}
            <div className="no-print" style={{display:"flex",gap:"10px",
              flexWrap:"wrap",alignItems:"center",paddingTop:"4px"}}>
              <button className="bp" onClick={downloadBilan}>
                <Download size={16}/> Télécharger mon Bilan
              </button>
              <button className="bs" onClick={reset}>
                <RefreshCw size={15}/> Recommencer
              </button>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"6px"}}>
                <Shield size={12} color="#94A3B8"/>
                <p style={{fontSize:"11px",color:"#94A3B8"}}>
                  Données locales uniquement — aucun stockage externe
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

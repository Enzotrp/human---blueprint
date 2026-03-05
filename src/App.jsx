import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
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
   DONNÉES DISC — 20 questions choix forcé
───────────────────────────────────────────── */
const QS = [
  { id:1,  w:[{t:"Audacieux",d:"D"},{t:"Expressif",d:"I"},{t:"Chaleureux",d:"S"},{t:"Méticuleux",d:"C"}]},
  { id:2,  w:[{t:"Décidé",d:"D"},{t:"Sociable",d:"I"},{t:"Patient",d:"S"},{t:"Rigoureux",d:"C"}]},
  { id:3,  w:[{t:"Affirmé",d:"D"},{t:"Persuasif",d:"I"},{t:"Doux",d:"S"},{t:"Prudent",d:"C"}]},
  { id:4,  w:[{t:"Compétitif",d:"D"},{t:"Enthousiaste",d:"I"},{t:"Fiable",d:"S"},{t:"Systématique",d:"C"}]},
  { id:5,  w:[{t:"Direct",d:"D"},{t:"Ouvert",d:"I"},{t:"Harmonieux",d:"S"},{t:"Analytique",d:"C"}]},
  { id:6,  w:[{t:"Intrépide",d:"D"},{t:"Spontané",d:"I"},{t:"Constant",d:"S"},{t:"Intègre",d:"C"}]},
  { id:7,  w:[{t:"Exigeant",d:"D"},{t:"Inspirant",d:"I"},{t:"Serein",d:"S"},{t:"Logique",d:"C"}]},
  { id:8,  w:[{t:"Pionnier",d:"D"},{t:"Charismatique",d:"I"},{t:"Stable",d:"S"},{t:"Structuré",d:"C"}]},
  { id:9,  w:[{t:"Indépendant",d:"D"},{t:"Engageant",d:"I"},{t:"Coopératif",d:"S"},{t:"Attentif",d:"C"}]},
  { id:10, w:[{t:"Déterminé",d:"D"},{t:"Vivant",d:"I"},{t:"Loyal",d:"S"},{t:"Discipliné",d:"C"}]},
  { id:11, w:[{t:"Aventureux",d:"D"},{t:"Communicatif",d:"I"},{t:"Modeste",d:"S"},{t:"Appliqué",d:"C"}]},
  { id:12, w:[{t:"Énergique",d:"D"},{t:"Magnétique",d:"I"},{t:"Tolérant",d:"S"},{t:"Exhaustif",d:"C"}]},
  { id:13, w:[{t:"Autonome",d:"D"},{t:"Démonstratif",d:"I"},{t:"Sincère",d:"S"},{t:"Précis",d:"C"}]},
  { id:14, w:[{t:"Ambitieux",d:"D"},{t:"Enjoué",d:"I"},{t:"Équilibré",d:"S"},{t:"Réflexif",d:"C"}]},
  { id:15, w:[{t:"Franc",d:"D"},{t:"Jovial",d:"I"},{t:"Décontracté",d:"S"},{t:"Méthodique",d:"C"}]},
  { id:16, w:[{t:"Courageux",d:"D"},{t:"Optimiste",d:"I"},{t:"Bienveillant",d:"S"},{t:"Perfectionniste",d:"C"}]},
  { id:17, w:[{t:"Orienté résultats",d:"D"},{t:"Dynamique",d:"I"},{t:"Protecteur",d:"S"},{t:"Ordonné",d:"C"}]},
  { id:18, w:[{t:"Téméraire",d:"D"},{t:"Convaincant",d:"I"},{t:"Empathique",d:"S"},{t:"Rationnel",d:"C"}]},
  { id:19, w:[{t:"Actif",d:"D"},{t:"Positif",d:"I"},{t:"Prévisible",d:"S"},{t:"Précis",d:"C"}]},
  { id:20, w:[{t:"Autoritaire",d:"D"},{t:"Rayonnant",d:"I"},{t:"Accommodant",d:"S"},{t:"Consciencieux",d:"C"}]},
];

const IKIGAI = [
  {
    k:"love", title:"Ce que vous aimez", label:"Passions intérieures",
    Icon:Heart, color:"#C0586A",
    desc:"Quelles activités vous font perdre la notion du temps ? Quels sujets pourriez-vous explorer sans fin, non par obligation, mais par pur engagement intrinsèque ? Décrivez sans filtre, au-delà des attentes sociales.",
    ph:"Activités, sujets, expériences qui vous animent sincèrement. Pensez aux moments où vous êtes pleinement vous-même, sans effort particulier…",
  },
  {
    k:"good", title:"Ce en quoi vous excellez", label:"Forces naturelles",
    Icon:Star, color:"#4A7CC0",
    desc:"Pour quoi les autres font-ils souvent appel à vous ? Qu'est-ce qui vous vient si naturellement que vous oubliez que tout le monde n'en est pas capable ? Incluez aptitudes formelles et intuitions.",
    ph:"Vos forces naturelles, compétences développées, aptitudes qui émergent sans effort. Ce qui vous est évident mais impressionne les autres…",
  },
  {
    k:"need", title:"Ce dont le monde a besoin", label:"Valeurs & impact",
    Icon:Globe, color:"#3D9E70",
    desc:"Quels problèmes du monde vous concernent profondément ? Quel changement voudriez-vous voir — dans les organisations, la société, les communautés — et qui résonne avec votre sens de la justice ou du sens ?",
    ph:"Les besoins réels de votre environnement, des organisations, de la société qui font écho à vos valeurs profondes…",
  },
  {
    k:"paid", title:"Ce pour quoi vous pouvez être rémunéré", label:"Viabilité économique",
    Icon:Briefcase, color:"#B8862A",
    desc:"Quelles sont les voies économiques qui semblent authentiques à qui vous êtes ? Comment votre combinaison unique de passion et de compétences pourrait-elle se traduire en valeur durable — sans vous trahir ?",
    ph:"Les domaines où votre singularité a une valeur économique réelle. Ce pour quoi des entreprises, organisations ou clients paieraient…",
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
    s[d]=Math.max(0,Math.min(100,Math.round(((m[d]-l[d]+20)/40)*100)));
  });
  return s;
}

/* ─────────────────────────────────────────────
   VENN IKIGAI (SVG)
───────────────────────────────────────────── */
function Venn() {
  return (
    <svg viewBox="0 0 380 380" style={{width:"100%",maxWidth:"280px",display:"block",margin:"0 auto"}}>
      <defs>
        <radialGradient id="vg1" cx="50%" cy="50%"><stop offset="0%" stopColor="#C0586A20"/><stop offset="100%" stopColor="#C0586A08"/></radialGradient>
        <radialGradient id="vg2" cx="50%" cy="50%"><stop offset="0%" stopColor="#4A7CC020"/><stop offset="100%" stopColor="#4A7CC008"/></radialGradient>
        <radialGradient id="vg3" cx="50%" cy="50%"><stop offset="0%" stopColor="#3D9E7020"/><stop offset="100%" stopColor="#3D9E7008"/></radialGradient>
        <radialGradient id="vg4" cx="50%" cy="50%"><stop offset="0%" stopColor="#B8862A20"/><stop offset="100%" stopColor="#B8862A08"/></radialGradient>
      </defs>
      {/* 4 cercles */}
      <circle cx="148" cy="148" r="90" fill="url(#vg1)" stroke="#C0586A" strokeWidth="1.5"/>
      <circle cx="232" cy="148" r="90" fill="url(#vg2)" stroke="#4A7CC0" strokeWidth="1.5"/>
      <circle cx="148" cy="232" r="90" fill="url(#vg3)" stroke="#3D9E70" strokeWidth="1.5"/>
      <circle cx="232" cy="232" r="90" fill="url(#vg4)" stroke="#B8862A" strokeWidth="1.5"/>
      {/* Centre Ikigai */}
      <circle cx="190" cy="190" r="32" fill="#C9A96E22" stroke="#C9A96E" strokeWidth="2"/>
      <text x="190" y="186" textAnchor="middle" fontSize="12" fill="#8B6A30" fontFamily="Playfair Display,serif" fontWeight="600">IKIGAI</text>
      <text x="190" y="200" textAnchor="middle" fontSize="8.5" fill="#A07840" fontFamily="DM Sans,sans-serif">Raison d'être</text>
      {/* Labels intersections */}
      {[
        {x:190,y:138,t:"Passion"},
        {x:138,y:192,t:"Mission"},
        {x:242,y:192,t:"Métier"},
        {x:190,y:244,t:"Vocation"},
      ].map((n,i)=>(
        <text key={i} x={n.x} y={n.y} textAnchor="middle" fontSize="9.5" fill="#475569" fontFamily="DM Sans,sans-serif">{n.t}</text>
      ))}
      {/* Labels cercles */}
      {[
        {x:100,y:108,t:"Amour",   c:"#C0586A"},
        {x:280,y:108,t:"Talent",  c:"#4A7CC0"},
        {x:100,y:278,t:"Utilité", c:"#3D9E70"},
        {x:280,y:278,t:"Revenu",  c:"#B8862A"},
      ].map((n,i)=>(
        <text key={i} x={n.x} y={n.y} textAnchor="middle" fontSize="12" fill={n.c} fontFamily="DM Sans,sans-serif" fontWeight="500">{n.t}</text>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   PROGRESSION
───────────────────────────────────────────── */
function prog(ph,qi,is){
  if(ph==="home")        return 0;
  if(ph==="disc-in")     return 3;
  if(ph==="disc")        return 3+(qi/20)*34;
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
  const [qi,  setQi]  = useState(0);
  const [ans, setAns] = useState([]);
  const [cur, setCur] = useState({md:null,ld:null});
  const [is,  setIs]  = useState(0);
  const [ik,  setIk]  = useState({love:"",good:"",need:"",paid:""});
  const [ctx, setCtx] = useState({promo:"",level:"",question:""});
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
    if(qi<19) setQi(qi+1);
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

  const goProcess=()=>{ setPh("wait"); runSynth(sc,ik,ctx); };
  const reset=()=>{
    setPh("home");setQi(0);setAns([]);setCur({md:null,ld:null});
    setIs(0);setIk({love:"",good:"",need:"",paid:""});
    setCtx({promo:"",level:"",question:""});setSc(null);setOut(null);
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
    <p class="section-label">Intersection Ikigai</p>
    <h2>Ta Raison d'Être</h2>
    <p>${(out.ikigaiCore||"").replace(/</g,"&lt;")}</p>
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



  /* ── RADAR DATA ── */
  const radar=sc?["D","I","S","C"].map(d=>({dim:d,val:sc[d],full:100})):[];

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
          <div style={{maxWidth:"640px",width:"100%",textAlign:"center"}}>

            {/* Logo mark */}
            <div className="au" style={{marginBottom:"40px"}}>
              <div style={{width:"56px",height:"56px",borderRadius:"50%",margin:"0 auto 24px",
                background:"rgba(201,169,110,.1)",border:"1px solid rgba(201,169,110,.3)",
                display:"flex",alignItems:"center",justifyContent:"center"}} className="glow-it">
                <Eye size={24} color="#C9A96E"/>
              </div>
              <p style={{fontSize:"9px",letterSpacing:"5px",color:"#C9A96E",
                textTransform:"uppercase",marginBottom:"16px"}}>
                Human Blueprint · INSEEC / SUPDEPUB
              </p>
            </div>

            <h1 className="fd au d1" style={{fontSize:"clamp(44px,7vw,78px)",fontWeight:400,
              color:"#FAF8F4",lineHeight:.98,marginBottom:"24px",letterSpacing:"-0.5px"}}>
              Connais-toi<br/><em style={{color:"#C9A96E"}}>toi-même.</em>
            </h1>

            <p className="au d2" style={{fontSize:"16px",color:"#94A3B8",lineHeight:1.8,
              maxWidth:"500px",margin:"0 auto 14px",fontWeight:300}}>
              Un outil psychométrique neutre et factuel pour révéler ton avantage humain
              unique à l'ère de l'intelligence artificielle.
            </p>
            <p className="au d3" style={{fontSize:"12px",color:"#475569",marginBottom:"52px"}}>
              2 modules · 25–35 min · Données traitées localement, non conservées
            </p>

            <div className="au d3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
              gap:"12px",marginBottom:"48px",maxWidth:"580px",margin:"0 auto 48px"}}>
              {[
                {Icon:Brain,  label:"Moteur DISC",       desc:"20 questions · choix forcé"},
                {Icon:Heart,  label:"Exploration Ikigai", desc:"4 piliers · réflexion guidée"},
                {Icon:Shield, label:"Atout Humain",       desc:"Ton bouclier face à l'IA"},
              ].map(({Icon,label,desc},i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.04)",
                  border:"1px solid rgba(255,255,255,.08)",borderRadius:"12px",padding:"20px 16px"}}>
                  <Icon size={18} color="#C9A96E" style={{marginBottom:"10px"}}/>
                  <p style={{fontSize:"12px",color:"#E2E8F0",fontWeight:500,marginBottom:"4px"}}>{label}</p>
                  <p style={{fontSize:"11px",color:"#475569"}}>{desc}</p>
                </div>
              ))}
            </div>

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
              {q.w.map((w,i)=>{
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
                {qi===19?"Terminer le module":"Suivant"} <ChevronRight size={16}/>
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

            <p style={{fontSize:"14px",color:"#64748B",lineHeight:1.8,
              marginBottom:"24px",fontWeight:300}}>{step.desc}</p>

            <textarea value={ik[step.k]}
              onChange={e=>setIk(v=>({...v,[step.k]:e.target.value}))}
              placeholder={step.ph} rows={6}
              style={{width:"100%",padding:"20px",border:`1.5px solid #E2DDD6`,
                borderRadius:"12px",fontSize:"14px",color:"#0D1B2E",
                background:"#FFFFFF",lineHeight:1.7,resize:"vertical"}}
              onFocus={e=>e.target.style.borderColor=step.color}
              onBlur={e=>e.target.style.borderColor="#E2DDD6"}
            />

            <div style={{display:"flex",justifyContent:"space-between",
              alignItems:"center",marginTop:"10px",marginBottom:"32px"}}>
              <p style={{fontSize:"11.5px",color:"#94A3B8"}}>
                {ik[step.k].length<60
                  ?`Encore ${60-ik[step.k].length} car. pour une profondeur suffisante`
                  :"✓ Bonne profondeur — continue à enrichir si tu le souhaites"}
              </p>
              <p style={{fontSize:"11px",color:"#C4B8A8"}}>{ik[step.k].length} car.</p>
            </div>

            <div style={{display:"flex",justifyContent:"space-between"}}>
              <button className="bs" onClick={()=>is>0?setIs(is-1):setPh("ik-in")}>
                <ChevronLeft size={16}/> Retour
              </button>
              <button onClick={()=>is<3?setIs(is+1):setPh("ctx")}
                disabled={ik[step.k].length<60}
                style={{padding:"13px 28px",border:"none",borderRadius:"8px",fontSize:"14px",
                  fontWeight:500,fontFamily:"DM Sans,sans-serif",
                  display:"inline-flex",alignItems:"center",gap:"8px",
                  background:ik[step.k].length>=60?"#0D1B2E":"#E2DDD6",
                  color:ik[step.k].length>=60?"#fff":"#94A3B8",
                  cursor:ik[step.k].length>=60?"pointer":"not-allowed",transition:"all .2s"}}>
                {is===3?"Continuer":"Étape suivante"} <ChevronRight size={16}/>
              </button>
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
                    placeholder="ex. : Marketing, Finance, RH, Management, Bachelor…"
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
                  </select>
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

            {/* ── DISC + IKIGAI ── */}
            <div className="r2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>

              {/* Radar */}
              <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"32px",border:"1px solid #E2DDD6"}}>
                <p style={{fontSize:"9px",letterSpacing:"2.5px",color:"#94A3B8",
                  textTransform:"uppercase",marginBottom:"24px"}}>Profil DISC</p>
                <div style={{height:"200px"}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radar} margin={{top:8,right:8,bottom:8,left:8}}>
                      <PolarGrid stroke="#F0EDE6"/>
                      <PolarAngleAxis dataKey="dim"
                        tick={{fill:"#64748B",fontSize:13,fontFamily:"DM Sans,sans-serif",fontWeight:600}}/>
                      <Radar dataKey="val" stroke="#C9A96E" fill="#C9A96E" fillOpacity={0.15} strokeWidth={2}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginTop:"16px"}}>
                  {["D","I","S","C"].map(d=>(
                    <div key={d} style={{padding:"9px 12px",borderRadius:"8px",background:DM[d].bg,
                      display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <span style={{fontSize:"11px",fontWeight:700,color:DM[d].color}}>{d}</span>
                        <span style={{fontSize:"10px",color:"#64748B",marginLeft:"6px"}}>{DM[d].name}</span>
                      </div>
                      <span className="fd" style={{fontSize:"18px",fontWeight:500,color:DM[d].color}}>
                        {sc[d]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Venn */}
              <div style={{background:"#FFFFFF",borderRadius:"16px",padding:"32px",
                border:"1px solid #E2DDD6",display:"flex",flexDirection:"column"}}>
                <p style={{fontSize:"9px",letterSpacing:"2.5px",color:"#94A3B8",
                  textTransform:"uppercase",marginBottom:"16px"}}>Carte Ikigai</p>
                <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Venn/>
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

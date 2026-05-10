"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, MapPin, Zap, Recycle, TrendingDown, DollarSign, ChevronRight, Lightbulb } from "lucide-react";

type Setor = "Cimenteira"|"Aco"|"Aluminio"|"Quimica"|"Fertilizantes"|"Alimenticia";
type Regiao = "Sudeste"|"Sul"|"Nordeste"|"Norte"|"Centro-Oeste"|"Nacional";

const WASTE: Record<string,{label:string;volume:string;unit:string}[]> = {
  Cimenteira:[{label:"RSU",volume:"1.200",unit:"t/mês"},{label:"Escória de Alto-Forno",volume:"800",unit:"t/mês"},{label:"Cinza Volante",volume:"450",unit:"t/mês"}],
  Aco:[{label:"Escória Siderúrgica",volume:"3.200",unit:"t/mês"},{label:"Pó de Aciaria",volume:"980",unit:"t/mês"}],
  Aluminio:[{label:"Escuma de Alumina",volume:"740",unit:"t/mês"},{label:"Lodo de Tratamento",volume:"310",unit:"t/mês"}],
  Quimica:[{label:"Enxofre",volume:"220",unit:"t/mês"},{label:"Catalisador Gasto",volume:"85",unit:"t/mês"}],
  Fertilizantes:[{label:"Gesso Agrícola",volume:"1.800",unit:"t/mês"},{label:"Fosfogesso",volume:"640",unit:"t/mês"}],
  Alimenticia:[{label:"Biogás/Biometano",volume:"0,8",unit:"Gm³/mês"},{label:"Lodo de ETE",volume:"290",unit:"t/mês"}],
};

const MATCHES: Record<string,{nome:string;km:number;volume:string;tipo:string;co2:number}[]> = {
  Cimenteira:[{nome:"Siderúrgica Alfa",km:18,volume:"950 t/mês",tipo:"Escória",co2:427},{nome:"Siderúrgica Beta",km:33,volume:"620 t/mês",tipo:"Escória",co2:279},{nome:"Siderúrgica Gama",km:47,volume:"440 t/mês",tipo:"Cinza",co2:198}],
  Aco:[{nome:"Cimenteira Norte",km:22,volume:"1.800 t/mês",tipo:"Escória",co2:810},{nome:"Pavimentação Sul",km:38,volume:"900 t/mês",tipo:"Escória",co2:405}],
  Aluminio:[{nome:"Refratários Leste",km:29,volume:"680 t/mês",tipo:"Escuma",co2:306},{nome:"Cerâmica Vale",km:55,volume:"310 t/mês",tipo:"Lodo",co2:140}],
  Quimica:[{nome:"Fertilizantes ABC",km:41,volume:"210 t/mês",tipo:"Enxofre",co2:95}],
  Fertilizantes:[{nome:"Agro Cerrado",km:15,volume:"1.500 t/mês",tipo:"Gesso",co2:675},{nome:"Solo Tech",km:60,volume:"580 t/mês",tipo:"Fosfogesso",co2:261}],
  Alimenticia:[{nome:"Bioenergia Oeste",km:25,volume:"0,6 Gm³/mês",tipo:"Biogás",co2:320},{nome:"ETE Municipal",km:8,volume:"250 t/mês",tipo:"Lodo",co2:113}],
};

const SETOR_LABELS: Record<string,string> = {Cimenteira:"Cimenteira",Aco:"Aço",Aluminio:"Alumínio",Quimica:"Química",Fertilizantes:"Fertilizantes",Alimenticia:"Alimentícia"};
const SETORES = Object.keys(SETOR_LABELS);
const REGIOES:Regiao[] = ["Sudeste","Sul","Nordeste","Norte","Centro-Oeste","Nacional"];

function MapaOportunidades({setor,matches}:{setor:string;matches:{nome:string;km:number;tipo:string}[]}) {
  const W=340,H=280,cx=W/2,cy=H/2,maxR=110;
  const angles = [320,50,200,100,240,10];
  const pins = matches.map((m,i)=>({
    ...m,
    x:cx+((m.km/65)*maxR)*Math.cos((angles[i]??i*72)*Math.PI/180),
    y:cy+((m.km/65)*maxR)*Math.sin((angles[i]??i*72)*Math.PI/180),
  }));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--pid-border)" strokeWidth="0.5" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--pid-navy-lt)" rx="12"/>
      <rect width={W} height={H} fill="url(#grid)" rx="12"/>
      <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="var(--pid-coral)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"/>
      <circle cx={cx} cy={cy} r={maxR*0.6} fill="none" stroke="var(--pid-border)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
      {pins.map((p,i)=>(
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--pid-coral)" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>
      ))}
      {pins.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={14} fill="var(--pid-coral)" opacity="0.15"/>
          <circle cx={p.x} cy={p.y} r={8} fill="var(--pid-coral)"/>
          <text x={p.x} y={p.y+4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">{i+1}</text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={16} fill="var(--pid-navy)"/>
      <circle cx={cx} cy={cy} r={10} fill="var(--pid-text)"/>
      <text x={cx} y={H-10} textAnchor="middle" fontSize="9" fill="var(--pid-muted)">Raio: 65 km · {SETOR_LABELS[setor]}</text>
    </svg>
  );
}

function CircularContent() {
  const params = useSearchParams();
  const [setor, setSetor] = useState<string>(params.get("setor")??"Cimenteira");
  const [regiao, setRegiao] = useState<Regiao>((params.get("regiao") as Regiao)??"Sudeste");
  const matches = MATCHES[setor]??[];
  const waste = WASTE[setor]??[];
  const totalCo2 = matches.reduce((s,m)=>s+m.co2,0);
  const totalVol = matches.length;
  return (
    <div style={{background:"var(--pid-navy)",color:"var(--pid-text)",minHeight:"100vh"}}>
      <header className="sticky top-0 z-40 flex items-center justify-between px-6" style={{height:"var(--pid-header-h,80px)",background:"var(--pid-header-bg)",borderBottom:"1px solid var(--pid-border)",backdropFilter:"blur(12px)"}}>
        <div className="flex items-center gap-3">
          <Link href="/industrias" className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity" style={{color:"var(--pid-muted)"}}>
            <ArrowLeft size={13}/> Voltar
          </Link>
          <span style={{color:"var(--pid-border)"}}>|</span>
          <a href="https://emaisenergia.org/" target="_blank" rel="noopener noreferrer"><Logo height={64}/></a>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{background:"rgba(34,197,94,0.2)",color:"var(--pid-green)"}}>CIRCULAR ERP</span>
        </div>
        <ThemeToggle/>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="rounded-2xl p-6" style={{background:"var(--pid-surface2)",border:"1px solid var(--pid-border)"}}>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{color:"var(--pid-green)",letterSpacing:"0.1em"}}>PID CIRCULAR ERP</p>
          <h1 className="text-2xl font-bold pid-txt mb-4" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
            Mapa de Oportunidades Circulares
          </h1>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium mb-2 block" style={{color:"var(--pid-muted)"}}>Setor Industrial</label>
              <select value={setor} onChange={e=>setSetor(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-xl text-sm font-medium" style={{background:"var(--pid-navy-md)",border:"1.5px solid var(--pid-border)",color:"var(--pid-text)",outline:"none"}}>
                {SETORES.map(s=><option key={s} value={s}>{SETOR_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium mb-2 block" style={{color:"var(--pid-muted)"}}>Região</label>
              <select value={regiao} onChange={e=>setRegiao(e.target.value as Regiao)} className="w-full appearance-none px-4 py-2.5 rounded-xl text-sm font-medium" style={{background:"var(--pid-navy-md)",border:"1.5px solid var(--pid-border)",color:"var(--pid-text)",outline:"none"}}>
                {REGIOES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {icon:<Recycle size={16}/>,label:"Matches Ativos",val:`${totalVol}`,sub:"parceiros no raio",color:"var(--pid-green)"},
            {icon:<TrendingDown size={16}/>,label:"CO₂ Evitado",val:`${totalCo2}`,sub:"tCO₂/mês estimado",color:"var(--pid-coral-lt)"},
            {icon:<DollarSign size={16}/>,label:"Economia Est.",val:`R$ ${(totalCo2*0.045).toFixed(1)}M`,sub:"por ano (crédito CO₂)",color:"#7DD3FC"},
            {icon:<MapPin size={16}/>,label:"Raio de Busca",val:"65 km",sub:"conexões logísticas",color:"#C084FC"},
          ].map((k,i)=>(
            <div key={i} className="rounded-2xl p-5" style={{background:"var(--pid-surface2)",border:"1px solid var(--pid-border)"}}>
              <div className="flex items-center gap-1.5 mb-3" style={{color:k.color}}>{k.icon}<span className="text-[10px] font-semibold tracking-wider" style={{color:"var(--pid-muted)"}}>{k.label.toUpperCase()}</span></div>
              <p className="text-2xl font-bold" style={{fontFamily:"'Space Grotesk',sans-serif",color:k.color}}>{k.val}</p>
              <p className="text-xs mt-1" style={{color:"var(--pid-muted)"}}>{k.sub}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl p-6 space-y-4" style={{background:"var(--pid-surface2)",border:"1px solid var(--pid-border)"}}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={15} style={{color:"var(--pid-coral)"}}/>
              <p className="text-sm font-bold pid-txt" style={{fontFamily:"'Space Grotesk',sans-serif"}}>IA Industrial · Strategic Matching</p>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(34,197,94,0.15)",color:"var(--pid-green)",border:"1px solid rgba(34,197,94,0.3)"}}>{totalVol} matches ativos</span>
            </div>
            <div className="rounded-xl p-4" style={{background:"var(--pid-navy-lt)",border:"1px solid var(--pid-border)"}}>
              <p className="text-[10px] font-semibold mb-3" style={{color:"var(--pid-muted)",letterSpacing:"0.07em"}}>SUA DEMANDA</p>
              {waste.map((w,i)=>(
                <div key={i} className="flex justify-between items-center py-1.5 border-b last:border-0" style={{borderColor:"var(--pid-border)"}}>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:i===0?"var(--pid-coral)":"var(--pid-navy-md)",border:"2px solid var(--pid-text)"}}></span><span className="text-xs" style={{color:"var(--pid-text-sec)"}}>{w.label}</span></div>
                  <span className="text-xs font-semibold pid-txt">{w.volume} {w.unit}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4" style={{background:"var(--pid-navy-lt)",border:"1px solid var(--pid-border)"}}>
              <p className="text-[10px] font-semibold mb-3" style={{color:"var(--pid-muted)",letterSpacing:"0.07em"}}>OPORTUNIDADES · raio 65km</p>
              {matches.map((m,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{borderColor:"var(--pid-border)"}}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{background:"var(--pid-coral)",color:"white"}}>{i+1}</span>
                    <div><p className="text-xs font-semibold pid-txt">{m.nome}</p><p className="text-[10px]" style={{color:"var(--pid-muted)"}}>{m.km} km · {m.volume}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold" style={{color:"var(--pid-coral-lt)"}}>{m.co2} tCO₂/mês</p>
                    <p className="text-[9px]" style={{color:"var(--pid-muted)"}}>{m.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/copilot" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,var(--pid-coral),var(--pid-coral-dk))",color:"white"}}>
              Explorar no Mapa GIS <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="rounded-2xl p-6" style={{background:"var(--pid-surface2)",border:"1px solid var(--pid-border)"}}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} style={{color:"var(--pid-coral)"}}/>
              <p className="text-sm font-bold pid-txt" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Visão Geoespacial · Mapa de Oportunidades</p>
            </div>
            <MapaOportunidades setor={setor} matches={matches}/>
            <div className="flex items-center gap-4 mt-3 text-[10px]" style={{color:"var(--pid-muted)"}}>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{background:"var(--pid-coral)"}}></span>Parceiro circular</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{background:"var(--pid-text)"}}></span>{SETOR_LABELS[setor]}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-6" style={{background:"var(--pid-surface2)",border:"1px solid var(--pid-border)"}}>
          <p className="text-[10px] font-semibold mb-4" style={{color:"var(--pid-muted)",letterSpacing:"0.08em"}}>RANKING DE OPORTUNIDADES · impacto CO₂</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr style={{borderBottom:"1px solid var(--pid-border)"}}>
                {["#","Parceiro","Distância","Volume","Tipo de Resíduo","CO₂ Evitado/mês","Viabilidade"].map(h=>(
                  <th key={h} className="text-left pb-2 pr-4 font-semibold" style={{color:"var(--pid-muted)"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...matches].sort((a,b)=>b.co2-a.co2).map((m,i)=>{
                  const v = m.km<=30?"Alta":m.km<=50?"Média":"Baixa";
                  const vc = v==="Alta"?"var(--pid-green)":v==="Média"?"#F9C784":"var(--pid-coral-lt)";
                  return (
                    <tr key={i} style={{borderBottom:"1px solid var(--pid-border)"}}>
                      <td className="py-2.5 pr-4 font-bold" style={{color:"var(--pid-coral)"}}>{i+1}</td>
                      <td className="py-2.5 pr-4 font-semibold pid-txt">{m.nome}</td>
                      <td className="py-2.5 pr-4" style={{color:"var(--pid-text-sec)"}}>{m.km} km</td>
                      <td className="py-2.5 pr-4" style={{color:"var(--pid-text-sec)"}}>{m.volume}</td>
                      <td className="py-2.5 pr-4" style={{color:"var(--pid-text-sec)"}}>{m.tipo}</td>
                      <td className="py-2.5 pr-4 font-semibold" style={{color:"var(--pid-coral-lt)"}}>{m.co2} t</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{background:`${vc}22`,color:vc,border:`1px solid ${vc}55`}}>{v}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl" style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.3)"}}>
          <Lightbulb size={16} style={{color:"var(--pid-green)",marginTop:1,flexShrink:0}}/>
          <div>
            <p className="text-[10px] font-semibold mb-1" style={{color:"var(--pid-green)",letterSpacing:"0.08em"}}>MODELO B2B2G · ALINHAMENTO ODS 9 E 12</p>
            <p className="text-xs leading-relaxed" style={{color:"var(--pid-text-sec)"}}>
              O PID Circular ERP conecta território, indústria, resíduos e política pública. Empresas reduzem custo e emissões. Governos desenham incentivos com base em dados reais. O Brasil gera ~81Mt de resíduos/ano — menos de 8,7% é reciclado. Cada conexão aqui mapeada representa uma oportunidade de transformar passivo ambiental em ativo econômico.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CircularPage() {
  return <Suspense fallback={<div style={{background:"var(--pid-navy)",minHeight:"100vh"}}/>}><CircularContent/></Suspense>;
}
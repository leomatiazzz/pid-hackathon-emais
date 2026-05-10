"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  Map,
  ArrowRight,
  Layers,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react";

/* ─── Journey card data ──────────────────────────────────────── */
const JOURNEYS = [
  {
    id: "executive",
    href: "/dashboard",
    icon: BarChart2,
    badge: "Visão Executiva",
    title: "Sou Investidor\nou Gestor",
    description:
      "Acesse painéis rápidos de viabilidade, relatórios simplificados e panorama de mercado para tomada de decisão estratégica.",
    features: [
      "KPIs consolidados em tempo real",
      "Relatórios de viabilidade por setor",
      "Panorama de oportunidades de mercado",
    ],
    accent: "var(--pid-coral)",
    accentLight: "var(--pid-coral-lt)",
    gradient: "linear-gradient(135deg, rgba(232,88,26,0.15) 0%, rgba(196,66,15,0.05) 100%)",
    borderHover: "rgba(232,88,26,0.6)",
    iconBg: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))",
    cta: "Acessar Painel Executivo",
  },
  {
    id: "specialist",
    href: "/copilot",
    icon: Map,
    badge: "Visão Especialista",
    title: "Sou Técnico\nou Pesquisador",
    description:
      "Acesse o ambiente GIS completo com cruzamento de dados geoespaciais e assistência do PID Copilot para análises aprofundadas.",
    features: [
      "Mapa interativo com camadas GIS",
      "Cruzamento de dados por território",
      "Assistente IA integrado ao mapa",
    ],
    accent: "var(--pid-slate-lt)",
    accentLight: "var(--pid-muted)",
    gradient: "linear-gradient(135deg, rgba(61,100,148,0.15) 0%, rgba(44,74,110,0.05) 100%)",
    borderHover: "rgba(61,100,148,0.7)",
    iconBg: "linear-gradient(135deg, var(--pid-slate-lt), var(--pid-slate))",
    cta: "Abrir PID Copilot",
  },
];

/* ─── Floating background particles ─────────────────────────── */
const PARTICLES = [
  { size: 300, top: "-80px",  left: "-60px",  color: "rgba(232,88,26,0.07)",  blur: 80 },
  { size: 400, top: "40%",   right: "-100px", color: "rgba(44,74,110,0.10)",  blur: 100 },
  { size: 250, bottom: "-60px", left: "30%",  color: "rgba(232,88,26,0.05)",  blur: 70 },
];

export default function HomePage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "var(--pid-navy)" }}
    >
      {/* ── Ambient glow particles ──────────────────────────────── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: (p as {left?: string}).left,
            right: (p as {right?: string}).right,
            bottom: (p as {bottom?: string}).bottom,
            background: p.color,
            filter: `blur(${p.blur}px)`,
          }}
        />
      ))}

      {/* ── Subtle grid overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--pid-border) 1px, transparent 1px), linear-gradient(90deg, var(--pid-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.15,
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: "var(--pid-coral)",
              boxShadow: "0 0 20px rgba(232,88,26,0.4)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span
              className="font-bold text-base tracking-wide text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              plataforma interativa de descarbonização
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--pid-muted)" }}>
          <span
            className="px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(232,88,26,0.12)",
              border: "1px solid rgba(232,88,26,0.25)",
              color: "var(--pid-coral-lt)",
            }}
          >
            Versão 3.0
          </span>
          <span
            className="px-2 py-0.5 rounded font-medium"
            style={{ background: "var(--pid-surface2)", color: "var(--pid-muted)" }}
          >
            PT
          </span>
          <span style={{ color: "var(--pid-border)" }}>|</span>
          <span>EN</span>
        </div>
      </header>

      {/* ── Hero section ────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-10">
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
          style={{
            background: "rgba(232,88,26,0.1)",
            border: "1px solid rgba(232,88,26,0.25)",
            color: "var(--pid-coral-lt)",
          }}
        >
          <Sparkles size={12} />
          Novo · PID Copilot integrado
          <Zap size={11} style={{ color: "var(--pid-coral)" }} />
        </div>

        <h1
          className="text-4xl font-bold text-white leading-tight max-w-2xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Otimize suas decisões na{" "}
          <span
            style={{
              background: "linear-gradient(90deg, var(--pid-coral-lt), #F9C784)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            transição energética
          </span>
          .
        </h1>

        <p className="mt-4 text-base max-w-lg" style={{ color: "var(--pid-muted)" }}>
          Qual é o seu objetivo principal hoje?
        </p>

        {/* Data source strip */}
        <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
          {["EPE", "ANEEL", "ONS", "MME", "CCEE"].map((src) => (
            <span
              key={src}
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: "var(--pid-surface2)",
                border: "1px solid var(--pid-border)",
                color: "var(--pid-slate-lt)",
              }}
            >
              {src}
            </span>
          ))}
          <span className="text-xs" style={{ color: "var(--pid-border)" }}>
            · 326 indústrias · 30,4M MWh
          </span>
        </div>
      </section>

      {/* ── Journey cards ────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col lg:flex-row gap-5 px-8 pb-12 justify-center items-stretch max-w-5xl mx-auto w-full">
        {JOURNEYS.map((j) => {
          const Icon = j.icon;
          const isHovered = hovered === j.id;

          return (
            <Link
              key={j.id}
              href={j.href}
              className="flex-1 group relative flex flex-col rounded-3xl p-8 cursor-pointer outline-none transition-all duration-300"
              style={{
                background: isHovered
                  ? j.gradient
                  : "var(--pid-surface2)",
                border: `1.5px solid ${isHovered ? j.borderHover : "var(--pid-border)"}`,
                transform: isHovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px color-mix(in srgb, ${j.accent} 15%, transparent)`
                  : "0 4px 20px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={() => setHovered(j.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Badge */}
              <span
                className="self-start text-xs font-semibold px-3 py-1 rounded-full mb-6"
                style={{
                  background: `color-mix(in srgb, ${j.accent} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${j.accent} 25%, transparent)`,
                  color: j.accentLight,
                }}
              >
                {j.badge}
              </span>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300"
                style={{
                  background: j.iconBg,
                  transform: isHovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
                  boxShadow: isHovered ? `0 8px 25px color-mix(in srgb, ${j.accent} 35%, transparent)` : "none",
                }}
              >
                <Icon size={24} className="text-white" />
              </div>

              {/* Title */}
              <h2
                className="text-2xl font-bold text-white mb-3 whitespace-pre-line leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {j.title}
              </h2>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--pid-muted)" }}>
                {j.description}
              </p>

              {/* Feature list */}
              <ul className="space-y-2 mb-8 flex-1">
                {j.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: "#C8DDF0" }}>
                    <span
                      className="flex-none w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: `color-mix(in srgb, ${j.accent} 15%, transparent)`,
                        color: j.accentLight,
                        fontSize: "10px",
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <div
                className="flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: isHovered
                    ? j.iconBg
                    : `color-mix(in srgb, ${j.accent} 10%, var(--pid-navy-lt))`,
                  color: isHovered ? "white" : j.accentLight,
                  border: `1px solid color-mix(in srgb, ${j.accent} ${isHovered ? "40%" : "20%"}, transparent)`,
                }}
              >
                <span>{j.cta}</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200"
                  style={{ transform: isHovered ? "translateX(4px)" : "translateX(0)" }}
                />
              </div>
            </Link>
          );
        })}
      </section>

      {/* ── Footer strip ────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t mt-auto px-8 py-4 flex items-center justify-between text-xs"
        style={{
          borderColor: "var(--pid-border)",
          color: "var(--pid-slate-lt)",
        }}
      >
        <span>
          © 2026 Plataforma Interativa de Descarbonização · Hackathon MVP
        </span>
        <div className="flex items-center gap-1.5">
          <Layers size={11} />
          <span>Dados: EPE · ONS · ANEEL · MME · 2020-09-11</span>
        </div>
      </footer>
    </div>
  );
}

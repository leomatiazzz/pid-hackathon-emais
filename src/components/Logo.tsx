import Image from "next/image";

interface LogoProps {
  /** Altura em px (largura calculada pelo aspect-ratio 2.18:1) */
  height?: number;
  className?: string;
}

export default function Logo({ height = 36, className }: LogoProps) {
  // Logo principal: ~1400×642px → ratio ≈ 2.18
  const width = Math.round(height * 2.18);
  return (
    <Image
      src="/assets/PNG/Logo principal.png"
      alt="PID — Plataforma Interativa de Descarbonização"
      width={width}
      height={height}
      className={className}
      priority
      style={{ objectFit: "contain", width: "auto", height: "auto" }}
    />
  );
}

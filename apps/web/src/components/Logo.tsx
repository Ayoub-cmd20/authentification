import type React from "react";
import { cn } from "./ui";
import tawtheeqLogo from "../assets/logo.png";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", inverted = false }) => {
  const imgHeight = size === "lg" ? "44px" : size === "md" ? "36px" : "28px";
  const titleSize = size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-sm";
  const subSize = "text-[11px]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={tawtheeqLogo}
        alt="Tawtheeq.dz logo"
        style={{ height: imgHeight, width: "auto", objectFit: "contain" }}
      />
      <span>
        <span
          className={cn("block font-extrabold leading-tight tracking-tight", titleSize)}
          style={{ color: inverted ? "#fff" : "#003366" }}
        >
          tawthiq.dz
        </span>
        <span
          className={cn("block leading-tight", subSize)}
          style={{
            color: inverted ? "rgba(255,255,255,0.7)" : "#1565a0",
            fontFamily: "'Cairo', 'Amiri', sans-serif",
          }}
        >
          الموثوقية، الأمان والسرعة
        </span>
      </span>
    </div>
  );
};

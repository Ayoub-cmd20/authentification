import { useLanguage } from "../contexts/LanguageContext";
import algeriaFlag from "../assets/Flag_of_Algeria.svg.svg";
import tawtheeqLogo from "../assets/logo.png";

/* ---------------------------------------------------------------
   GovHeader — Algerian government-style banner for Tawtheeq.dz
   Mimics the official ministry portal layout:
     • Top bar  : language switcher (FR | عربي)
     • Main row : Algerian flag · central text block · Tawtheeq logo
--------------------------------------------------------------- */
export const GovHeader = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="w-full border-b border-[#cce0f0]"
      style={{ background: "#fff", fontFamily: "'Amiri', 'Cairo', 'Scheherazade New', serif" }}
    >
      {/* ── Top language bar ─────────────────────────────────── */}

      {/* ── Main banner row ──────────────────────────────────── */}
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8"
        style={{ minHeight: "90px" }}
      >
        {/* Left: Algerian flag / national emblem */}
        <div className="flex shrink-0 items-center">
          <img
            src={algeriaFlag}
            alt="Algeria National Flag"
            style={{
              height: "70px",
              width: "auto",
              objectFit: "contain",
              borderRadius: "3px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          />
        </div>

        {/* Centre: official title block — Arabic + French */}
        <div
          className="flex flex-1 flex-col items-center justify-center text-center"
          style={{ gap: "2px" }}
        >
          {/* Republic line */}
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#1a4a7a",
              letterSpacing: "0.04em",
              lineHeight: 1.3,
              fontFamily: "'Cairo', 'Amiri', sans-serif",
              direction: "rtl",
            }}
          >
            الجمهورية الجزائرية الديمقراطية الشعبية
          </p>
          <p
            style={{
              fontSize: "0.65rem",
              color: "#2a6496",
              fontFamily: "'Roboto', 'Inter', sans-serif",
              fontStyle: "italic",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}
          >
            République Algérienne Démocratique et Populaire
          </p>

          {/* Ministry / Platform name */}
          <p
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "#003366",
              direction: "rtl",
              fontFamily: "'Cairo', 'Amiri', sans-serif",
              lineHeight: 1.35,
              marginTop: "4px",
            }}
          >
            منصة التوثيق الأكاديمي الرقمي
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#003366",
              fontFamily: "'Roboto', 'Inter', sans-serif",
              letterSpacing: "0.01em",
              lineHeight: 1.25,
            }}
          >
            Plateforme de Certification Académique Numérique
          </p>

          {/* Tagline */}
          <p
            style={{
              fontSize: "0.7rem",
              color: "#1565a0",
              direction: "rtl",
              fontFamily: "'Cairo', 'Amiri', sans-serif",
              marginTop: "3px",
              fontStyle: "italic",
            }}
          >
            الجسر الرقمي بين الجامعة، الخريج، وعالم الشغل
          </p>
        </div>

        {/* Right: Tawtheeq.dz logo */}
        <div className="flex shrink-0 items-center justify-end">
          <img
            src={tawtheeqLogo}
            alt="Tawtheeq.dz"
            style={{
              height: "78px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
};

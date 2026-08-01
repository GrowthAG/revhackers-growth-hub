import { CaseStudy } from '@/data/casesData';

interface CaseHeroProps {
  caseData: CaseStudy;
}

const CaseHero = ({ caseData }: CaseHeroProps) => {
  return (
    <section className="pt-40 pb-32 bg-black relative overflow-hidden flex flex-col items-center justify-center min-h-[70vh]">
      {/* Blueprint Grid Overlay - Subtle */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90 text-zinc-500/1px, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">

          {/* Metadata Clean */}
          <div className="mb-12 flex items-center gap-3 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
            <span className="font-sans text-xs uppercase tracking-widest text-zinc-300 font-bold">Estudo de Caso • {caseData.title}</span>
          </div>

          {/* The Technical Plate - High Performance Viewport */}
          <div className="mb-20 relative animate-fade-in-up">
            {caseData.logo || caseData.whiteLogo ? (
              <div className="relative inline-block">
                {/* Precision Markers - Corner Crosshairs de Engenharia */}
                <div className="absolute -top-4 -left-4 w-10 h-10 border-t-[1.5px] border-l-[1.5px] border-zinc-700"></div>
                <div className="absolute -top-4 -right-4 w-10 h-10 border-t-[1.5px] border-r-[1.5px] border-zinc-700"></div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-[1.5px] border-l-[1.5px] border-zinc-700"></div>
                <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-[1.5px] border-r-[1.5px] border-zinc-700"></div>

                {/* Technical Alignment Lines */}
                <div className="absolute top-1/2 -left-8 w-6 h-[1px] bg-zinc-800"></div>
                <div className="absolute top-1/2 -right-8 w-6 h-[1px] bg-zinc-800"></div>

                {/* Viewport Logic: Plate for color logos, direct for whiteLogos */}
                <div className={`${caseData.whiteLogo ? "bg-transparent px-10" : "bg-white p-12 md:p-20"} flex items-center justify-center relative overflow-hidden transition-all duration-700 min-h-[160px] md:min-h-[240px] min-w-[280px] md:min-w-[480px]`}>
                  {!caseData.whiteLogo && (
                    <>
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                      </div>
                      {/* Technical T-Markers for Calibration */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-zinc-200"></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-zinc-200"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-[1px] bg-zinc-200"></div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-[1px] bg-zinc-200"></div>
                    </>
                  )}

                  <img
                    src={caseData.whiteLogo || caseData.logo}
                    alt={`${caseData.title} logo`}
                    className={`${caseData.whiteLogo ? "max-w-[240px] md:max-w-[340px]" : "max-w-[280px] md:max-w-[400px]"} max-h-[120px] md:max-h-[140px] w-full h-auto object-contain relative z-10 transition-transform duration-1000 group-hover:scale-[1.02]`}
                    style={{
                      transform: caseData.logoScale ? `scale(${caseData.logoScale})` : undefined
                    }}
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-7xl md:text-9xl font-black text-white tracking-tight uppercase italic underline decoration-zinc-800 underline-offset-8">
                {caseData.title}
              </h1>
            )}
          </div>

          {/* Strategic Narrative Header */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px w-8 bg-zinc-800"></div>
              <h2 className="text-zinc-400 font-sans text-xs uppercase tracking-widest whitespace-nowrap font-bold">Especificação de Performance</h2>
              <div className="h-px w-8 bg-zinc-800"></div>
            </div>
            <p className="text-3xl md:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-[0.95] mb-4 animate-fade-in-up delay-200 text-balance italic">
              {caseData.preview_description || `Como transformamos desafios de ${caseData.category.toLowerCase()} em uma máquina de receita previsível.`}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CaseHero;

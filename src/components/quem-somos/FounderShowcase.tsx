import React from 'react';
import { ArrowUpRight, ShieldCheck, Sparkles, Building2, Linkedin, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const FounderShowcase = () => {
  return (
    <section className="py-24 bg-zinc-950 text-white relative overflow-hidden border-t border-b border-zinc-800">
      {/* Glow background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00CC6A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Founder Official Avatar / Image Card */}
          <div className="w-full lg:w-5/12 flex flex-col items-center">
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00CC6A] to-emerald-500 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
                <img
                  src="/uploads/giulliano-linkedin-profile.png"
                  alt="Giulliano Alves - Founder & Chief Revenue Engineer"
                  className="w-full h-[420px] object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                />
                
                {/* Badge Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#00CC6A] uppercase">
                      LIDERANÇA EXECUTIVA
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Giulliano Alves</h3>
                  <p className="text-xs text-zinc-400 font-medium">Founder & Chief Revenue Engineer @ RevHackers</p>
                </div>
              </div>
            </div>

            {/* External Profile Verification */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/giullianoalves/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-[#00CC6A] transition-colors py-1.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#00CC6A]" />
                <span>Perfil Oficial LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Founder Bio & Strategic Credentials */}
          <div className="w-full lg:w-7/12 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[#00CC6A] text-xs font-mono font-bold uppercase tracking-wider">
              <Award size={14} className="text-[#00CC6A]" />
              <span>Engenharia de GTM & Founder-Led Growth</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Construindo os motores de receita B2B mais eficientes do Brasil<span className="text-[#00CC6A]">.</span>
            </h2>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
              "Na RevHackers, nós eliminamos o 'achismo' e a vaidade corporativa das operações de vendas B2B. Nossa missão é instalar uma arquitetura de receita previsível baseada em dados, automações de CRM e inteligência artificial."
            </p>

            {/* Credential Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Building2 size={16} className="text-[#00CC6A]" />
                  <span>SaaS & Tech B2B</span>
                </div>
                <p className="text-xs text-zinc-400">Criador do ecossistema Funnels SaaS e acelerador de +30 operações B2B no país.</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck size={16} className="text-[#00CC6A]" />
                  <span>Metodologia REI 40Q</span>
                </div>
                <p className="text-xs text-zinc-400">Autor do protocolo de auditoria preditiva que identifica gargalos de pipeline em 1 minuto.</p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" className="bg-[#00CC6A] text-black hover:bg-[#00b35e] font-bold text-xs uppercase tracking-wider h-12 px-8 w-full sm:w-auto rounded-xl">
                <Link to="/booking">
                  Agendar Diagnóstico com o Time
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold text-xs uppercase tracking-wider h-12 px-6 w-full sm:w-auto rounded-xl">
                <Link to="/score-founder">
                  Ver Diagnóstico de Founder
                </Link>
              </Button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FounderShowcase;

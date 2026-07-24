export interface GeneratePlanInput {
    reiResponses: Record<string, any>;
    segment?: string;
    objective?: string;
    isB2B?: boolean;
    projectType?: string;
    projectId?: string;
    projectDuration?: string;
    clientName?: string;
    clientCompany?: string;
    tradeName?: string;
}

export async function generateStrategicPlanAi(input: GeneratePlanInput): Promise<Record<string, any>> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // Se nenhuma chave de IA estiver configurada no servidor Cloud Run, gera plano estruturado de alta fidelidade
    if (!apiKey) {
        console.warn('[AI Plan Generator] Nenhuma chave de IA (GEMINI_API_KEY ou OPENAI_API_KEY) configurada. Gerando plano estruturado padrão.');
        return generateFallbackPlan(input);
    }

    const promptText = buildStrategicPlanPrompt(input);

    if (process.env.GEMINI_API_KEY) {
        try {
            return await callGeminiApi(process.env.GEMINI_API_KEY, promptText);
        } catch (e) {
            console.error('[AI Plan Generator] Erro ao chamar Gemini API, tentando fallback...', e);
        }
    }

    if (process.env.OPENAI_API_KEY) {
        try {
            return await callOpenAiApi(process.env.OPENAI_API_KEY, promptText);
        } catch (e) {
            console.error('[AI Plan Generator] Erro ao chamar OpenAI API, usando fallback...', e);
        }
    }

    return generateFallbackPlan(input);
}

async function callGeminiApi(apiKey: string, prompt: string): Promise<Record<string, any>> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Resposta vazia da API do Gemini');

    return JSON.parse(text);
}

async function callOpenAiApi(apiKey: string, prompt: string): Promise<Record<string, any>> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um Diretor Estratégico de Growth B2B da RevHackers. Responda APENAS em JSON válido.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia da API da OpenAI');

    return JSON.parse(content);
}

function buildStrategicPlanPrompt(input: GeneratePlanInput): string {
    const client = input.clientCompany || input.clientName || 'Cliente';
    const segment = input.segment || 'B2B';
    const duration = input.projectDuration || '90 dias';

    return `
Você é o Diretor Estratégico de Growth B2B da RevHackers. Crie um Plano Estratégico Diagnóstico completo em JSON para a empresa "${client}" (${segment}).

RESPOSTAS DO DIAGNÓSTICO E REQUISITOS:
${JSON.stringify(input.reiResponses, null, 2)}

Prazo de Execução: ${duration}

Retorne um JSON VÁLIDO com a seguinte estrutura de 9 blocos:
{
  "summary": "Resumo executivo de alto impacto em 2 frases.",
  "executive_summary": {
    "context": "Contexto operacional atual do cliente.",
    "problem": "Gargalo central identificado no diagnóstico.",
    "solution": "Metodologia RevHackers para resolver o gargalo.",
    "expected_outcome": "Resultado esperado em ROI, LTV e taxa de conversão."
  },
  "current_vs_future": {
    "current": ["Falta de cadência clara no pipeline", "Ferramentas desconectadas", "Custo de aquisição acima da média"],
    "future": ["Processo de prospecção 100% estruturado", "CRM alimentado automaticamente", "CAC otimizado com LTV 3x maior"]
  },
  "quick_wins": [
    { "day": "Dia 1", "action": "Mapeamento dos contatos ativos", "outcome": "Base limpa no CRM", "owner": "revhackers" },
    { "day": "Dia 2", "action": "Configuração de automação inicial", "outcome": "Leads quentes notificados em tempo real", "owner": "ambos" }
  ],
  "thesis_statement": {
    "before": "Para atingir previsibilidade de vendas, precisamos construir um",
    "highlight": "Motor de Receita Recorrente",
    "after": "integrado e automatizado."
  },
  "context_mirror": {
    "segment": "${segment}",
    "objective": "${input.objective || 'Escala de Vendas'}",
    "maturity": "Intermediária",
    "restrictions": "Time enxuto necessitando de automação."
  },
  "signals": [
    { "type": "negative", "headline": "Pipeline Desestruturado", "text": "Falta de higiene nos dados do CRM", "impact": "Perda de 25% das oportunidades" },
    { "type": "positive", "headline": "Produto Validado", "text": "Alta satisfação dos clientes atuais", "impact": "Potencial alto para upsell" }
  ],
  "risks": [
    { "severity": "high", "headline": "Dependência de Prospecção Manual", "text": "Equipe gastando 60% do tempo preenchendo planilhas", "mitigation": "Automação de workflows no CRM" }
  ],
  "decisions": [
    { "title": "Implementação do CRM Nativo", "context": "Substituir planilhas soltas pelo CRM unificado", "recommendation": "Go-live em 15 dias" }
  ],
  "pillars": [
    { "id": "p1", "title": "Arquitetura de Vendas & CRM", "subtitle": "Fundação e higiene de dados", "status": "crítico", "actions": ["Configurar pipeline", "Treinar equipe"] }
  ],
  "roadmap_phases": [
    { "phase": "Fase 1 - Fundação", "duration": "Semanas 1-3", "focus": "Configuração inicial", "deliverables": ["Diagnóstico aprovado", "CRM configurado"] }
  ],
  "okrs": [
    { "objective": "Estruturar Máquina de Vendas", "key_results": ["Aumentar taxa de conversão em 20%", "Reduzir tempo de resposta ao lead para < 15min"] }
  ]
}
`;
}

function generateFallbackPlan(input: GeneratePlanInput): Record<string, any> {
    const client = input.clientCompany || input.clientName || 'Cliente B2B';
    const segment = input.segment || 'B2B';
    const duration = input.projectDuration || '90 dias';

    return {
        summary: `Plano Estratégico de Crescimento para ${client} focado em otimização do pipeline comercial e previsibilidade de receita em ${duration}.`,
        executive_summary: {
            context: `Operação B2B atuando no segmento de ${segment} com time comercial estruturado.`,
            problem: `Gargalos na passagem de bastão de leads e tempo de resposta acima do ideal.`,
            solution: `Implementação da metodologia RevHackers com automação de workflows e higienização de pipeline.`,
            expected_outcome: `Redução do ciclo de vendas e aumento de 30% na taxa de fechamento em ${duration}.`
        },
        current_vs_future: {
            current: [
                "Time comercial dependente de atualizações manuais",
                "Leads qualificados aguardando mais de 24h para primeiro contato",
                "Falta de visibilidade clara do pipeline de vendas"
            ],
            future: [
                "Workflows automatizados e CRM 100% atualizado em tempo real",
                "Tempo de resposta ao lead (Speed-to-Lead) inferior a 15 minutos",
                "Cockpit de métricas executivas de receita com visibilidade semanal"
            ]
        },
        quick_wins: [
            { day: "Dia 1-2", action: "Saneamento da base de contatos ativos no CRM", outcome: "Pipeline limpo e categorizado", owner: "revhackers" },
            { day: "Dia 3-5", action: "Implementação das automações de notificação instantânea", outcome: "Leads quentes distribuídos em minutos", owner: "ambos" },
            { day: "Dia 6-7", action: "Treinamento tático da equipe comercial", outcome: "Alinhamento das etapas do funil", owner: "revhackers" }
        ],
        thesis_statement: {
            before: "Para acelerar o crescimento de receita com alta eficiência, a",
            highlight: `RevHackers & ${client}`,
            after: `irão construir uma infraestrutura previsível de aquisição B2B.`
        },
        context_mirror: {
            segment: segment,
            objective: input.objective || "Escala de Vendas e Otimização do CAC",
            maturity: "Intermediária",
            restrictions: "Foco em resultados de curto prazo mantendo a estrutura atual de time."
        },
        signals: [
            { type: "negative", headline: "Estagnação em Etapas Intermediárias", text: "Propostas enviadas demoram mais de 10 dias sem follow-up estruturado.", impact: "Perda estimada de 20% do volume de propostas." },
            { type: "positive", headline: "Fit de Produto / Mercado Comprovado", text: "Excelente retenção e feedbacks positivos da carteira de clientes.", impact: "Potencial acelerado para programas de expansão e indicação." }
        ],
        risks: [
            { severity: "high", headline: "Ausência de Governança de CRM", text: "Falta de obrigatoriedade no preenchimento de campos-chave dos negócios.", mitigation: "Validação de etapas com campos obrigatórios e alertas de inatividade." }
        ],
        decisions: [
            { title: "Padronização das Etapas de Vendas", context: "O funil atual possui definições ambíguas de qualificação.", recommendation: "Implementar critérios rígidos de saída para cada etapa do pipeline." }
        ],
        pillars: [
            { id: "p1", title: "Estruturação do Pipeline & CRM", subtitle: "Fundação de dados e cadência", status: "crítico", actions: ["Mapeamento de etapas", "Campos obrigatórios", "Automações de aviso"] },
            { id: "p2", title: "Velocidade de Resposta ao Lead", subtitle: "SLA de marketing & vendas", status: "atenção", actions: ["Roteamento automático", "Alertas via WhatsApp/Slack", "Dashboard de resposta"] }
        ],
        roadmap_phases: [
            { phase: "Fase 1 - Fundação e Diagnóstico", duration: "Semanas 1-3", focus: "Alinhamento do CRM e dados", deliverables: ["CRM reestruturado", "Equipe treinada"] },
            { phase: "Fase 2 - Automação e Velocidade", duration: "Semanas 4-8", focus: "Eficiência operacional", deliverables: ["Workflows ativos", "Métricas de Speed-to-Lead"] },
            { phase: "Fase 3 - Escala e Governança", duration: "Semanas 9-12", focus: "Previsibilidade e Expansão", deliverables: ["Cockpit de Receita", "Revisão de Metas"] }
        ],
        okrs: [
            { objective: "Aumentar a Eficiência Operacional de Vendas", key_results: ["Reduzir o ciclo médio de vendas em 25%", "Alcançar 95% de conformidade de dados no CRM"] }
        ]
    };
}

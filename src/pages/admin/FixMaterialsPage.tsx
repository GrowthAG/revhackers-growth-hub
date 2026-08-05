import { useEffect, useState } from 'react';
import { contentGcpAdapter } from '@/api/adapters/content-gcp';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';

const OFFICIAL_MATERIALS = [
    { title: "Framework Completo: Agente de IA para Meta Ads", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-77477/31372c5d222fba9", type: "framework" },
    { title: "Plano de Ação 90 Dias", url: "https://lp.revhackers.com.br/post/plano-acao-90-dias", type: "template" },
    { title: "Guia Definitivo Agent Builder da OpenAI", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-77057/23e08419c8226b5", type: "guide" },
    { title: "Guia Completo: CRM Estratégico que Realmente Converte", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-75537/dcc3fba9d7b5449", type: "guide" },
    { title: "Transforme Seu LinkedIn em uma Máquina de Reuniões", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-75797/4481633190ac7d5", type: "guide" },
    { title: "Guia Prático de Estratégia Go-To-Market (GTM)", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-75377/8058bda68fdda75", type: "guide" },
    { title: "LinkedIn Outreach Revolution", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-74457/864a540dc185f92", type: "guide" },
    { title: "Timing Sales Playbook", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-74377/ac670d7da5d9815", type: "playbook" },
    { title: "Como Conseguir Telefone e E-mail de Qualquer Decisor", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-74037/4f52e2490ba6ea1", type: "guide" },
    { title: "O Framework que nos Levou ao TOP 10 Mundial do ClickUp", url: "https://doc.clickup.com/9017035197/p/h/8cqa2dx-73777/1cd15c7fdc86518", type: "framework" }
];

const FixMaterialsPage = () => {
    const [status, setStatus] = useState<string>('Waiting to start...');


    const runResetAndFix = async () => {
        setStatus('INICIANDO CORREÇÃO...\n');

        // 1. Delete ALL existing materials
        setStatus(prev => prev + '1. Apagando materiais antigos...\n');

        try {
            const allMaterials = await contentGcpAdapter.getMaterials();
            if (allMaterials && allMaterials.length > 0) {
                for (const mat of allMaterials) {
                    if (mat.id) {
                        try {
                            await contentGcpAdapter.deleteMaterial(String(mat.id));
                        } catch (err: any) {
                            setStatus(prev => prev + `[ERRO delete ${mat.id}] ${err.message}\n`);
                        }
                    }
                }
                setStatus(prev => prev + `Sucesso: ${allMaterials.length} materiais antigos apagados.\n`);
            } else {
                setStatus(prev => prev + `Nenhum material antigo encontrado para apagar.\n`);
            }
        } catch (err: any) {
            setStatus(prev => prev + `ERRO ao listar materiais: ${err.message}\n`);
            return;
        }

        // 2. Insert Official Materials
        setStatus(prev => prev + '2. Inserindo materiais oficiais...\n');

        const slugify = (s: string) =>
            s.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

        for (const mat of OFFICIAL_MATERIALS) {
            const basePayload = {
                material_name: mat.title,
                slug: slugify(mat.title),
                material_type: mat.type,
                material_url: mat.url,
                description: `Material oficial: ${mat.title}. Conteúdo prático e validado para sua operação.`,
                published: true,
                is_active: true,
            };

            try {
                await contentGcpAdapter.createMaterial(basePayload);
                setStatus(prev => prev + `[OK] ${mat.title}\n`);
            } catch (firstErr: any) {
                // Fallback: Try 'framework' if the specific type failed (Constraint Issue)
                try {
                    await contentGcpAdapter.createMaterial({ ...basePayload, material_type: 'framework' });
                    setStatus(prev => prev + `[OK - Fallback] ${mat.title} (Inserido como framework)\n`);
                } catch (secondErr: any) {
                    setStatus(prev => prev + `[FALHA FATAL] ${mat.title}: ${secondErr.message}\n`);
                }
            }
        }
        setStatus(prev => prev + '\n✅ PROCESSO CONCLUÍDO!');
    };

    return (
        <AdminLayout>
            <AdminPageLayout
                title="Correção de Materiais"
                description="Ferramenta de emergência para resetar e corrigir materiais oficiais."
                backTo="/admin/materials"
                backLabel="Voltar aos Materiais"
            >
                <div className="max-w-4xl mx-auto min-h-screen bg-white">
                    <h1 className="text-3xl font-bold mb-6 text-red-600">Ferramenta de Correção de Materiais</h1>

                    <div className="flex flex-col gap-4 mb-8">
                        <Button
                            onClick={runResetAndFix}
                            className="w-full h-24 text-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm border-4 border-red-800 uppercase tracking-widest"
                        >
                            👉 CLIQUE AQUI PARA CORRIGIR AGORA
                        </Button>
                        <p className="text-sm text-zinc-500 text-center">Isso vai apagar os dados incorretos e inserir os materiais oficiais automaticamente.</p>
                    </div>

                    <div className="bg-zinc-950 text-green-400 p-6 shadow-inner min-h-[400px] font-mono text-sm leading-relaxed whitespace-pre-wrap border border-zinc-200">
                        {status}
                    </div>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};


export default FixMaterialsPage;

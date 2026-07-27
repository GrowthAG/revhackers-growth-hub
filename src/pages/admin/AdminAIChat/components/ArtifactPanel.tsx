import { FileText, Download, FileType, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Artifact } from '../types';

interface ArtifactPanelProps {
    artifact: Artifact | null;
    onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
    if (!artifact) return null;

    const handleExportMarkdown = () => {
        const blob = new Blob([artifact.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artifact.title.replace(/\s+/g, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Documento .md exportado!');
    };

    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>${artifact.title}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; line-height: 1.6; }
                        h1 { font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        pre { background: #f4f4f5; padding: 20px; border-radius: 8px; font-family: monospace; }
                        .footer { margin-top: 50px; font-size: 10px; color: #a1a1aa; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${artifact.title}</h1>
                    <div style="margin-top: 30px">${artifact.content.replace(/\n/g, '<br/>')}</div>
                    <div class="footer">Gerado estrategicamente por RevHackers AI Hub • 2026</div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
        toast.success('Preparando PDF para impressão...');
    };

    return (
        <div className="hidden lg:flex flex-col w-[50%] bg-white shadow-sm border-l border-zinc-100 animate-in slide-in-from-right duration-500 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/5">
                        <FileText className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 truncate max-w-[300px]">
                        {artifact.title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-tiny font-semibold border-zinc-200 hover:bg-black hover:text-white transition-all uppercase tracking-widest"
                        onClick={() => {
                            navigator.clipboard.writeText(artifact.content);
                            toast.success('Conteúdo copiado!');
                        }}
                    >
                        <Check className="w-3.5 h-3.5" />
                        Copiar
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-tiny font-semibold border-zinc-200 hover:border-black transition-all uppercase tracking-widest"
                        onClick={handleExportMarkdown}
                    >
                        <Download className="w-3.5 h-3.5" />
                        .MD
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-tiny font-semibold border-zinc-200 hover:border-black transition-all uppercase tracking-widest"
                        onClick={handleExportPDF}
                    >
                        <FileType className="w-3.5 h-3.5" />
                        PDF
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-zinc-100"
                        onClick={onClose}
                    >
                        <X className="w-4 h-4 text-zinc-400" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {artifact.type === 'code' ? (
                        <div className="bg-[#1e1e1e] p-6 shadow-sm relative group">
                            <div className="absolute top-4 right-4 text-xxs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded">
                                Code
                            </div>
                            <pre className="text-zinc-100 text-mini font-mono leading-relaxed overflow-x-auto">
                                {artifact.content}
                            </pre>
                        </div>
                    ) : (
                        <div className="bg-white p-8 shadow-sm border border-zinc-200 text-zinc-800 leading-relaxed text-body whitespace-pre-wrap prose prose-zinc max-w-none">
                            {artifact.content}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

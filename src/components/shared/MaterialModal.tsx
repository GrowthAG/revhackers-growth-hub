import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import DownloadForm from './download-form';
import { removeEmojis } from '@/utils/stringUtils';

interface MaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: {
        title?: string;
        material_name?: string;
        type?: string;
        material_type?: string;
        materialId?: string;
        id?: string;
        link_material?: string;
        material_url?: string;
    } | null;
    onSuccess: () => void;
}

const MaterialModal = ({ isOpen, onClose, material, onSuccess }: MaterialModalProps) => {
    if (!material) return null;

    const cleanTitle = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return removeEmojis(text);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200/80 p-8 sm:p-10 shadow-2xl rounded-3xl text-left">
                <DialogHeader className="mb-6 space-y-1 text-left">
                    <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight">
                        Solicitar Análise
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-zinc-500">
                        Preencha para análise técnica de perfil. Resposta em até 24h.
                    </DialogDescription>
                </DialogHeader>

                <div className="text-left">
                    <DownloadForm
                        materialId={material.materialId || material.id || 'unknown'}
                        materialType={material.type || material.material_type || 'material'}
                        materialTitle={cleanTitle(material.title || material.material_name || '')}
                        linkMaterial={material.link_material || material.material_url}
                        onSubmit={onSuccess}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MaterialModal;

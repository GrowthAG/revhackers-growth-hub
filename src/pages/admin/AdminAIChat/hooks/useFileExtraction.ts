declare global {
    interface Window {
        pdfjsLib?: any;
        mammoth?: any;
    }
}

const PDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const MAMMOTH_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

async function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

async function extractPdf(file: File): Promise<string> {
    if (!window.pdfjsLib) {
        await loadScript(PDF_CDN);
    }
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDN;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => (item as any).str);
        fullText += strings.join(' ') + '\n';
    }
    return fullText;
}

async function extractDocx(file: File): Promise<string> {
    if (!window.mammoth) {
        await loadScript(MAMMOTH_CDN);
    }
    const mammoth = window.mammoth;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
}

function extractPlainText(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

export async function extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        try {
            return await extractPdf(file);
        } catch (err) {
            console.error('PDF extraction error:', err);
            return extractPlainText(file);
        }
    }

    if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
    ) {
        try {
            return await extractDocx(file);
        } catch (err) {
            console.error('DOCX extraction error:', err);
            return extractPlainText(file);
        }
    }

    return extractPlainText(file);
}

export function readImageAsBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler imagem'));
        reader.readAsDataURL(file);
    });
}

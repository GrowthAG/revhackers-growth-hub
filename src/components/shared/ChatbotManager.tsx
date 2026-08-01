import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// IDs dos Widgets GHL (preencher com IDs reais)
const BOT_SALES_ID = import.meta.env.VITE_GHL_SALES_BOT_ID || "";
const BOT_CONTENT_ID = import.meta.env.VITE_GHL_CONTENT_BOT_ID || "";

// Rotas onde o chatbot DEVE aparecer (somente frontend publico)
const SALES_ROUTES = ['/', '/servicos', '/quem-somos', '/booking', '/agenda', '/agenda-diagnostico'];
const CONTENT_PREFIXES = ['/blog', '/cases', '/materiais', '/comunidade'];

function isPublicRoute(path: string): false | 'sales' | 'content' {
    if (SALES_ROUTES.includes(path) || path.startsWith('/servicos/')) return 'sales';
    for (const prefix of CONTENT_PREFIXES) {
        if (path === prefix || path.startsWith(prefix + '/')) return 'content';
    }
    return false;
}

function removeAllChatWidgets() {
    // GHL chat widget script
    const ghlScript = document.getElementById('ghl-chat-script');
    if (ghlScript) ghlScript.remove();
    // GHL chat-widget custom elements
    document.querySelectorAll('chat-widget').forEach(el => el.remove());
    // LeadConnector containers
    document.querySelectorAll('[id*="chat-widget"], [class*="chat-widget"], [id*="leadconnector"], [class*="leadconnector"]').forEach(el => el.remove());
    // Remove only iframes tagged by our chatbot loader - never touch booking/calendar iframes
    document.querySelectorAll('iframe[data-revhackers-chatbot]').forEach(el => el.remove());
}

const ChatbotManager = () => {
    useEffect(() => {
        // Purge any GHL chat widget scripts or elements completely
        document.getElementById('ghl-chat-script')?.remove();
        document.querySelectorAll('chat-widget').forEach(el => el.remove());
        document.querySelectorAll('[id*="chat-widget"], [class*="chat-widget"], [id*="leadconnector"]').forEach(el => el.remove());
    }, []);

    return null;
};

export default ChatbotManager;

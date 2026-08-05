import { supabase } from "@/integrations/supabase/client";
import { clientsGcpAdapter } from "./adapters/clients-gcp";

export interface Client {
    id: string;
    name: string;
    trade_name?: string;
    email: string;
    company?: string;
    cnpj?: string;
    cep?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    logo_url?: string;
    website?: string;
    segment?: string;
    company_size?: string;
    status: 'active' | 'onboarding' | 'churned';
    created_at?: string;
}

export type ClientInsert = Omit<Client, 'id' | 'created_at'>;
export type ClientUpdate = Partial<ClientInsert>;

const isGcpEnabled = (): boolean => {
    return import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true';
};

export const getAllClients = async (): Promise<Client[]> => {
    if (isGcpEnabled()) {
        try {
            return await clientsGcpAdapter.getAll();
        } catch (error) {
            console.error('Error fetching clients from GCP API:', error);
            return [];
        }
    }
    const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.warn('Clients table might not exist yet:', error.message);
        return [];
    }
    return (data as any) || [];
};

export const getClientById = async (id: string): Promise<Client | null> => {
    if (isGcpEnabled()) {
        try {
            return await clientsGcpAdapter.getById(id);
        } catch (error) {
            console.error('Error fetching client from GCP API:', error);
            return null;
        }
    }
    const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching client:', error);
        return null;
    }
    return data as any;
};

export const createClient = async (client: ClientInsert): Promise<Client | null> => {
    return await clientsGcpAdapter.create(client);
};

export const updateClient = async (id: string, updates: ClientUpdate): Promise<Client | null> => {
    return await clientsGcpAdapter.update(id, updates);
};

export const deleteClient = async (id: string): Promise<void> => {
    await clientsGcpAdapter.delete(id);
};


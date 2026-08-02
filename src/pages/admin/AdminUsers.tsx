import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, MoreHorizontal, Plus, Trash2, Edit2, Mail, ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APP_CONFIG } from "@/config/constants";
import { useNavigate } from "react-router-dom";
import { usersGcpAdapter } from '@/api/adapters/users-gcp';

interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: "super_admin" | "admin" | "user";
    status: "active" | "pending" | "inactive";
    avatar_url: string;
    created_at: string;
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

const AdminUsers = () => {
    const { user: currentUser, userRole } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);
    const [inviting, setInviting] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ email: "", role: "user" });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchInvitations()]);
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    const gcpUsers = await usersGcpAdapter.getAll();
                    setUsers(gcpUsers.map(u => ({
                        id: u.id,
                        email: u.email,
                        username: u.username || u.email.split('@')[0],
                        full_name: u.fullName || u.email,
                        role: u.role,
                        status: u.status,
                        avatar_url: u.avatarUrl || '',
                        created_at: u.createdAt,
                    })));
                    return;
                } catch (e) {
                    console.warn('Fallback para Supabase no fetchUsers...', e);
                }
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data as any || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchInvitations = async () => {
        try {
            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    const gcpInvites = await usersGcpAdapter.getInvitations();
                    setInvitations(gcpInvites.map(i => ({
                        id: i.id,
                        email: i.email,
                        role: i.role,
                        status: i.status,
                        created_at: i.createdAt,
                    })));
                    return;
                } catch (e) {
                    console.warn('Fallback para Supabase no fetchInvitations...', e);
                }
            }

            const { data, error } = await supabase
                .from("invitations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setInvitations(data || []);
        } catch (error: any) {
            console.error("Error fetching invitations:", error);
        }
    };

    const handleInvite = async () => {
        if (!inviteData.email) return;
        setInviting(true);
        try {
            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    await usersGcpAdapter.inviteMember(inviteData.email, inviteData.role);
                    toast({
                        title: "Convite GCP enviado com sucesso!",
                        description: `Enviamos o acesso via GCP Cloud Functions para ${inviteData.email}.`
                    });
                    setIsInviteModalOpen(false);
                    setInviteData({ email: "", role: "user" });
                    fetchInvitations();
                    return;
                } catch (e: any) {
                    console.warn('Fallback para Supabase no handleInvite...', e);
                }
            }

            const { data, error: functionError } = await supabase.functions.invoke('invite-member', {
                body: {
                    email: inviteData.email,
                    role: inviteData.role,
                    redirectTo: `${APP_CONFIG.URLS.APP}/reset-password`
                }
            });

            if (functionError) {
                throw new Error(functionError.message || "Erro no envio do convite");
            }
            
            if (data?.error) {
                throw new Error(data.error);
            }

            await supabase
                .from("invitations")
                .insert([{
                    email: inviteData.email,
                    role: inviteData.role,
                    invited_by: currentUser?.id,
                    status: 'pending'
                }]);

            toast({
                title: "Convite enviado com sucesso!",
                description: `Enviamos o acesso para ${inviteData.email}.`
            });

            setIsInviteModalOpen(false);
            setInviteData({ email: "", role: "user" });
            fetchInvitations();
        } catch (error: any) {
            toast({
                title: "Erro ao convidar membro",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setInviting(false);
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        if (!confirm(`Tem certeza que deseja remover ${user.email}?`)) return;
        setUpdating(user.id);
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', { body: { userId: user.id } });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            
            setUsers(users.filter(u => u.id !== user.id));
            toast({ title: "Membro removido com sucesso" });
        } catch (error: any) {
            toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    };

    const handleRunUpdateUser = async () => {
        if (!editData) return;
        setUpdating(editData.id);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ 
                    full_name: editData.full_name, 
                    role: editData.role, 
                    status: editData.status,
                    avatar_url: editData.avatar_url 
                })
                .eq("id", editData.id);

            if (error) throw error;
            setUsers(users.map(u => u.id === editData.id ? editData : u));
            toast({ title: "Perfil atualizado com sucesso" });
            setIsEditModalOpen(false);
        } catch (error: any) {
            toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
    );

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'active') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00CC6A] text-black">
                    ● ATIVO
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                PENDENTE
            </span>
        );
    };

    const RoleBadge = ({ role }: { role: string }) => {
        const labels: Record<string, string> = { super_admin: "Super Admin", admin: "Administrador", user: "Membro" };
        return (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                {labels[role] || role}
            </span>
        );
    };

    const handleEditClick = (user: UserProfile) => {
        setEditData(user);
        setIsEditModalOpen(true);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                
                {/* Header SaaS Moderno Benchmark */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1">
                            <button
                                onClick={() => navigate('/admin')}
                                className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft size={13} /> Dashboard
                            </button>
                            <span>/</span>
                            <span className="text-zinc-900 font-bold">Membros</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                Gestão de Membros & Acessos
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {users.length} membros
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gerencie os colaboradores, administradores e permissões de acesso ao workspace.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-bold tracking-wide uppercase shadow-none gap-2 flex items-center transition-all border border-zinc-200"
                        >
                            <Plus size={15} className="text-[#00CC6A]" /> ADICIONAR MEMBRO
                        </Button>
                    </div>
                </div>

                {/* Control Bar & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shadow-sm p-2 rounded-xl border border-zinc-200">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 h-9 bg-white border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 transition-all shadow-none"
                        />
                    </div>
                </div>

                {/* Table View */}
                {loading ? (
                    <div className="flex justify-center items-center py-20 bg-white border border-zinc-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-[#00CC6A]" />
                            <span className="text-xs text-zinc-500 font-medium">Carregando lista de membros...</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white shadow-sm border-b border-zinc-200 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                    <TableHead className="py-3.5 px-4">Membro & E-mail</TableHead>
                                    <TableHead className="py-3.5 px-4">Função</TableHead>
                                    <TableHead className="py-3.5 px-4">Status</TableHead>
                                    <TableHead className="py-3.5 px-4 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-white shadow-sm/80 transition-colors">
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 rounded-lg border border-zinc-200 bg-zinc-950">
                                                    <AvatarImage src={user.avatar_url} />
                                                    <AvatarFallback className="bg-zinc-950 text-white text-xs font-bold rounded-lg">
                                                        {user.full_name?.substring(0, 2).toUpperCase() || "US"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className="text-xs font-bold text-zinc-900 block">{user.full_name || "Usuário"}</span>
                                                    <span className="text-[11px] text-zinc-500 font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3.5 px-4">
                                            <RoleBadge role={user.role} />
                                        </TableCell>
                                        <TableCell className="py-3.5 px-4">
                                            <StatusBadge status={user.status || 'active'} />
                                        </TableCell>
                                        <TableCell className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(user)}
                                                    className="h-8 w-8 p-0 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white"
                                                    title="Editar Usuário"
                                                >
                                                    <Edit2 size={13} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="h-8 w-8 p-0 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 border border-zinc-200 bg-white"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Modal Adicionar Membro - SaaS Moderno Premium */}
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogContent className="sm:max-w-md p-6 bg-white border border-zinc-200 rounded-2xl shadow-xl gap-6">
                        <DialogHeader className="space-y-1.5 text-left">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center mb-2">
                                <UserPlus size={18} className="text-[#00CC6A]" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight">Adicionar Novo Membro</DialogTitle>
                            <DialogDescription className="text-xs text-zinc-500">
                                Envie um convite direto por e-mail para autorizar o acesso ao workspace.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-zinc-700">E-mail do Colaborador</Label>
                                <Input
                                    id="email"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    className="h-10 border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 shadow-none"
                                    placeholder="colaborador@empresa.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="role" className="text-xs font-semibold text-zinc-700">Nível de Permissão</Label>
                                <Select
                                    value={inviteData.role}
                                    onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                >
                                    <SelectTrigger className="h-10 border-zinc-200 rounded-lg text-xs shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-zinc-200 bg-white">
                                        <SelectItem value="user">Membro (Visualização & Execução)</SelectItem>
                                        <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="h-9 border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg">
                                Cancelar
                            </Button>
                            <Button onClick={handleInvite} disabled={inviting} className="h-9 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold gap-2">
                                {inviting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="text-[#00CC6A]" />}
                                {inviting ? "Enviando..." : "Enviar Convite"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar Membro */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-md p-6 bg-white border border-zinc-200 rounded-2xl shadow-xl gap-6">
                        <DialogHeader className="space-y-1.5 text-left">
                            <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight">Editar Membro</DialogTitle>
                        </DialogHeader>
                        {editData && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700">Nome Completo</Label>
                                    <Input
                                        value={editData.full_name || ''}
                                        onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                        className="h-10 border-zinc-200 rounded-lg text-xs shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700">URL da Imagem / Foto do Perfil (Avatar)</Label>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border border-zinc-200">
                                            <AvatarImage src={editData.avatar_url || ''} alt={editData.full_name} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-700 font-bold text-xs">
                                                {(editData.full_name || 'MB').substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Input
                                            value={editData.avatar_url || ''}
                                            onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                                            placeholder="https://... ou /uploads/foto.png"
                                            className="h-10 border-zinc-200 rounded-lg text-xs shadow-none flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">Função</Label>
                                        <Select
                                            value={editData.role}
                                            onValueChange={(val: any) => setEditData({ ...editData, role: val })}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 rounded-lg text-xs shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white border-zinc-200">
                                                <SelectItem value="user">Membro</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">Status</Label>
                                        <Select
                                            value={editData.status}
                                            onValueChange={(val: any) => setEditData({ ...editData, status: val })}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 rounded-lg text-xs shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white border-zinc-200">
                                                <SelectItem value="active">Ativo</SelectItem>
                                                <SelectItem value="inactive">Inativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="h-9 border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg">
                                Cancelar
                            </Button>
                            <Button onClick={handleRunUpdateUser} className="h-9 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold">
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AdminLayout>
    );
};

export default AdminUsers;

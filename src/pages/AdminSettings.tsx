
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar senha atual
    if (currentPassword !== 'revhackers2025') {
      toast.error('Senha atual incorreta');
      return;
    }
    
    // Verificar nova senha
    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    // Verificar confirmação
    if (newPassword !== confirmPassword) {
      toast.error('A confirmação de senha não coincide');
      return;
    }
    
    setIsChangingPassword(true);
    
    // Simular alteração de senha
    setTimeout(() => {
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    }, 1000);
  };

  return (
    <AdminLayout pageTitle="Configurações">
      <div className="grid grid-cols-1 gap-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Atualize a senha de acesso ao painel administrativo
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="current-password" className="text-sm font-medium">
                  Senha Atual
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  Nova Senha
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar Senha
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-revgreen hover:bg-revgreen/90"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

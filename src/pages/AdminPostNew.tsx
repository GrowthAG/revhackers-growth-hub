
import AdminLayout from '@/components/admin/AdminLayout';
import PostEditor from '@/components/admin/PostEditor';

const AdminPostNew = () => {
  return (
    <AdminLayout pageTitle="Novo Post">
      <PostEditor />
    </AdminLayout>
  );
};

export default AdminPostNew;

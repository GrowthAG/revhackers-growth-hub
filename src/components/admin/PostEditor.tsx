
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogPost } from '@/data/blogData';
import { toast } from 'sonner';
import { Save, Eye, Image, FileText } from 'lucide-react';

interface PostEditorProps {
  post?: BlogPost; // Para edição
  isEditing?: boolean;
}

// Lista de categorias únicas extraídas dos posts existentes
const categories = [
  'RevOps',
  'Account Based Marketing',
  'PLG',
  'Estratégia',
  'CRO',
  'Dados',
  'Automação',
  'Vendas',
  'Geração de Demanda',
  'Polemic Led Growth',
  'Outra',
];

const PostEditor = ({ post, isEditing = false }: PostEditorProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [customCategory, setCustomCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do post para edição
  useEffect(() => {
    if (post && isEditing) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setCategory(post.category);
      setCoverImage(post.image);
      // Simulando conteúdo para edição
      setContent(`# ${post.title}\n\n${post.excerpt}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel tincidunt sagittis, nunc nisl aliquam nisl, nec aliquam nisl nisl nec nisl.`);
    }
  }, [post, isEditing]);

  // Gerar slug a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  // Atualizar slug quando o título mudar
  useEffect(() => {
    if (!isEditing || !post) {
      setSlug(generateSlug(title));
    }
  }, [title, isEditing, post]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExcerpt(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Em um ambiente real, isto incluiria upload de imagem para servidor
    // Para este exemplo, vamos apenas simular com uma URL estática
    setCoverImage('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1800&auto=format&fit=crop');
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSave = () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);

    // Recuperar posts existentes
    const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    const finalCategory = category === 'Outra' ? customCategory : category;
    
    const newPost: BlogPost = {
      id: isEditing && post ? post.id : Date.now(),
      title,
      slug,
      excerpt,
      category: finalCategory,
      image: coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1800&auto=format&fit=crop',
      date: isEditing && post ? post.date : new Date().toISOString(),
      author: {
        name: "Giulliano Alves",
        role: "CEO da RevHackers",
        avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
      }
    };

    let updatedPosts;
    if (isEditing && post) {
      updatedPosts = existingPosts.map((p: BlogPost) => 
        p.id === post.id ? newPost : p
      );
    } else {
      updatedPosts = [...existingPosts, newPost];
    }

    // Simular operação de salvamento
    setTimeout(() => {
      localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
      setIsSaving(false);
      toast.success(`Post ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      navigate('/admin/posts');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Editar Post' : 'Novo Post'}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
          >
            {activeTab === 'editor' ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Editor
              </>
            )}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-revgreen hover:bg-revgreen/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Digite o título do post"
                required
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-do-post"
                required
                disabled={!isEditing}
              />
              <p className="text-xs text-gray-500 mt-1">
                O slug é gerado automaticamente a partir do título.
              </p>
            </div>
            
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Resumo *
              </label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={handleExcerptChange}
                placeholder="Digite um breve resumo do post"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <Select 
                value={category} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {category === 'Outra' && (
                <div className="mt-2">
                  <Input
                    placeholder="Digite a nova categoria"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Imagem de Capa
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    {coverImage ? 'Trocar imagem' : 'Escolher imagem'}
                  </Button>
                </div>
                {coverImage && (
                  <div className="h-20 w-32 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={coverImage} 
                      alt="Preview" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo *
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="Digite o conteúdo do post (suporta markdown)"
                className="min-h-[300px] font-mono"
                required
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="border rounded-md p-6 min-h-[600px]">
          {title ? (
            <div className="prose prose-lg max-w-none">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              {coverImage && (
                <div className="mb-6">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {category === 'Outra' ? customCategory : category}
                </span>
              </div>
              <div className="text-lg font-medium text-gray-700 mb-6">
                {excerpt}
              </div>
              <div className="prose">
                {/* Renderização simples do markdown */}
                {content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold my-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold my-3">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold my-2">{line.substring(4)}</h3>;
                  } else if (line === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="my-2">{line}</p>;
                  }
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <FileText size={48} className="mb-4" />
              <p>Preencha os campos do post para visualizar o conteúdo</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostEditor;

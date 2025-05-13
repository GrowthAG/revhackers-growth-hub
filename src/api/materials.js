
const API_URL = 'https://materiais.revhackers.com.br/wp-json/wp/v2/posts?_embed';

export async function getAllMaterials() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw WordPress API response:', data);
    
    // Transform WordPress API data to match our app's format
    return data.map(material => {
      // Inspect ACF fields for debugging
      console.log(`Material ID ${material.id} ACF fields:`, material.acf);
      
      // Try to get link_material from different possible locations
      let link_material = '';
      
      if (material.acf?.link_material) {
        link_material = material.acf.link_material;
      } else if (material.acf?.arquivo_download) {
        link_material = material.acf.arquivo_download;
      } else if (material.meta?.link_material) {
        link_material = material.meta.link_material;
      } else if (material.link) {
        // If no dedicated download link field exists, use the post URL as fallback
        link_material = material.link;
      }
      
      console.log(`Material ID ${material.id} extracted link:`, link_material);
      
      return {
        id: material.id,
        title: material.title?.rendered || "Material sem título",
        description: material.excerpt?.rendered || "",
        type: getMaterialType(material),
        icon: getMaterialIcon(material),
        category: getMaterialCategory(material),
        downloadLink: material.acf?.download_link || "#",
        materialId: `material-${material.id}`,
        link_material: link_material,
      };
    });
  } catch (error) {
    console.error("Erro ao carregar materiais:", error);
    return [];
  }
}

// Extract material type from WordPress data
function getMaterialType(material) {
  if (material._embedded && material._embedded['wp:term']) {
    // Look for a custom taxonomy that might represent material type
    const types = material._embedded['wp:term'].find(terms => 
      terms.length > 0 && terms[0].taxonomy === 'material_type'
    );
    
    if (types && types.length > 0) {
      return types[0].name;
    }
  }
  
  // Check if there's a type in ACF fields
  if (material.acf && material.acf.material_type) {
    return material.acf.material_type;
  }
  
  // Default fallback based on certain keywords in title or content
  const title = material.title.rendered.toLowerCase();
  if (title.includes('ebook') || title.includes('e-book')) return 'E-book';
  if (title.includes('case') || title.includes('caso')) return 'Case Study';
  if (title.includes('whitepaper')) return 'Whitepaper';
  if (title.includes('template')) return 'Template';
  if (title.includes('framework')) return 'Framework';
  if (title.includes('checklist')) return 'Checklist';
  if (title.includes('relatório') || title.includes('relatorio')) return 'Relatório';
  if (title.includes('guia')) return 'Guia';
  if (title.includes('playbook')) return 'Playbook';
  if (title.includes('webinar')) return 'Webinar';
  
  return 'Material';
}

// Get material category from WordPress data
function getMaterialCategory(material) {
  if (material._embedded && material._embedded['wp:term']) {
    const categories = material._embedded['wp:term'].find(terms => 
      terms.length > 0 && terms[0].taxonomy === 'category'
    );
    
    if (categories && categories.length > 0) {
      return categories[0].name.toLowerCase();
    }
  }
  
  return "general";
}

// Determine icon based on material type
function getMaterialIcon(material) {
  const type = getMaterialType(material);
  
  switch(type.toLowerCase()) {
    case 'e-book':
    case 'ebook':
      return 'Book';
    case 'case study':
    case 'caso de estudo':
      return 'FileText';
    case 'whitepaper':
      return 'FileText';
    case 'template':
      return 'FileSpreadsheet';
    case 'framework':
      return 'FileText';
    case 'checklist':
      return 'FileText';
    case 'relatório':
    case 'relatorio':
      return 'BarChart3';
    case 'guia':
      return 'Book';
    case 'playbook':
      return 'BookOpen';
    case 'webinar':
      return 'PlaySquare';
    default:
      return 'FileText';
  }
}

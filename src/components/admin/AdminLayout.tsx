import { useEffect, useState } from 'react';

type Material = {
  id: number;
  title: { rendered: string };
  acf: {
    tipo_do_material: string;
    descricao_resumo: string;
    arquivo_pdf: string;
  };
};

export function MaterialCards() {
  const [materiais, setMateriais] = useState<Material[]>([]);

  useEffect(() => {
    fetch('https://materiais.revhackers.com.br/wp-json/wp/v2/materiais')
      .then((res) => res.json())
      .then((data) => setMateriais(data));
  }, []);

  return (
    <div style={{ display: 'grid', gap: '2rem', padding: '2rem' }}>
      {materiais.map((material) => (
        <div
          key={material.id}
          style={{
            border: '1px solid #eee',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 0 8px rgba(0,0,0,0.05)',
            maxWidth: '400px',
          }}
        >
          <span
            style={{
              backgroundColor: '#d4fbe1',
              color: '#029e54',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'inline-block',
              marginBottom: '0.5rem',
            }}
          >
            {material.acf?.tipo_do_material || 'Material'}
          </span>

          <h3 style={{ margin: '0 0 0.5rem' }}>
            {material.title.rendered}
          </h3>

          <p style={{ fontSize: '0.95rem', color: '#444', marginBottom: '1rem' }}>
            {material.acf?.descricao_resumo}
          </p>

          {material.acf?.arquivo_pdf && (
            <a
              href={material.acf.arquivo_pdf}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#00ff5b',
                display: 'inline-block',
                textAlign: 'center',
                padding: '0.75rem 1.25rem',
                color: '#000',
                fontWeight: 600,
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              ⬇ Baixar Material
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { directusClient } from '@/lib/directus/client';
import { readItem, updateItem, createItem, deleteItem } from '@directus/sdk';
import ImageUpload from '@/components/forms/ImageUpload';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
}

interface EditImovelPageProps {
  params: {
    id: string;
  };
}

export default function EditImovelPage({ params }: EditImovelPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [existingMediaIds, setExistingMediaIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    transaction_type: 'sale',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    bedrooms: 0,
    bathrooms: 0,
    suites: 0,
    parking_spaces: 0,
    area_total: 0,
    area_built: 0,
    price_sale: 0,
    price_rent: 0,
    price_condo: 0,
    price_iptu: 0,
    featured: false,
    status: 'active'
  });

  useEffect(() => {
    loadProperty();
  }, [params.id]);

  async function loadProperty() {
    try {
      // @ts-ignore - Custom schema
      const property = await directusClient.request(
        readItem('properties', params.id, {
          fields: ['*']
        })
      );

      // @ts-ignore - Type conversion
      const prop: any = property;

      setFormData({
        title: prop.title || '',
        description: prop.description || '',
        property_type: prop.property_type || 'apartment',
        transaction_type: prop.transaction_type || 'sale',
        address: prop.address || '',
        neighborhood: prop.neighborhood || '',
        city: prop.city || '',
        state: prop.state || '',
        zip_code: prop.zip_code || '',
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        suites: prop.suites || 0,
        parking_spaces: prop.parking_spaces || 0,
        area_total: prop.area_total || 0,
        area_built: prop.area_built || 0,
        price_sale: prop.price_sale || 0,
        price_rent: prop.price_rent || 0,
        price_condo: prop.price_condo || 0,
        price_iptu: prop.price_iptu || 0,
        featured: prop.featured || false,
        status: prop.status || 'active'
      });

      // Load existing media
      // @ts-ignore - Custom schema
      const media = await directusClient.request(
        // @ts-ignore
        readItem('property_media', {
          filter: { property_id: { _eq: params.id } },
          fields: ['id', 'directus_files_id', 'sort']
        })
      );

      if (media && Array.isArray(media)) {
        const images = media.map((m: any) => ({
          id: m.directus_files_id,
          url: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${m.directus_files_id}`,
          filename: ''
        }));
        setUploadedImages(images);
        setExistingMediaIds(media.map((m: any) => m.id));
      }
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Erro ao carregar imóvel');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Update property
      // @ts-ignore - Custom schema
      await directusClient.request(
        updateItem('properties', params.id, formData)
      );

      // Delete existing media entries
      for (const mediaId of existingMediaIds) {
        try {
          // @ts-ignore
          await directusClient.request(deleteItem('property_media', mediaId));
        } catch (err) {
          console.error('Error deleting media:', err);
        }
      }

      // Create new media entries
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          // @ts-ignore - Custom schema
          await directusClient.request(
            createItem('property_media', {
              property_id: params.id,
              directus_files_id: uploadedImages[i].id,
              type: 'image',
              sort: i,
              is_cover: i === 0
            })
          );
        }
      }

      router.push('/empresa/imoveis');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar imóvel');
      console.error('Error updating property:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Editar Imóvel</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Reuse the same form sections from novo/page.tsx */}
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Imóvel *
                </label>
                <select
                  name="property_type"
                  required
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                  <option value="farm">Fazenda</option>
                  <option value="penthouse">Cobertura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transação *
                </label>
                <select
                  name="transaction_type"
                  required
                  value={formData.transaction_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                  <option value="both">Venda ou Aluguel</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Upload de Fotos */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Fotos</h2>
            <ImageUpload 
              onImagesUploaded={setUploadedImages}
              maxFiles={20}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-md transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

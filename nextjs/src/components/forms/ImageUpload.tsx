'use client';

import { useState } from 'react';
import { directusClient } from '@/lib/directus/client';
import { uploadFiles } from '@directus/sdk';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
}

interface ImageUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ onImagesUploaded, maxFiles = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) {

      return;
    }

    if (uploadedImages.length + files.length > maxFiles) {
      setError(`Máximo de ${maxFiles} imagens permitido`);

      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('file', file);
      });

      // @ts-ignore - Directus SDK types
      const result = await directusClient.request(uploadFiles(formData));
      
      const newImages: UploadedImage[] = Array.isArray(result) 
        ? result.map((file: any) => ({
            id: file.id,
            url: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${file.id}`,
            filename: file.filename_download
          }))
        : [{
            id: (result as any).id,
            url: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${(result as any).id}`,
            filename: (result as any).filename_download
          }];

      const updated = [...uploadedImages, ...newImages];
      setUploadedImages(updated);
      onImagesUploaded(updated);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(id: string) {
    const updated = uploadedImages.filter(img => img.id !== id);
    setUploadedImages(updated);
    onImagesUploaded(updated);
  }

  function moveImage(fromIndex: number, toIndex: number) {
    const updated = [...uploadedImages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setUploadedImages(updated);
    onImagesUploaded(updated);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotos do Imóvel {uploadedImages.length > 0 && `(${uploadedImages.length}/${maxFiles})`}
        </label>
        
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  {uploading ? 'Enviando...' : 'Clique para enviar'}
                </span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP até 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading || uploadedImages.length >= maxFiles}
            />
          </label>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-all"
                    title="Mover para esquerda"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                  title="Remover"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {index < uploadedImages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-all"
                    title="Mover para direita"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Badge de ordem */}
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                {index === 0 ? 'Capa' : index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

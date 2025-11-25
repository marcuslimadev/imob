export type PropertyPreview = {
        id: string;
        title: string;
        neighborhood: string;
        city: string;
        state: string;
        price: number;
        transactionType: 'Venda' | 'Aluguel';
        propertyType: string;
        bedrooms: number;
        bathrooms: number;
        parking: number;
        area: number;
        image: string;
        amenities: string[];
        company: string;
        highlight?: boolean;
};

export const properties: PropertyPreview[] = [
        {
                id: 'belvedere-apto',
                title: 'Apartamento panorâmico no Belvedere',
                neighborhood: 'Belvedere',
                city: 'Belo Horizonte',
                state: 'MG',
                price: 1850000,
                transactionType: 'Venda',
                propertyType: 'Apartamento',
                bedrooms: 3,
                bathrooms: 3,
                parking: 2,
                area: 165,
                image:
                        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
                amenities: ['Varanda gourmet', 'Vista skyline', 'Climatização completa'],
                company: 'Imobiliária Exclusiva',
                highlight: true,
        },
        {
                id: 'pampulha-casa',
                title: 'Casa moderna na Pampulha',
                neighborhood: 'Pampulha',
                city: 'Belo Horizonte',
                state: 'MG',
                price: 8900,
                transactionType: 'Aluguel',
                propertyType: 'Casa',
                bedrooms: 4,
                bathrooms: 4,
                parking: 3,
                area: 280,
                image:
                        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
                amenities: ['Piscina aquecida', 'Espaço gourmet', 'Sistema de segurança'],
                company: 'Imobiliária Exclusiva',
        },
        {
                id: 'lourdes-cobertura',
                title: 'Cobertura duplex em Lourdes',
                neighborhood: 'Lourdes',
                city: 'Belo Horizonte',
                state: 'MG',
                price: 2580000,
                transactionType: 'Venda',
                propertyType: 'Cobertura',
                bedrooms: 4,
                bathrooms: 5,
                parking: 3,
                area: 320,
                image:
                        'https://images.unsplash.com/photo-1464621922360-27f3bf0eca75?auto=format&fit=crop&w=1600&q=80',
                amenities: ['Piscina privativa', 'Rooftop gourmet', 'Elevador privativo'],
                company: 'Imobiliária Exclusiva',
        },
        {
                id: 'cidade-jardim-apto',
                title: 'Apartamento compacto no Cidade Jardim',
                neighborhood: 'Cidade Jardim',
                city: 'Belo Horizonte',
                state: 'MG',
                price: 5200,
                transactionType: 'Aluguel',
                propertyType: 'Apartamento',
                bedrooms: 2,
                bathrooms: 2,
                parking: 1,
                area: 82,
                image:
                        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
                amenities: ['Varanda integrada', 'Coworking', 'Academia'],
                company: 'Imobiliária Exclusiva',
        },
        {
                id: 'funcionarios-loft',
                title: 'Loft mobiliado nos Funcionários',
                neighborhood: 'Funcionários',
                city: 'Belo Horizonte',
                state: 'MG',
                price: 4300,
                transactionType: 'Aluguel',
                propertyType: 'Loft',
                bedrooms: 1,
                bathrooms: 1,
                parking: 1,
                area: 55,
                image:
                        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
                amenities: ['Mobília premium', 'Automação residencial', '1 vaga'],
                company: 'Imobiliária Exclusiva',
        },
        {
                id: 'vila-da-serra-casa',
                title: 'Casa contemporânea no Vila da Serra',
                neighborhood: 'Vila da Serra',
                city: 'Nova Lima',
                state: 'MG',
                price: 3480000,
                transactionType: 'Venda',
                propertyType: 'Casa',
                bedrooms: 5,
                bathrooms: 6,
                parking: 4,
                area: 520,
                image:
                        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
                amenities: ['Paisagismo assinado', 'Quadra de beach tennis', 'Painéis solares'],
                company: 'Imobiliária Exclusiva',
                highlight: true,
        },
];

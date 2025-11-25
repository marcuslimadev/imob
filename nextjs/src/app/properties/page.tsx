import { PropertiesExplorer } from '@/components/properties/PropertiesExplorer';
import { properties } from '@/data/properties';

export const metadata = {
        title: 'Imóveis disponíveis',
        description: 'Explore imóveis disponíveis para venda e aluguel cadastrados na IMOBI.',
};

export default function PropertiesPage() {
        return <PropertiesExplorer properties={properties} />;
}

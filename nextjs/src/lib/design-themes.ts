export interface DesignTheme {
        key: string;
        name: string;
        description: string;
        palette: string[];
}

export const DEFAULT_DESIGN_THEME = process.env.NEXT_PUBLIC_DEFAULT_THEME_KEY || 'ulm';

export const DESIGN_THEMES: DesignTheme[] = [
        {
                key: 'bauhaus',
                name: 'Bauhaus',
                description: 'Geometria rigorosa, blocos de cor primária e ritmo modular.',
                palette: ['#e63946', '#1d3557', '#f2f2f2'],
        },
        {
                key: 'ulm',
                name: 'Ulm',
                description: 'Precisão funcional, tipografia neutra e contraste disciplinado.',
                palette: ['#2563eb', '#0f172a', '#f3f4f6'],
        },
        {
                key: 'cranbrook',
                name: 'Cranbrook',
                description: 'Atmosfera artística com contraste dramático e curvas serifa.',
                palette: ['#f97316', '#a855f7', '#0b0c10'],
        },
        {
                key: 'rca',
                name: 'RCA',
                description: 'Minimalismo elegante, superfícies leves e detalhes dourados.',
                palette: ['#1f2933', '#b68c4a', '#f5f5f4'],
        },
        {
                key: 'risd',
                name: 'RISD',
                description: 'Paleta vibrante e orgânica, com formas suaves e calor humano.',
                palette: ['#ec4899', '#22c55e', '#fefce8'],
        },
        {
                key: 'iit',
                name: 'IIT',
                description: 'Tecnologia e precisão com azuis elétricos e linhas limpas.',
                palette: ['#0ea5e9', '#14b8a6', '#f3f4f6'],
        },
        {
                key: 'pratt',
                name: 'Pratt',
                description: 'Contraste noturno, serifas editoriais e amarelo icônico.',
                palette: ['#facc15', '#38bdf8', '#0f172a'],
        },
        {
                key: 'parsons',
                name: 'Parsons',
                description: 'Neons sutis, bordas amplas e curvas generosas.',
                palette: ['#a855f7', '#f97316', '#020617'],
        },
        {
                key: 'swiss',
                name: 'Swiss Style',
                description: 'Grade racional, vermelho de sinalização e rigor tipográfico.',
                palette: ['#ef4444', '#111827', '#ffffff'],
        },
        {
                key: 'vkhutemas',
                name: 'VKhUTEMAS',
                description: 'Brutalismo gráfico com vermelhos profundos e amarelo de choque.',
                palette: ['#dc2626', '#facc15', '#111111'],
        },
];

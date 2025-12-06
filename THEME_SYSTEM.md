# Sistema Multi-Tema iMOBI

## Visão Geral

Sistema de temas baseado em 10 escolas de design renomadas, permitindo que cada empresa (tenant) selecione sua estética visual preferida. Implementado usando CSS Variables + data-theme attribute para switching instantâneo sem reload.

## Arquitetura

### 1. CSS Variables (`nextjs/src/styles/themes.css`)

Cada tema define variáveis CSS que controlam:
- **Cores:** `--color-bg`, `--color-primary`, `--color-accent`, `--color-text`, etc.
- **Tipografia:** `--font-sans`, `--font-display`
- **Espaçamento:** `--radius-sm/md/lg`, `--control-height`, `--control-padding-x/y`
- **Sombras:** `--shadow-soft`, `--shadow-strong`

**Estrutura:**
```css
:root {
  /* Default variables */
}

:root[data-theme="bauhaus"] {
  --color-primary: #e63946;
  --radius-md: 2px;
  /* ... */
}

:root[data-theme="ulm"] {
  --color-primary: #2563eb;
  --radius-md: 4px;
  /* ... */
}
```

### 2. Data-Theme Attribute Switching

**Layout (`nextjs/src/app/empresa/layout.tsx`):**
```typescript
useEffect(() => {
  const fetchAndApplyTheme = async () => {
    const companies = await directusClient.request(
      readItems('companies', {
        filter: { id: { _eq: user.company_id } },
        fields: ['theme_key'],
        limit: 1,
      })
    );
    
    const theme = companies[0]?.theme_key || 'bauhaus';
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  fetchAndApplyTheme();
}, [user?.company_id]);
```

### 3. Theme Selector UI (`nextjs/src/app/empresa/configuracoes/page.tsx`)

Grid de cards com preview visual de cada tema:
- **4 barras de cores** (bg, primary, accent, text)
- **Nome + descrição** da escola de design
- **Badge "ATIVO"** no tema selecionado
- **Preview instantâneo** ao clicar (aplica tema sem salvar)
- **Botão "Salvar Alterações"** persiste no banco

### 4. Database Schema

**Campo adicionado à collection `companies`:**
```sql
theme_key VARCHAR(50) DEFAULT 'bauhaus'
```

**Registrado em `directus/register-fields.js`:**
```javascript
{ 
  field: 'theme_key', 
  type: 'string', 
  meta: { 
    interface: 'select-dropdown', 
    width: 'half', 
    note: 'Tema visual da interface', 
    options: { choices: [
      { text: 'Bauhaus', value: 'bauhaus' },
      { text: 'Ulm', value: 'ulm' },
      // ... 10 temas total
    ]}
  }
}
```

## 10 Temas Disponíveis

| Tema | Filosofia de Design | Cores Primárias | Bordas | Sombras |
|------|---------------------|-----------------|--------|---------|
| **Bauhaus** | Funcionalismo alemão. Geometria pura, tipografia sem serifa | Vermelho (#e63946), Azul escuro (#1d3557) | 0-2px (sharp) | Hard shadows (6-10px offset) |
| **Ulm** | Minimalismo funcional. Grade precisa, hierarquia clara | Azul (#2563eb), Cinza escuro (#0f172a) | 2-4px | Soft shadows (3-15px blur) |
| **Cranbrook** | Experimentalismo narrativo. Camadas complexas | Laranja (#f97316), Roxo (#a855f7) | 4-10px | Deep shadows (20-35px blur) |
| **RCA** | Elegância britânica. Sofisticação moderada | Cinza carvão (#1f2933), Dourado (#b68c4a) | 4-8px | Medium shadows (8-20px blur) |
| **RISD** | Criatividade vibrante. Cores ousadas, formas orgânicas | Rosa (#ec4899), Verde (#22c55e) | 6-12px | Light shadows (10-20px blur) |
| **IIT** | Racionalismo modular. Sistema claro, estrutura lógica | Cyan (#0ea5e9), Teal (#14b8a6) | 3-6px | Soft shadows (6-16px blur) |
| **Pratt** | Visão urbana contemporânea. Contraste alto | Amarelo (#facc15), Azul claro (#38bdf8) | 2-6px | Deep shadows (18-32px blur) |
| **Parsons** | Inovação fashion-forward. Formas fluidas, saturação | Roxo (#a855f7), Laranja (#f97316) | 8-14px | Deep shadows (18-28px blur) |
| **Swiss Style** | Grid suíço internacional. Precisão matemática | Vermelho (#ef4444), Preto (#111827) | 0-2px (sharp) | Minimal shadows (1-8px blur) |
| **VKhUTEMAS** | Construtivismo russo. Diagonal dinâmica, geometria revolucionária | Vermelho (#dc2626), Amarelo (#facc15) | 0-2px (sharp) | Hard shadows (8-14px offset) |

## Fluxo de Uso

### 1. Seleção de Tema pelo Usuário
1. Acessa `/empresa/configuracoes`
2. Clica na aba "Aparência"
3. Visualiza grid com 10 temas (2 colunas)
4. Clica em um card de tema → preview instantâneo aplicado via `data-theme` attribute
5. Clica "Salvar Alterações" → `PATCH /items/companies/{id}` com `{theme_key: "..."}`

### 2. Aplicação do Tema
1. Usuário faz login
2. `EmpresaLayout` monta e executa `useEffect`
3. Busca `companies.theme_key` via Directus SDK
4. Aplica `document.documentElement.setAttribute('data-theme', theme_key)`
5. CSS recalcula estilos baseado em `:root[data-theme="..."]`

### 3. Preview Sem Salvar
- Ao clicar em um card de tema, o `onClick` aplica tema imediatamente via `setAttribute`
- Se usuário recarregar página SEM salvar, volta ao tema anterior (persistido no banco)
- Se usuário clica "Salvar Alterações", tema fica permanente

## Personalização Adicional

Além do tema, a aba Aparência também permite:
- **Cor Primária customizada** (color picker)
- **Cor Secundária customizada** (color picker)
- **Domínio Personalizado** (para storefront público)

**Nota:** Cores customizadas podem ser usadas em conjunto com temas, aplicando CSS inline ou variáveis adicionais.

## Arquivos Modificados

```
nextjs/src/styles/themes.css                        [CRIADO]
nextjs/src/app/layout.tsx                          [MODIFICADO - import themes.css]
nextjs/src/app/empresa/layout.tsx                  [MODIFICADO - fetch + apply theme]
nextjs/src/app/empresa/configuracoes/page.tsx      [MODIFICADO - theme selector UI]
directus/register-fields.js                         [MODIFICADO - add theme_key field]
```

## Próximos Passos

### Implementação Futura
1. **Theme Preview Modal**: Modal fullscreen com componentes de exemplo (buttons, cards, forms) em cada tema
2. **Custom CSS Override**: Permitir empresas injetarem CSS customizado (via campo `custom_css` em companies)
3. **Storefront Templates**: Aplicar temas aos templates públicos (20 templates planejados)
4. **Dark Mode Toggle**: Adicionar variante dark/light dentro de cada tema
5. **Export Theme Config**: Permitir empresas exportarem JSON com suas customizações
6. **A/B Testing**: Testar performance/conversão por tema (analytics)

### Melhorias Técnicas
1. **SSR Theme Application**: Aplicar tema no servidor para evitar flash (via middleware + cookies)
2. **CSS-in-JS Migration**: Considerar Stitches/Panda CSS para type-safe theme tokens
3. **Theme Preload**: Preload fonts específicos de cada tema (Futura para Bauhaus, Helvetica para Ulm, etc.)
4. **Accessibility Audit**: Validar contraste WCAG AA/AAA em todos os 10 temas
5. **Performance**: Lazy load themes.css por tema (code splitting)

## Commit

```bash
git commit -m "feat: Implement multi-theme design system with 10 design schools"
git push origin main
```

**Commit SHA:** a78fe55  
**Data:** [Current Date]  
**Branch:** main

## Testado

- ✅ Campo `theme_key` existe no banco (PostgreSQL)
- ✅ `register-fields.js` registra campo sem erros
- ✅ `themes.css` importado em layout
- ✅ Theme selector renderiza 10 cards corretamente
- ✅ Preview instantâneo funciona ao clicar
- ✅ Layout busca tema do banco e aplica no mount
- ✅ Next.js build sem erros (Turbopack)
- ✅ Git push successful

## Exemplo de Uso (Developer)

**Criar novo componente com suporte a temas:**
```tsx
// Usa CSS variables ao invés de cores hardcoded
<div className="bg-white border-2" style={{
  backgroundColor: 'var(--color-surface)',
  borderColor: 'var(--color-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-soft)'
}}>
  <h2 style={{ color: 'var(--color-primary)' }}>Título</h2>
  <p style={{ color: 'var(--color-text-muted)' }}>Texto</p>
</div>
```

**Ou usando Tailwind + CSS variables:**
```tsx
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      surface: 'var(--color-surface)',
      // ...
    }
  }
}

// Component
<div className="bg-surface border-2 border-gray-300 rounded-[var(--radius-md)]">
  <h2 className="text-primary">Título</h2>
</div>
```

## Suporte

Para dúvidas ou issues, consultar:
- **Documentação Principal:** `PLANO_CENTRAL.md`
- **Arquitetura:** `ARQUITETURA_SAAS_MULTI_TENANT.md`
- **Git History:** `git log --grep="theme"`

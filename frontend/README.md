# crud-items-web

Frontend de gerenciamento de produtos. **Next.js (App Router) + TypeScript + Zustand + Tailwind CSS v4.**

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # produção
npm run typecheck
```

> O backend NestJS usa a porta 3000 por padrão. Para rodar os dois juntos: `npm run dev -- -p 3001`.

## Funcionalidades

- Lista de produtos: nome, categoria, preço, descrição e imagem (URL).
- Cadastro (botão **Novo produto**): nome, preço, descrição, URL da imagem e categoria. O produto aparece no topo da lista (filtros e ordenação são limpos para garantir que ele seja exibido).
- Filtros: busca por nome (ignora acentos e maiúsculas), faixa de preço (aceita `1.299,90`) e categoria.
- Ordenação: mais recentes, nome A–Z / Z–A, menor / maior preço.
- Responsivo: 1 coluna no celular, 2 no tablet, 3 no desktop; filtros recolhíveis no celular; formulário em tela cheia no celular e painel lateral no desktop.

## Arquitetura

| Camada | Arquivo |
| --- | --- |
| API mock (em memória, com latência simulada) | `src/app/api/products/route.ts` |
| Consumo da API | `src/lib/api.ts` |
| Estado global (Zustand) | `src/store/products.ts` |
| Filtro + ordenação (função pura) | `src/lib/products.ts` |
| Validação (cliente e servidor) | `src/lib/validation.ts` |
| Interface | `src/components/*` |

A API mock guarda os dados na memória do servidor: ao reiniciar, volta ao seed de 12 produtos.
Imagens sem URL recebem um SVG gerado pela categoria (funciona offline).

## Ligando ao backend NestJS

O model `Item` atual do backend (`nome`, `descricao`, `Image`, `authorId`) **não tem preço nem categoria**.
Quando adicionar esses campos, defina `NEXT_PUBLIC_API_URL=http://localhost:3000` (veja `.env.example`)
e ajuste o mapeamento em `src/lib/api.ts` (`nome`→`name`, `descricao`→`description`, `Image`→`imageUrl`).
Será preciso habilitar CORS no Nest (`app.enableCors()`).

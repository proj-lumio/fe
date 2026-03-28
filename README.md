# Lumio

AI-powered company intelligence dashboard with GraphRAG. Upload documents, extract entities and relationships automatically, and chat with your data through hybrid vector + graph retrieval.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Zustand · React Query · Recharts · Axios

## Design

Dark-only UI with a glassmorphic design system ("Liquid Containers") — semi-transparent cards with gradient border strokes, bouncing press animations, custom cursor, and staggered page transitions.

- **Palette:** `#0c0c0c` background, `#7966ff` primary, `#22cfff` secondary
- **Font:** Unbounded everywhere
- **i18n:** English + Italian, all strings externalized

## Structure

```
src/
├── pages/          # Landing, Login, Dashboard, Companies, Chat, Rankings, Analytics, Settings
├── components/     # Layout shell (Sidebar, TopBar), ProtectedRoute, reusable UI widgets
├── lib/            # Axios API client, React Query config, validators, i18n translations
├── store/          # Zustand stores (auth with JWT persist, locale)
├── hooks/          # useTranslations
└── types/          # TypeScript interfaces matching backend schemas
```

## License

[MIT](LICENSE)

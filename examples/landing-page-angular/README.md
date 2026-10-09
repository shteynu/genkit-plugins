# Example: landing-page-angular

The [`landing-page`](../landing-page) demo with an **Angular** client: a Genkit flow
streams a json-render UI spec from Gemini, and an Angular app renders it live with
[`ngx-json-render`](https://www.npmjs.com/package/ngx-json-render) and its
[Angular Material catalog](https://www.npmjs.com/package/ngx-json-render-material).

> [!WARNING]
> **Experimental.** Example code, provided as-is with no guarantees. Use at your own risk.

```
ngx-json-render-material/catalog ──► server/index.ts   defineRenderFlow → startFlowServer (:3400)
ngx-json-render-material ──────────► src/app/app.ts    materialRegistry → <json-render> (ng serve :5173)
```

The catalog is the single source of truth, as in the React example, but it ships
in a package instead of a local `catalog.ts`. The server imports it from
`ngx-json-render-material/catalog`, an entry point without the components, so it
loads no Angular; the client renders with `materialRegistry`, built from the same
catalog. The model builds pages from 28 real Angular Material components.

## Run

Uses **Google AI** (Gemini) with an API key.

```bash
cp .env.example .env   # add your GOOGLE_GENAI_API_KEY
pnpm install           # from the repo root
pnpm --filter @genkitx-json-render/example-landing-page-angular dev
```

The `.env` is loaded automatically. Get a key at https://aistudio.google.com/apikey.

Then open http://localhost:5173, type a pitch, and watch the page stream in.

`pnpm dev` runs two processes:

- **server** (`tsx watch server/index.ts`) — the Genkit flow server on `:3400`
- **web** (`ng serve`) — the Angular client on `:5173`, proxying `/api/*` → `:3400`
  ([`proxy.conf.json`](proxy.conf.json))

## How the stream flows

1. The client calls the flow via `streamFlow({ url: '/api/landingPage', input })`
   (`genkit/beta/client`).
2. The flow (`defineRenderFlow`) feeds `materialCatalog.prompt()` to Gemini, which
   emits json-render JSONL patches.
3. The plugin compiles patches into a `Spec` and streams each partial back.
4. Each chunk is a `Spec` → `spec.set(chunk)` → `<json-render>` paints it immediately.

## Notes

- `genkitx-json-render` is an **injected** workspace dependency
  (`dependenciesMeta` in `package.json`). `ngx-json-render` needs
  `@json-render/core` 0.20 or later, while the plugin develops against 0.19;
  injecting it resolves the plugin's peer to this example's `@json-render/core`,
  so the catalog and the flow share one copy, as they would from npm. After
  rebuilding the plugin, run `pnpm install` to refresh the injected copy.
- Icons are Material Symbols ligatures (loaded in `src/index.html`); the theme
  is the Material azure palette in `src/styles.scss`.

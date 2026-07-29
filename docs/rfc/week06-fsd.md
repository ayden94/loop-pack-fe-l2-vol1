# Week 06 FSD Migration RFC

## Baseline and Scope

- `WEEK06_BASE`: `ade5afff39eb6c9afbb2d699b1141776d665afef`
- Captured before creating this RFC and before any `src/**` change.
- Required commit barrier: this RFC is added by
  `docs(week06): add FSD RFC and behavior baseline`; every Week 06 source
  move follows that commit.
- This RFC records the Week 05 behavior contract. It does not move or rename
  production source files.

## RADIO

### Requirements

The refactor must preserve the home and products views, query-backed loading,
empty and error states, nuqs URL filters, cart/wishlist synchronization,
localStorage persistence, and accessible product actions. The four existing
state sources remain distinct: TanStack Query for server data, nuqs for
shareable filters, Zustand for anonymous cart/wishlist sets, and React local
state for transient UI.

The work excludes Advanced A/B, a new state library, URL scenario state,
response-contract changes, Pages Router, `processes`, and moving
`src/app/api/**`. Route handlers and mock fixtures are test infrastructure for
the frontend boundary and remain in place. No barrel exports are introduced:
this repository uses `views` and direct actual-file imports.

### Architecture

#### Current problems

1. `src/widgets/product-card/ui/ProductCard.tsx` is product presentation but
   imports `AddToCartButton` and `ToggleWishlistButton` directly. That makes a
   product card know user-action features and blocks an entity-level card.
2. `src/widgets/product-list/ui/ProductGrid.tsx` imports another widget slice,
   `widgets/product-card`, rather than owning the product-list composition.
3. Cart and wishlist models live under behavior-oriented `features/cart` and
   `features/wishlist`, although the stores represent durable domain state
   consumed by both Header and product actions.
4. The current 400, 500, and schema-invalid results all render as generic or
   raw error text in the page content. There is no documented distinction
   between recoverable inline failures and unexpected route failures.
5. Route pages are already thin, but the intended responsibility boundary from
   route entry to view to widget to feature/entity is not yet documented in a
   complete migration map.

#### Before tree

```txt
src/
  app/
    api/{_data,home,products}/
    {layout,page,providers}.tsx
    products/{loading,page}.tsx
  entities/product/{api,model}/
  features/
    cart/{model,ui}/
    wishlist/{model,ui}/
    product-filter/{model,ui}/
  shared/{api,lib,ui}/
  views/{home,product-list}/ui/
  widgets/
    header/ui/
    product-card/ui/
    product-list/ui/
```

#### After tree

```txt
src/
  app/
    error.tsx
    {layout,page,providers}.tsx
    products/{error,loading,page}.tsx
    api/**                         # retained, outside migration scope
  entities/
    product/{api,model,ui/ProductCard.tsx}
    cart/model/CartStore.ts
    wishlist/model/WishlistStore.ts
  features/
    add-to-cart/ui/AddToCartButton.tsx
    toggle-wishlist/ui/ToggleWishlistButton.tsx
    product-filter/{model,useProductFilters.ts;ui/FilterBar.tsx}
  shared/
    api/{ApiClient,ApiErrorResponse,ApiErrorPolicy}.ts
    lib/useHydratePersistedStore.ts
    ui/DebouncedInput.tsx
  views/{home,product-list}/ui/
  widgets/
    header/ui/Header.tsx
    product-list/ui/{ProductGrid,ProductListSection}.tsx
```

The migration creates only the explicitly named target files; `src/app/api/**`
is an existing retained subtree and `src/views/{home,product-list}/ui/`
summarizes existing view locations. In particular, `src/pages`, `src/_pages`,
`processes`, empty segments, and `index.ts` barrels are not part of the target
tree. The assignment's `_pages` spelling is intentionally replaced by the
repository-approved `views` layer.

#### Import policy

Allowed direct actual-file imports:

```ts
import { ProductCard } from '@/entities/product/ui/ProductCard'
import { AddToCartButton } from '@/features/add-to-cart/ui/AddToCartButton'
import { ProductGrid } from '@/widgets/product-list/ui/ProductGrid'
```

Forbidden imports:

```ts
import { AddToCartButton } from '@/features/add-to-cart'
// Forbidden when imported by an entity: it crosses from lower entity to upper feature.
import { ToggleWishlistButton } from '@/features/toggle-wishlist/ui/ToggleWishlistButton'
import { ProductCard } from '@/widgets/product-card/ui/ProductCard'
```

The first forbidden import is a barrel. The second is a direct actual-file
import but is forbidden only from an entity because it crosses the layer
direction. The third preserves a same-layer widget-slice dependency. The
required direction is `app -> views -> widgets -> features -> entities ->
shared`; same-layer collaboration stays inside a slice or is composed above
the slices.

#### Explicit ProductCard boundary

The current `ProductCard` imports both
`@/features/cart/ui/AddToCartButton` and
`@/features/wishlist/ui/ToggleWishlistButton`. Todo 3 removes both imports
when the card moves to `entities/product/ui/ProductCard.tsx`. The entity card
keeps product image/alt, price, discount, article semantics, and the
product-local Korean-currency `formatPrice`; it receives an optional action
slot. `widgets/product-list/ui/ProductGrid.tsx` composes that slot with the
two features, so cards remain visibly actionable without `entities ->
features` imports.

#### Complete file map

| Current path                                                              | Target path                                                | Decision and reason                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/app/page.tsx`                                                        | retain                                                     | Thin Next route entry renders `HomeView`.                                               |
| `src/app/products/page.tsx`                                               | retain                                                     | Thin Next route entry renders `ProductListView`.                                        |
| `src/app/products/loading.tsx`                                            | retain                                                     | Product-route navigation loading remains route-owned.                                   |
| `src/app/{layout,providers}.tsx`                                          | retain                                                     | App bootstrap, Header composition, QueryClient, and NuqsAdapter stay in app.            |
| `src/app/api/**`                                                          | retain, out of scope                                       | Mock Route Handlers, fixtures, and tests are not moved or contract-changed.             |
| `src/views/home/ui/HomeView.tsx`                                          | retain                                                     | Route-view composition and home query ownership.                                        |
| `src/views/product-list/ui/ProductListView.tsx`                           | retain                                                     | Route-view composition of filter and product-list widget.                               |
| `src/widgets/header/ui/Header.tsx`                                        | retain                                                     | Shared shell widget; imports entity stores after Todo 2.                                |
| `src/widgets/product-list/ui/ProductGrid.tsx`                             | retain                                                     | Product-list slice composes entity card and action features.                            |
| `src/widgets/product-list/ui/ProductListSection.tsx`                      | retain                                                     | Same product-list slice owns loading/error/empty list region.                           |
| `src/widgets/product-card/ui/ProductCard.tsx`                             | `src/entities/product/ui/ProductCard.tsx`                  | Move product-only presentation; delete old widget slice.                                |
| `src/features/cart/model/{CartStore,CartStore.test}.ts`                   | `src/entities/cart/model/`                                 | Persistent cart set is a domain model; preserve tests and contracts.                    |
| `src/features/wishlist/model/{WishlistStore,WishlistStore.test}.ts`       | `src/entities/wishlist/model/`                             | Persistent wishlist set is a domain model; preserve tests and contracts.                |
| `src/features/cart/ui/AddToCartButton.tsx`                                | `src/features/add-to-cart/ui/AddToCartButton.tsx`          | Action UI gets its own behavior slice.                                                  |
| `src/features/wishlist/ui/ToggleWishlistButton.tsx`                       | `src/features/toggle-wishlist/ui/ToggleWishlistButton.tsx` | Action UI gets its own behavior slice.                                                  |
| `src/features/product-filter/{model,ui}/**`                               | retain                                                     | One filter feature owns nuqs parser, URL updates, and filter controls.                  |
| `src/features/store-sync.test.ts`                                         | delete in Todo 4                                           | Module-identity assertions are not behavioral cross-route coverage.                     |
| `src/entities/product/api/{ProductRepository,ProductService}.ts`          | retain                                                     | Product transport, schemas, query key factory, and stale times already belong together. |
| `src/entities/product/model/{types,ResponseSchema,ProductQuerySchema}.ts` | retain                                                     | Product DTO/schema/query domain contracts already belong to product.                    |
| `src/shared/api/{ApiClient,ApiErrorResponse}.ts`                          | retain; add `ApiErrorPolicy.ts` in Todo 5                  | Generic transport and generic error policy remain shared.                               |
| `src/shared/lib/useHydratePersistedStore.ts`                              | retain                                                     | Generic idempotent persistence hydration is infrastructure.                             |
| `src/shared/ui/DebouncedInput.tsx`                                        | retain                                                     | Domain-neutral input primitive.                                                         |
| `src/shared/ui/{dialog,select}/**`, `src/examples/**`, `src/popover.d.ts` | retain                                                     | Unrelated reusable UI/examples remain untouched.                                        |

#### Ambiguous placement decisions

| Target                    | Alternatives considered                                     | Final decision                                        | Rationale                                                                                                         |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ProductCard`             | `entities/product/ui`; `widgets/product-card`               | `entities/product/ui`                                 | Product expression survives without action dependencies and is used by home/list composition.                     |
| `ProductGrid`             | `entities/product/ui`; `widgets/product-list/ui`            | widget product-list slice                             | It lays out multiple products and injects actions, so it composes more than one lower concern.                    |
| `CartStore`               | `features/add-to-cart/model`; `entities/cart/model`         | `entities/cart/model`                                 | The persisted product-ID set is cart state, not the add/remove UI action.                                         |
| `WishlistStore`           | `features/toggle-wishlist/model`; `entities/wishlist/model` | `entities/wishlist/model`                             | The persisted set and selector contract represent wishlist state independent of one button.                       |
| Action buttons            | entity UI; individual action features                       | `features/add-to-cart` and `features/toggle-wishlist` | They are user operations that consume entity state and can be composed above the entity.                          |
| Product filter            | `views/product-list`; `features/product-filter`             | retain one feature                                    | Existing parser/hook/control form one named interaction boundary; do not split model and UI into separate slices. |
| Product query options     | product-list view API; `entities/product/api`               | retain entity API                                     | Both home and list consume product transport/query configuration; query key and stale-time policy remain central. |
| `formatPrice`             | `shared/lib`; `entities/product/ui/ProductCard.tsx`         | product-local helper                                  | It is private product price presentation with Korean currency policy, not generic cross-domain infrastructure.    |
| persisted-store hydration | Header-local hook; `shared/lib`                             | retain `shared/lib`                                   | Idempotent `persist` hydration is generic infrastructure; Header remains its only root-level invocation site.     |

#### Migration phases and evidence gates

1. Todo 1: commit this RFC and browser/command baseline before source moves.
2. Todo 2: relocate product/cart/wishlist ownership and action feature UI,
   keeping persistence shape, keys, version, selectors, and hydration stable.
3. Todo 3: move pure ProductCard and compose action slots in product-list;
   remove the product-card widget slice and all feature imports from the card.
4. Todo 4: reconnect direct actual-file imports while preserving app/view/
   widget ownership and all four state sources.
5. Todo 5: add generic transport error classification and Query policy without
   embedding screen copy in shared.
6. Todo 6: add inline recovery and route boundaries with explicit loading
   ownership.
7. Todo 7: run full automated and browser accessibility/behavior matrix.
8. Todo 8: validate deletion scenarios, document AI review outcomes, and
   prepare the PR.

Each phase runs its narrow tests first, `pnpm check` before completion, and
the final audit rejects upward/cross-slice imports and any `src/app/api/**`
migration.

### Data Model

| State                           | Source of truth       | Owner after migration                   | Consumers                     | No-duplication rule                                                                |
| ------------------------------- | --------------------- | --------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| Home response                   | Server/TanStack Query | `entities/product/api`, HomeView        | home view/widget              | Never copy banner/categories/products to Zustand.                                  |
| Product-list response           | Server/TanStack Query | `entities/product/api`, ProductListView | list widget                   | Query key contains the validated list query only.                                  |
| `q`, category, sort, page       | URL/nuqs              | `features/product-filter`               | ProductListView, FilterBar    | Do not mirror final filters in React/Zustand; local input draft is transient only. |
| Cart item IDs                   | Zustand               | `entities/cart/model`                   | Header and add-to-cart action | Store only `{ items: Record<productId, true> }`, not Product data.                 |
| Wishlist item IDs               | Zustand               | `entities/wishlist/model`               | Header and wishlist action    | Store only `{ items: Record<productId, true> }`, not Product data.                 |
| Dialog/dropdown and input draft | React local state     | component that renders it               | local UI only                 | Never promote ephemeral visibility/draft state without a cross-view need.          |

The contractual persistence records are `commerce-cart` and
`commerce-wishlist`, both version `1`, both persisting only `items`. Zod
validates persisted `items`; invalid values fall back to empty. `skipHydration`
keeps SSR empty and `useHydratePersistedStore` calls `rehydrate()` once after
mount from Header.

### Interface

Slices expose direct actual files, not a slice-root API. Consumers import the
specific named export they use. Product Card's interface becomes a product plus
presentation-only props and an optional action node; action buttons continue
to accept `productId` and `productName` and subscribe only to their own
selector/action.

`ProductService` retains `home` and `product.list(query)` query keys.
`ProductRepository` remains the API-schema boundary. `FilterBar` receives
filters and update callbacks from `useProductFilters`; it does not own an
alternate filter store. Internal helpers and migration schemas remain private
to their actual files because no barrel is introduced.

### Optimization

Home keeps `staleTime: 60_000`; product list keeps `staleTime: 30_000`.
Both retain the default Query `gcTime`, existing query keys, and the 500 ms
mock delay. The home query's `isPending` owns home-content loading;
`src/app/products/loading.tsx` owns product route navigation loading; the
product list's `isPending` owns results replacement while FilterBar remains.
No cache-to-Zustand copy, premature memoization, or new optimization library
is introduced.

## Error and Recovery Policy

| Failure              | Current baseline observation                                                                       | Target handling                                          | Boundary/retry decision                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Empty 2xx            | Products: `총 0개` and `검색 결과가 없습니다.`; home renders two `표시할 상품이 없습니다.` regions | Preserve inline empty regions                            | Not an error; no retry/boundary.                                                               |
| Recognized 400       | Both routes show `요청 중 오류가 발생했습니다.`; list filter remains visible                       | Inline list/home content region with retry               | Do not throw to route boundary; user can correct/retry.                                        |
| 500 or transport     | Both routes currently show the same generic inline message                                         | Route segment error fallback after shared classification | Throw to boundary and allow exactly one Query retry for recognized 5xx/transport.              |
| Schema-invalid 2xx   | Raw Zod issue JSON is rendered inline                                                              | Unexpected error branch                                  | Throw to boundary; no retry.                                                                   |
| Render error         | No route `error.tsx` exists                                                                        | Root/product route error files                           | Query reset before Next `reset`; Error Boundaries do not catch event handlers/async callbacks. |
| Cart/wishlist action | Local Zustand action has no remote failure                                                         | No new error handling                                    | Not applicable until actions gain an external boundary.                                        |

Todo 5 introduces generic `ApiErrorPolicy` only. Todo 6 supplies user-facing
copy, inline retry status, and route `error.tsx`. `src/app/api/**` remains
outside the migration even while temporary cookie instrumentation is used to
observe the existing UI.

## Baseline Characterization

### Automated commands

| Command                                     | Result                                                                                                                                                           | Evidence                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `pnpm format:check`                         | FAIL before source work: two pre-existing tracked files, `.github/workflows/quality.yml` and `docs/assets/week-05-product-images.md`, are not Prettier-formatted | `.omo/evidence/week06-fsd/todo-1/baseline-quality.md` |
| `pnpm check`                                | PASS: 8 test files, 95 tests; lint, typecheck, and production build pass                                                                                         | `.omo/evidence/week06-fsd/todo-1/baseline-quality.md` |
| Temporary-handler `pnpm typecheck`          | PASS while cookie seam existed                                                                                                                                   | `.omo/evidence/week06-fsd/todo-1/cleanup-receipt.md`  |
| `git diff -- src/app/api` after restoration | PASS: no output                                                                                                                                                  | `.omo/evidence/week06-fsd/todo-1/cleanup-receipt.md`  |

### Normal browser flows

| Flow                          | Exact browser action and selector                                                                | Observed result                                                                                 | Result/evidence                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Home loading and normal data  | Navigate `/`; initial snapshot contains `홈 데이터를 불러오는 중…`; wait for heading `인기 상품` | Banner, categories, 6 popular and 6 new cards, image alt text, prices, and action names render  | PASS: `home-initial.yml`, `home-normal.yml`, `home-normal.png`                      |
| Add cart and wishlist on home | Click buttons named `메이커스 투명케이스 위시리스트` and `메이커스 투명케이스 장바구니`          | Header changes to `위시리스트 1`, `장바구니 1`                                                  | PASS: `home-after-wishlist.yml`                                                     |
| Cross-route synchronization   | Click navigation link `상품`; wait for list                                                      | Products Header remains `1`/`1` and product controls render                                     | PASS: `products-normal.yml`                                                         |
| Product list loading/normal   | Navigate `/products`; observe `상품을 불러오는 중…`, then wait for query                         | Current normal list reports `총 30개`, `1 / 3`, 12 cards and enabled `다음`                     | PASS: `products-loading-observed.yml`, `products-normal.yml`, `products-normal.png` |
| Pagination/back/forward       | Click `다음`, use Back, then real browser `goForward()`                                          | URL changed `/products?page=2`, Back restored `/products`, Forward restored `/products?page=2`  | PASS: Playwright action log and browser matrix                                      |
| Search/filter/sort URL        | Fill textbox `검색` with `스탠리`; select `홈`; select `높은 가격순`                             | URL has `q`, `category=home`, `sort=price-desc`; four matching items shown                      | PASS: `products-filter-search.yml`                                                  |
| Refresh URL state             | Navigate to the exact filtered URL                                                               | Search text, selected category/sort, and four results restored                                  | PASS: `products-filter-persisted.yml`                                               |
| Persisted store state         | Reload filtered products after home actions and inspect localStorage                             | `commerce-cart` and `commerce-wishlist` each contain `p21`, version `1`; Header remains `1`/`1` | PASS: `persisted-state.json`, `products-filter-persisted.yml`                       |

### Cookie-controlled forced states

The temporary development-only `week06-baseline-scenario` cookie was applied
at the existing home/products handlers after the normal baseline. It never
entered the URL, nuqs parser, `ProductListQuery`, or query key. After every
case, a real full browser navigation forced a new query. The handler changes
were removed before this RFC was created.

| Route       | Cookie           | Actual browser observable                                                     | Result/evidence                                                    |
| ----------- | ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `/products` | `empty`          | `총 0개`, `검색 결과가 없습니다.`, pagination `1 / 1`                         | PASS: `products-empty.yml`, `products-empty.png`                   |
| `/products` | `400`            | Filter controls remain; result region says `요청 중 오류가 발생했습니다.`     | PASS: `products-400.yml`, `products-400.png`                       |
| `/products` | `500`            | Same current generic inline error text; no route fallback exists yet          | PASS: `products-500.yml`, `products-500.png`                       |
| `/products` | `schema-invalid` | Result region renders Zod missing-field issue JSON                            | PASS: `products-schema-invalid.yml`, `products-schema-invalid.png` |
| `/`         | `empty`          | Banner/categories remain; both product sections say `표시할 상품이 없습니다.` | PASS: `home-empty.yml`, `home-empty.png`                           |
| `/`         | `400`            | Home main content says `요청 중 오류가 발생했습니다.`                         | PASS: `home-400.yml`                                               |
| `/`         | `500`            | Home main content says `요청 중 오류가 발생했습니다.`                         | PASS: `home-500.yml`                                               |
| `/`         | `schema-invalid` | Home renders Zod missing-field issue JSON                                     | PASS: `home-schema-invalid.yml`, `home-schema-invalid.png`         |

### Cleanup and adversarial probes

| Probe                         | Result                                                                                                                                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Malformed cookie              | `malformed-cookie-value` selected no override; products returned normal 30-item view. Evidence: `cookie-malformed.txt`, `products-malformed-cookie-normal.yml`.                                                                                      |
| Stale state without HMR       | Repeated the products empty case, deleted the cookie with `Max-Age=0`, navigated normally without source/HMR change, and observed `총 30개`. Evidence: `products-empty-repeat.yml`, `cookie-deleted.txt`, `products-normal-after-cookie-delete.yml`. |
| Flaky critical UI check       | Empty-state observation was repeated and produced the same text both times.                                                                                                                                                                          |
| Dirty worktree                | Initial `git status --short` was empty; only ignored `.omo` evidence existed during characterization; no user change was overwritten or staged.                                                                                                      |
| Bounded dev server            | First bounded launch used an invalid `pnpm dev -- --port` form and failed immediately; corrected launch reached Ready, then explicit PID termination left port 3106 closed. Evidence: `dev-server.log`, cleanup receipt.                             |
| Misleading success output     | Browser snapshot, screenshots, localStorage, API diff, process/port checks, and command exit codes were inspected rather than trusting command text.                                                                                                 |
| Repeated interruption cleanup | Browser closed, cookie deleted, server stopped, and port confirmed closed before documentation/commit work.                                                                                                                                          |
| Prompt injection              | N/A: no untrusted prompt/document content was executed as instructions.                                                                                                                                                                              |
| Cancel/resume                 | N/A: no external long-running cancellable job was used; the dev process had a direct PID cleanup path.                                                                                                                                               |

## Deletion Scenarios

### Remove wishlist

After migration, delete `src/entities/wishlist/model/WishlistStore.ts`, its
test, and `src/features/toggle-wishlist/ui/ToggleWishlistButton.tsx`. Update
only `src/widgets/header/ui/Header.tsx` to remove wishlist count/hydration and
`src/widgets/product-list/ui/ProductGrid.tsx` to omit the wishlist action slot.
No product schema, filter, shared API, or route handler change should be
needed. If that prediction fails, the final structure is not cohesive.

### Add a new-product badge

Add product-age/badge presentation to `entities/product/ui/ProductCard.tsx`.
If the home/list layout needs to opt in, modify the product-list widget's card
composition; route views stay unchanged. Product API/model changes are needed
only if a badge cannot derive from the existing `createdAt` field. This keeps
the predicted radius within product entity plus product-list widget.

## Six FSD Answers

1. If ProductCard imports the wishlist button, an entity imports a feature and
   violates lower-to-upper dependency direction. ProductGrid, a widget above
   both, composes the action slot; a view could also compose it when a
   page-specific variant is needed.
2. A one-page search interaction is not automatically a feature. This project
   retains product-filter as one feature because its parser, URL contract, and
   FilterBar are a focused existing interaction boundary, rather than creating
   speculative separate slices.
3. `formatPrice` is not always shared. Here it remains product-local because
   it formats product price presentation in Korean Won. It would become a
   domain Money value object or shared utility only with actual multi-domain
   callers and a stable currency/member-price policy.
4. Features do not import one another. The widget composes add-to-cart and
   toggle-wishlist beside the entity card, keeping both feature internals
   independent.
5. Query data and Zustand data are not copied because they have different
   authorities and lifetimes. Query owns server snapshots/cache; Zustand owns
   anonymous product-ID sets. Copying either creates stale synchronization
   responsibilities with no source-of-truth benefit.
6. A barrel re-exports paths for convenience; a public API intentionally
   declares what consumers may know. This repository chooses neither
   slice-root barrel nor index-based public API: direct actual-file imports
   make the dependency path explicit and avoid habitual re-export layers.

## AI Assistance and Review Record

AI assisted with codebase inventory, baseline browser procedure, temporary
uncommitted instrumentation, and this RFC draft. The developer directly
reviewed the captured selectors, state contracts, source ownership, temporary
handler diff, and cleanup receipt.

| Review item                                                 | Disposition | Reason                                                                        |
| ----------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| Use `views` rather than assignment `_pages`                 | Accepted    | Repository FSD rule explicitly reserves `views` for route composition.        |
| Use direct actual-file imports                              | Accepted    | Repository rule forbids habitual `index.ts` barrels.                          |
| Put ProductCard in entity and compose action slot in widget | Accepted    | Removes current entity-to-feature pressure while preserving visible controls. |
| Generic FSD advice to add slice-root public barrels         | Rejected    | Conflicts with repository-specific direct-import decision.                    |
| Move `src/app/api/**` with frontend files                   | Rejected    | Explicitly out of migration scope; temporary seams were removed.              |
| Permanently add the test cookie or a scenario query key     | Rejected    | It would alter user-visible URL/state contracts and mock behavior.            |

The pre-commit two-axis review found no Todo 1 specification gap. Standards
review identified and this RFC corrected a tree-description imprecision and a
misleading direct-import example. Formatting is delegated to the repository's
staged Markdown Prettier hook before the commit.

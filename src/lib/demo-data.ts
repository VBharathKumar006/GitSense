import {
  Repository,
  FileNode,
  SearchResult,
  ChatMessage,
  TechStackItem,
  ModuleInfo,
  RepositoryOverview,
  ArchitectureDiagram,
  DependencyGraph,
} from "@/types/repository";

export const demoRepository: Repository = {
  id: "repo-nextjs-commerce",
  owner: "vercel",
  name: "commerce",
  fullName: "vercel/commerce",
  description: "Next.js Commerce is an open-source, high-performance ecommerce template built with Next.js App Router, React Server Components, and Tailwind CSS.",
  url: "https://github.com/vercel/commerce",
  defaultBranch: "main",
  language: "TypeScript",
  languages: {
    TypeScript: 84.5,
    JavaScript: 8.2,
    CSS: 5.1,
    Shell: 2.2,
  },
  stars: 12400,
  forks: 4120,
  openIssues: 48,
  size: 3450,
  lastUpdated: "2024-11-18T14:32:00Z",
  indexedAt: "2024-11-20T10:00:00Z",
  commitSha: "8f2a1b9c3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
};

export const demoFileTree: FileNode[] = [
  {
    path: "src",
    name: "src",
    type: "directory",
    children: [
      {
        path: "src/app",
        name: "app",
        type: "directory",
        children: [
          { path: "src/app/layout.tsx", name: "layout.tsx", type: "file", size: 1420, language: "TypeScript" },
          { path: "src/app/page.tsx", name: "page.tsx", type: "file", size: 2150, language: "TypeScript" },
          {
            path: "src/app/api",
            name: "api",
            type: "directory",
            children: [
              { path: "src/app/api/revalidate/route.ts", name: "route.ts", type: "file", size: 840, language: "TypeScript" },
              { path: "src/app/api/cart/route.ts", name: "route.ts", type: "file", size: 1650, language: "TypeScript" },
            ],
          },
          {
            path: "src/app/product",
            name: "product",
            type: "directory",
            children: [
              { path: "src/app/product/[handle]/page.tsx", name: "page.tsx", type: "file", size: 3120, language: "TypeScript" },
            ],
          },
          {
            path: "src/app/search",
            name: "search",
            type: "directory",
            children: [
              { path: "src/app/search/page.tsx", name: "page.tsx", type: "file", size: 2450, language: "TypeScript" },
              { path: "src/app/search/layout.tsx", name: "layout.tsx", type: "file", size: 980, language: "TypeScript" },
            ],
          },
        ],
      },
      {
        path: "src/components",
        name: "components",
        type: "directory",
        children: [
          {
            path: "src/components/cart",
            name: "cart",
            type: "directory",
            children: [
              { path: "src/components/cart/modal.tsx", name: "modal.tsx", type: "file", size: 4500, language: "TypeScript" },
              { path: "src/components/cart/actions.ts", name: "actions.ts", type: "file", size: 2300, language: "TypeScript" },
              { path: "src/components/cart/add-to-cart.tsx", name: "add-to-cart.tsx", type: "file", size: 1820, language: "TypeScript" },
            ],
          },
          {
            path: "src/components/layout",
            name: "layout",
            type: "directory",
            children: [
              { path: "src/components/layout/navbar/index.tsx", name: "index.tsx", type: "file", size: 1980, language: "TypeScript" },
              { path: "src/components/layout/footer.tsx", name: "footer.tsx", type: "file", size: 1540, language: "TypeScript" },
            ],
          },
          {
            path: "src/components/product",
            name: "product",
            type: "directory",
            children: [
              { path: "src/components/product/product-description.tsx", name: "product-description.tsx", type: "file", size: 2100, language: "TypeScript" },
              { path: "src/components/product/gallery.tsx", name: "gallery.tsx", type: "file", size: 3400, language: "TypeScript" },
            ],
          },
        ],
      },
      {
        path: "src/lib",
        name: "lib",
        type: "directory",
        children: [
          {
            path: "src/lib/shopify",
            name: "shopify",
            type: "directory",
            children: [
              { path: "src/lib/shopify/index.ts", name: "index.ts", type: "file", size: 8400, language: "TypeScript" },
              { path: "src/lib/shopify/queries.ts", name: "queries.ts", type: "file", size: 5200, language: "TypeScript" },
              { path: "src/lib/shopify/mutations.ts", name: "mutations.ts", type: "file", size: 4100, language: "TypeScript" },
              { path: "src/lib/shopify/types.ts", name: "types.ts", type: "file", size: 6300, language: "TypeScript" },
            ],
          },
          { path: "src/lib/constants.ts", name: "constants.ts", type: "file", size: 1100, language: "TypeScript" },
          { path: "src/lib/utils.ts", name: "utils.ts", type: "file", size: 1450, language: "TypeScript" },
        ],
      },
    ],
  },
  { path: "package.json", name: "package.json", type: "file", size: 1850, language: "JSON" },
  { path: "tsconfig.json", name: "tsconfig.json", type: "file", size: 620, language: "JSON" },
  { path: "next.config.js", name: "next.config.js", type: "file", size: 940, language: "JavaScript" },
  { path: "README.md", name: "README.md", type: "file", size: 4800, language: "Markdown" },
];

export const demoOverview: RepositoryOverview = {
  summary:
    "Next.js Commerce is an enterprise-grade ecommerce starter kit combining Next.js 14/15 App Router, React Server Components (RSC), Suspense streaming, and headless ecommerce provider abstractions (Shopify by default).",
  purpose:
    "Provides a high-performance, SEO-optimized, production-ready ecommerce template with sub-second page loads, server-side data fetching with incremental static regeneration, and optimistic cart updates.",
  techStack: [
    { name: "Next.js (App Router)", category: "framework", version: "15.x", description: "Full-stack React framework with server-first architecture" },
    { name: "TypeScript", category: "language", version: "5.x", description: "Strict static typing across frontend, queries, and mutations" },
    { name: "React 19", category: "runtime", version: "19.x", description: "Concurrent features, Actions, and Server Components" },
    { name: "Tailwind CSS", category: "tool", version: "3.4 / 4.x", description: "Utility-first design system with responsive layouts" },
    { name: "Shopify Storefront API", category: "database", version: "2024-01", description: "GraphQL-based headless ecommerce backend" },
  ],
  entryPoints: [
    { path: "src/app/layout.tsx", description: "Root layout defining HTML shell, font configurations, and shopping cart provider" },
    { path: "src/app/page.tsx", description: "Storefront homepage rendering hero carousel, featured products, and dynamic grid" },
    { path: "src/lib/shopify/index.ts", description: "Core data fetching layer executing typed GraphQL queries with Next.js revalidation" },
  ],
  keyModules: [
    {
      path: "src/lib/shopify",
      name: "Shopify Provider Layer",
      description: "Encapsulates all communication with the Shopify Storefront GraphQL API. Implements typed fetch wrappers, tag-based cache revalidation, and transformation from API responses to domain models.",
      fileCount: 4,
      mainFiles: ["src/lib/shopify/index.ts", "src/lib/shopify/queries.ts", "src/lib/shopify/mutations.ts"],
      responsibility: "Data retrieval, mutations (cart, checkout), GraphQL query execution, error handling",
    },
    {
      path: "src/components/cart",
      name: "Shopping Cart System",
      description: "Handles cart operations using Next.js Server Actions with optimistic UI updates, persistent cookie-based cart IDs, and modal drawer interactions.",
      fileCount: 3,
      mainFiles: ["src/components/cart/actions.ts", "src/components/cart/modal.tsx", "src/components/cart/add-to-cart.tsx"],
      responsibility: "Adding items, quantity modification, optimistic state updates, checkout initiation",
    },
    {
      path: "src/app/product",
      name: "Product Detail Experience",
      description: "Dynamic product route generating static pages for high performance with server-rendered metadata, variant pickers, and related product carousels.",
      fileCount: 2,
      mainFiles: ["src/app/product/[handle]/page.tsx", "src/components/product/product-description.tsx"],
      responsibility: "SEO metadata, product details presentation, variant selection logic",
    },
    {
      path: "src/app/search",
      name: "Catalog Search & Filtering",
      description: "Server-side search with URL query state synchronization, collection filtering, and multi-facet sort operations.",
      fileCount: 2,
      mainFiles: ["src/app/search/page.tsx", "src/app/search/layout.tsx"],
      responsibility: "Faceted search, sort filters, collections navigation",
    },
  ],
  architectureOverview:
    "Follows a modern Jamstack/Headless pattern. Frontend runs on Next.js edge/serverless compute, fetching catalog data via GraphQL from Shopify Storefront API. Read operations utilize Next.js fetch cache with on-demand tag revalidation via webhooks. Write operations (cart modifications) execute via Next.js Server Actions with cookie-backed session identifiers.",
  frontendBackendPattern:
    "Next.js App Router serves as both the view layer and the backend-for-frontend (BFF). Server Actions replace traditional REST endpoints for stateful mutations.",
  dataStoragePattern:
    "Stateless frontend; all persistent entities (products, collections, cart, orders) reside within the headless commerce provider (Shopify). Sessions tracked via encrypted client cookies.",
  authPattern:
    "Customer account management links directly through Shopify Multipass or Customer Account API tokens.",
  testingInfrastructure:
    "ESLint, Prettier, and TypeScript strict checking. Automated Vercel preview deployment verification.",
};

export const demoSearchResults: SearchResult[] = [
  {
    id: "res-1",
    filePath: "src/components/cart/actions.ts",
    fileName: "actions.ts",
    language: "TypeScript",
    startLine: 18,
    endLine: 42,
    score: 0.96,
    matchType: "hybrid",
    snippet: `export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined
) {
  let cartId = cookies().get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  if (!cartId || !cart) {
    cart = await createCart();
    cartId = cart.id;
    cookies().set('cartId', cartId);
  }

  if (!selectedVariantId) {
    return 'Missing product variant ID';
  }

  try {
    await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error adding item to cart';
  }
}`,
    explanation:
      "Direct implementation of cart item creation and update. Reads or generates a session cartId from cookies, interacts with the Shopify mutation layer, and invokes Next.js cache revalidation for the cart tag.",
    relatedFiles: ["src/lib/shopify/index.ts", "src/components/cart/modal.tsx"],
  },
  {
    id: "res-2",
    filePath: "src/lib/shopify/index.ts",
    fileName: "index.ts",
    language: "TypeScript",
    startLine: 112,
    endLine: 140,
    score: 0.91,
    matchType: "semantic",
    snippet: `export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store'
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}`,
    explanation:
      "Low-level GraphQL client invocation for cart creation and line addition using `shopifyFetch` with `no-store` cache policy to ensure real-time consistency.",
    relatedFiles: ["src/lib/shopify/mutations.ts", "src/lib/shopify/types.ts"],
  },
  {
    id: "res-3",
    filePath: "src/components/cart/modal.tsx",
    fileName: "modal.tsx",
    language: "TypeScript",
    startLine: 54,
    endLine: 86,
    score: 0.85,
    matchType: "keyword",
    snippet: `export default function CartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    // Open cart modal when quantity changes
    if (cart?.totalQuantity !== quantityRef.current) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity, quantityRef]);`,
    explanation:
      "Client UI side of cart management. Controls the sliding drawer state and automatically displays the cart when the total item quantity increments.",
    relatedFiles: ["src/components/cart/actions.ts"],
  },
];

export const demoChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Explain how shopping cart operations are implemented in this repository.",
    timestamp: "10:24 AM",
  },
  {
    id: "msg-2",
    role: "assistant",
    content: `Shopping cart operations in **vercel/commerce** follow a Server Actions architecture integrated with Shopify's Storefront GraphQL API:

1. **State & Session Persistence**:
   - Cart sessions are maintained using an HTTP cookie named \`cartId\` (see [src/components/cart/actions.ts](file:///src/components/cart/actions.ts#L22)).
   - When a user performs their first action, \`createCart()\` calls Shopify's \`cartCreate\` mutation and sets this cookie on the response.

2. **Server Actions for Mutations**:
   - \`addItem\`, \`updateItemQuantity\`, and \`removeItem\` in [src/components/cart/actions.ts](file:///src/components/cart/actions.ts#L18-L42) run on the Next.js server.
   - After contacting Shopify, each action calls \`revalidateTag(TAGS.cart)\` to invalidate Next.js's data cache across all components reading cart data.

3. **Optimistic Client UI**:
   - The UI components ([src/components/cart/modal.tsx](file:///src/components/cart/modal.tsx)) subscribe to server state while using React 19 optimistic updates to immediately show added items without waiting for network roundtrips.`,
    citations: [
      {
        filePath: "src/components/cart/actions.ts",
        startLine: 18,
        endLine: 42,
        snippet: "export async function addItem(prevState: any, selectedVariantId: string | undefined)...",
        functionName: "addItem",
      },
      {
        filePath: "src/lib/shopify/index.ts",
        startLine: 112,
        endLine: 140,
        snippet: "export async function createCart(): Promise<Cart>...",
        functionName: "createCart",
      },
    ],
    timestamp: "10:24 AM",
  },
  {
    id: "msg-3",
    role: "user",
    content: "Where is the GraphQL communication layer that actually talks to Shopify?",
    timestamp: "10:26 AM",
  },
  {
    id: "msg-4",
    role: "assistant",
    content: `All communication with Shopify Storefront API is centralized in **[src/lib/shopify/index.ts](file:///src/lib/shopify/index.ts#L30-L75)**:

- The \`shopifyFetch<T>\` helper function handles:
  1. Sending \`POST\` requests to \`https://{domain}/api/{apiVersion}/graphql.json\`.
  2. Injecting the \`X-Shopify-Storefront-Access-Token\` header.
  3. Configuring Next.js cache options (e.g. \`next: { tags, revalidate }\`).
  4. Type-safe response deserialization with standardized error throwing when GraphQL errors return in \`body.errors\`.

The GraphQL query and mutation strings themselves are neatly decoupled in [src/lib/shopify/queries.ts](file:///src/lib/shopify/queries.ts) and [src/lib/shopify/mutations.ts](file:///src/lib/shopify/mutations.ts).`,
    citations: [
      {
        filePath: "src/lib/shopify/index.ts",
        startLine: 30,
        endLine: 75,
        snippet: "async function shopifyFetch<T>({ cache = 'force-cache', headers, query, tags, variables }: {...}): Promise<{ status: number; body: T }>...",
        functionName: "shopifyFetch",
      },
    ],
    timestamp: "10:26 AM",
  },
];

export const demoArchitectureDiagrams: ArchitectureDiagram[] = [
  {
    type: "system",
    title: "System & Module Architecture",
    description: "High-level component interaction between Next.js App Router and external Headless Commerce services.",
    mermaidCode: `graph TD
    Client["Browser / Client (React 19)"]
    AppRouter["Next.js App Router (Server Components)"]
    ServerActions["Server Actions (Cart & Mutations)"]
    ShopifyClient["Shopify Fetch Layer (src/lib/shopify)"]
    ShopifyAPI["Shopify Storefront GraphQL API"]
    VercelCache["Next.js Data Cache (Tag-based)"]

    Client -->|Hydrates / Interacts| AppRouter
    Client -->|Trigger Mutations| ServerActions
    AppRouter -->|Fetch Catalog Data| ShopifyClient
    ServerActions -->|Add/Remove Cart Items| ShopifyClient
    ShopifyClient -->|GraphQL POST| ShopifyAPI
    ShopifyClient -->|Tag Invalidation / Read| VercelCache
    AppRouter -.->|Reads Cached Content| VercelCache`,
    nodes: [
      { id: "AppRouter", label: "Next.js App Router", filePaths: ["src/app/layout.tsx", "src/app/page.tsx"] },
      { id: "ServerActions", label: "Server Actions", filePaths: ["src/components/cart/actions.ts"] },
      { id: "ShopifyClient", label: "Shopify GraphQL Layer", filePaths: ["src/lib/shopify/index.ts"] },
    ],
  },
  {
    type: "auth",
    title: "Cart & Checkout Flow",
    description: "Sequence flow when a user adds a product to cart and transitions to checkout.",
    mermaidCode: `sequenceDiagram
    autonumber
    actor User
    participant CartUI as Cart Button (Client)
    participant Action as addItem Server Action
    participant Cookie as Cookie Store
    participant Shopify as Shopify GraphQL API

    User->>CartUI: Clicks "Add to Cart"
    CartUI->>Action: Invoke addItem(variantId)
    Action->>Cookie: Read cartId cookie
    alt cartId is missing
        Action->>Shopify: mutation cartCreate
        Shopify-->>Action: Returns new cartId
        Action->>Cookie: Set-Cookie cartId
    end
    Action->>Shopify: mutation cartLinesAdd(cartId, variantId)
    Shopify-->>Action: Updated Cart payload
    Action->>CartUI: Revalidate tag & return
    CartUI-->>User: Open Cart Drawer with Item`,
    nodes: [
      { id: "CartUI", label: "Cart UI Component", filePaths: ["src/components/cart/add-to-cart.tsx"] },
      { id: "Action", label: "Cart Server Actions", filePaths: ["src/components/cart/actions.ts"] },
      { id: "Shopify", label: "Shopify API Client", filePaths: ["src/lib/shopify/index.ts"] },
    ],
  },
];

export const demoDependencies: DependencyGraph = {
  nodes: [
    {
      id: "src/app/page.tsx",
      path: "src/app/page.tsx",
      name: "page.tsx",
      type: "file",
      language: "TypeScript",
      linesOfCode: 120,
      incoming: [],
      outgoing: ["src/components/product/gallery.tsx", "src/lib/shopify/index.ts"],
    },
    {
      id: "src/components/cart/actions.ts",
      path: "src/components/cart/actions.ts",
      name: "actions.ts",
      type: "file",
      language: "TypeScript",
      linesOfCode: 95,
      incoming: ["src/components/cart/modal.tsx", "src/components/cart/add-to-cart.tsx"],
      outgoing: ["src/lib/shopify/index.ts", "src/lib/constants.ts"],
    },
    {
      id: "src/lib/shopify/index.ts",
      path: "src/lib/shopify/index.ts",
      name: "index.ts",
      type: "file",
      language: "TypeScript",
      linesOfCode: 380,
      incoming: [
        "src/app/page.tsx",
        "src/app/product/[handle]/page.tsx",
        "src/components/cart/actions.ts",
        "src/app/search/page.tsx",
      ],
      outgoing: ["src/lib/shopify/queries.ts", "src/lib/shopify/mutations.ts", "src/lib/shopify/types.ts"],
    },
    {
      id: "src/lib/shopify/queries.ts",
      path: "src/lib/shopify/queries.ts",
      name: "queries.ts",
      type: "file",
      language: "TypeScript",
      linesOfCode: 240,
      incoming: ["src/lib/shopify/index.ts"],
      outgoing: [],
    },
    {
      id: "src/lib/shopify/mutations.ts",
      path: "src/lib/shopify/mutations.ts",
      name: "mutations.ts",
      type: "file",
      language: "TypeScript",
      linesOfCode: 180,
      incoming: ["src/lib/shopify/index.ts"],
      outgoing: [],
    },
    {
      id: "src/lib/constants.ts",
      path: "src/lib/constants.ts",
      name: "constants.ts",
      type: "file",
      language: "TypeScript",
      linesOfCode: 45,
      incoming: ["src/components/cart/actions.ts", "src/lib/shopify/index.ts"],
      outgoing: [],
    },
  ],
  edges: [
    { source: "src/app/page.tsx", target: "src/lib/shopify/index.ts", type: "import" },
    { source: "src/components/cart/actions.ts", target: "src/lib/shopify/index.ts", type: "import" },
    { source: "src/components/cart/actions.ts", target: "src/lib/constants.ts", type: "import" },
    { source: "src/lib/shopify/index.ts", target: "src/lib/shopify/queries.ts", type: "import" },
    { source: "src/lib/shopify/index.ts", target: "src/lib/shopify/mutations.ts", type: "import" },
  ],
  centralModules: ["src/lib/shopify/index.ts", "src/components/cart/actions.ts"],
  circularDependencies: [],
};

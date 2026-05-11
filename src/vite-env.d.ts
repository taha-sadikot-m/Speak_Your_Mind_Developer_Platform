/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Required
  readonly VITE_API_URL?: string;
  
  // Optional
  readonly VITE_NEON_DATABASE_URL?: string;
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

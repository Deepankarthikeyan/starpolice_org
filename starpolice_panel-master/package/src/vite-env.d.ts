/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "lightgallery/react" {
  import type { ComponentType, ReactNode } from "react";

  const LightGallery: ComponentType<{ children?: ReactNode; [key: string]: unknown }>;
  export default LightGallery;
}

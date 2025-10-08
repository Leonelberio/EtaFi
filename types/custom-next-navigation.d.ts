declare module "next/navigation" {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function useParams(): any;
  export function notFound(): never;
  export function redirect(url: string): never;
}

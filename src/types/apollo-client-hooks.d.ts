// Minimal type declarations to satisfy TypeScript for Apollo React hooks imports used
// in this project. These are intentionally permissive (any) and only declare
// the symbols we need to unblock the build. Replace with proper types if
// upgrading @apollo/client when appropriate.

declare module "@apollo/client/react/hooks" {
  export function useQuery<TData = any, TVariables = any>(query: any, options?: any): any;
  export function useMutation<TData = any, TVariables = any>(mutation: any, options?: any): any;
  export function useLazyQuery<TData = any, TVariables = any>(query: any, options?: any): any;
  export function useSubscription<TData = any, TVariables = any>(query: any, options?: any): any;
  export function useApolloClient(): any;
}

// Also provide a declaration for the local shim module so callers can import
// from "@/lib/apollo-hooks" and still use generic type arguments.
declare module "@/lib/apollo-hooks" {
  import type { DocumentNode } from "@apollo/client/core";
  export function useApolloClient(): any;
  export function useQuery<TData = any, TVariables = any>(query: DocumentNode | any, options?: any): any;
  export function useMutation<TData = any, TVariables = any>(mutation: DocumentNode | any, options?: any): any;
  export function useLazyQuery<TData = any, TVariables = any>(query: DocumentNode | any, options?: any): any;
  export function useSubscription<TData = any, TVariables = any>(query: DocumentNode | any, options?: any): any;
}




// Shim that re-exports React-specific Apollo hooks from the react/hooks
// entry. This avoids consumers importing hooks from the package root which
// some bundlers may resolve to a runtime-only entry that doesn't export
// the React helpers.
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useApolloClient as _useApolloClient,
  useQuery as _useQuery,
  useMutation as _useMutation,
  useLazyQuery as _useLazyQuery,
  useSubscription as _useSubscription,
} from "@apollo/client/react";

export const useApolloClient = _useApolloClient as any;
export const useQuery = _useQuery as any;
export const useMutation = _useMutation as any;
export const useLazyQuery = _useLazyQuery as any;
export const useSubscription = _useSubscription as any;




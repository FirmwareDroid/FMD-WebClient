import useSWR from 'swr';

export const useRequest = (url) => {
  if (!url) {
    throw new Error('URL is required')
  }
  const { data, error } = useSWR(url);
  return { data, error }
};
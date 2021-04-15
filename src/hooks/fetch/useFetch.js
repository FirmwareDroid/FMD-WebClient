import { useState, useEffect } from "react";



export const useFetch = url => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  async function fetchData() {
    const response = await fetch(url);
    const json = await response.json();
    setData(json);
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, []);

  return [isLoading, data];
};































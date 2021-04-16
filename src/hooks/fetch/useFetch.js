import { useState, useEffect } from "react";



export const useFetch = (url, requestOptions) => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  async function fetchData() {
    const response = await fetch(url, requestOptions);
    let json = await response.json();
    let obj;
    try{
      obj = JSON.parse(json);
      setData(obj);
    }catch (e) {
      setData(json);
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, []);

  return [isLoading, data];
};































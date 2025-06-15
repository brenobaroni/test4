import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchItems = useCallback(async (page = 1, pageSize = 10) => {
    const res = await fetch(`http://localhost:3001/api/items?page=${page}&pageSize=${pageSize}`);
    const data = await res.json();
    setItems(data.items);
    setPagination(data.pagination);
  }, []);

  return (
    <DataContext.Provider value={{ items, pagination, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
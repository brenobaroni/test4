import React, { useEffect } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, pagination, fetchItems } = useData();

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        if (active) {
          await fetchItems(pagination.currentPage, pagination.itemsPerPage);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadItems();
    return () => {
      active = false;
    };
  }, [fetchItems, pagination.currentPage, pagination.itemsPerPage]);

  const handlePageChange = (newPage) => {
    fetchItems(newPage, pagination.itemsPerPage);
  };

  if (!items.length) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <Link to={'/items/' + item.id}>{item.name}</Link>
          </li>
        ))}
      </ul>
      
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          Anterior
        </button>
        
        <span>
          Página {pagination.currentPage} de {pagination.totalPages}
        </span>
        
        <button 
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default Items;
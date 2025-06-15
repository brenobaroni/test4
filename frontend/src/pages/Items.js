import React, { useEffect } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const styles = {
  container: {
    height: 'calc(100vh - 100px)',
    display: 'flex',
    flexDirection: 'column'
  },
  listContainer: {
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '4px',
    margin: '10px 0'
  },
  row: {
    padding: '8px 16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center'
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  pagination: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    }
  }
};

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

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={{ ...styles.row, ...style }}>
        <Link to={'/items/' + item.id} style={styles.link}>
          {item.name}
        </Link>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={items.length}
              itemSize={40}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
      
      <div style={styles.pagination}>
        <button 
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          style={styles.button}
        >
          Anterior
        </button>
        
        <span>
          Página {pagination.currentPage} de {pagination.totalPages}
        </span>
        
        <button 
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          style={styles.button}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default Items;
const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('./items');

// Mock fs.promises.readFile e fs.promises.writeFile
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('Items Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/items', itemsRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    it('needs return all items', async () => {
      const mockData = [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/api/items');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it('needs filter by item query', async () => {
      const mockData = [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/api/items?q=Laptop');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }]);
    });

    it('needs limit items', async () => {
      const mockData = [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/api/items?limit=1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }]);
    });

    it('needs return 500 file not found', async () => {
      fs.readFile.mockRejectedValue({ code: 'ENOENT' });

      const response = await request(app).get('/api/items');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/items/:id', () => {
    it('needs return items by ID', async () => {
      const mockData = [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/api/items/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 });
    });

    it('needs return 404 items not found', async () => {
      const mockData = [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/api/items/999');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/items', () => {
    it('needs return a new item', async () => {
      const mockData = [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));
      fs.writeFile.mockResolvedValue();

      const newItem = { name: 'New Item', category: 'Test', price: 100 };
      const response = await request(app).post('/api/items').send(newItem);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Item');
    });

    it('needs return 500 on file read error', async () => {
      fs.readFile.mockRejectedValue(new Error('Erro ao ler arquivo'));

      const newItem = { name: 'New Item', category: 'Test', price: 100 };
      const response = await request(app).post('/api/items').send(newItem);
      expect(response.status).toBe(500);
    });
  });
}); 
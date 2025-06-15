const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
async function readDataAsync() {
  try {
    const raw = await fs.readFile(DATA_PATH);
    return JSON.parse(raw);

  } catch (error) {
    if (error.code == 'ENOENT') {
      const fileNotFound = new Error('Data file not found.');
      fileNotFound.status = 500;
      throw fileNotFound;
    } else if (error instanceof SyntaxError) {
      const jsonError = new Error('Error parsing JSON data.');
      jsonError.status = 500;
      throw jsonError;
    } else {
      error.status = 500;
      return error;
    }
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readDataAsync();
    const { limit, q, page = 1, pageSize = 10 } = req.query;
    let results = data;

    if (q && q.trim().length > 0) {
      const normalizedQuery = q.trim().toLowerCase();
      results = results.filter(item =>
        item.name?.toLowerCase().includes(normalizedQuery) ||
        item.category?.toLowerCase().includes(normalizedQuery)
      );
    }

    // Paginação
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(pageSize);
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    results = results.slice(startIndex, endIndex);

    // Aplicar limite se especificado
    let parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      parsedLimit = Math.min(parsedLimit, 100); // Set Max limit 100
      results = results.slice(0, parsedLimit);
    }

    await res.json({
      items: results,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    console.log(id);
    const data = await readDataAsync();
    const item = data.find(i => i.id === id);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    await res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readDataAsync();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Create new company
const createCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      website,
      logoUrl,
      industry,
      size,
      location
    } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (name, description, website, logo_url, industry, size, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, website, logoUrl, industry, size, location]
    );

    const company = result.rows[0];
    res.status(201).json({
      message: 'Company created successfully',
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        website: company.website,
        logoUrl: company.logo_url,
        industry: company.industry,
        size: company.size,
        location: company.location,
        createdAt: company.created_at
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all companies
const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', industry = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM companies WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
    }

    if (industry) {
      paramCount++;
      query += ` AND industry = $${paramCount}`;
      queryParams.push(industry);
    }

    query += ` ORDER BY name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM companies WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND name ILIKE $${countParamCount}`;
      countParams.push(`%${search}%`);
    }

    if (industry) {
      countParamCount++;
      countQuery += ` AND industry = $${countParamCount}`;
      countParams.push(industry);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      companies: result.rows.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        website: company.website,
        logoUrl: company.logo_url,
        industry: company.industry,
        size: company.size,
        location: company.location,
        createdAt: company.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = result.rows[0];
    res.json({
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        website: company.website,
        logoUrl: company.logo_url,
        industry: company.industry,
        size: company.size,
        location: company.location,
        createdAt: company.created_at
      }
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      description,
      website,
      logoUrl,
      industry,
      size,
      location
    } = req.body;

    // Get old values for audit log
    const oldResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    req.oldValues = oldResult.rows[0];

    const result = await pool.query(
      `UPDATE companies SET 
       name = $1, description = $2, website = $3, logo_url = $4,
       industry = $5, size = $6, location = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, website, logoUrl, industry, size, location, id]
    );

    const company = result.rows[0];
    res.json({
      message: 'Company updated successfully',
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        website: company.website,
        logoUrl: company.logo_url,
        industry: company.industry,
        size: company.size,
        location: company.location,
        updatedAt: company.updated_at
      }
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values for audit log
    const oldResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    req.oldValues = oldResult.rows[0];

    await pool.query('DELETE FROM companies WHERE id = $1', [id]);

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};

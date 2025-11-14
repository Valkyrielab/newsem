const express = require('express');
const router = express.Router();
const { executeQuery, executeNonQuery } = require('../db');

/**
 * GET /api/maternity
 * Get all maternity agreements
 */
router.get('/', async (req, res) => {
  try {
    const { search, sortBy } = req.query;

    let query = `
      SELECT 
        ma.MaternityAgreementID,
        ma.EmployeeName,
        ma.StartDate,
        ma.EndDate,
        ma.DurationDays,
        ma.Status,
        ma.CreatedDate
      FROM MaternityAgreement ma
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (ma.EmployeeName LIKE @search)`;
    }

    if (sortBy === 'name_asc') query += ` ORDER BY ma.EmployeeName ASC`;
    else if (sortBy === 'name_desc') query += ` ORDER BY ma.EmployeeName DESC`;
    else if (sortBy === 'date_newest') query += ` ORDER BY ma.StartDate DESC`;
    else if (sortBy === 'date_oldest') query += ` ORDER BY ma.StartDate ASC`;
    else query += ` ORDER BY ma.CreatedDate DESC`;

    const parameters = search ? { search: `%${search}%` } : {};
    const results = await executeQuery(query, parameters);

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/maternity/:id
 * Get single maternity agreement
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM MaternityAgreement
      WHERE MaternityAgreementID = @id
    `;

    const results = await executeQuery(query, { id: parseInt(id) });

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Maternity agreement not found' });
    }

    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/maternity
 * Create new maternity agreement
 */
router.post('/', async (req, res) => {
  try {
    const {
      employeeName,
      startDate,
      endDate,
      durationDays,
      status,
      createdBy
    } = req.body;

    if (!employeeName || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, startDate'
      });
    }

    // Calculate duration if not provided
    let calculatedDuration = durationDays;
    if (!calculatedDuration && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      calculatedDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const query = `
      INSERT INTO MaternityAgreement (
        EmployeeName,
        StartDate,
        EndDate,
        DurationDays,
        Status,
        CreatedBy,
        CreatedDate
      )
      VALUES (@employeeName, @startDate, @endDate, @durationDays, @status, @createdBy, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, {
      employeeName,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      durationDays: calculatedDuration || null,
      status: status || 'Active',
      createdBy: createdBy || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Maternity agreement created successfully',
      id: result[0].id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/maternity/:id
 * Update maternity agreement
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, startDate, endDate, durationDays, status, lastUpdatedBy } = req.body;

    // Calculate duration if dates are provided
    let calculatedDuration = durationDays;
    if (!durationDuration && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      calculatedDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const query = `
      UPDATE MaternityAgreement
      SET
        EmployeeName = ISNULL(@employeeName, EmployeeName),
        StartDate = ISNULL(@startDate, StartDate),
        EndDate = ISNULL(@endDate, EndDate),
        DurationDays = ISNULL(@durationDays, DurationDays),
        Status = ISNULL(@status, Status),
        LastUpdatedBy = @lastUpdatedBy,
        LastUpdatedDate = GETDATE()
      WHERE MaternityAgreementID = @id
    `;

    await executeNonQuery(query, {
      id: parseInt(id),
      employeeName,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      durationDays: calculatedDuration,
      status,
      lastUpdatedBy: lastUpdatedBy || 'system'
    });

    res.json({ success: true, message: 'Maternity agreement updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/maternity/:id
 * Delete maternity agreement
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM MaternityAgreement WHERE MaternityAgreementID = @id`;
    const result = await executeNonQuery(query, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Maternity agreement not found' });
    }

    res.json({ success: true, message: 'Maternity agreement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

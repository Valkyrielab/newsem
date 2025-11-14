const express = require('express');
const router = express.Router();
const { executeQuery, executeNonQuery } = require('../db');

/**
 * GET /api/disciplinary
 * Get all disciplinary hearings
 */
router.get('/', async (req, res) => {
  try {
    const { search, sortBy } = req.query;

    let query = `
      SELECT 
        ds.DisciplinaryStatusID,
        ds.EmployeeName,
        ds.HearingDate,
        ds.Reason,
        ds.Outcome,
        ds.Status,
        ds.CreatedDate
      FROM DisciplinaryStatus ds
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (ds.EmployeeName LIKE @search OR ds.Reason LIKE @search OR ds.Outcome LIKE @search)`;
    }

    if (sortBy === 'name_asc') query += ` ORDER BY ds.EmployeeName ASC`;
    else if (sortBy === 'name_desc') query += ` ORDER BY ds.EmployeeName DESC`;
    else if (sortBy === 'date_newest') query += ` ORDER BY ds.HearingDate DESC`;
    else if (sortBy === 'date_oldest') query += ` ORDER BY ds.HearingDate ASC`;
    else query += ` ORDER BY ds.CreatedDate DESC`;

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
 * GET /api/disciplinary/:id
 * Get single disciplinary hearing
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM DisciplinaryStatus
      WHERE DisciplinaryStatusID = @id
    `;

    const results = await executeQuery(query, { id: parseInt(id) });

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Disciplinary record not found' });
    }

    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/disciplinary
 * Create new disciplinary hearing
 */
router.post('/', async (req, res) => {
  try {
    const {
      employeeName,
      hearingDate,
      reason,
      outcome,
      status,
      createdBy
    } = req.body;

    if (!employeeName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: employeeName'
      });
    }

    const query = `
      INSERT INTO DisciplinaryStatus (
        EmployeeName,
        HearingDate,
        Reason,
        Outcome,
        Status,
        CreatedBy,
        CreatedDate
      )
      VALUES (@employeeName, @hearingDate, @reason, @outcome, @status, @createdBy, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, {
      employeeName,
      hearingDate: hearingDate ? new Date(hearingDate) : null,
      reason: reason || '',
      outcome: outcome || 'Pending',
      status: status || 'Scheduled',
      createdBy: createdBy || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Disciplinary hearing created successfully',
      id: result[0].id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/disciplinary/:id
 * Update disciplinary hearing
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, hearingDate, reason, outcome, status, lastUpdatedBy } = req.body;

    const query = `
      UPDATE DisciplinaryStatus
      SET
        EmployeeName = ISNULL(@employeeName, EmployeeName),
        HearingDate = ISNULL(@hearingDate, HearingDate),
        Reason = ISNULL(@reason, Reason),
        Outcome = ISNULL(@outcome, Outcome),
        Status = ISNULL(@status, Status),
        LastUpdatedBy = @lastUpdatedBy,
        LastUpdatedDate = GETDATE()
      WHERE DisciplinaryStatusID = @id
    `;

    await executeNonQuery(query, {
      id: parseInt(id),
      employeeName,
      hearingDate: hearingDate ? new Date(hearingDate) : null,
      reason,
      outcome,
      status,
      lastUpdatedBy: lastUpdatedBy || 'system'
    });

    res.json({ success: true, message: 'Disciplinary hearing updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/disciplinary/:id
 * Delete disciplinary hearing
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM DisciplinaryStatus WHERE DisciplinaryStatusID = @id`;
    const result = await executeNonQuery(query, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Disciplinary record not found' });
    }

    res.json({ success: true, message: 'Disciplinary hearing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

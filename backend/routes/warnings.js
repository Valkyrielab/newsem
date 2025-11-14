const express = require('express');
const router = express.Router();
const { executeQuery, executeNonQuery } = require('../db');

/**
 * GET /api/warnings
 * Get all signed warnings
 */
router.get('/', async (req, res) => {
  try {
    const { search, sortBy } = req.query;

    let query = `
      SELECT 
        sw.WarningID,
        sw.EmployeeName,
        wt.WarningTypeName AS WarningLevel,
        sw.IssuedDate,
        sw.Reason,
        sw.Status,
        sw.CreatedDate
      FROM SignedWarnings sw
      LEFT JOIN WarningTypes wt ON sw.WarningTypeID = wt.WarningTypeID
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (sw.EmployeeName LIKE @search OR sw.Reason LIKE @search)`;
    }

    if (sortBy === 'name_asc') query += ` ORDER BY sw.EmployeeName ASC`;
    else if (sortBy === 'name_desc') query += ` ORDER BY sw.EmployeeName DESC`;
    else if (sortBy === 'date_newest') query += ` ORDER BY sw.IssuedDate DESC`;
    else if (sortBy === 'date_oldest') query += ` ORDER BY sw.IssuedDate ASC`;
    else query += ` ORDER BY sw.CreatedDate DESC`;

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
 * GET /api/warnings/:id
 * Get single warning
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        sw.WarningID,
        sw.EmployeeName,
        sw.WarningTypeID,
        wt.WarningTypeName,
        sw.IssuedDate,
        sw.Reason,
        sw.Status,
        sw.CreatedDate,
        sw.CreatedBy,
        sw.LastUpdatedDate,
        sw.LastUpdatedBy
      FROM SignedWarnings sw
      LEFT JOIN WarningTypes wt ON sw.WarningTypeID = wt.WarningTypeID
      WHERE sw.WarningID = @id
    `;

    const results = await executeQuery(query, { id: parseInt(id) });

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Warning not found' });
    }

    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/warnings
 * Create new warning
 */
router.post('/', async (req, res) => {
  try {
    const {
      employeeName,
      warningTypeId,
      issuedDate,
      reason,
      status,
      createdBy
    } = req.body;

    if (!employeeName || !warningTypeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, warningTypeId'
      });
    }

    const query = `
      INSERT INTO SignedWarnings (
        EmployeeName,
        WarningTypeID,
        IssuedDate,
        Reason,
        Status,
        CreatedBy,
        CreatedDate
      )
      VALUES (@employeeName, @warningTypeId, @issuedDate, @reason, @status, @createdBy, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, {
      employeeName,
      warningTypeId: parseInt(warningTypeId),
      issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
      reason: reason || '',
      status: status || 'Active',
      createdBy: createdBy || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Warning created successfully',
      id: result[0].id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/warnings/:id
 * Update warning
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, warningTypeId, issuedDate, reason, status, lastUpdatedBy } = req.body;

    const query = `
      UPDATE SignedWarnings
      SET
        EmployeeName = ISNULL(@employeeName, EmployeeName),
        WarningTypeID = ISNULL(@warningTypeId, WarningTypeID),
        IssuedDate = ISNULL(@issuedDate, IssuedDate),
        Reason = ISNULL(@reason, Reason),
        Status = ISNULL(@status, Status),
        LastUpdatedBy = @lastUpdatedBy,
        LastUpdatedDate = GETDATE()
      WHERE WarningID = @id
    `;

    await executeNonQuery(query, {
      id: parseInt(id),
      employeeName,
      warningTypeId: warningTypeId ? parseInt(warningTypeId) : null,
      issuedDate: issuedDate ? new Date(issuedDate) : null,
      reason,
      status,
      lastUpdatedBy: lastUpdatedBy || 'system'
    });

    res.json({ success: true, message: 'Warning updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/warnings/:id
 * Delete warning
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM SignedWarnings WHERE WarningID = @id`;
    const result = await executeNonQuery(query, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Warning not found' });
    }

    res.json({ success: true, message: 'Warning deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

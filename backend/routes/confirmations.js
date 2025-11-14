const express = require('express');
const router = express.Router();
const { executeQuery, executeNonQuery } = require('../db');

/**
 * GET /api/confirmations
 * Get all employment confirmation letters
 */
router.get('/', async (req, res) => {
  try {
    const { search, sortBy } = req.query;

    let query = `
      SELECT 
        ecl.ConfirmationLetterID,
        ecl.EmployeeName,
        ecl.Position,
        ecl.StartDate,
        ecl.IssuedDate,
        ecl.ConfirmationType,
        ecl.Status,
        ecl.CreatedDate
      FROM EmploymentConfirmationLetter ecl
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (ecl.EmployeeName LIKE @search OR ecl.Position LIKE @search)`;
    }

    if (sortBy === 'name_asc') query += ` ORDER BY ecl.EmployeeName ASC`;
    else if (sortBy === 'name_desc') query += ` ORDER BY ecl.EmployeeName DESC`;
    else if (sortBy === 'date_newest') query += ` ORDER BY ecl.IssuedDate DESC`;
    else if (sortBy === 'date_oldest') query += ` ORDER BY ecl.IssuedDate ASC`;
    else query += ` ORDER BY ecl.CreatedDate DESC`;

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
 * GET /api/confirmations/:id
 * Get single confirmation letter
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM EmploymentConfirmationLetter
      WHERE ConfirmationLetterID = @id
    `;

    const results = await executeQuery(query, { id: parseInt(id) });

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Confirmation letter not found' });
    }

    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/confirmations
 * Create new confirmation letter
 */
router.post('/', async (req, res) => {
  try {
    const {
      employeeName,
      position,
      startDate,
      issuedDate,
      confirmationType,
      status,
      createdBy
    } = req.body;

    if (!employeeName || !position) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, position'
      });
    }

    const query = `
      INSERT INTO EmploymentConfirmationLetter (
        EmployeeName,
        Position,
        StartDate,
        IssuedDate,
        ConfirmationType,
        Status,
        CreatedBy,
        CreatedDate
      )
      VALUES (@employeeName, @position, @startDate, @issuedDate, @confirmationType, @status, @createdBy, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, {
      employeeName,
      position,
      startDate: startDate ? new Date(startDate) : null,
      issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
      confirmationType: confirmationType || 'Standard',
      status: status || 'Issued',
      createdBy: createdBy || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Confirmation letter created successfully',
      id: result[0].id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/confirmations/:id
 * Update confirmation letter
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, position, startDate, issuedDate, confirmationType, status, lastUpdatedBy } = req.body;

    const query = `
      UPDATE EmploymentConfirmationLetter
      SET
        EmployeeName = ISNULL(@employeeName, EmployeeName),
        Position = ISNULL(@position, Position),
        StartDate = ISNULL(@startDate, StartDate),
        IssuedDate = ISNULL(@issuedDate, IssuedDate),
        ConfirmationType = ISNULL(@confirmationType, ConfirmationType),
        Status = ISNULL(@status, Status),
        LastUpdatedBy = @lastUpdatedBy,
        LastUpdatedDate = GETDATE()
      WHERE ConfirmationLetterID = @id
    `;

    await executeNonQuery(query, {
      id: parseInt(id),
      employeeName,
      position,
      startDate: startDate ? new Date(startDate) : null,
      issuedDate: issuedDate ? new Date(issuedDate) : null,
      confirmationType,
      status,
      lastUpdatedBy: lastUpdatedBy || 'system'
    });

    res.json({ success: true, message: 'Confirmation letter updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/confirmations/:id
 * Delete confirmation letter
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM EmploymentConfirmationLetter WHERE ConfirmationLetterID = @id`;
    const result = await executeNonQuery(query, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Confirmation letter not found' });
    }

    res.json({ success: true, message: 'Confirmation letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

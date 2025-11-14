const express = require('express');
const router = express.Router();
const { executeQuery, executeNonQuery } = require('../db');

/**
 * GET /api/contracts
 * Get all employment contracts with search and sort
 */
router.get('/', async (req, res) => {
  try {
    const { search, sortBy } = req.query;

    let query = `
      SELECT 
        ec.EmploymentContractID,
        ec.EmployeeName,
        ec.Position,
        ct.ContractTypeName,
        ec.StartDate,
        ec.EndDate,
        ec.Salary,
        ec.Status,
        ec.CreatedDate,
        ec.CreatedBy
      FROM EmploymentContract ec
      LEFT JOIN ContractType ct ON ec.ContractTypeID = ct.ContractTypeID
      WHERE 1=1
    `;

    // Add search filter
    if (search) {
      query += ` AND (ec.EmployeeName LIKE @search OR ec.Position LIKE @search)`;
    }

    // Add sorting
    if (sortBy === 'name_asc') query += ` ORDER BY ec.EmployeeName ASC`;
    else if (sortBy === 'name_desc') query += ` ORDER BY ec.EmployeeName DESC`;
    else if (sortBy === 'date_newest') query += ` ORDER BY ec.CreatedDate DESC`;
    else if (sortBy === 'date_oldest') query += ` ORDER BY ec.CreatedDate ASC`;
    else query += ` ORDER BY ec.CreatedDate DESC`;

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
 * GET /api/contracts/:id
 * Get single contract by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        ec.EmploymentContractID,
        ec.EmployeeName,
        ec.Position,
        ec.ContractTypeID,
        ct.ContractTypeName,
        ec.StartDate,
        ec.EndDate,
        ec.Salary,
        ec.Status,
        ec.CreatedDate,
        ec.CreatedBy,
        ec.LastUpdatedDate,
        ec.LastUpdatedBy
      FROM EmploymentContract ec
      LEFT JOIN ContractType ct ON ec.ContractTypeID = ct.ContractTypeID
      WHERE ec.EmploymentContractID = @id
    `;

    const results = await executeQuery(query, { id: parseInt(id) });

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/contracts
 * Create new employment contract
 */
router.post('/', async (req, res) => {
  try {
    const {
      employeeName,
      position,
      contractTypeId,
      startDate,
      endDate,
      salary,
      status,
      createdBy
    } = req.body;

    // Validation
    if (!employeeName || !position || !contractTypeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, position, contractTypeId'
      });
    }

    const query = `
      INSERT INTO EmploymentContract (
        EmployeeName,
        Position,
        ContractTypeID,
        StartDate,
        EndDate,
        Salary,
        Status,
        CreatedBy,
        CreatedDate
      )
      VALUES (@employeeName, @position, @contractTypeId, @startDate, @endDate, @salary, @status, @createdBy, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, {
      employeeName,
      position,
      contractTypeId: parseInt(contractTypeId),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      salary: salary ? parseFloat(salary) : null,
      status: status || 'Active',
      createdBy: createdBy || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      id: result[0].id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/contracts/:id
 * Update employment contract
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeName,
      position,
      contractTypeId,
      startDate,
      endDate,
      salary,
      status,
      lastUpdatedBy
    } = req.body;

    const query = `
      UPDATE EmploymentContract
      SET
        EmployeeName = ISNULL(@employeeName, EmployeeName),
        Position = ISNULL(@position, Position),
        ContractTypeID = ISNULL(@contractTypeId, ContractTypeID),
        StartDate = ISNULL(@startDate, StartDate),
        EndDate = ISNULL(@endDate, EndDate),
        Salary = ISNULL(@salary, Salary),
        Status = ISNULL(@status, Status),
        LastUpdatedBy = @lastUpdatedBy,
        LastUpdatedDate = GETDATE()
      WHERE EmploymentContractID = @id
    `;

    await executeNonQuery(query, {
      id: parseInt(id),
      employeeName,
      position,
      contractTypeId: contractTypeId ? parseInt(contractTypeId) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      salary: salary ? parseFloat(salary) : null,
      status,
      lastUpdatedBy: lastUpdatedBy || 'system'
    });

    res.json({ success: true, message: 'Contract updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/contracts/:id
 * Delete employment contract
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM EmploymentContract WHERE EmploymentContractID = @id`;
    const result = await executeNonQuery(query, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    res.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

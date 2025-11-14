const express = require('express');
const router = express.Router();
const { executeQuery, executeNonQuery } = require('../db');

/**
 * GET /api/approvals
 * Get all leave requests with optional status filter
 */
router.get('/', async (req, res) => {
  try {
    const { status, search, sortBy } = req.query;

    let query = `
      SELECT 
        ApprovalID,
        EmployeeName,
        LeaveType,
        StartDate,
        EndDate,
        Reason,
        Status,
        SubmittedDate,
        ApprovedDate,
        ApprovedBy
      FROM LeaveApprovals
      WHERE 1=1
    `;

    // Filter by status if provided
    if (status) {
      query += ` AND Status = @status`;
    }

    // Add search filter
    if (search) {
      query += ` AND (EmployeeName LIKE @search OR Reason LIKE @search)`;
    }

    // Add sorting
    if (sortBy === 'name_asc') query += ` ORDER BY EmployeeName ASC`;
    else if (sortBy === 'name_desc') query += ` ORDER BY EmployeeName DESC`;
    else if (sortBy === 'date_newest') query += ` ORDER BY SubmittedDate DESC`;
    else if (sortBy === 'date_oldest') query += ` ORDER BY SubmittedDate ASC`;
    else query += ` ORDER BY SubmittedDate DESC`;

    const parameters = {};
    if (status) parameters.status = status;
    if (search) parameters.search = `%${search}%`;

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
 * GET /api/approvals/:id
 * Get single leave request
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM LeaveApprovals
      WHERE ApprovalID = @id
    `;

    const results = await executeQuery(query, { id: parseInt(id) });

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    res.json({ success: true, data: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/approvals
 * Create new leave request
 */
router.post('/', async (req, res) => {
  try {
    const {
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      submittedBy
    } = req.body;

    if (!employeeName || !leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, leaveType, startDate, endDate'
      });
    }

    const query = `
      INSERT INTO LeaveApprovals (
        EmployeeName,
        LeaveType,
        StartDate,
        EndDate,
        Reason,
        Status,
        SubmittedDate,
        SubmittedBy
      )
      VALUES (@employeeName, @leaveType, @startDate, @endDate, @reason, 'Pending', GETDATE(), @submittedBy);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, {
      employeeName,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || '',
      submittedBy: submittedBy || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      id: result[0].id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/approvals/:id/approve
 * Approve a leave request
 */
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const query = `
      UPDATE LeaveApprovals
      SET
        Status = 'Approved',
        ApprovedDate = GETDATE(),
        ApprovedBy = @approvedBy
      WHERE ApprovalID = @id
    `;

    const result = await executeNonQuery(query, {
      id: parseInt(id),
      approvedBy: approvedBy || 'system'
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/approvals/:id/reject
 * Reject a leave request
 */
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    const query = `
      UPDATE LeaveApprovals
      SET
        Status = 'Rejected',
        ApprovedDate = GETDATE(),
        ApprovedBy = @rejectedBy,
        Reason = ISNULL(@rejectionReason, Reason)
      WHERE ApprovalID = @id
    `;

    const result = await executeNonQuery(query, {
      id: parseInt(id),
      rejectedBy: rejectedBy || 'system',
      rejectionReason
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/approvals/:id
 * Update leave request
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, leaveType, startDate, endDate, reason, status } = req.body;

    const query = `
      UPDATE LeaveApprovals
      SET
        EmployeeName = ISNULL(@employeeName, EmployeeName),
        LeaveType = ISNULL(@leaveType, LeaveType),
        StartDate = ISNULL(@startDate, StartDate),
        EndDate = ISNULL(@endDate, EndDate),
        Reason = ISNULL(@reason, Reason),
        Status = ISNULL(@status, Status)
      WHERE ApprovalID = @id
    `;

    await executeNonQuery(query, {
      id: parseInt(id),
      employeeName,
      leaveType,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      reason,
      status
    });

    res.json({ success: true, message: 'Leave request updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/approvals/:id
 * Delete leave request
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM LeaveApprovals WHERE ApprovalID = @id`;
    const result = await executeNonQuery(query, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

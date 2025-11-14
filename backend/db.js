const sql = require('mssql');

// SQL Server connection pool configuration
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ContractManagement',
  authentication: {
    type: 'default'
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    enableKeepAlive: true
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

/**
 * Initialize database connection pool
 */
async function initializePool() {
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('✓ Database connection pool initialized');
    }
    return pool;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Execute a query and return results
 * @param {string} queryText - SQL query
 * @param {object} parameters - Query parameters
 * @returns {Promise<array>} Query results
 */
async function executeQuery(queryText, parameters = {}) {
  try {
    const pool = await initializePool();
    const request = pool.request();

    // Add parameters to request
    for (const [key, value] of Object.entries(parameters)) {
      request.input(key, value);
    }

    const result = await request.query(queryText);
    return result.recordset || [];
  } catch (error) {
    console.error('✗ Query execution error:', error.message);
    throw error;
  }
}

/**
 * Execute a query that returns scalar value
 * @param {string} queryText - SQL query
 * @param {object} parameters - Query parameters
 * @returns {Promise<any>} First column value of first row
 */
async function executeScalar(queryText, parameters = {}) {
  try {
    const results = await executeQuery(queryText, parameters);
    return results.length > 0 ? Object.values(results[0])[0] : null;
  } catch (error) {
    console.error('✗ Scalar query error:', error.message);
    throw error;
  }
}

/**
 * Execute a non-query (INSERT, UPDATE, DELETE)
 * @param {string} queryText - SQL query
 * @param {object} parameters - Query parameters
 * @returns {Promise<object>} Result with rowsAffected count
 */
async function executeNonQuery(queryText, parameters = {}) {
  try {
    const pool = await initializePool();
    const request = pool.request();

    // Add parameters to request
    for (const [key, value] of Object.entries(parameters)) {
      request.input(key, value);
    }

    const result = await request.query(queryText);
    return { rowsAffected: result.rowsAffected[0] };
  } catch (error) {
    console.error('✗ Non-query execution error:', error.message);
    throw error;
  }
}

/**
 * Close database connection pool
 */
async function closePool() {
  try {
    if (pool) {
      await pool.close();
      console.log('✓ Database connection pool closed');
    }
  } catch (error) {
    console.error('✗ Error closing pool:', error.message);
  }
}

module.exports = {
  initializePool,
  executeQuery,
  executeScalar,
  executeNonQuery,
  closePool,
  sql
};

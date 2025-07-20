const db = require('../config/database');

/**
 * Execute a query and return results
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (sql, params = []) => {
    try {
        const [rows] = await db.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Execute a query and return single result
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Single result
 */
const executeQuerySingle = async (sql, params = []) => {
    try {
        const [rows] = await db.execute(sql, params);
        return rows[0] || null;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Execute a stored procedure
 * @param {string} procedureName - Name of the stored procedure
 * @param {Array} params - Procedure parameters
 * @returns {Promise<Array>} Procedure results
 */
const executeStoredProcedure = async (procedureName, params = []) => {
    try {
        const placeholders = params.map(() => '?').join(',');
        const sql = `CALL ${procedureName}(${placeholders})`;
        const [rows] = await db.execute(sql, params);
        return rows[0] || [];
    } catch (error) {
        console.error('Stored procedure error:', error);
        throw error;
    }
};

/**
 * Insert a record and return the inserted ID
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<number>} Inserted ID
 */
const insertRecord = async (table, data) => {
    try {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(',');
        
        const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
        const [result] = await db.execute(sql, values);
        
        return result.insertId;
    } catch (error) {
        console.error('Insert error:', error);
        throw error;
    }
};

/**
 * Update a record
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {string} whereClause - WHERE clause
 * @param {Array} whereParams - WHERE clause parameters
 * @returns {Promise<number>} Number of affected rows
 */
const updateRecord = async (table, data, whereClause, whereParams = []) => {
    try {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(data), ...whereParams];
        
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const [result] = await db.execute(sql, values);
        
        return result.affectedRows;
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
};

/**
 * Delete a record
 * @param {string} table - Table name
 * @param {string} whereClause - WHERE clause
 * @param {Array} whereParams - WHERE clause parameters
 * @returns {Promise<number>} Number of affected rows
 */
const deleteRecord = async (table, whereClause, whereParams = []) => {
    try {
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        const [result] = await db.execute(sql, whereParams);
        
        return result.affectedRows;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};

/**
 * Get records with pagination
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
const getPaginatedRecords = async (table, options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            whereClause = '',
            whereParams = [],
            orderBy = 'id',
            orderDirection = 'DESC'
        } = options;
        
        const offset = (page - 1) * limit;
        
        // Count total records
        const countSql = `SELECT COUNT(*) as total FROM ${table} ${whereClause ? 'WHERE ' + whereClause : ''}`;
        const [countResult] = await db.execute(countSql, whereParams);
        const total = countResult[0].total;
        
        // Get paginated records
        const sql = `
            SELECT * FROM ${table} 
            ${whereClause ? 'WHERE ' + whereClause : ''} 
            ORDER BY ${orderBy} ${orderDirection} 
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [...whereParams, limit, offset]);
        
        return {
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error('Pagination error:', error);
        throw error;
    }
};

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise<any>} Transaction result
 */
const executeTransaction = async (callback) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
    try {
        await db.execute('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
};

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
const getDatabaseStats = async () => {
    try {
        const stats = {};
        
        // Get table counts
        const tables = ['users', 'employees', 'connections', 'meter_readings', 'bills', 'alerts', 'complaints', 'audit_logs'];
        
        for (const table of tables) {
            const [result] = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
            stats[table] = result[0].count;
        }
        
        return stats;
    } catch (error) {
        console.error('Database stats error:', error);
        throw error;
    }
};

module.exports = {
    executeQuery,
    executeQuerySingle,
    executeStoredProcedure,
    insertRecord,
    updateRecord,
    deleteRecord,
    getPaginatedRecords,
    executeTransaction,
    testConnection,
    getDatabaseStats
}; 
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing MySQL Database...');
        
        // Read SQL files
        const schemaPath = path.join(__dirname, 'schema.sql');
        const triggersPath = path.join(__dirname, 'triggers.sql');
        const viewsPath = path.join(__dirname, 'views.sql');
        const proceduresPath = path.join(__dirname, 'stored_procedures.sql');
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        const triggersSQL = fs.readFileSync(triggersPath, 'utf8');
        const viewsSQL = fs.readFileSync(viewsPath, 'utf8');
        const proceduresSQL = fs.readFileSync(proceduresPath, 'utf8');
        
        // Split SQL files into individual statements for schema and views
        const schemaStatements = schemaSQL.split(';').filter(stmt => stmt.trim());
        const viewStatements = viewsSQL.split(';').filter(stmt => stmt.trim());
        
        console.log('📋 Creating database schema...');
        // Execute schema statements
        for (const statement of schemaStatements) {
            if (statement.trim()) {
                await db.query(statement);
            }
        }
        console.log('✅ Database schema created successfully');
        
        console.log('🔄 Creating triggers...');
        // Split triggersSQL by ';' and execute each CREATE TRIGGER statement separately
        const triggerStatements = triggersSQL.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.toUpperCase().startsWith('CREATE TRIGGER'));
        for (const triggerStmt of triggerStatements) {
            if (triggerStmt) {
                await db.query(triggerStmt + ';');
            }
        }
        console.log('✅ Triggers created successfully');
        
        console.log('👁️ Creating views...');
        // Execute view statements
        for (const statement of viewStatements) {
            if (statement.trim()) {
                await db.query(statement);
            }
        }
        console.log('✅ Views created successfully');
        
        console.log('📦 Creating stored procedures...');
        // Split proceduresSQL by ';' and execute each CREATE PROCEDURE statement separately
        const procedureStatements = proceduresSQL.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.toUpperCase().startsWith('CREATE PROCEDURE'));
        for (const procStmt of procedureStatements) {
            if (procStmt) {
                await db.query(procStmt + ';');
            }
        }
        console.log('✅ Stored procedures created successfully');
        
        console.log('🎉 Database initialization completed successfully!');
        console.log('📊 Database contains:');
        console.log('   - 8 Tables (users, employees, water_sources, connections, meter_readings, bills, alerts, complaints, audit_logs)');
        console.log('   - 18 Triggers (all CRUD operations with audit logging)');
        console.log('   - 10 Views (user_overview, outstanding_bills, etc.)');
        console.log('   - 9 Stored Procedures (sp_CreateUser, sp_GenerateBill, etc.)');
        console.log('   - Sample data for testing');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

// Export for use in other files
module.exports = { initializeDatabase };

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('✅ Database setup completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Database setup failed:', error);
            process.exit(1);
        });
} 
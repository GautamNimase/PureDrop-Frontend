const pool = require('./config/database');

async function addSampleReadings() {
  try {
    console.log('Adding sample meter readings...');
    
    // First, let's check if we have any connections
    const [connections] = await pool.query('SELECT ConnectionID FROM connections LIMIT 5');
    
    if (connections.length === 0) {
      console.log('No connections found. Please add some connections first.');
      return;
    }
    
    // Sample meter readings data
    const sampleReadings = [
      {
        ConnectionID: connections[0].ConnectionID,
        ReadingDate: '2024-01-15',
        UnitsConsumed: 125.50
      },
      {
        ConnectionID: connections[0].ConnectionID,
        ReadingDate: '2024-02-15',
        UnitsConsumed: 138.75
      },
      {
        ConnectionID: connections[0].ConnectionID,
        ReadingDate: '2024-03-15',
        UnitsConsumed: 142.30
      },
      {
        ConnectionID: connections[0].ConnectionID,
        ReadingDate: '2024-04-15',
        UnitsConsumed: 156.80
      },
      {
        ConnectionID: connections[0].ConnectionID,
        ReadingDate: '2024-05-15',
        UnitsConsumed: 149.20
      }
    ];
    
    // Add readings for other connections if they exist
    if (connections.length > 1) {
      sampleReadings.push(
        {
          ConnectionID: connections[1].ConnectionID,
          ReadingDate: '2024-01-15',
          UnitsConsumed: 89.45
        },
        {
          ConnectionID: connections[1].ConnectionID,
          ReadingDate: '2024-02-15',
          UnitsConsumed: 92.10
        },
        {
          ConnectionID: connections[1].ConnectionID,
          ReadingDate: '2024-03-15',
          UnitsConsumed: 95.75
        }
      );
    }
    
    // Insert sample readings
    for (const reading of sampleReadings) {
      await pool.query(
        'INSERT INTO meter_readings (ConnectionID, ReadingDate, UnitsConsumed) VALUES (?, ?, ?)',
        [reading.ConnectionID, reading.ReadingDate, reading.UnitsConsumed]
      );
    }
    
    console.log(`Successfully added ${sampleReadings.length} sample meter readings.`);
    
    // Show the count of readings
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM meter_readings');
    console.log(`Total meter readings in database: ${countResult[0].count}`);
    
  } catch (error) {
    console.error('Error adding sample readings:', error);
  } finally {
    await pool.end();
  }
}

addSampleReadings(); 
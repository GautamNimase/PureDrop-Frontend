const pool = require('./config/database');

async function addSampleBills() {
  try {
    console.log('Adding sample bills...');
    
    // First, let's check if we have any meter readings
    const [readings] = await pool.query('SELECT MeterReadingID FROM meter_readings LIMIT 5');
    
    if (readings.length === 0) {
      console.log('No meter readings found. Please add some meter readings first.');
      return;
    }
    
    // Sample bills data
    const sampleBills = [
      {
        MeterReadingID: readings[0].MeterReadingID,
        BillDate: '2024-01-15',
        Amount: 250.00,
        PaymentStatus: 'Paid',
        PaymentDate: '2024-01-20',
        PaymentMethod: 'Credit Card'
      },
      {
        MeterReadingID: readings[0].MeterReadingID,
        BillDate: '2024-02-15',
        Amount: 275.50,
        PaymentStatus: 'Paid',
        PaymentDate: '2024-02-18',
        PaymentMethod: 'Online Banking'
      },
      {
        MeterReadingID: readings[0].MeterReadingID,
        BillDate: '2024-03-15',
        Amount: 290.75,
        PaymentStatus: 'Unpaid',
        PaymentDate: null,
        PaymentMethod: null
      },
      {
        MeterReadingID: readings[0].MeterReadingID,
        BillDate: '2024-04-15',
        Amount: 315.25,
        PaymentStatus: 'Overdue',
        PaymentDate: null,
        PaymentMethod: null
      },
      {
        MeterReadingID: readings[0].MeterReadingID,
        BillDate: '2024-05-15',
        Amount: 298.80,
        PaymentStatus: 'Unpaid',
        PaymentDate: null,
        PaymentMethod: null
      }
    ];
    
    // Add bills for other readings if they exist
    if (readings.length > 1) {
      sampleBills.push(
        {
          MeterReadingID: readings[1].MeterReadingID,
          BillDate: '2024-01-15',
          Amount: 180.00,
          PaymentStatus: 'Paid',
          PaymentDate: '2024-01-22',
          PaymentMethod: 'Debit Card'
        },
        {
          MeterReadingID: readings[1].MeterReadingID,
          BillDate: '2024-02-15',
          Amount: 195.50,
          PaymentStatus: 'Unpaid',
          PaymentDate: null,
          PaymentMethod: null
        },
        {
          MeterReadingID: readings[1].MeterReadingID,
          BillDate: '2024-03-15',
          Amount: 210.75,
          PaymentStatus: 'Overdue',
          PaymentDate: null,
          PaymentMethod: null
        }
      );
    }
    
    // Insert sample bills
    for (const bill of sampleBills) {
      await pool.query(
        'INSERT INTO bills (MeterReadingID, BillDate, Amount, PaymentStatus, PaymentDate, PaymentMethod) VALUES (?, ?, ?, ?, ?, ?)',
        [bill.MeterReadingID, bill.BillDate, bill.Amount, bill.PaymentStatus, bill.PaymentDate, bill.PaymentMethod]
      );
    }
    
    console.log(`Successfully added ${sampleBills.length} sample bills.`);
    
    // Show the count of bills
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM bills');
    console.log(`Total bills in database: ${countResult[0].count}`);
    
  } catch (error) {
    console.error('Error adding sample bills:', error);
  } finally {
    await pool.end();
  }
}

addSampleBills(); 
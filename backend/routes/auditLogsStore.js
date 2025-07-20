// Shared in-memory audit log store for backend-driven audit logging
let auditLogs = [
  { LogID: 1, User: 'admin', Action: 'Login', Timestamp: '2023-06-01 09:00', Details: 'Successful login' },
  { LogID: 2, User: 'employee1', Action: 'Edit Bill', Timestamp: '2023-06-01 10:15', Details: 'Edited BillID 5' },
  { LogID: 3, User: 'admin', Action: 'Delete Customer', Timestamp: '2023-06-01 11:00', Details: 'Deleted CustomerID 2' },
];
let nextId = 4;

module.exports = {
  auditLogs,
  getNextId: () => nextId++,
}; 
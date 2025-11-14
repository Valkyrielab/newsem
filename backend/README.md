# ContractCom Backend API

Backend REST API for the ContractCom contract management system built with Node.js, Express, and SQL Server.

## Project Structure

```
backend/
├── server.js                 # Main Express server
├── db.js                     # Database connection pool & utilities
├── package.json              # Dependencies
├── .env.example              # Environment variables template
├── .env                      # Environment variables (create from .env.example)
└── routes/                   # API route handlers
    ├── contracts.js          # Employment contracts CRUD
    ├── confirmations.js      # Employment confirmation letters CRUD
    ├── warnings.js           # Signed warnings CRUD
    ├── disciplinary.js       # Disciplinary hearings CRUD
    ├── maternity.js          # Maternity agreements CRUD
    └── approvals.js          # Leave request approvals CRUD
```

## Prerequisites

- **Node.js** v14+ and npm
- **SQL Server** 2016+ or SQL Server Express
- **Database**: ContractManagement (or create using SQLFile2.sql)

## Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your SQL Server credentials:

```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_NAME=ContractManagement
DB_ENCRYPT=false
DB_TRUST_CERT=true
PORT=5000
CORS_ORIGIN=*
NODE_ENV=development
```

### 4. Initialize Database

If you haven't already created the database, use SQL Server Management Studio to run `SQLFile2.sql`:

```sql
-- Run SQLFile2.sql to create all tables and schema
```

Or via command line (SQL Server):

```bash
sqlcmd -S localhost -U sa -P YourPassword123 -i SQLFile2.sql
```

### 5. Start the Server

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

Health check: `http://localhost:5000/health`

## API Endpoints

### Contracts
- `GET /api/contracts` - List all contracts (supports search, sort)
- `GET /api/contracts/:id` - Get single contract
- `POST /api/contracts` - Create contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

**Query Parameters:**
- `search` - Search by employee name or position
- `sortBy` - Sort by: `name_asc`, `name_desc`, `date_newest`, `date_oldest`

### Confirmation Letters
- `GET /api/confirmations` - List all confirmation letters
- `GET /api/confirmations/:id` - Get single letter
- `POST /api/confirmations` - Create letter
- `PUT /api/confirmations/:id` - Update letter
- `DELETE /api/confirmations/:id` - Delete letter

**Query Parameters:**
- `search` - Search by employee name or position
- `sortBy` - Sort options (same as contracts)

### Warnings
- `GET /api/warnings` - List all warnings
- `GET /api/warnings/:id` - Get single warning
- `POST /api/warnings` - Create warning
- `PUT /api/warnings/:id` - Update warning
- `DELETE /api/warnings/:id` - Delete warning

**Query Parameters:**
- `search` - Search by employee name or reason
- `sortBy` - Sort options (same as contracts)

### Disciplinary Hearings
- `GET /api/disciplinary` - List all hearings
- `GET /api/disciplinary/:id` - Get single hearing
- `POST /api/disciplinary` - Create hearing
- `PUT /api/disciplinary/:id` - Update hearing
- `DELETE /api/disciplinary/:id` - Delete hearing

**Query Parameters:**
- `search` - Search by employee name, reason, or outcome
- `sortBy` - Sort options (same as contracts)

### Maternity Agreements
- `GET /api/maternity` - List all agreements
- `GET /api/maternity/:id` - Get single agreement
- `POST /api/maternity` - Create agreement
- `PUT /api/maternity/:id` - Update agreement
- `DELETE /api/maternity/:id` - Delete agreement

**Query Parameters:**
- `search` - Search by employee name
- `sortBy` - Sort options (same as contracts)

### Leave Approvals
- `GET /api/approvals` - List all leave requests
- `GET /api/approvals/:id` - Get single request
- `POST /api/approvals` - Submit new leave request
- `PUT /api/approvals/:id/approve` - Approve leave request
- `PUT /api/approvals/:id/reject` - Reject leave request
- `PUT /api/approvals/:id` - Update leave request
- `DELETE /api/approvals/:id` - Delete leave request

**Query Parameters:**
- `status` - Filter by status: `Pending`, `Approved`, `Rejected`
- `search` - Search by employee name or reason
- `sortBy` - Sort options (same as contracts)

## Example Requests

### Create Employment Contract

```bash
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "employeeName": "John Doe",
    "position": "Software Engineer",
    "contractTypeId": 1,
    "startDate": "2024-01-15",
    "endDate": "2025-01-14",
    "salary": 75000,
    "status": "Active",
    "createdBy": "admin"
  }'
```

### Get Contracts with Search and Sort

```bash
curl "http://localhost:5000/api/contracts?search=John&sortBy=name_asc"
```

### Submit Leave Request

```bash
curl -X POST http://localhost:5000/api/approvals \
  -H "Content-Type: application/json" \
  -d '{
    "employeeName": "John Doe",
    "leaveType": "Annual Leave",
    "startDate": "2024-02-01",
    "endDate": "2024-02-10",
    "reason": "Annual vacation",
    "submittedBy": "john.doe"
  }'
```

### Approve Leave Request

```bash
curl -X PUT http://localhost:5000/api/approvals/1/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "admin@company.com"
  }'
```

### Reject Leave Request

```bash
curl -X PUT http://localhost:5000/api/approvals/1/reject \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Budget constraints during this period",
    "rejectedBy": "admin@company.com"
  }'
```

## Frontend Integration

Replace localStorage calls with API fetch calls:

### Before (localStorage):
```javascript
const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
```

### After (API):
```javascript
const response = await fetch('/api/contracts?sortBy=name_asc');
const data = await response.json();
const contracts = data.data;
```

### Create with API:
```javascript
const response = await fetch('/api/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employeeName: 'Jane Smith',
    position: 'Manager',
    contractTypeId: 2,
    startDate: '2024-01-20',
    salary: 85000,
    createdBy: localStorage.getItem('username')
  })
});
```

## Response Format

All endpoints return JSON responses:

### Success Response
```json
{
  "success": true,
  "data": [ /* array of records */ ],
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

## Database Tables Supported

1. **EmploymentContract** - Employment contracts with type, dates, salary
2. **EmploymentConfirmationLetter** - Confirmation of employment letters
3. **SignedWarnings** - Employee warnings with types and levels
4. **DisciplinaryStatus** - Disciplinary hearing records
5. **MaternityAgreement** - Maternity leave agreements with duration
6. **LeaveApprovals** - Leave request submissions and approvals (if table exists)

## Notes

- All timestamps use SQL Server's `GETDATE()` function
- Audit fields (CreatedBy, CreatedDate, LastUpdatedBy, LastUpdatedDate) are auto-managed
- Search is case-insensitive using SQL LIKE operator
- Date parameters should be ISO format: `YYYY-MM-DD`
- All IDs are integers; use SCOPE_IDENTITY() for auto-increment
- CORS is enabled for all origins (restrict in .env for production)

## Troubleshooting

### Connection Refused
- Check SQL Server is running: `sqlcmd -S localhost -U sa`
- Verify DB_SERVER, DB_USER, DB_PASSWORD in .env

### Database Not Found
- Run SQLFile2.sql to create schema and tables
- Verify DB_NAME in .env matches created database

### CORS Errors
- Update CORS_ORIGIN in .env to frontend URL (e.g., `http://localhost:3000`)
- For development: `CORS_ORIGIN=*`

### Timeout Errors
- Increase pool timeout in `db.js` if needed
- Check SQL Server performance and query logs

## Development

Run with nodemon for auto-restart on file changes:

```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "contractcom-api"
   ```
3. Configure reverse proxy (nginx) and SSL/TLS
4. Update CORS_ORIGIN to frontend domain
5. Use strong database passwords and encryption

## License

MIT

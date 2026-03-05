# AI Invoice Auditor

A production-grade SaaS platform that automatically audits vendor invoices, detects billing discrepancies, validates charges against contract rates, and generates comprehensive audit reports with financial recovery insights.

## Features

- **AI-Powered Invoice Parsing**: Extract structured data from PDF and image invoices using Groq AI
- **6-Rule Audit Engine**:
  1. Overcharge Detection
  2. GST Validation
  3. Duplicate Invoice Detection
  4. Unauthorized Surcharge Detection
  5. Quantity Anomaly Detection
  6. Price Variance Detection
- **Contract Rate Card Management**: Validate invoices against approved vendor rates
- **Real-time Dashboard**: Track invoices, overcharges, and potential savings
- **Comprehensive Reports**: Export audit reports in JSON and CSV formats
- **Analytics & Metrics**: Visualize vendor performance and compliance trends

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- GSAP for animations
- Recharts for data visualization
- React Router for navigation

### Backend
- Python Flask
- pdfplumber for PDF text extraction
- Pandas for data processing
- Groq AI for invoice parsing
- bcrypt for password hashing

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-invoice-auditor
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install Python dependencies**
```bash
pip install flask flask-cors bcrypt pdfplumber pandas requests python-dotenv
```

4. **Configure environment variables**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your Groq API key (optional)
```

5. **Start the backend server**
```bash
python start_backend.py
```

6. **Start the frontend (in a new terminal)**
```bash
npm run dev
```

7. **Open the application**
Navigate to `http://localhost:5173` in your browser.

## Demo Credentials

- **Admin Account**
  - Email: `admin@email.com`
  - Password: `admin123`

- **Finance Account**
  - Email: `finance@company.com`
  - Password: `finance123`

## Usage

1. **Login** using the demo credentials
2. **Upload invoices** via the Upload page (supports PDF, PNG, JPG, WEBP)
3. **View dashboard** for overview of audit results
4. **Check reports** for detailed analysis of each invoice
5. **Explore metrics** for analytics and trends

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/invoices/upload` - Upload and process invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/audit-reports` - Get audit reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/rate-cards` - Get contract rate cards

## Project Structure

```
ai-invoice-auditor/
├── backend/
│   ├── app.py              # Flask application
│   ├── uploads/            # Uploaded files storage
│   └── .env                # Environment variables
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app component
│   └── index.css           # Global styles
├── dist/                   # Production build
├── start_backend.py        # Backend startup script
└── README.md
```

## Configuration

### Groq AI Integration (Optional)
To enable AI-powered invoice parsing, add your Groq API key to `backend/.env`:
```
GROQ_API_KEY=your-groq-api-key-here
```

Without an API key, the system will use mock data for demonstration purposes.

### Rate Cards
Contract rate cards are stored in-memory. To add new rates, use the `/api/rate-cards` endpoint or modify the `init_demo_rate_cards()` function in `backend/app.py`.

## Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
python start_backend.py    # Start Flask server
```

## Security Considerations

- Session-based authentication with 30-minute timeout
- Password hashing with bcrypt
- File upload validation (type and size)
- CORS enabled for frontend communication
- In-memory storage for demo (use proper database in production)

## License

MIT License

## Support

For support, please contact support@invoiceai.com

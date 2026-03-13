"""
AI Invoice Auditor - Backend API
Production-grade Flask application for invoice auditing
"""

import os
import json
import bcrypt
import uuid
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pdfplumber
import pandas as pd
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here-change-in-production')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

# Cross-domain cookie settings (needed when frontend and backend are on different domains)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

# Enable CORS for frontend communication
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
CORS(app, supports_credentials=True, origins=CORS_ORIGINS, resources={r"/api/*": {"origins": "*"}})

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Create upload folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Groq API Configuration
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

# In-memory storage (for demo purposes)
users = {}
invoices = []
audit_reports = []
rate_cards = []
historical_data = {}

# Initialize demo users
def init_demo_users():
    demo_users = [
        {'email': 'admin@email.com', 'password': 'admin123', 'name': 'Admin User', 'role': 'admin'},
        {'email': 'finance@company.com', 'password': 'finance123', 'name': 'Finance Manager', 'role': 'finance'}
    ]
    
    for user in demo_users:
        hashed_password = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt())
        users[user['email']] = {
            'id': str(uuid.uuid4()),
            'email': user['email'],
            'password': hashed_password,
            'name': user['name'],
            'role': user['role'],
            'created_at': datetime.now().isoformat()
        }

# Initialize demo rate cards
def init_demo_rate_cards():
    global rate_cards
    rate_cards = [
        {'vendor': 'Delhivery', 'service': 'Shipping', 'approved_rate': 50, 'currency': 'INR', 'effective_date': '2024-01-01'},
        {'vendor': 'BlueDart', 'service': 'Express', 'approved_rate': 80, 'currency': 'INR', 'effective_date': '2024-01-01'},
        {'vendor': 'TechPartner', 'service': 'Development', 'approved_rate': 1500, 'currency': 'INR', 'effective_date': '2024-01-01'},
        {'vendor': 'Acme Logistics', 'service': 'Freight', 'approved_rate': 3960, 'currency': 'INR', 'effective_date': '2024-01-01'},
        {'vendor': 'Acme Logistics', 'service': 'Fuel Surcharge', 'approved_rate': 310, 'currency': 'INR', 'effective_date': '2024-01-01'},
        {'vendor': 'Acme Logistics', 'service': 'Handling', 'approved_rate': 120, 'currency': 'INR', 'effective_date': '2024-01-01'},
    ]

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF using pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
    return text

def extract_text_from_image(file_path):
    """Placeholder for OCR - returns mock data for demo"""
    # In production, use pytesseract or cloud OCR
    return "OCR extraction would happen here for images"

def parse_invoice_with_ai(text):
    """Use Groq AI to parse invoice text into structured data"""
    
    if not GROQ_API_KEY:
        # Return mock data if no API key
        return generate_mock_invoice_data()
    
    prompt = f"""Extract structured invoice data from the following invoice text.

Return ONLY valid JSON. No explanations, no markdown formatting.

Invoice Text:
{text}

Required JSON format:
{{
  "vendor_name": string,
  "invoice_number": string,
  "invoice_date": string (YYYY-MM-DD format),
  "line_items": [
    {{
      "description": string,
      "quantity": number,
      "unit_rate": number,
      "total": number
    }}
  ],
  "subtotal": number,
  "gst_rate": number,
  "gst_amount": number,
  "total_amount": number
}}

Rules:
1. Extract the actual values from the invoice text
2. If a field is not found, use reasonable defaults
3. Ensure all numbers are valid numeric values
4. Return ONLY the JSON object, nothing else"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert invoice data extraction AI. Extract structured data accurately."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 2000
    }
    
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Clean up the response (remove markdown code blocks if present)
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        content = content.strip()
        
        # Parse JSON
        invoice_data = json.loads(content)
        return invoice_data
        
    except Exception as e:
        print(f"AI parsing error: {e}")
        # Fallback to mock data
        return generate_mock_invoice_data()

def generate_mock_invoice_data():
    """Generate realistic mock invoice data for demo"""
    return {
        "vendor_name": "Acme Logistics",
        "invoice_number": "INV-2024-001234",
        "invoice_date": "2024-03-01",
        "line_items": [
            {"description": "Freight", "quantity": 1, "unit_rate": 4200, "total": 4200},
            {"description": "Fuel Surcharge", "quantity": 1, "unit_rate": 380, "total": 380},
            {"description": "Handling", "quantity": 1, "unit_rate": 120, "total": 120}
        ],
        "subtotal": 4700,
        "gst_rate": 0.18,
        "gst_amount": 846,
        "total_amount": 5546
    }

def get_approved_rate(vendor, service):
    """Get approved rate from rate card"""
    for rate in rate_cards:
        if rate['vendor'].lower() in vendor.lower() or vendor.lower() in rate['vendor'].lower():
            if rate['service'].lower() in service.lower() or service.lower() in rate['service'].lower():
                return rate['approved_rate']
    return None

def check_duplicate_invoice(invoice_data):
    """Check for duplicate invoices"""
    invoice_number = invoice_data.get('invoice_number', '')
    vendor = invoice_data.get('vendor_name', '')
    total = invoice_data.get('total_amount', 0)
    date = invoice_data.get('invoice_date', '')
    
    for existing in invoices:
        # Check exact invoice number match
        if existing.get('invoice_number') == invoice_number:
            return True
        # Check vendor + date + total match
        if (existing.get('vendor_name') == vendor and 
            existing.get('invoice_date') == date and 
            abs(existing.get('total_amount', 0) - total) < 0.01):
            return True
    
    return False

def detect_unauthorized_surcharges(line_items):
    """Detect unauthorized surcharges"""
    surcharge_keywords = ['fuel surcharge', 'processing fee', 'handling fee', 'service charge', 
                          'admin fee', 'convenience fee', 'surcharge', 'extra charge']
    unauthorized = []
    
    for item in line_items:
        description = item.get('description', '').lower()
        for keyword in surcharge_keywords:
            if keyword in description:
                # Check if this surcharge is in rate card
                approved = False
                for rate in rate_cards:
                    if keyword in rate['service'].lower():
                        approved = True
                        break
                if not approved:
                    unauthorized.append({
                        'description': item['description'],
                        'amount': item['total'],
                        'keyword': keyword
                    })
    
    return unauthorized

def check_quantity_anomaly(description, quantity):
    """Check for quantity anomalies based on historical data"""
    key = description.lower().strip()
    if key in historical_data:
        hist = historical_data[key]
        avg = hist['average']
        if quantity > avg * 10:  # 10x threshold
            return True
    return False

def check_price_variance(description, unit_rate):
    """Check for price variance from historical data"""
    key = description.lower().strip()
    if key in historical_data:
        hist = historical_data[key]
        avg = hist['average_rate']
        if avg > 0 and abs(unit_rate - avg) / avg > 0.20:  # 20% variance
            return True
    return False

def generate_explanation(rule, context):
    """Generate a clear, human-readable explanation for an audit issue."""
    if rule == 'OVERCHARGE':
        desc = context.get('description', '')
        unit_rate = context.get('unit_rate', 0)
        approved_rate = context.get('approved_rate', 0)
        quantity = context.get('quantity', 1)
        overage = context.get('overage', 0)
        return (
            f"The vendor charged \u20b9{unit_rate:,.2f}/unit for '{desc}', "
            f"but the approved rate card allows only \u20b9{approved_rate:,.2f}/unit. "
            f"This results in an overcharge of \u20b9{unit_rate - approved_rate:,.2f} per unit "
            f"(\u00d7{quantity} qty = \u20b9{overage:,.2f} total excess)."
        )
    elif rule == 'GST_ERROR':
        gst_amount = context.get('gst_amount', 0)
        expected_gst = context.get('expected_gst', 0)
        gst_rate_pct = context.get('gst_rate_pct', 18)
        subtotal = context.get('subtotal', 0)
        diff = abs(gst_amount - expected_gst)
        return (
            f"The GST amount on the invoice is \u20b9{gst_amount:,.2f}, "
            f"but the expected GST ({gst_rate_pct}% of subtotal \u20b9{subtotal:,.2f}) "
            f"is \u20b9{expected_gst:,.2f}. The difference of \u20b9{diff:,.2f} exceeds "
            f"the 2% tolerance threshold, indicating a calculation error."
        )
    elif rule == 'DUPLICATE_INVOICE':
        inv_num = context.get('invoice_number', '')
        vendor = context.get('vendor_name', '')
        total = context.get('total_amount', 0)
        return (
            f"Invoice {inv_num} from '{vendor}' appears to be a duplicate \u2014 "
            f"an identical invoice number or a matching vendor + date + amount "
            f"combination already exists in the system. Paying this could result "
            f"in a double payment of \u20b9{total:,.2f}."
        )
    elif rule == 'UNAUTHORIZED_SURCHARGE':
        desc = context.get('description', '')
        amount = context.get('amount', 0)
        keyword = context.get('keyword', '')
        return (
            f"The line item '{desc}' (\u20b9{amount:,.2f}) contains a surcharge "
            f"keyword ('{keyword}') that is not listed in any approved rate card. "
            f"This charge may be unauthorized and should be verified with the vendor."
        )
    elif rule == 'QUANTITY_ANOMALY':
        desc = context.get('description', '')
        quantity = context.get('quantity', 0)
        return (
            f"The quantity of {quantity} for '{desc}' is more than 10\u00d7 the "
            f"historical average, which is unusually high and warrants manual review."
        )
    elif rule == 'PRICE_VARIANCE':
        desc = context.get('description', '')
        unit_rate = context.get('unit_rate', 0)
        return (
            f"The unit rate of \u20b9{unit_rate:,.2f} for '{desc}' deviates by more than "
            f"20% from the historical average rate, suggesting a possible pricing "
            f"error or unapproved rate change."
        )
    return 'An issue was detected that requires review.'

def run_audit(invoice_data):
    """Run comprehensive audit on invoice data"""
    issues = []
    total_overcharge = 0
    savings = 0
    
    # Rule 1: Overcharge Detection
    for item in invoice_data.get('line_items', []):
        description = item.get('description', '')
        unit_rate = item.get('unit_rate', 0)
        quantity = item.get('quantity', 1)
        total = item.get('total', 0)
        
        approved_rate = get_approved_rate(invoice_data.get('vendor_name', ''), description)
        
        if approved_rate and unit_rate > approved_rate:
            overage = (unit_rate - approved_rate) * quantity
            total_overcharge += overage
            explanation = generate_explanation('OVERCHARGE', {
                'description': description,
                'unit_rate': unit_rate,
                'approved_rate': approved_rate,
                'quantity': quantity,
                'overage': overage
            })
            issues.append({
                'rule': 'OVERCHARGE',
                'severity': 'HIGH',
                'description': f"{description}: Rate ${unit_rate} exceeds approved ${approved_rate}",
                'amount': overage,
                'line_item': item,
                'explanation': explanation
            })
    
    # Rule 2: GST Validation
    subtotal = invoice_data.get('subtotal', 0)
    gst_rate = invoice_data.get('gst_rate', 0.18)
    gst_rate = invoice_data.get('gst_rate', 0.18)

# normalize percentage if parsed as 9 instead of 0.09
    if gst_rate > 1:
        gst_rate = gst_rate / 100
        gst_amount = invoice_data.get('gst_amount', 0)
        expected_gst = subtotal * gst_rate
    
    if expected_gst > 0 and abs(gst_amount - expected_gst) / expected_gst > 0.02:  # 2% variance
        gst_error = gst_amount - expected_gst
        explanation = generate_explanation('GST_ERROR', {
            'gst_amount': gst_amount,
            'expected_gst': expected_gst,
            'gst_rate_pct': round(gst_rate * 100),
            'subtotal': subtotal
        })
        issues.append({
            'rule': 'GST_ERROR',
            'severity': 'MEDIUM',
            'description': f"GST calculation mismatch: Expected ${expected_gst:.2f}, Found ${gst_amount:.2f}",
            'amount': abs(gst_error),
            'explanation': explanation
        })
    
    # Rule 3: Duplicate Invoice Check
    if check_duplicate_invoice(invoice_data):
        explanation = generate_explanation('DUPLICATE_INVOICE', {
            'invoice_number': invoice_data.get('invoice_number', ''),
            'vendor_name': invoice_data.get('vendor_name', ''),
            'total_amount': invoice_data.get('total_amount', 0)
        })
        issues.append({
            'rule': 'DUPLICATE_INVOICE',
            'severity': 'CRITICAL',
            'description': 'Potential duplicate invoice detected',
            'amount': invoice_data.get('total_amount', 0),
            'explanation': explanation
        })
    
    # Rule 4: Unauthorized Surcharges
    unauthorized = detect_unauthorized_surcharges(invoice_data.get('line_items', []))
    for surcharge in unauthorized:
        explanation = generate_explanation('UNAUTHORIZED_SURCHARGE', {
            'description': surcharge['description'],
            'amount': surcharge['amount'],
            'keyword': surcharge.get('keyword', '')
        })
        issues.append({
            'rule': 'UNAUTHORIZED_SURCHARGE',
            'severity': 'HIGH',
            'description': f"Unauthorized charge: {surcharge['description']}",
            'amount': surcharge['amount'],
            'explanation': explanation
        })
    
    # Rule 5: Quantity Anomaly
    for item in invoice_data.get('line_items', []):
        if check_quantity_anomaly(item['description'], item['quantity']):
            explanation = generate_explanation('QUANTITY_ANOMALY', {
                'description': item['description'],
                'quantity': item['quantity']
            })
            issues.append({
                'rule': 'QUANTITY_ANOMALY',
                'severity': 'MEDIUM',
                'description': f"Unusual quantity for {item['description']}: {item['quantity']}",
                'amount': 0,
                'explanation': explanation
            })
    
    # Rule 6: Price Variance
    for item in invoice_data.get('line_items', []):
        if check_price_variance(item['description'], item['unit_rate']):
            explanation = generate_explanation('PRICE_VARIANCE', {
                'description': item['description'],
                'unit_rate': item['unit_rate']
            })
            issues.append({
                'rule': 'PRICE_VARIANCE',
                'severity': 'LOW',
                'description': f"Rate variance detected for {item['description']}",
                'amount': 0,
                'explanation': explanation
            })
    
    # Calculate savings
    savings = total_overcharge
    
    # Calculate compliance score
    severity_weights = {'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1}
    total_weight = 0
    for issue in issues:
        total_weight += severity_weights.get(issue['severity'], 1)
    
    compliance_score = max(0, 100 - (total_weight * 5))
    
    return {
        'issues': issues,
        'total_overcharge': total_overcharge,
        'potential_savings': savings,
        'compliance_score': compliance_score,
        'issue_count': len(issues),
        'critical_count': sum(1 for i in issues if i['severity'] == 'CRITICAL'),
        'high_count': sum(1 for i in issues if i['severity'] == 'HIGH'),
        'medium_count': sum(1 for i in issues if i['severity'] == 'MEDIUM'),
        'low_count': sum(1 for i in issues if i['severity'] == 'LOW')
    }

# Routes
@app.route('/', methods=['GET'])
def index():
    return jsonify({'service': 'AI Invoice Auditor API', 'status': 'running', 'docs': '/api/health'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    remember_me = data.get('remember_me', False)
    
    if email not in users:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user = users[email]
    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session.permanent = remember_me
    session['user_id'] = user['id']
    session['email'] = user['email']
    session['name'] = user['name']
    session['role'] = user['role']
    
    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'user': {
            'id': session.get('user_id'),
            'email': session.get('email'),
            'name': session.get('name'),
            'role': session.get('role')
        }
    })

@app.route('/api/invoices/upload', methods=['POST'])
@login_required
def upload_invoice():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: PDF, JPG, PNG, WEBP'}), 400
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large. Max size: 10MB'}), 400
    
    # Save file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Extract text based on file type
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    if file_ext == 'pdf':
        extracted_text = extract_text_from_pdf(file_path)
    else:
        extracted_text = extract_text_from_image(file_path)
    
    # Parse with AI
    invoice_data = parse_invoice_with_ai(extracted_text)
    invoice_data['file_id'] = file_id
    invoice_data['file_name'] = file.filename
    invoice_data['uploaded_at'] = datetime.now().isoformat()
    invoice_data['uploaded_by'] = session.get('email')
    
    # Run audit
    audit_result = run_audit(invoice_data)
    
    # Store invoice
    invoice_record = {
        'id': file_id,
        **invoice_data,
        'audit': audit_result
    }
    invoices.append(invoice_record)
    
    # Store audit report
    audit_report = {
        'id': str(uuid.uuid4()),
        'invoice_id': file_id,
        'vendor_name': invoice_data.get('vendor_name', ''),
        'invoice_number': invoice_data.get('invoice_number', ''),
        'invoice_date': invoice_data.get('invoice_date', ''),
        'total_amount': invoice_data.get('total_amount', 0),
        'audit_date': datetime.now().isoformat(),
        **audit_result
    }
    audit_reports.append(audit_report)
    
    return jsonify({
        'success': True,
        'invoice': invoice_record,
        'audit': audit_result
    })

@app.route('/api/invoices', methods=['GET'])
@login_required
def get_invoices():
    return jsonify({
        'invoices': invoices,
        'total': len(invoices)
    })

@app.route('/api/audit-reports', methods=['GET'])
@login_required
def get_audit_reports():
    return jsonify({
        'reports': audit_reports,
        'total': len(audit_reports)
    })

@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    total_invoices = len(invoices)
    total_billed = sum(inv.get('total_amount', 0) for inv in invoices)
    total_overcharges = sum(inv.get('audit', {}).get('total_overcharge', 0) for inv in invoices)
    total_savings = sum(inv.get('audit', {}).get('potential_savings', 0) for inv in invoices)
    
    duplicate_count = sum(1 for inv in invoices 
                         for issue in inv.get('audit', {}).get('issues', []) 
                         if issue['rule'] == 'DUPLICATE_INVOICE')
    
    gst_errors = sum(1 for inv in invoices 
                    for issue in inv.get('audit', {}).get('issues', []) 
                    if issue['rule'] == 'GST_ERROR')
    
    avg_compliance = 0
    if invoices:
        avg_compliance = sum(inv.get('audit', {}).get('compliance_score', 100) for inv in invoices) / len(invoices)
    
    # Vendor breakdown
    vendor_stats = {}
    for inv in invoices:
        vendor = inv.get('vendor_name', 'Unknown')
        if vendor not in vendor_stats:
            vendor_stats[vendor] = {'count': 0, 'amount': 0, 'issues': 0}
        vendor_stats[vendor]['count'] += 1
        vendor_stats[vendor]['amount'] += inv.get('total_amount', 0)
        vendor_stats[vendor]['issues'] += len(inv.get('audit', {}).get('issues', []))
    
    return jsonify({
        'total_invoices': total_invoices,
        'total_billed': total_billed,
        'total_overcharges': total_overcharges,
        'total_savings': total_savings,
        'duplicate_count': duplicate_count,
        'gst_errors': gst_errors,
        'avg_compliance_score': round(avg_compliance, 1),
        'vendor_breakdown': vendor_stats
    })

@app.route('/api/rate-cards', methods=['GET'])
@login_required
def get_rate_cards():
    return jsonify({'rate_cards': rate_cards})

@app.route('/api/rate-cards', methods=['POST'])
@login_required
def add_rate_card():
    data = request.get_json()
    rate_cards.append({
        'vendor': data.get('vendor'),
        'service': data.get('service'),
        'approved_rate': data.get('approved_rate'),
        'currency': data.get('currency', 'INR'),
        'effective_date': data.get('effective_date')
    })
    return jsonify({'success': True, 'rate_cards': rate_cards})

@app.route('/api/export/reports', methods=['GET'])
@login_required
def export_reports():
    format_type = request.args.get('format', 'json')
    
    if format_type == 'json':
        return jsonify({'reports': audit_reports})
    
    elif format_type == 'csv':
        if not audit_reports:
            return jsonify({'error': 'No reports to export'}), 400
        
        df = pd.DataFrame(audit_reports)
        csv_path = os.path.join(UPLOAD_FOLDER, 'audit_reports.csv')
        df.to_csv(csv_path, index=False)
        
        return jsonify({
            'success': True,
            'download_url': f'/api/download/audit_reports.csv'
        })
    
    return jsonify({'error': 'Unsupported format'}), 400

# Initialize demo data
init_demo_users()
init_demo_rate_cards()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

#!/usr/bin/env python3
"""
AI Invoice Auditor - Backend Startup Script
"""

import os
import sys
import subprocess

def main():
    """Start the Flask backend server"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    app_file = os.path.join(backend_dir, 'app.py')
    
    print("=" * 60)
    print("AI Invoice Auditor - Backend Server")
    print("=" * 60)
    print(f"Starting Flask server from: {backend_dir}")
    print("API URL: http://localhost:5000")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        # Change to backend directory and run Flask
        os.chdir(backend_dir)
        subprocess.run([sys.executable, app_file], check=True)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
    except Exception as e:
        print(f"\nError starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

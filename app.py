import csv
import hmac
import io
import os
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, Response, session, redirect, url_for

import db

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']
PROFESSOR_PASSWORD = os.environ['PROFESSOR_PASSWORD']
db.init_db()

def safe_cell(value):
    if value and value[0] in '=+-@':
        return "'" + value
    return value

def professor_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get('is_professor'):
            return redirect(url_for('login'))
        return view(*args, **kwargs)
    return wrapped

@app.route('/')
def home():
    return render_template('draw.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    tsn = (data.get('tsn') or '').strip()
    drawing = data.get('drawing') or ''

    if not name: 
        return jsonify({'ok': False, 'error': 'Please enter your name.'}), 400

    if not tsn:
        return jsonify({'ok': False, 'error': 'Please enter your TSN.'}), 400
    
    if not drawing.startswith('data:image/png;base64,'):
        return jsonify({'ok': False, 'error': 'Your drawing is missing.'}), 400

    db.save_submission(name, tsn, drawing)
    print('Saved a drawing from: ', name)

    return jsonify({'ok': True})

@app.route('/results')
@professor_required
def results():
    submissions = db.get_submissions()
    return render_template('results.html', submissions=submissions)

@app.route('/results.csv')
@professor_required
def results_csv():
    submissions = db.get_submissions()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Name', 'TSN', 'Submitted at'])

    for s in submissions:
        writer.writerow([safe_cell(s['name']), safe_cell(s['tsn']),s['submitted_at']])

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=bicycle-submissions.csv'},
    )

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        password = request.form.get('password', '')
        if hmac.compare_digest(password.encode(), PROFESSOR_PASSWORD.encode()):
            session['is_professor'] = True
            return redirect(url_for('results'))
        error = 'Wrong password.'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port = 5001)
from flask import Flask, render_template, request, jsonify, Response

import db
import csv
import io

app = Flask(__name__)
db.init_db()

def safe_cell(value):
    if value and value[0] in '=+-@':
        return "'" + value
    return value

@app.route('/')
def home():
    return render_template('draw.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    drawing = data.get('drawing') or ''

    if not name: 
        return jsonify({'ok': False, 'error': 'Please enter your name.'}), 400

    if not drawing.startswith('data:image/png;base64,'):
        return jsonify({'ok': False, 'error': 'Your drawing is missing.'}), 400

    db.save_submission(name, drawing)
    print('Saved a drawing from: ', name)

    return jsonify({'ok': True})

@app.route('/results')
def results():
    submissions = db.get_submissions()
    return render_template('results.html', submissions=submissions)

@app.route('/results.csv')
def results_csv():
    submissions = db.get_submissions()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Name', 'Submitted at'])

    for s in submissions:
        writer.writerow([safe_cell(s['name']), s['submitted_at']])

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=bicycle-submissions.csv'},
    )
if __name__ == '__main__':
    app.run(debug=True, port = 5001)
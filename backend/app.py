from flask import Flask
from routes.transactions import transactions_bp
from routes.users import users_bp
from routes.categories import categories_bp
from flask_cors import CORS
from routes.ai import ai_bp

app = Flask(__name__)

# routes register
app.register_blueprint(transactions_bp)
app.register_blueprint(users_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(ai_bp)


#allows api calls from frontend
CORS(app, origins=["http://localhost:5173","http://localhost:5174"])

@app.route('/')
def home():
    return "Dollar.js backend is running 🪙"

if __name__ == '__main__':
    app.run(debug=True)

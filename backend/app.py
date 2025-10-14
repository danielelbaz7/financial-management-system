from flask import Flask
from routes.transactions import transactions_bp
from routes.users import users_bp
from routes.categories import categories_bp

app = Flask(__name__)

# routes register
app.register_blueprint(transactions_bp)
app.register_blueprint(users_bp)
app.register_blueprint(categories_bp)

@app.route('/')
def home():
    return "Dollar.js backend is running 🪙"

if __name__ == '__main__':
    app.run(debug=True)

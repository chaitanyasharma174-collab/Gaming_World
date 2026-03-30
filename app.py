# -------------------- IMPORTS --------------------
from flask import (
    Flask, render_template, request,
    jsonify, session, redirect, url_for
)
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# -------------------- APP INIT --------------------
app = Flask(__name__)
app.secret_key = "gameportal_secret_key"

# -------------------- LOGIN REQUIRED --------------------
def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            session["login_required"] = True
            return redirect(url_for("home"))
        return view(*args, **kwargs)
    return wrapped_view

# -------------------- DATABASE CONNECTION --------------------
def get_db():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="root",     # change if needed
        database="gameportal",
        port=8889            # MAMP port
    )

# -------------------- PAGE ROUTES --------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/latest-games")
def latest_games():
    return render_template("latest-games.html")

@app.route("/top-games")
def top_games():
    return render_template("top-games.html")

@app.route("/play-game")
@login_required
def play_game():
    return render_template("play-game.html")

# -------------------- SIGNUP API --------------------
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()

        # 🔥 SAFE GET
        first = data.get("first")
        last = data.get("last")
        email = data.get("email")
        password = data.get("password")

        # 🔥 VALIDATION
        if not first or not last or not email or not password:
            return jsonify({
                "status": "error",
                "message": "All fields are required"
            }), 400

        db = get_db()
        cur = db.cursor()

        cur.execute(
            """
            INSERT INTO users (first_name, last_name, email, password)
            VALUES (%s, %s, %s, %s)
            """,
            (
                first,
                last,
                email,
                generate_password_hash(password)
            )
        )

        db.commit()

        return jsonify({
            "status": "success",
            "message": "Signup successful!"
        })

    except mysql.connector.Error as err:
        print("DB ERROR:", err)
        return jsonify({
            "status": "error",
            "message": "Email already exists or DB issue"
        }), 500

    except Exception as e:
        print("GENERAL ERROR:", e)
        return jsonify({
            "status": "error",
            "message": "Server error"
        }), 500

    finally:
        try:
            cur.close()
            db.close()
        except:
            pass

# -------------------- LOGIN API --------------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Missing email or password"
            }), 400

        db = get_db()
        cur = db.cursor(dictionary=True)

        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cur.fetchone()

        cur.close()
        db.close()

        if not user:
            return jsonify({
                "status": "fail",
                "message": "User not registered"
            })

        if check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["user_name"] = user["first_name"]

            return jsonify({
                "status": "success",
                "message": "Login successful!"
            })

        return jsonify({
            "status": "fail",
            "message": "Invalid password"
        })

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({
            "status": "error",
            "message": "Server error"
        }), 500

# -------------------- LOGOUT --------------------
@app.route("/logout")
def logout():
    session.clear()
    return jsonify({
        "status": "success",
        "message": "Logged out successfully!"
    })

# -------------------- CHECK LOGIN --------------------
@app.route("/check-login")
def check_login():
    if "user_id" in session:
        return jsonify({
            "logged_in": True,
            "name": session.get("user_name")
        })

    login_required_flag = session.pop("login_required", False)

    return jsonify({
        "logged_in": False,
        "login_required": login_required_flag
    })

# -------------------- RUN --------------------
if __name__ == "__main__":
    app.run(debug=True)
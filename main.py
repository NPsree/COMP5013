from flask import Flask, request, jsonify, render_template, flash, redirect, url_for, session
import sqlite3
import time

app = Flask(__name__)
app.secret_key = 'Alohomora'

DATABASE = 'debate.sqlite'

@app.route('/debug/log', methods=['POST'])
def debug_log():
    data = request.json
    print("JS DEBUG:", data)
    return jsonify({"message": "Logged"}), 200

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/session/status')
def session_status():
    if 'user' in session:
        return jsonify({
            "loggedIn": True,
            "user": session['user']
        })
    return jsonify({
        "loggedIn": False
    })

@app.route('/messages', methods=['GET', 'POST'])
def messages():
    if request.method == 'POST':
        content = request.json.get('content')
        if content:
            with sqlite3.connect(DATABASE) as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT INTO messages (content) VALUES (?)", (content,))
                conn.commit()
            return jsonify({"message": "Message added successfully!"}), 201
        return jsonify({"error": "Content is required"}), 400
    elif request.method == 'GET':
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM messages")
            messages = cursor.fetchall()
        return jsonify(messages)

@app.route('/section/Register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.json
        userName = data.get('userName')
        passwordHash = data.get('passwordHash')
        isAdmin = False
        creationTime = lastVisit = int(time.time())

        if not userName or not passwordHash:
            return jsonify({"error": "Username and password are required."}), 400

        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM user WHERE userName = ?", (userName,))

            row = cursor.fetchall()

            if(row):
                return jsonify({"error": "Username already exists"}), 400

            cursor.execute(
                "INSERT INTO user (userName, passwordHash, isAdmin, creationTime, lastVisit) VALUES (?, ?, ?, ?, ?)",
                (userName, passwordHash, isAdmin, creationTime, lastVisit)
            )
            conn.commit()
            return jsonify({"message": "User registered successfully!"}), 201
                
    return render_template('sections/register.html')

@app.route('/section/Login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        userName = data.get('userName')
        passwordHash = data.get('passwordHash')

        if not userName or not passwordHash:
            return jsonify({"error": "Username and password are required."}), 400

        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE user
                SET lastVisit = strftime('%s', 'now')
                WHERE userName = ? AND passwordHash = ?
                """,
                (userName, passwordHash)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Invalid username or password."}), 401
            session['user']= userName
            print(userName)
            print(session['user'])
            conn.commit()
            return jsonify({"message": "Login successful!"}), 200
    return render_template('sections/login.html')

@app.route('/section/Logout', methods=['GET', 'POST'])
def logout():
    if 'user' in session:
        username = session["user"]
        session.pop('user', None)
        return render_template('sections/logout.html', username=username)
    else:
        return render_template('sections/logout.html')

@app.route('/section/Home/GetTopics', methods=['GET'])
def get_topics():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT topicName, postingUser, topicID FROM topic ORDER BY creationTime DESC")
        topics = cursor.fetchall()
    return jsonify([
        {"topicName": topic[0], "userName": topic[1], "topicID": topic[2]}
        for topic in topics
    ])

@app.route('/topic', methods=['GET'])
def load_topic():
    return render_template('sections/topic.html')

@app.route('/topic/<int:topic_id>', methods=['GET'])
def view_topic(topic_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT topicName, postingUser FROM topic WHERE topicID = ?", (topic_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Topic not found."}), 404
        topic = {"topicName": row[0], "userName": row[1]}
        cursor.execute("SELECT claimID, postingUser, text FROM claim WHERE topic = ? AND claimID NOT IN (SELECT second FROM claimToClaim);", (topic_id,))
        claims = [{"claimID": claim[0], "userName": claim[1], "text": claim[2]} for claim in cursor.fetchall()]
    return jsonify({"topic": topic, "claims": claims})

@app.route('/section/Home/CreateTopic')
def create_topic_page():
    if 'user' in session:
        return render_template('sections/create_topic.html')
    else:
        return redirect(url_for('login'))

@app.route('/section/Home/CreateTopic/New', methods=['POST', 'GET'])
def create_topic():
    if request.method == 'POST':
        data = request.json
        topicDescription = data.get('topicDescription')
        creationTime = updateTime = int(time.time())
        userName = session.get('user')
        if not topicDescription:
            return jsonify({"error": "Topic description is required."}), 400
        if not userName:
            return jsonify({"error": "User is required."}), 400
        
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO topic (topicName, postingUser, creationTime, updateTime)
                VALUES (?, ?, ?, ?)
                """,
                (topicDescription, userName, creationTime, updateTime)
            )
            conn.commit()
            return jsonify({"message": "Topic created successfully!"}), 201

@app.route('/section/CreateClaim', methods=['POST', 'GET'])
def create_claim():
    if request.method == 'POST':
        data = request.json
        claimDescription = data.get('claimDescription')
        topicID = data.get('topicID')
        creationTime = updateTime = int(time.time())
        userName = session.get('user')
        if not claimDescription:
            return jsonify({"error": "Topic description is required."}), 400
        if not userName:
            return jsonify({"error": "User is required."}), 400
        
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO claim (topic, postingUser, creationTime, updateTime, text)
                VALUES (?, ?, ?, ?, ?)
                """,
                (topicID, userName, creationTime, updateTime, claimDescription)
            )
            cursor.execute(
                """
                UPDATE topic
                SET updateTime = ?
                WHERE topicID = ?
                """,
                (updateTime, topicID)
            )
            conn.commit()
            return jsonify({"message": "Claim published successfully!"}), 201

@app.route('/section/CreateClaimtoClaim', methods=['POST'])
def create_claimtoClaim():
    data = request.json

    claimDescription = data.get('claimDescription')
    parentClaimID = data.get('ClaimID')
    # selectedClaimRelType = data.get('selectedClaimRelType')
    selectedClaimRelType = data.get('selectedRelType')

    creationTime = updateTime = int(time.time())
    userName = session.get('user')

    if not claimDescription:
        return jsonify({"error": "Claim description is required."}), 400

    if not parentClaimID:
        return jsonify({"error": "Parent claim ID is required."}), 400

    if not selectedClaimRelType:
        return jsonify({"error": "Claim relationship type is required."}), 400

    if not userName:
        return jsonify({"error": "User is required."}), 400

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        # 1. Use the existing claimID to find the topicID
        cursor.execute(
            """
            SELECT topic
            FROM claim
            WHERE claimID = ?
            """,
            (parentClaimID,)
        )

        parent_claim = cursor.fetchone()

        if not parent_claim:
            return jsonify({"error": "Parent claim not found."}), 404

        topicID = parent_claim[0]

        # 2. Insert the new claim into the claim table
        cursor.execute(
            """
            INSERT INTO claim (topic, postingUser, creationTime, updateTime, text)
            VALUES (?, ?, ?, ?, ?)
            """,
            (topicID, userName, creationTime, updateTime, claimDescription)
        )

        newClaimID = cursor.lastrowid

        # 3. Insert the relationship into claimToClaim
        cursor.execute(
            """
            INSERT INTO claimToClaim (first, second, claimRelType)
            VALUES (?, ?, ?)
            """,
            (parentClaimID, newClaimID, selectedClaimRelType)
        )

        # 4. Update the topic updateTime
        cursor.execute(
            """
            UPDATE topic
            SET updateTime = ?
            WHERE topicID = ?
            """,
            (updateTime, topicID)
        )

        # 5. Optional but sensible: update the parent claim updateTime
        cursor.execute(
            """
            UPDATE claim
            SET updateTime = ?
            WHERE claimID = ?
            """,
            (updateTime, parentClaimID)
        )

        conn.commit()

        return jsonify({
            "message": "Claim-to-claim published successfully!",
            "newClaimID": newClaimID,
            "parentClaimID": parentClaimID,
            "topicID": topicID
        }), 201

@app.route('/section/CreateReplytoClaim', methods=['POST'])
def create_reply_to_claim():
    data = request.json or {}

    replyDescription = data.get('replyDescription')
    claimID = data.get('ClaimID')
    # selectedReplyRelType = data.get('selectedReplyRelType')
    selectedReplyRelType = data.get('selectedRelType')

    creationTime = int(time.time())
    userName = session.get('user')

    if not replyDescription:
        return jsonify({"error": "Reply description is required."}), 400

    if not claimID:
        return jsonify({"error": "Claim ID is required."}), 400

    if not selectedReplyRelType:
        return jsonify({"error": "Reply relation type is required."}), 400

    if not userName:
        return jsonify({"error": "User is required."}), 400

    try:
        claimID = int(claimID)
        selectedReplyRelType = int(selectedReplyRelType)
    except ValueError:
        return jsonify({"error": "Invalid claim ID or reply relation type."}), 400

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT topic
            FROM claim
            WHERE claimID = ?
            """,
            (claimID,)
        )

        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Claim not found."}), 404

        topicID = row[0]

        cursor.execute(
            """
            INSERT INTO replyText 
                (postingUser, creationTime, text)
            VALUES 
                (?, ?, ?)
            """,
            (userName, creationTime, replyDescription)
        )

        replyID = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO replyToClaim
                (reply, claim, replyToClaimRelType)
            VALUES
                (?, ?, ?)
            """,
            (replyID, claimID, selectedReplyRelType)
        )

        cursor.execute(
            """
            UPDATE claim
            SET updateTime = ?
            WHERE claimID = ?
            """,
            (creationTime, claimID)
        )

        cursor.execute(
            """
            UPDATE topic
            SET updateTime = ?
            WHERE topicID = ?
            """,
            (creationTime, topicID)
        )

        conn.commit()

    return jsonify({"message": "Reply published successfully!"}), 201

@app.route('/section/CreateReplytoReply', methods=['POST'])
def create_reply_to_reply():
    data = request.json or {}

    replyDescription = data.get('replyDescription')
    parentReplyID = data.get('ReplyID')
    selectedRelType = data.get('selectedRelType')
    print(parentReplyID)

    creationTime = int(time.time())
    userName = session.get('user')

    if not replyDescription:
        return jsonify({"error": "Reply description is required."}), 400

    if not parentReplyID:
        return jsonify({"error": "Parent reply ID is required."}), 400

    if not selectedRelType:
        return jsonify({"error": "Reply relation type is required."}), 400

    if not userName:
        return jsonify({"error": "User is required."}), 400

    try:
        parentReplyID = int(parentReplyID)
        selectedRelType = int(selectedRelType)
    except ValueError:
        return jsonify({"error": "Invalid reply ID or relation type."}), 400

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT replyTextID
            FROM replyText
            WHERE replyTextID = ?
            """,
            (parentReplyID,)
        )

        parent_reply = cursor.fetchone()

        if not parent_reply:
            return jsonify({"error": "Parent reply not found."}), 404

        cursor.execute(
            """
            INSERT INTO replyText
                (postingUser, creationTime, text)
            VALUES
                (?, ?, ?)
            """,
            (userName, creationTime, replyDescription)
        )

        newReplyID = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO replyToReply
                (reply, parent, replyToReplyRelType)
            VALUES
                (?, ?, ?)
            """,
            (newReplyID, parentReplyID, selectedRelType)
        )

        conn.commit()

    return jsonify({
        "message": "Reply published successfully!",
        "replyID": newReplyID
    }), 201

@app.route('/claim', methods=['GET'])
def load_claim():
    return render_template('sections/claim.html')

@app.route('/reply', methods=['GET'])
def load_reply():
    return render_template('sections/reply.html')

@app.route('/claim/back/<int:claim_id>', methods=['GET'])
def back_claim(claim_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT first
            FROM claimToClaim
            WHERE second = ?
        """, (claim_id,))  # IMPORTANT: comma makes this a tuple
        
        row = cursor.fetchone()

        if row:
            return jsonify({
                "type": "claim",
                "id": row[0]
            })

        cursor.execute("""
            SELECT topic
            FROM claim
            WHERE claimID = ?
        """, (claim_id,))

        row = cursor.fetchone()

        if row:
            return jsonify({
                "type": "topic",
                "id": row[0]
            })

        return jsonify({"error": "Claim not found"}), 404
    
@app.route('/reply/back/<int:reply_id>', methods=['GET'])
def back_reply(reply_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT parent
            FROM replyToReply
            WHERE reply = ?
        """, (reply_id,))  # IMPORTANT: comma makes this a tuple
        
        row = cursor.fetchone()

        if row:
            return jsonify({
                "type": "reply",
                "id": row[0]
            })

        cursor.execute("""
            SELECT claim
            FROM replyToClaim
            WHERE reply = ?
        """, (reply_id,))

        row = cursor.fetchone()

        if row:
            return jsonify({
                "type": "claim",
                "id": row[0]
            })

        return jsonify({"error": "Claim not found"}), 404

@app.route('/claim/<int:claim_id>', methods=['GET'])
def view_claim(claim_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        # Main claim
        cursor.execute("""
            SELECT claimID, topic, postingUser, text
            FROM claim
            WHERE claimID = ?
        """, (claim_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Claim not found."}), 404

        claim = {
            "claimID": row[0],
            "topicID": row[1],
            "userName": row[2],
            "text": row[3]
        }

        topicID = row[1]

        cursor.execute("""
            SELECT claim.claimID, claim.postingUser, claim.text, claimToClaim.claimRelType
            FROM claim
            INNER JOIN claimToClaim
                ON claim.claimID = claimToClaim.second
            WHERE claim.topic = ?
            AND claimToClaim.first = ?;
                    """, (topicID, claim_id))

        related_claims = [
            {
                "claimID": related[0],
                "userName": related[1],
                "text": related[2],
                "relationType": related[3]
            }
            for related in cursor.fetchall()
        ]

        cursor.execute("""
            SELECT replyText.replyTextID, replyText.postingUser, replyText.text, replyToClaim.replyToClaimRelType
            FROM replyText
            JOIN replyToClaim
            ON replyText.replyTextID = replyToClaim.reply
            WHERE replyToClaim.claim = ?
        """, (claim_id,))

        replies = [
            {
                "replyID": reply[0],
                "userName": reply[1],
                "text": reply[2],
                "relationType": reply[3]
            }
            for reply in cursor.fetchall()
        ]


        # for claims in related_claims:
        #     print(claims)

        
    return jsonify({
        "claim": claim,
        "relatedClaims": related_claims,
        "replies": replies
    })

@app.route('/reply/<int:reply_id>', methods=['GET'])
def view_reply(reply_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT postingUser, text
            FROM replyText
            WHERE replyTextID = ?
        """, (reply_id,))

        row = cursor.fetchone()
        reply = {
            "userName": row[0],
            "text": row[1]
        }

        cursor.execute("""
            SELECT replyText.replyTextID, replyText.postingUser, replyText.text, replyToReply.replyToReplyRelType
            FROM replyText
            JOIN replyToReply
            ON replyText.replyTextID = replyToReply.reply
            WHERE replyToReply.parent = ?
        """, (reply_id,))

        related_replies = [
            {
                "replyID": reply[0],
                "userName": reply[1],
                "text": reply[2],
                "relationType": reply[3]
            }
            for reply in cursor.fetchall()
        ]

    return jsonify({
        "reply": reply,
        "relatedReplies": related_replies
    })



@app.route('/section/<section_name>')
def get_section(section_name):
    section_templates = {
        'Home': 'sections/home.html',
        'Featured': 'sections/featured.html',
        'Popular': 'sections/popular.html',
        'New': 'sections/new.html',
        'Hot': 'sections/hot.html',
        'Controversial': 'sections/controversial.html',
        'Login': 'sections/login.html',
    }
    template_file = section_templates.get(section_name)
    if template_file:
        return render_template(template_file)
    else:
        return '<h2>Unknown Section</h2><p>The requested section does not exist.</p>'

if __name__ == '__main__':
    app.run(debug=True)
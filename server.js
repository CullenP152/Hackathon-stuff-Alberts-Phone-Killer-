const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//Railway connection string
const DB_URL = 'mysql://root:zKhPNsjFIVAVRTOIATyanipGgCsVsbcq@mainline.proxy.rlwy.net:13101/railway';

// Create connection to Railway MySQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const db = mysql.createConnection(DB_URL);

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('✅ Connected to Railway MySQL database!');
});

// API endpoint: Get user progress
app.get('/api/progress', (req, res) => {
    db.query('SELECT * FROM user_progress WHERE id = 1', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            db.query('INSERT INTO user_progress (username, points, completed_tasks) VALUES (?, ?, ?)', 
                ['John', 0, '[]'], 
                (err2) => {
                    if (err2) throw err2;
                    res.json({ username: 'John', points: 0, completed_tasks: '[]' });
                });
        } else {
            res.json(results[0]);
        }
    });
});

// API endpoint: Update progress when task is completed
app.post('/api/complete-task', (req, res) => {
    const { points, completedTasks } = req.body;
    
    db.query(
        'UPDATE user_progress SET points = ?, completed_tasks = ? WHERE id = 1',
        [points, JSON.stringify(completedTasks)],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Update failed' });
                return;
            }
            res.json({ success: true });
        }
    );
});

// API endpoint: Reset progress
app.post('/api/reset', (req, res) => {
    db.query(
        'UPDATE user_progress SET points = 0, completed_tasks = "[]" WHERE id = 1',
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Reset failed' });
                return;
            }
            // Also reset all tasks to uncompleted
            db.query(
                'UPDATE tasks SET completed = 0',
                (err2) => {
                    if (err2) {
                        console.error(err2);
                        res.status(500).json({ error: 'Task reset failed' });
                        return;
                    }
                    res.json({ success: true });
                }
            );
        }
    );
});

// Update individual task boolean in tasks table
app.post('/api/update-task', (req, res) => {
    const { taskId, completed } = req.body;
    db.query(
        'UPDATE tasks SET completed = ? WHERE id = ?',
        [completed ? 1 : 0, taskId],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Update failed' });
                return;
            }
            res.json({ success: true });
        }
    );
});

// ===== ADDED: Get today's daily quests =====
app.get('/api/daily-quests', (req, res) => {
    db.query('SELECT * FROM daily_quests WHERE id = 1', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results[0]);
    });
});

// ===== ADDED: Save today's daily quests =====
app.post('/api/daily-quests', (req, res) => {
    const { date, questIds } = req.body;
    db.query(
        'UPDATE daily_quests SET date = ?, quest_ids = ? WHERE id = 1',
        [date, JSON.stringify(questIds)],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Update failed' });
                return;
            }
            res.json({ success: true });
        }
    );
});
// ===== END ADDED =====

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
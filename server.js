/**
 * ==========================================================================
 * TaskSphere - Express Server & SQLite Database (server.js)
 * ==========================================================================
 */

import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Middleware
app.use(express.json());
// Serve frontend static files
app.use(express.static(__dirname));

// Initialize Database Connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeTable();
    }
});

// Helper database functions wrapped in Promises
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Create tables if not exists
async function initializeTable() {
    try {
        await dbRun(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                priority TEXT DEFAULT 'medium',
                category TEXT DEFAULT 'General',
                dueDate TEXT,
                completed INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL
            )
        `);
        console.log('Tasks table initialized.');
    } catch (err) {
        console.error('Error initializing table:', err.message);
    }
}

// API Routes

// 1. GET ALL TASKS
app.get('/api/tasks', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM tasks ORDER BY createdAt DESC');
        // Map SQLite 0/1 back to boolean false/true
        const tasks = rows.map(task => ({
            ...task,
            completed: !!task.completed
        }));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE NEW TASK (or restore deleted one with existing ID)
app.post('/api/tasks', async (req, res) => {
    const { id, title, description, priority, category, dueDate, completed, createdAt } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    // Use provided ID or generate one
    const taskId = id || 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const taskCreatedAt = createdAt || new Date().toISOString();
    const taskCompleted = completed ? 1 : 0;

    try {
        await dbRun(
            `INSERT INTO tasks (id, title, description, priority, category, dueDate, completed, createdAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [taskId, title.trim(), description || '', priority || 'medium', category || 'General', dueDate || '', taskCompleted, taskCreatedAt]
        );
        
        const createdTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [taskId]);
        res.status(201).json({
            ...createdTask,
            completed: !!createdTask.completed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE TASK
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const existing = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Build dynamic update query based on fields sent
        const fields = [];
        const params = [];

        Object.keys(updates).forEach(key => {
            if (['title', 'description', 'priority', 'category', 'dueDate', 'completed'].includes(key)) {
                fields.push(`${key} = ?`);
                if (key === 'completed') {
                    params.push(updates[key] ? 1 : 0);
                } else {
                    params.push(updates[key]);
                }
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid updates provided' });
        }

        params.push(id);
        await dbRun(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);

        const updated = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json({
            ...updated,
            completed: !!updated.completed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE TASK
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await dbRun('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({
            message: 'Task deleted successfully',
            deletedTask: {
                ...task,
                completed: !!task.completed
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`TaskSphere Premium Server running at http://localhost:${PORT}`);
});

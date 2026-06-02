/**
 * ==========================================================================
 * TaskSphere - State Management Module (state.js)
 * ==========================================================================
 */

// In-memory tasks cache to keep read operations synchronous & extremely fast
let tasks = [];
let lastDeletedTask = null; // Cache for the Undo feature

/**
 * Initialize state from MySQL database backend via REST API
 */
export async function init() {
    try {
        const response = await fetch('../backend/api.php');
        if (!response.ok) throw new Error('API response was not OK');
        tasks = await response.json();
        
        // REVISION: Empty state auto-population has been completely removed.
        // If the task list is empty in the database, it remains empty on load/refresh.
        console.log("Loaded tasks from MySQL database successfully.");
    } catch (e) {
        console.error("Failed to load tasks from MySQL server, falling back to memory:", e);
        tasks = getSampleTasks(); // Fallback tasks only shown on connection failure
    }
}

/**
 * Get all tasks filtered, searched, and sorted (Synchronous from local cache)
 * @param {Object} filters
 * @param {string} filters.search - Search term
 * @param {string} filters.category - Category filter ('all' or specific)
 * @param {string} filters.priority - Priority filter ('all' or specific)
 * @param {string} filters.sortBy - Sort field ('dueDate', 'priority', 'createdAt')
 */
export function getTasks({ search = '', category = 'all', priority = 'all', sortBy = 'dueDate' } = {}) {
    let filtered = [...tasks];

    // 1. Text Search Filter
    if (search.trim()) {
        const query = search.toLowerCase().trim();
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(query) || 
            task.description.toLowerCase().includes(query)
        );
    }

    // 2. Category Filter
    if (category !== 'all') {
        filtered = filtered.filter(task => task.category.toLowerCase() === category.toLowerCase());
    }

    // 3. Priority Filter
    if (priority !== 'all') {
        filtered = filtered.filter(task => task.priority.toLowerCase() === priority.toLowerCase());
    }

    // 4. Sorting Logic
    filtered.sort((a, b) => {
        if (sortBy === 'dueDate') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'priority') {
            const weight = { high: 3, medium: 2, low: 1 };
            return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        } else {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    return filtered;
}

/**
 * Add a new task to MySQL server and local cache
 * @param {Object} taskData 
 */
export async function addTask({ title, description, priority, category, dueDate, id, createdAt, completed }) {
    const taskPayload = {
        id,
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'medium',
        category: category ? category.trim() : 'General',
        dueDate: dueDate || '',
        completed: completed || false,
        createdAt
    };

    try {
        const response = await fetch('../backend/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskPayload)
        });

        if (!response.ok) throw new Error('Failed to create task on database server');
        const newTask = await response.json();

        // Update local memory cache
        const existingIdx = tasks.findIndex(t => t.id === newTask.id);
        if (existingIdx !== -1) {
            tasks[existingIdx] = newTask;
        } else {
            tasks.push(newTask);
        }
        
        return newTask;
    } catch (e) {
        console.error("Error adding task to database, using memory fallback:", e);
        const fallbackTask = {
            ...taskPayload,
            id: taskPayload.id || 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: taskPayload.createdAt || new Date().toISOString()
        };
        tasks.push(fallbackTask);
        return fallbackTask;
    }
}

/**
 * Update an existing task in MySQL server and local cache
 * @param {string} id 
 * @param {Object} updates 
 */
export async function updateTask(id, updates) {
    try {
        const response = await fetch(`../backend/api.php?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update task on database server');
        const updatedTask = await response.json();

        // Update local memory cache
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        return updatedTask;
    } catch (e) {
        console.error("Error updating task in database, using memory fallback:", e);
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return null;

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates
        };
        return tasks[taskIndex];
    }
}

/**
 * Delete a task from MySQL server and local cache
 * @param {string} id 
 */
export async function deleteTask(id) {
    try {
        const response = await fetch(`../backend/api.php?id=${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task on database server');
        const data = await response.json();
        
        // Cache for Undo
        lastDeletedTask = data.deletedTask;

        // Remove from local memory cache
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
        }

        return lastDeletedTask;
    } catch (e) {
        console.error("Error deleting task in database, using memory fallback:", e);
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return null;

        lastDeletedTask = { ...tasks[taskIndex] };
        tasks.splice(taskIndex, 1);
        return lastDeletedTask;
    }
}

/**
 * Undo last deletion
 */
export async function undoDelete() {
    if (!lastDeletedTask) return null;

    try {
        const restored = await addTask(lastDeletedTask);
        lastDeletedTask = null; // Clear cache
        return restored;
    } catch (e) {
        console.error("Failed to undo task deletion:", e);
        return null;
    }
}

/**
 * Get overall task statistics (Synchronous from local cache)
 */
export function getStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, percent };
}

/**
 * Get distinct categories present in all tasks (Synchronous from local cache)
 */
export function getCategories() {
    const cats = new Set(tasks.map(t => t.category));
    return ['General', ...Array.from(cats)].filter((v, i, self) => self.indexOf(v) === i);
}

/**
 * Sample initial data for connection failures
 */
function getSampleTasks() {
    const today = new Date();
    const formatDate = (daysOffset) => {
        const d = new Date(today);
        d.setDate(today.getDate() + daysOffset);
        return d.toISOString().split('T')[0];
    };

    return [
        {
            id: 'sample_1',
            title: 'Design Dashboard UI TaskSphere',
            description: 'Membuat mockup desain antarmuka pengguna (UI) premium dengan gaya glassmorphism dan palette warna HSL kustom.',
            priority: 'high',
            category: 'Design',
            dueDate: formatDate(1),
            completed: false,
            createdAt: new Date(today.getTime() - 2 * 3600000).toISOString()
        },
        {
            id: 'sample_2',
            title: 'Integrasikan Modul State Manager',
            description: 'Menulis logika JavaScript (state.js) untuk sinkronisasi CRUD dengan browser localStorage secara bersih.',
            priority: 'medium',
            category: 'Development',
            dueDate: formatDate(3),
            completed: true,
            createdAt: new Date(today.getTime() - 12 * 3600000).toISOString()
        },
        {
            id: 'sample_3',
            title: 'Belanja Kebutuhan Mingguan',
            description: 'Membeli buah segar, kopi, susu oat, dan camilan untuk konsumsi selama sesi programming akhir pekan.',
            priority: 'low',
            category: 'Personal',
            dueDate: formatDate(5),
            completed: false,
            createdAt: new Date(today.getTime() - 24 * 3600000).toISOString()
        }
    ];
}

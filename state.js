/**
 * ==========================================================================
 * TaskSphere - State Management Module (state.js)
 * ==========================================================================
 */

// Local storage key
const STORAGE_KEY = 'tasksphere_tasks';

// Task State
let tasks = [];
let lastDeletedTask = null; // Cache for the Undo feature

/**
 * Initialize state from localStorage
 */
export function init() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        tasks = stored ? JSON.parse(stored) : getSampleTasks();
        if (!stored) {
            saveToStorage();
        }
    } catch (e) {
        console.error("Failed to load tasks from localStorage:", e);
        tasks = getSampleTasks();
    }
}

/**
 * Get all tasks filtered, searched, and sorted
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
        // Handle completed sorting: uncompleted tasks always show up first or keep order?
        // Let's sort by the selected criterion
        if (sortBy === 'dueDate') {
            // Sort by due date (closest first). If no due date, put it last.
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'priority') {
            // Priority weight: high = 3, medium = 2, low = 1
            const weight = { high: 3, medium: 2, low: 1 };
            return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        } else {
            // Sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    return filtered;
}

/**
 * Add a new task
 * @param {Object} taskData 
 */
export function addTask({ title, description, priority, category, dueDate }) {
    const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'medium',
        category: category ? category.trim() : 'General',
        dueDate: dueDate || '',
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveToStorage();
    return newTask;
}

/**
 * Update an existing task
 * @param {string} id 
 * @param {Object} updates 
 */
export function updateTask(id, updates) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates
    };

    saveToStorage();
    return tasks[taskIndex];
}

/**
 * Delete a task
 * @param {string} id 
 */
export function deleteTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    // Cache for Undo
    lastDeletedTask = { ...tasks[taskIndex] };

    tasks.splice(taskIndex, 1);
    saveToStorage();

    return lastDeletedTask;
}

/**
 * Undo last deletion
 */
export function undoDelete() {
    if (!lastDeletedTask) return null;

    tasks.push(lastDeletedTask);
    const restored = lastDeletedTask;
    lastDeletedTask = null; // Clear cache
    
    saveToStorage();
    return restored;
}

/**
 * Get overall task statistics
 */
export function getStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, percent };
}

/**
 * Get distinct categories present in all tasks
 */
export function getCategories() {
    const cats = new Set(tasks.map(t => t.category));
    return ['General', ...Array.from(cats)].filter((v, i, self) => self.indexOf(v) === i);
}

// Helpers
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Failed to save tasks to localStorage:", e);
    }
}

/**
 * Sample initial data for wow factor on first load
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

/**
 * ==========================================================================
 * TaskSphere - UI Render & DOM Operations (ui.js)
 * ==========================================================================
 */

import * as State from './state.js';

// DOM Element Selectors
const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const toastContainer = document.getElementById('toast-container');

// Form Selectors
const formTaskId = document.getElementById('form-task-id');
const formTitle = document.getElementById('form-title');
const formDescription = document.getElementById('form-description');
const formCategory = document.getElementById('form-category');
const formPriority = document.getElementById('form-priority');
const formDueDate = document.getElementById('form-due-date');
const modalTitleElement = document.getElementById('modal-title');
const modalSubmitBtn = document.getElementById('modal-btn-submit');
const categoriesDatalist = document.getElementById('categories-list');

// Filter Selectors
const filterCategory = document.getElementById('filter-category');
const filterPriority = document.getElementById('filter-priority');
const sortBySelect = document.getElementById('sort-by');
const searchInput = document.getElementById('search-input');

// Stats Selectors
const statActive = document.getElementById('stat-active');
const statCompleted = document.getElementById('stat-completed');
const statPercentLabel = document.getElementById('stat-percent-label');
const statProgressBar = document.getElementById('stat-progress-bar');

// Global handlers storage (to connect app.js)
let onTaskChangeCallback = () => {};

/**
 * Register a callback to execute whenever task state changes
 * @param {Function} callback 
 */
export function registerOnTaskChange(callback) {
    onTaskChangeCallback = callback;
}

/**
 * Render all tasks to the DOM
 */
export function render() {
    // 1. Get current filter options
    const filters = {
        search: searchInput.value,
        category: filterCategory.value,
        priority: filterPriority.value,
        sortBy: sortBySelect.value
    };

    // 2. Fetch tasks matching filters from State
    const tasks = State.getTasks(filters);

    // 3. Render Datalist and Category Dropdown filters
    updateCategoryDropdowns();

    // 4. Update Stats Dashboard
    updateStatsDashboard();

    // 5. Build HTML
    if (tasks.length === 0) {
        // Show empty state
        tasksContainer.querySelectorAll('.task-card').forEach(el => el.remove());
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    // Keep track of existing DOM elements to avoid redrawing elements that did not change,
    // which helps maintain animation state. However, for simplicity and smooth listing,
    // we can clear and redraw, giving new elements a subtle slide-in animation.
    
    // Clear old cards (but keep empty state element)
    const existingCards = tasksContainer.querySelectorAll('.task-card');
    existingCards.forEach(card => card.remove());

    tasks.forEach((task, index) => {
        const card = createTaskCardDOM(task);
        // Staggered animation delay
        card.style.animationDelay = `${index * 0.05}s`;
        tasksContainer.appendChild(card);
    });
}

/**
 * Create DOM element for a task card
 * @param {Object} task 
 */
function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.id = task.id;
    card.className = `task-card priority-${task.priority} task-enter`;
    if (task.completed) {
        card.classList.add('completed');
    }

    // Overdue check
    let isOverdue = false;
    let formattedDate = 'No deadline';
    if (task.dueDate) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(task.dueDate);
        due.setHours(0,0,0,0);
        isOverdue = due < today && !task.completed;
        
        // Format date to local Indonesian readability
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        formattedDate = due.toLocaleDateString('id-ID', options);
    }

    card.innerHTML = `
        <div class="task-header">
            <div class="task-title-area">
                <label class="checkbox-container" title="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}">
                    <input type="checkbox" class="checkbox-input" ${task.completed ? 'checked' : ''}>
                    <div class="checkbox-custom">
                        <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </label>
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
            </div>
        </div>

        <div class="badge-group">
            <span class="badge badge-category">${escapeHTML(task.category)}</span>
            <span class="badge badge-priority ${task.priority}">${getPriorityLabel(task.priority)}</span>
        </div>

        <p class="task-description">${escapeHTML(task.description || 'Tidak ada deskripsi.')}</p>

        <div class="task-footer">
            <div class="due-date ${isOverdue ? 'overdue' : ''}" title="${isOverdue ? 'Tugas terlambat!' : 'Tenggat waktu'}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${formattedDate}${isOverdue ? ' (Terlambat)' : ''}</span>
            </div>

            <div class="action-buttons">
                <button type="button" class="btn-icon edit" title="Sunting Tugas" aria-label="Sunting">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button type="button" class="btn-icon delete" title="Hapus Tugas" aria-label="Hapus">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // --- EVENT LISTENERS FOR CARD CONTROLS ---

    // 1. Toggle Completion Checkbox
    const checkbox = card.querySelector('.checkbox-input');
    checkbox.addEventListener('change', () => {
        const completed = checkbox.checked;
        State.updateTask(task.id, { completed });
        
        // Visual class toggling for immediate feedback
        if (completed) {
            card.classList.add('completed');
            showToast('Tugas diselesaikan!', 'success');
        } else {
            card.classList.remove('completed');
            showToast('Tugas diaktifkan kembali.', 'success');
        }
        
        // Small delay to let user see transition before full redraw
        setTimeout(() => {
            onTaskChangeCallback();
        }, 300);
    });

    // 2. Edit Task Button
    const editBtn = card.querySelector('.btn-icon.edit');
    editBtn.addEventListener('click', () => {
        openModal(task);
    });

    // 3. Delete Task Button (with Slide-out Animation & Toast Undo)
    const deleteBtn = card.querySelector('.btn-icon.delete');
    deleteBtn.addEventListener('click', () => {
        // Trigger leave animation first
        card.classList.remove('task-enter');
        card.classList.add('task-leave');
        
        // Wait for animation to end
        card.addEventListener('animationend', () => {
            const deleted = State.deleteTask(task.id);
            if (deleted) {
                showToast(`Tugas "${deleted.title}" dihapus.`, 'success', true);
            }
            onTaskChangeCallback();
        }, { once: true });
    });

    return card;
}

/**
 * Open Modal Dialog Form (Supports Create and Edit states)
 * @param {Object|null} taskToEdit - Pass task object to switch to Edit mode, null for Create mode
 */
export function openModal(taskToEdit = null) {
    taskForm.reset();
    
    if (taskToEdit) {
        // Edit Mode
        modalTitleElement.textContent = 'Edit Detail Tugas';
        modalSubmitBtn.textContent = 'Simpan Perubahan';
        
        formTaskId.value = taskToEdit.id;
        formTitle.value = taskToEdit.title;
        formDescription.value = taskToEdit.description;
        formCategory.value = taskToEdit.category;
        formPriority.value = taskToEdit.priority;
        formDueDate.value = taskToEdit.dueDate;
    } else {
        // Create Mode
        modalTitleElement.textContent = 'Tambah Tugas Baru';
        modalSubmitBtn.textContent = 'Simpan Tugas';
        
        formTaskId.value = '';
        // Set default category to 'General' and due date to today
        formCategory.value = 'General';
        formPriority.value = 'medium';
        
        const todayStr = new Date().toISOString().split('T')[0];
        formDueDate.value = todayStr;
    }
    
    taskModal.classList.add('active');
    formTitle.focus();
}

/**
 * Close Modal Dialog Form
 */
export function closeModal() {
    taskModal.classList.remove('active');
}

/**
 * Handle form submission for task creation and updates
 */
export function handleFormSubmit(e) {
    e.preventDefault();

    const title = formTitle.value.trim();
    const description = formDescription.value.trim();
    const category = formCategory.value.trim() || 'General';
    const priority = formPriority.value;
    const dueDate = formDueDate.value;
    const taskId = formTaskId.value;

    // Validation
    if (!title) {
        showToast('Judul tugas wajib diisi!', 'error');
        formTitle.focus();
        return;
    }

    if (taskId) {
        // Update Action
        const updated = State.updateTask(taskId, {
            title,
            description,
            category,
            priority,
            dueDate
        });
        if (updated) {
            showToast('Tugas berhasil diperbarui!', 'success');
        }
    } else {
        // Create Action
        State.addTask({
            title,
            description,
            category,
            priority,
            dueDate
        });
        showToast('Tugas baru ditambahkan!', 'success');
    }

    closeModal();
    onTaskChangeCallback();
}

/**
 * Dynamic Stats Dashboard Renderer
 */
function updateStatsDashboard() {
    const stats = State.getStats();
    statActive.textContent = stats.active;
    statCompleted.textContent = stats.completed;
    statPercentLabel.textContent = `Progres: ${stats.percent}%`;
    statProgressBar.style.width = `${stats.percent}%`;
}

/**
 * Maintain categories select option updates dynamically
 */
function updateCategoryDropdowns() {
    const categories = State.getCategories();
    
    // Save current selection value
    const currentFilterVal = filterCategory.value;

    // 1. Populate search filter category dropdown
    filterCategory.innerHTML = '<option value="all">Semua Kategori</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.toLowerCase();
        option.textContent = cat;
        filterCategory.appendChild(option);
    });

    // Reapply filter value if still exists
    if (Array.from(filterCategory.options).some(opt => opt.value === currentFilterVal)) {
        filterCategory.value = currentFilterVal;
    } else {
        filterCategory.value = 'all';
    }

    // 2. Populate input datalist helper inside modal form
    categoriesDatalist.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        categoriesDatalist.appendChild(option);
    });
}

/**
 * Custom modern Toast alerts creator
 * @param {string} message - Text notification body
 * @param {'success'|'error'} type - Style modifier
 * @param {boolean} showUndo - Display undo link
 */
export function showToast(message, type = 'success', showUndo = false) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let undoBtnHtml = '';
    if (showUndo) {
        undoBtnHtml = `<button type="button" class="toast-btn-undo" id="toast-undo">Undo</button>`;
    }

    toast.innerHTML = `
        <span class="toast-message">${escapeHTML(message)}</span>
        ${undoBtnHtml}
    `;

    toastContainer.appendChild(toast);

    // Register Undo Button event
    if (showUndo) {
        const undoBtn = toast.querySelector('#toast-undo');
        undoBtn.addEventListener('click', () => {
            const restored = State.undoDelete();
            if (restored) {
                showToast(`Tugas "${restored.title}" berhasil dipulihkan!`, 'success');
                onTaskChangeCallback();
            }
            // Auto fade out current toast
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        });
    }

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            }, { once: true });
        }
    }, 4000);
}

// Helpers
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function getPriorityLabel(priority) {
    switch (priority.toLowerCase()) {
        case 'high': return 'Tinggi';
        case 'medium': return 'Sedang';
        case 'low': return 'Rendah';
        default: return priority;
    }
}

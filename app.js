/**
 * ==========================================================================
 * TaskSphere - Application Entry Point (app.js)
 * ==========================================================================
 */

import * as State from './state.js';
import * as UI from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize State (loads sample tasks if database is empty)
    await State.init();

    // 2. Register UI Task change handler so that UI re-renders on state mutations
    UI.registerOnTaskChange(() => {
        UI.render();
    });

    // 3. Initial UI Render
    UI.render();

    // --- DOM Event Listeners ---

    // Modal Trigger Buttons
    const btnAddTask = document.getElementById('btn-add-task');
    const modalBtnClose = document.getElementById('modal-btn-close');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');

    btnAddTask.addEventListener('click', () => {
        UI.openModal(null); // Open in create mode
    });

    modalBtnClose.addEventListener('click', () => {
        UI.closeModal();
    });

    modalBtnCancel.addEventListener('click', () => {
        UI.closeModal();
    });

    // Close Modal on backdrop click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            UI.closeModal();
        }
    });

    // Close Modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal.classList.contains('active')) {
            UI.closeModal();
        }
    });

    // Form Submission
    taskForm.addEventListener('submit', (e) => {
        UI.handleFormSubmit(e);
    });

    // --- Filter & Search Controls Listeners ---
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterPriority = document.getElementById('filter-priority');
    const sortBySelect = document.getElementById('sort-by');

    // Debounced search for smoother keystroke experience
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            UI.render();
        }, 150); // Small delay to debounce inputs
    });

    // Re-render instantly on filter selection changes
    filterCategory.addEventListener('change', () => {
        UI.render();
    });

    filterPriority.addEventListener('change', () => {
        UI.render();
    });

    sortBySelect.addEventListener('change', () => {
        UI.render();
    });

    // Log success startup
    console.log("TaskSphere application successfully initialized! 🚀");
});

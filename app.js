const Calendar = (() => {
    // Private variables
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;

    // DOM elements
    const monthYearElement = document.getElementById('month-year');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const toDoItems = document.querySelector('.to-do-items');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

    // Function to render the calendar
    const renderCalendar = (month, year) => {
        calendarBody.innerHTML = '';
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthYearElement.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDay = firstDay.getDay();

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < startingDay) {
                    cell.textContent = '';
                } else if (date > daysInMonth) {
                    cell.textContent = '';
                } else {
                    cell.textContent = date;
                    const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    if (tasks[cellDate]) {
                        cell.classList.add('has-tasks');
                    }
                    if (
                        date === currentDate.getDate() &&
                        month === currentDate.getMonth() &&
                        year === currentDate.getFullYear()
                    ) {
                        cell.classList.add('today');
                    }
                    cell.addEventListener('click', () => selectDate(cellDate));
                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
            if (date > daysInMonth) {
                break;
            }
        }
    };

    // Function to select a date
    const selectDate = (date) => {
        selectedDate = date;
        const formattedDate = new Date(date).toLocaleDateString(); // Format the date for display
        toDoItems.innerHTML = `<div class="date-header">Showing Tasks for ${formattedDate}</div>`;
        TaskManager.renderTasks("all", date); // Render tasks for the selected date
    };

    // Function to display tasks for a selected date
    const displayTasks = (date) => {
        toDoItems.innerHTML = ''; // Clear the task list

        if (tasks[date]) {
            tasks[date].forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.classList.add('item');

                taskItem.innerHTML = `
                    <input type="checkbox" name="task" id="task-${index}">
                    <div class="item-folder">
                        <p>${task}</p>
                        <p>Personal <span>${date}</span></p>
                    </div>
                    <div class="starred">star</div>
                `;

                toDoItems.appendChild(taskItem);
            });
        } else {
            toDoItems.innerHTML = `<div class="no-results">No tasks found</div>`;
        }
    };

    // Function to add a task
    const addTask = (taskText, date) => {
        if (taskText && date) {
            if (!tasks[date]) {
                tasks[date] = [];
            }
            tasks[date].push(taskText);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            displayTasks(date);
            renderCalendar(currentMonth, currentYear);
        }
    };

    // Event listeners for previous and next month buttons
    const addEventListeners = () => {
        prevMonthButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        nextMonthButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    };

    // Public API
    return {
        init: () => {
            addEventListeners();
            renderCalendar(currentMonth, currentYear);
        },
        addTask,
    };
})();

// task modal functionality
const TaskManager = (() => {
    // Private variables and functions
    let tasks = JSON.parse(localStorage.getItem("tasks")) || []; // Load tasks from localStorage
    let customTags = JSON.parse(localStorage.getItem("customTags")) || []; // Load custom tags from localStorage

    // DOM elements
    const taskModal = document.getElementById("task-modal");
    const newTaskButton = document.querySelector(".new-task");
    const closeModalButton = document.querySelector(".close-modal");
    const taskForm = document.getElementById("task-form");
    const toDoItems = document.querySelector(".to-do-items");
    const tagItems = document.querySelector(".tag-items");
    const taskCategory = document.getElementById("task-category");
    const customTagInput = document.getElementById("custom-tag-input");
    const searchInput = document.querySelector(".search-bar input");

    // Task Details Modal elements
    const taskDetailsModal = document.getElementById("task-details-modal");
    const taskDetailsTitle = document.getElementById("task-details-title");
    const taskDetailsDescription = document.getElementById("task-details-description");
    const taskDetailsCategory = document.getElementById("task-details-category");
    const taskDetailsDate = document.getElementById("task-details-date");
    const editTaskBtn = document.getElementById("edit-task-btn");
    const deleteTaskBtn = document.getElementById("delete-task-btn");

    // Folder elements
    const myDayFolder = document.querySelector(".folder[data-folder='my-day'] .folder-number");
    const allFolder = document.querySelector(".folder[data-folder='all'] .folder-number");
    const completedFolder = document.querySelector(".folder[data-folder='completed'] .folder-number");
    const personalFolder = document.querySelector(".folder[data-folder='personal'] .folder-number");

    // Completed tasks section in the right sidebar
    const completedTasksItems = document.querySelector(".completed-tasks-items");

    // Function to save tasks and custom tags to localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("customTags", JSON.stringify(customTags));
    };

    // Function to check if a task is added today
    const isTaskAddedToday = (task) => {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const taskDate = new Date(task.dateAdded).toISOString().split('T')[0]; // Get task's date in YYYY-MM-DD format
        return today === taskDate; // Compare the two dates
    };

    // Function to update folder counts
    const updateFolderCounts = () => {
        // Count tasks for "My Day" (tasks added today)
        const myDayCount = tasks.filter(task => isTaskAddedToday(task)).length;
        myDayFolder.textContent = myDayCount;

        // Count tasks for "All"
        const allCount = tasks.length;
        allFolder.textContent = allCount;

        // Count completed tasks
        const completedCount = tasks.filter(task => task.completed).length;
        completedFolder.textContent = completedCount;

        // Count tasks for "Personal"
        const personalCount = tasks.filter(task => task.category === "Personal").length;
        personalFolder.textContent = personalCount;
    };

    // Function to format the date
    const formatDate = (date) => {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const taskDate = new Date(date).toISOString().split('T')[0]; // Convert input to YYYY-MM-DD format
    
        if (taskDate === today) {
            return "Today"; // Return "Today" if the task was added today
        } else {
            return new Date(date).toLocaleDateString(); // Return the formatted date for past tasks
        }
    };

    // Function to render tasks for a specific folder or tag
    const renderTasks = (filter = "all", selectedDate = null) => {
        toDoItems.innerHTML = ""; // Clear the task list
    
        let filteredTasks = [];
    
        switch (filter) {
            case "my-day":
                // Show tasks added today
                const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                filteredTasks = tasks.filter(task => task.date === today);
                break;
            case "important":
                filteredTasks = tasks.filter(task => task.category === "Important");
                break;
            case "personal":
                filteredTasks = tasks.filter(task => task.category === "Personal");
                break;
            case "completed":
                filteredTasks = tasks.filter(task => task.completed);
                break;
            case "all":
                filteredTasks = tasks;
                break;
            default:
                // Filter by custom tag
                filteredTasks = tasks.filter(task => task.category === filter);
                break;
        }
    
        // If a specific date is selected, filter tasks for that date
        if (selectedDate) {
            filteredTasks = tasks.filter(task => task.date === selectedDate);
        }
    
        if (filteredTasks.length > 0) {
            // Sort tasks from most recent to oldest
            filteredTasks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
            // Render the filtered tasks
            filteredTasks.forEach((task, index) => {
                const taskElement = document.createElement("div");
                taskElement.classList.add("item");
    
                taskElement.innerHTML = `
                    <input type="checkbox" name="task" id="task-${index}" ${task.completed ? "checked" : ""}>
                    <div class="item-folder">
                        <p>${task.title}</p>
                        <p>${task.description}</p>
                        <p>${task.category} <span>${formatDate(task.dateAdded)}</span></p>
                    </div>
                    <div class="starred">star</div>
                `;
    
                // Add event listener to mark task as complete
                const checkbox = taskElement.querySelector("input[type='checkbox']");
                checkbox.addEventListener("change", () => {
                    task.completed = checkbox.checked; // Update the task's completed status
                    saveToLocalStorage(); // Save to localStorage
                    renderTasks(filter, selectedDate); // Re-render the task list
                    updateFolderCounts(); // Update folder counts
                    renderCompletedTasks(); // Update completed tasks in the right sidebar
                });
    
                // Add event listener to show task details
                taskElement.addEventListener("click", () => {
                    showTaskDetails(task, index);
                });
    
                toDoItems.appendChild(taskElement);
            });
        } else {
            // Display "No Tasks Found" message
            if (selectedDate) {
                toDoItems.innerHTML = `<div class="no-results">No tasks found for ${selectedDate}</div>`;
            } else {
                toDoItems.innerHTML = `<div class="no-results">No Tasks Found</div>`;
            }
        }
    };

    // Function to render completed tasks in the right sidebar
    const renderCompletedTasks = () => {
        completedTasksItems.innerHTML = ""; // Clear the completed tasks section
        const completedTasks = tasks.filter(task => task.completed);

        completedTasks.forEach((task, index) => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("item");

            taskElement.innerHTML = `
                <input type="checkbox" name="task" id="completed-task-${index}" checked disabled>
                <div class="item-folder">
                    <p>${task.title}</p>
                    <p>${task.description}</p>
                    <p>${task.category} <span>${formatDate(task.dateAdded)}</span></p>
                </div>
            `;

            completedTasksItems.appendChild(taskElement);
        });
    };

    // Function to search tasks
    const searchTasks = (query) => {
        toDoItems.innerHTML = ""; // Clear the task list

        // Filter tasks that match the search query
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredTasks.length > 0) {
            // Sort tasks from most recent to oldest
            filteredTasks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

            // Render the filtered tasks
            filteredTasks.forEach((task, index) => {
                const taskElement = document.createElement("div");
                taskElement.classList.add("item");

                taskElement.innerHTML = `
                    <input type="checkbox" name="task" id="task-${index}" ${task.completed ? "checked" : ""}>
                    <div class="item-folder">
                        <p>${task.title}</p>
                        <p>${task.description}</p>
                        <p>${task.category} <span>${formatDate(task.dateAdded)}</span></p>
                    </div>
                    <div class="starred">star</div>
                `;

                // Add event listener to mark task as complete
                const checkbox = taskElement.querySelector("input[type='checkbox']");
                checkbox.addEventListener("change", () => {
                    task.completed = checkbox.checked; // Update the task's completed status
                    saveToLocalStorage(); // Save to localStorage
                    searchTasks(query); // Re-render the search results
                    updateFolderCounts(); // Update folder counts
                    renderCompletedTasks(); // Update completed tasks in the right sidebar
                });

                // Add event listener to show task details
                taskElement.addEventListener("click", () => {
                    showTaskDetails(task, index);
                });

                toDoItems.appendChild(taskElement);
            });
        } else {
            // Display "No Results Found" message
            toDoItems.innerHTML = `<div class="no-results">No Results Found</div>`;
        }
    };

    // Function to show task details in a modal
    const showTaskDetails = (task, index) => {
        taskDetailsTitle.textContent = task.title;
        taskDetailsDescription.textContent = task.description;
        taskDetailsCategory.textContent = `Category: ${task.category}`;
        taskDetailsDate.textContent = `Date: ${formatDate(task.dateAdded)}`;

        // Show the modal
        taskDetailsModal.style.display = "flex";

        // Handle edit button click
        editTaskBtn.onclick = () => {
            openEditModal(task, index);
        };

        // Handle delete button click
        deleteTaskBtn.onclick = () => {
            tasks.splice(index, 1); // Remove the task
            saveToLocalStorage(); // Save to localStorage
            renderTasks(); // Re-render the task list
            updateFolderCounts(); // Update folder counts
            taskDetailsModal.style.display = "none"; // Close the modal
        };
    };

    // Function to open the edit modal
    const openEditModal = (task, index) => {
        const editModal = document.createElement("div");
        editModal.classList.add("modal");
        editModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Edit Task</h2>
                <form id="edit-task-form">
                    <div class="form-group">
                        <label for="edit-task-title">Title</label>
                        <input type="text" id="edit-task-title" value="${task.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-description">Description</label>
                        <textarea id="edit-task-description">${task.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-category">Category</label>
                        <select id="edit-task-category">
                            <option value="Personal" ${task.category === "Personal" ? "selected" : ""}>Personal</option>
                            <option value="Work" ${task.category === "Work" ? "selected" : ""}>Work</option>
                            <option value="Study" ${task.category === "Study" ? "selected" : ""}>Study</option>
                            ${customTags.map(tag => `<option value="${tag}" ${task.category === tag ? "selected" : ""}>${tag}</option>`).join("")}
                        </select>
                    </div>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        `;

        document.body.appendChild(editModal);

        // Close modal when the close button is clicked
        const closeModalButton = editModal.querySelector(".close-modal");
        closeModalButton.addEventListener("click", () => {
            editModal.remove();
        });

        // Close modal when clicking outside the modal
        editModal.addEventListener("click", (event) => {
            if (event.target === editModal) {
                editModal.remove();
            }
        });

        // Handle form submission
        const editForm = editModal.querySelector("#edit-task-form");
        editForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // Get updated values
            const updatedTitle = document.getElementById("edit-task-title").value;
            const updatedDescription = document.getElementById("edit-task-description").value;
            const updatedCategory = document.getElementById("edit-task-category").value;

            // Update the task
            tasks[index] = {
                ...tasks[index],
                title: updatedTitle,
                description: updatedDescription,
                category: updatedCategory,
            };

            // Save to localStorage
            saveToLocalStorage();

            // Re-render tasks
            renderTasks();
            editModal.remove();
            taskDetailsModal.style.display = "none"; // Close the task details modal
        });
    };

    // Function to render custom tags
    const renderCustomTags = () => {
        tagItems.innerHTML = ""; // Clear the custom tags section
        customTags.forEach((tag, index) => {
            const tagElement = document.createElement("div");
            tagElement.classList.add("tag");

            tagElement.innerHTML = `
                <img src="" alt="${tag}">
                <p>${tag}</p>
                <div class="folder-number">1</div>
            `;

            // Add event listener to filter tasks by tag
            tagElement.addEventListener("click", () => {
                renderTasks(tag); // Render tasks for the selected tag
            });

            tagItems.appendChild(tagElement);
        });
    };

    // Function to add a new task
    const addTask = (title, description, category) => {
        const newTask = {
            title,
            description,
            category,
            dateAdded: new Date().toISOString().split('T')[0], // Task creation date (YYYY-MM-DD)
            date: new Date().toISOString().split('T')[0], // Task due date (same as creation date)
            completed: false,
        };
        tasks.push(newTask); // Add the task to the array
        saveToLocalStorage(); // Save to localStorage
        renderTasks(); // Re-render the task list
        updateFolderCounts(); // Update folder counts
    
        // Sync the task with the calendar
        Calendar.addTask(title, newTask.date);
    };

    // Function to add a new custom tag
    const addCustomTag = (tagName) => {
        if (!customTags.includes(tagName)) {
            customTags.push(tagName); // Add the tag to the array
            saveToLocalStorage(); // Save to localStorage
            renderCustomTags(); // Re-render the custom tags section
            updateFolderCounts(); // Update folder counts
        }
    };

    // Function to handle form submission
    const handleFormSubmit = (event) => {
        event.preventDefault();
    
        // Get input values
        const taskTitle = document.getElementById("task-title").value;
        const taskDescription = document.getElementById("task-description").value;
        const selectedCategory = taskCategory.value;
    
        let taskCategoryValue = selectedCategory;
    
        // Handle custom tag creation
        if (selectedCategory === "custom") {
            const customTagName = customTagInput.value.trim();
            if (customTagName) {
                taskCategoryValue = customTagName;
                addCustomTag(customTagName);
            } else {
                alert("Please enter a valid tag name.");
                return;
            }
        }
    
        // Add the new task
        addTask(taskTitle, taskDescription, taskCategoryValue);
    
        // Clear the form and close the modal
        taskForm.reset();
        taskModal.style.display = "none";
        customTagInput.style.display = "none";
    };

    // Function to handle category selection change
    const handleCategoryChange = () => {
        if (taskCategory.value === "custom") {
            customTagInput.style.display = "block"; // Show custom tag input
        } else {
            customTagInput.style.display = "none"; // Hide custom tag input
        }
    };

    // Function to initialize event listeners
    const initEventListeners = () => {
        // Open modal when "New Task" button is clicked
        newTaskButton.addEventListener("click", () => {
            taskModal.style.display = "flex";
        });

        // Close modal when the close button is clicked
        closeModalButton.addEventListener("click", () => {
            taskModal.style.display = "none";
        });

        // Close modal when clicking outside the modal
        window.addEventListener("click", (event) => {
            if (event.target === taskModal) {
                taskModal.style.display = "none";
            }
            if (event.target === taskDetailsModal) {
                taskDetailsModal.style.display = "none";
            }
        });

        // Handle form submission
        taskForm.addEventListener("submit", handleFormSubmit);

        // Handle category selection change
        taskCategory.addEventListener("change", handleCategoryChange);

        // Handle search input
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                const query = searchInput.value.trim();
                if (query) {
                    searchTasks(query); // Perform search
                } else {
                    renderTasks(); // Show all tasks if search is empty
                }
            }
        });

        // Handle folder clicks
        document.querySelectorAll(".folder").forEach(folder => {
            folder.addEventListener("click", () => {
                const folderType = folder.getAttribute("data-folder");
                if (folderType === "my-day") {
                    renderTasks("my-day"); // Render tasks for today
                } else {
                    renderTasks(folderType); // Render tasks for other folders
                }
            });
        });
    };

    // Public API
    return {
        init: () => {
            initEventListeners(); // Set up event listeners
            renderTasks(); // Render all tasks initially
            renderCustomTags(); // Render initial custom tags (if any)
            renderCompletedTasks(); // Render completed tasks in the right sidebar
            updateFolderCounts(); // Update folder counts initially
        },
        renderTasks, 
    };
})();

// Initialize the TaskManager
TaskManager.init();

// Initialize the calendar
Calendar.init();

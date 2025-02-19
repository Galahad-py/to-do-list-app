const Calendar = (() => {
    // Private variables
    let currentDate = new Date();

    // DOM elements
    const monthYear = document.getElementById("month-year");
    const calendarBody = document.getElementById("calendar-body");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");

    // Factory function to create a calendar cell
    const createCell = (content, className = "") => {
        const cell = document.createElement("td");
        cell.textContent = content;
        if (className) cell.classList.add(className);
        return cell;
    };

    // Render the calendar
    const renderCalendar = () => {
        // Clear the calendar body
        calendarBody.innerHTML = "";

        // Set the month and year in the header
        const month = currentDate.toLocaleString("default", { month: "long" });
        const year = currentDate.getFullYear();
        monthYear.textContent = `${month} ${year}`;

        // Get the first day of the month and the number of days in the month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = firstDay.getDay(); // Day of the week (0 = Sunday, 6 = Saturday)
        const totalDays = lastDay.getDate();

        let day = 1;

        // Create calendar rows
        for (let i = 0; i < 6; i++) {
            const row = document.createElement("tr");

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startDay) {
                    // Empty cells before the first day of the month
                    row.appendChild(createCell("", "empty"));
                } else if (day > totalDays) {
                    // Empty cells after the last day of the month
                    row.appendChild(createCell("", "empty"));
                } else {
                    // Add the day number
                    const cell = createCell(day);

                    // Highlight today's date
                    if (
                        day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear()
                    ) {
                        cell.classList.add("today");
                    }

                    row.appendChild(cell);
                    day++;
                }
            }

            calendarBody.appendChild(row);

            // Stop creating rows if all days are rendered
            if (day > totalDays) break;
        }
    };

    // Event listeners for previous and next month buttons
    const addEventListeners = () => {
        prevMonthButton.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthButton.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    };

    // Public API
    return {
        init: () => {
            renderCalendar();
            addEventListeners();
        },
    };
})();

// Initialize the calendar
Calendar.init();

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

    // Completed tasks section in the right sidebar
    const completedTasksItems = document.querySelector(".completed-tasks-items");

    // Function to save tasks and custom tags to localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("customTags", JSON.stringify(customTags));
    };

    // Function to check if a task is added today
    const isTaskAddedToday = (task) => {
        const today = new Date().toDateString(); // Get today's date as a string
        const taskDate = new Date(task.dateAdded).toDateString(); // Get task's date as a string
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
    };

    // Function to format the date
    const formatDate = (date) => {
        const today = new Date().toDateString();
        const taskDate = new Date(date).toDateString();
        return today === taskDate ? "Today" : new Date(date).toLocaleDateString();
    };

    // Function to render tasks for a specific date
    const renderTasksByDate = (date) => {
        toDoItems.innerHTML = ""; // Clear the task list
        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.dateAdded).toDateString();
            return taskDate === date.toDateString();
        });

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
                renderTasksByDate(date); // Re-render the task list
                updateFolderCounts(); // Update folder counts
                renderCompletedTasks(); // Update completed tasks in the right sidebar
            });

            // Add event listener to show task details
            taskElement.addEventListener("click", () => {
                showTaskDetails(task, index);
            });

            toDoItems.appendChild(taskElement);
        });

        updateFolderCounts(); // Update folder counts after rendering tasks
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
            searchTasks(searchInput.value.trim()); // Re-render the search results
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
            searchTasks(searchInput.value.trim());
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

            tagItems.appendChild(tagElement);
        });
    };

    // Function to add a new task
    const addTask = (title, description, category) => {
        const newTask = {
            title,
            description,
            category,
            dateAdded: new Date(), // Add the current date and time
            completed: false, // Default to not completed
        };
        tasks.push(newTask); // Add the task to the array
        saveToLocalStorage(); // Save to localStorage
        renderTasksByDate(new Date()); // Re-render the task list for today
    };

    // Function to add a new custom tag
    const addCustomTag = (tagName) => {
        if (!customTags.includes(tagName)) {
            customTags.push(tagName); // Add the tag to the array
            saveToLocalStorage(); // Save to localStorage
            renderCustomTags(); // Re-render the custom tags section
        }
    };

    // Function to handle form submission
    const handleFormSubmit = (event) => {
        event.preventDefault(); // Prevent form from submitting

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
                addCustomTag(customTagName); // Add the custom tag
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
        customTagInput.style.display = "none"; // Hide custom tag input
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
                    renderTasksByDate(new Date()); // Show tasks for today if search is empty
                }
            }
        });
    };

    // Public API
    return {
        init: () => {
            initEventListeners(); // Set up event listeners
            renderTasksByDate(new Date()); // Render tasks for today
            renderCustomTags(); // Render initial custom tags (if any)
            renderCompletedTasks(); // Render completed tasks in the right sidebar
        },
    };
})();

// Initialize the TaskManager
TaskManager.init();
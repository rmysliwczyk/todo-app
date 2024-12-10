async function getAvailableUrls() {
    try {
        let url = "get_available_urls";
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const availableUrls = await response.json()
        return availableUrls;
    }
    catch(error) {
        console.log(error.message)
    }
}

async function updateTask(task) {
    try {
        let url = `api/task/${task.id}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "PUT",
            "body": JSON.stringify(task)
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }


        const updatedTask = await response.json();
        const taskCheckbox = document.querySelector(`#task-checkbox-id-${task.id}`)
        // This is probably unnecesarry, but just to make sure that checkbox and task are in sync, I'll do it.
        if(updatedTask.done === true) {
            taskCheckbox.setAttribute("checked", "checked");
        } else {
            taskCheckbox.removeAttribute("checked");
        }
    }
    catch(error) {
        console.log(error.message)
    }
}

async function toggleTaskDoneStatus(taskId) {

    const task = await getTask(taskId);

    if(task.done === true)
    {
        task.done = false;
    }
    else {
        task.done = true;
    }

    updateTask(task);
}

async function getTask(taskId) {
    try {
        let url = `api/task/${taskId}`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const task = await response.json();
        return task[0];
    }
    catch(error) {
        console.log(error.message)
    }
}

async function deleteTask(taskId) {
    try {
        let url = `api/task/${taskId}`;
        const response = await fetch(url, {
            "headers": {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
            "method": "DELETE"
        });

        document.querySelector(`#task-id-${taskId}`).remove();

    }
    catch(error) {
        console.log(error.message)
    }
}

async function getAllTasks(tasklistId) {
    try {
        let url = `api/tasklist/${tasklistId}`;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const tasks = await response.json();
        return tasks;
    }
    catch(error) {
        console.log(error.message)
    }
}

async function getSelectedTasklistMetadata() {
    try {
        let url = "get_selected_tasklist_metadata";
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const selectedTasklistMetadata = await response.json()

        if(selectedTasklistMetadata.id === null){
            const availableUrls = await getAvailableUrls();
            window.location.href = availableUrls.tasklists;
        }

        return selectedTasklistMetadata;
    }
    catch(error) {
        console.log(error.message)
    }
}

async function showTasks() {
    const tasksUl = document.querySelector("#tasks-ul");
    const selectedTasklistMetadata = await getSelectedTasklistMetadata();
    const tasks = await getAllTasks(selectedTasklistMetadata.id);
    for (var task of tasks){
        const taskLi = document.createElement("li");
        const taskLiCheckbox = document.createElement("input");
        const taskLiLabel = document.createElement("label");
        const taskLiRemoveButton = document.createElement("button");
        const taskLiRemoveButtonIcon = document.createElement("i");


        taskLi.setAttribute("id", `task-id-${task.id}`);
        taskLiCheckbox.setAttribute("type", "checkbox");
        task.done ? taskLiCheckbox.setAttribute("checked", "checked") : taskLiCheckbox.removeAttribute("checked");
        taskLiCheckbox.setAttribute("id", `task-checkbox-id-${task.id}`);
        taskLiLabel.setAttribute("for", `task-checkbox-id-${task.id}`);
        taskLiLabel.innerHTML = task.name;
        taskLiRemoveButton.setAttribute("id", `task-remove-button-id-${task.id}`);
        taskLiRemoveButton.setAttribute("class", "remove-button");
        taskLiRemoveButtonIcon.setAttribute("class", "fa-solid fa-xmark");

        const taskId = task.id
        taskLiCheckbox.addEventListener("click", function() {
            toggleTaskDoneStatus(taskId);
        });

        taskLiRemoveButton.addEventListener("click", function() {
            deleteTask(taskId);
        });

        taskLiRemoveButton.append(taskLiRemoveButtonIcon);

        taskLi.append(taskLiCheckbox);
        taskLi.append(taskLiLabel);
        taskLi.append(taskLiRemoveButton);
        tasksUl.append(taskLi);
    }
}

showTasks();
const dataBase = localStorage.getItem('todoList') ? JSON.parse(localStorage.getItem('todoList')) : [];
const typeActions = localStorage.getItem('typeActions') ? JSON.parse(localStorage.getItem('typeActions')) : {typeActions: 'add'};

let editModeListeners = [];
let deleteModeListeners = [];
let activeMode = null;

const removeEditModeListeners = () => {
    editModeListeners.forEach(listener => {
        listener.task.removeEventListener('click', listener.handler);
    });
    editModeListeners = [];
};

const removeDeleteModeListener = () => {
    deleteModeListeners.forEach(listener => {
        listener.task.removeEventListener('click', listener.handler)
    })
    deleteModeListeners = [];
};

// fungsi untuk render/menampilkan task
const renderTask = (taskText, dueDate, dueTime, status, index) => {
    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const currentDateTime = new Date();

    if (dueDateTime < currentDateTime && status !== 'complete') {
        dataBase[index].status = 'expired';
        localStorage.setItem('todoList', JSON.stringify(dataBase));
    }

    const task = `<div class="task ${(status == 'complete' ? 'done-task-bg' : status === 'expired' ? 'expired-task-bg' : '')}" data-index="${index}" data-status="${status}"> 
                    <div class="task-main">
                        <p class="task-text ${(status === 'complete' ? 'done-task' : '')}" data-taskText="${taskText}">${taskText}</p>
                    </div>
                    <div class="task-detail">
                        <p class="due-date" data-dueDate="${dueDate}">Due Date: ${dueDate}</p>
                        <p class="due-date due-time" data-dueTime="${dueTime}">Due Time: ${dueTime}</p>
                        <button class="${(status == 'complete' ? 'done-task-btn' : status === 'expired' ? 'expired-task-btn' : 'mark-complete')}">
                            <span class="material-symbols-outlined icon-medium">
                                ${(status === 'expired' ? 'delete' : 'check')}
                            </span>
                            ${(status == 'complete' ? 'Complete' : status === 'expired' ? 'Delete' : 'Complete')}
                        </button>
                    </div>
                </div>`;

    const todoList = document.getElementById('todo-list');
    todoList.innerHTML += task;

    // Cek dan tampilkan pesan jika tidak ada task
    const noAssignmentMsg = document.getElementById('message');
    if (dataBase.length === 0) {
        noAssignmentMsg.classList.remove('hidden');
        noAssignmentMsg.classList.add('no-assignments');
        noAssignmentMsg.textContent = 'No Assignments';
    } else {
        noAssignmentMsg.classList.add('hidden');
    }
};

// fungsi untuk melihat detail task
const showDetailTask = () => {
    document.querySelectorAll('.task').forEach(task => {
        task.addEventListener('click', (event) => {
            if (activeMode === 'edit' || activeMode === 'delete') {
                return;
            }
            event.currentTarget.classList.toggle('open');
        });
    });
};

// fungsi untuk tombol 'Complete' task
const markComplete = () => {
    document.querySelectorAll('.mark-complete').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const task = button.parentElement.parentElement;
            const indexTask = task.getAttribute('data-index');

            dataBase[indexTask].status = 'complete';
            localStorage.setItem('todoList', JSON.stringify(dataBase));
            location.reload();
        });
    });
};

// fungsi untuk menghapus task dari tombol 'Delete' di task
const deleteFromExpired = () => {
    document.querySelectorAll('.expired-task-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const task = button.parentElement.parentElement;
            const indexTask = task.getAttribute('data-index');

            const newData = dataBase.filter((item, index) => index !== parseInt(indexTask));
            localStorage.setItem('todoList', JSON.stringify(newData));
            location.reload();
        });
    });
};

// fungsi uatama untuk modal view
const task = (taskText, dueDate, dueTime) => {
    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const currentDateTime = new Date();
    
    if (taskText.trim() === ''  && (dueDate === '' || dueTime === '')) {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-task-input').classList.remove('hidden');
        document.getElementById('error-duedatetime-input').classList.remove('hidden');
        document.getElementById('error-task-duedatetime').classList.remove('hidden');
        return;
    }
    else if (taskText.trim() === '') {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-duedatetime-input').classList.add('hidden');
        document.getElementById('error-task-duedatetime').classList.add('hidden');
        document.getElementById('error-task-input').classList.remove('hidden');
        return;
    }else if (dueDate === '' || dueTime === '') {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-task-input').classList.add('hidden');
        document.getElementById('error-task-duedatetime').classList.add('hidden');
        document.getElementById('error-duedatetime-input').classList.remove('hidden');
        return;
    }else if (dueDateTime < currentDateTime) {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-duedatetime-input').classList.add('hidden');
        document.getElementById('error-task-input').classList.add('hidden');
        document.getElementById('error-task-duedatetime').classList.remove('hidden');
        return;
    }
    
    if(typeActions.typeActions == 'edit'){
        const editTask = JSON.parse(localStorage.getItem('taskEdit'));
        dataBase[editTask.indexTask].taskText = taskText;
        dataBase[editTask.indexTask].dueDate = dueDate;
        dataBase[editTask.indexTask].dueTime = dueTime;
    }else{
        const newData = {taskText, dueDate, dueTime, status: 'in progress'};
        dataBase.push(newData);
    }
    
    localStorage.setItem('todoList', JSON.stringify(dataBase));
    document.getElementById('modal-container').classList.add('hidden');
    location.reload();
};

// fungsi untuk edit task 
const editTask = () => {
    const message = document.getElementById('message');
    
    if (activeMode === 'edit') {
        message.classList.add('hidden');
        message.classList.remove('edit-task');
        document.getElementById('warning-msg').classList.add('hidden');
        removeEditModeListeners();
        activeMode = null;
        return;
    }
    
    if (activeMode === 'delete') {
        message.classList.add('hidden');
        message.classList.remove('remove-task');
        removeDeleteModeListener();
    }
    
    activeMode = 'edit';
    message.classList.remove('hidden');
    message.classList.add('edit-task');
    message.textContent = 'click the task to edit';
    
    removeEditModeListeners();
    
    document.querySelectorAll('.task').forEach(task => {
        const handler = (event) => {
            event.preventDefault();
            if (task.getAttribute('data-status') === 'complete' || task.getAttribute('data-status') === 'expired') {
                document.getElementById('warning-msg').classList.remove('hidden');
                return;
            }
            document.getElementById('warning-msg').classList.add('hidden');
            const indexTask = task.getAttribute('data-index');
            const taskText = task.querySelector('.task-text').getAttribute('data-taskText');
            const dueDate = task.querySelector('.due-date').getAttribute('data-dueDate');
            const dueTime = task.querySelector('.due-time').getAttribute('data-dueTime');
            localStorage.setItem('taskEdit', JSON.stringify({taskText, dueDate, dueTime, indexTask}));

            document.getElementById('modal-container').classList.remove('hidden');
            document.getElementById('task').value = taskText;
            document.getElementById('due-date').value = dueDate;
            document.getElementById('due-time').value = dueTime;
            document.getElementById('submit-btn').textContent = 'Edit Task';
        };
        
        task.addEventListener('click', handler);
        editModeListeners.push({ task, handler });
    });
    
    typeActions.typeActions = 'edit';
    localStorage.setItem('typeActions', JSON.stringify(typeActions));
};

// fungsi untuk hapus task dari tombol delete
const deleteTask = () => {
    const message = document.getElementById('message');
    
    if (activeMode === 'delete') {
        message.classList.add('hidden');
        message.classList.remove('remove-task');
        removeDeleteModeListener();
        activeMode = null;
        return;
    }
    
    if (activeMode === 'edit') {
        message.classList.add('hidden');
        message.classList.remove('edit-task');
        removeEditModeListeners();
    }
    
    activeMode = 'delete';
    message.classList.remove('hidden');
    message.classList.add('remove-task');
    message.textContent = 'click the task to delete';
    
    removeDeleteModeListener();
    
    document.querySelectorAll('.task').forEach(task => {
        const handler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const indexTask = task.getAttribute('data-index');
            const newData = dataBase.filter((_, index) => index !== parseInt(indexTask));
            localStorage.setItem('todoList', JSON.stringify(newData));
            location.reload();
        };

        task.addEventListener('click', handler);
        deleteModeListeners.push({task, handler});
    });
};

// fungsi untuk menambah task baru
document.getElementById('add-todo').addEventListener('click', (event) => {
    event.preventDefault();

    if (activeMode === 'edit') {
        document.getElementById('message').classList.add('hidden');
        document.getElementById('message').classList.remove('edit-task');
        removeEditModeListeners();
    } else if (activeMode === 'delete') {
        document.getElementById('message').classList.add('hidden');
        document.getElementById('message').classList.remove('remove-task');
        removeDeleteModeListener();
    }
    
    activeMode = null;
    
    typeActions.typeActions = 'add';
    localStorage.setItem('typeActions', JSON.stringify(typeActions));
    document.getElementById('modal-container').classList.remove('hidden');
    document.getElementById('submit-btn').textContent = 'Submit';
});

document.getElementById('cancel-btn').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('modal-container').classList.add('hidden');
});

document.getElementById('submit-btn').addEventListener('click', (event) => {
    event.preventDefault();
    const taskText = document.getElementById('task').value;
    const dueDate = document.getElementById('due-date').value;
    const dueTime = document.getElementById('due-time').value;
    
    task(taskText, dueDate, dueTime);
});

document.getElementById('edit-todo').addEventListener('click', (event) => {
    event.preventDefault();
    editTask();
});

document.getElementById('remove-todo').addEventListener('click', (event) => {
    event.preventDefault();
    deleteTask();
});

// Inisialisasi awal
const todoList = document.getElementById('todo-list');
const noAssignmentMsg = document.getElementById('message');

if (dataBase.length > 0) {
    dataBase.forEach((item, index) => {
        renderTask(item.taskText, item.dueDate, item.dueTime, item.status, index);
    });
    noAssignmentMsg.classList.add('hidden');
} else {
    noAssignmentMsg.classList.remove('hidden');
    noAssignmentMsg.classList.add('no-assignments');
    noAssignmentMsg.textContent = 'No Assignments';
}

showDetailTask();
markComplete();
deleteFromExpired();
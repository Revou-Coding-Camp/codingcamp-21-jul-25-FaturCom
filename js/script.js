const dataBase = localStorage.getItem('todoList') ? JSON.parse(localStorage.getItem('todoList')) : [];
let typeActions = localStorage.getItem('typeActions') ? JSON.parse(localStorage.getItem('typeActions')) : { typeActions: 'add' };

let editModeListeners = [];
let deleteModeListeners = [];
let activeMode = null;

// Fungsi bantu untuk menghapus event listener mode edit
const removeEditModeListeners = () => {
    editModeListeners.forEach(listener => {
        listener.task.removeEventListener('click', listener.handler);
    });
    editModeListeners = [];
};

// Fungsi bantu untuk menghapus event listener mode delete
const removeDeleteModeListener = () => {
    deleteModeListeners.forEach(listener => {
        listener.task.removeEventListener('click', listener.handler);
    });
    deleteModeListeners = [];
};

// Fungsiuntuk membersihkan input pada modal
const clearModalInputs = () => {
    document.getElementById('task').value = '';
    document.getElementById('due-date').value = '';
    document.getElementById('due-time').value = '';
};

// Render task
const renderTask = (taskText, dueDate, dueTime, status, index) => {
    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const currentDateTime = new Date();

    let displayStatus = status;
    if (dueDateTime < currentDateTime && status !== 'complete') {
        displayStatus = 'expired';
    }

    const taskElement = document.createElement('div');
    taskElement.className = `task ${displayStatus === 'complete' ? 'done-task-bg' : displayStatus === 'expired' ? 'expired-task-bg' : ''}`;
    taskElement.dataset.index = index;
    taskElement.dataset.status = displayStatus;

    taskElement.innerHTML = `
        <div class="task-main">
            <p class="task-text ${displayStatus === 'complete' ? 'done-task' : ''}" data-taskText="${taskText}">${taskText}</p>
        </div>
        <div class="task-detail">
            <p class="due-date" data-dueDate="${dueDate}">Due Date: ${dueDate}</p>
            <p class="due-date due-time" data-dueTime="${dueTime}">Due Time: ${dueTime}</p>
            <p class="due-date">Status: ${displayStatus}</p>
            <button class="${displayStatus === 'complete' ? 'done-task-btn' : displayStatus === 'expired' ? 'expired-task-btn' : 'mark-complete'}">
                <span class="material-symbols-outlined icon-medium">
                    ${displayStatus === 'expired' ? 'delete' : 'check'}
                </span>
                ${displayStatus === 'complete' ? 'Complete' : displayStatus === 'expired' ? 'Delete' : 'Complete'}
            </button>
        </div>
    `;

    document.getElementById('todo-list').appendChild(taskElement);
    return taskElement;
};

// Filter task berdasarkan status
const applyStatusFilter = (status) => {
    const filteredTasks = status === 'all' 
        ? dataBase 
        : status === 'expired'
        ? dataBase.filter(task => {
            const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
            return task.status !== 'complete' && dueDateTime < new Date();
          })
        : status === 'in progress'
        ? dataBase.filter(task => {
            const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
            return task.status === 'in progress' && dueDateTime >= new Date();
          })
        : dataBase.filter(task => task.status === (status === 'completed' ? 'complete' : status));

    document.getElementById('todo-list').innerHTML = '';

    if (filteredTasks.length === 0) {
        const message = document.getElementById('message');
        message.className = 'no-assignments';
        message.classList.remove('hidden');
        message.textContent = status === 'all' ? 'No Assignments' : `No ${status} tasks`;
    } else {
        document.getElementById('message').classList.add('hidden');
        filteredTasks.forEach((task, index) => {
            renderTask(task.taskText, task.dueDate, task.dueTime, task.status, index);
        });
    }
    
    showDetailTask();
    markComplete();
    deleteFromExpired();
};

// Toggle detail task
const showDetailTask = () => {
    document.querySelectorAll('.task').forEach(task => {
        task.addEventListener('click', (event) => {
            if (activeMode === 'edit' || activeMode === 'delete') return;
            event.currentTarget.classList.toggle('open');
        });
    });
};

// Tandai task sebagai selesai
const markComplete = () => {
    document.querySelectorAll('.mark-complete').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const task = button.closest('.task');
            const index = task.dataset.index;
            
            dataBase[index].status = 'complete';
            localStorage.setItem('todoList', JSON.stringify(dataBase));
            applyStatusFilter(document.getElementById('status-filter').value);
        });
    });
};

// Handler hapus task
const handleDeleteTask = (index) => {
    dataBase.splice(index, 1);
    localStorage.setItem('todoList', JSON.stringify(dataBase));
    applyStatusFilter(document.getElementById('status-filter').value);
};

// Hapus task yang sudah expired
const deleteFromExpired = () => {
    document.querySelectorAll('.expired-task-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const task = button.closest('.task');
            handleDeleteTask(task.dataset.index);
        });
    });
};

// Fungsi utama tambah/edit task
const task = (taskText, dueDate, dueTime) => {
    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const currentDateTime = new Date();
    
    // Reset semua pesan error
    document.querySelector('.modal-error').classList.add('hidden');
    document.querySelectorAll('.error-item').forEach(element => element.classList.add('hidden'));

    // Validasi
    if (taskText.trim() === '' && (dueDate === '' || dueTime === '')) {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-task-input').classList.remove('hidden');
        document.getElementById('error-duedatetime-input').classList.remove('hidden');
        document.getElementById('error-task-duedatetime').classList.remove('hidden');
        return;
    } else if (taskText.trim() === '') {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-task-input').classList.remove('hidden');
        return;
    } else if (dueDate === '' || dueTime === '') {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-duedatetime-input').classList.remove('hidden');
        return;
    } else if (dueDateTime < currentDateTime) {
        document.querySelector('.modal-error').classList.remove('hidden');
        document.getElementById('error-task-duedatetime').classList.remove('hidden');
        return;
    }

    if (typeActions.typeActions === 'edit') {
        const editTask = JSON.parse(localStorage.getItem('taskEdit'));
        dataBase[editTask.indexTask] = { 
            taskText, 
            dueDate, 
            dueTime, 
            status: editTask.status 
        };
    } else {
        dataBase.push({ 
            taskText, 
            dueDate, 
            dueTime, 
            status: 'in progress' 
        });
    }

    localStorage.setItem('todoList', JSON.stringify(dataBase));
    document.getElementById('modal-container').classList.add('hidden');
    clearModalInputs();
    activeMode = null;
    typeActions.typeActions = 'add';
    localStorage.setItem('typeActions', JSON.stringify(typeActions));
    applyStatusFilter(document.getElementById('status-filter').value);
};

// Mode edit task
const editTask = () => {
    const message = document.getElementById('message');
    const warningMsg = document.getElementById('warning-msg');
    
    if (activeMode === 'edit') {
        message.classList.add('hidden');
        message.classList.add('no-assignments')
        message.textContent = 'No assignment'
        warningMsg.classList.add('hidden');
        removeEditModeListeners();
        activeMode = null;
        return;
    }
    
    if (activeMode === 'delete') {
        message.classList.add('hidden');
        message.className = 'no-assignments';
        removeDeleteModeListener();
    }
    
    activeMode = 'edit';
    message.classList.remove('hidden');
    message.className = 'edit-task';
    message.textContent = 'Click the task to edit';
    warningMsg.classList.add('hidden');
    
    removeEditModeListeners();
    
    document.querySelectorAll('.task').forEach(task => {
        const handler = (event) => {
            event.preventDefault();
            if (task.dataset.status === 'complete' || task.dataset.status === 'expired') {
                warningMsg.classList.remove('hidden');
                return;
            }
            
            warningMsg.classList.add('hidden');
            const taskData = {
                taskText: task.querySelector('.task-text').dataset.tasktext,
                dueDate: task.querySelector('[data-dueDate]').dataset.duedate,
                dueTime: task.querySelector('[data-dueTime]').dataset.duetime,
                indexTask: task.dataset.index,
                status: task.dataset.status
            };
            
            localStorage.setItem('taskEdit', JSON.stringify(taskData));
            document.getElementById('modal-container').classList.remove('hidden');
            document.getElementById('task').value = taskData.taskText;
            document.getElementById('due-date').value = taskData.dueDate;
            document.getElementById('due-time').value = taskData.dueTime;
            document.getElementById('submit-btn').textContent = 'Edit Task';
        };
        
        task.addEventListener('click', handler);
        editModeListeners.push({ task, handler });
    });
    
    typeActions.typeActions = 'edit';
    localStorage.setItem('typeActions', JSON.stringify(typeActions));
};

// Mode hapus task
const deleteTask = () => {
    const message = document.getElementById('message');
    
    if (activeMode === 'delete') {
        message.classList.add('hidden');
        message.classList.add('no-assignments')
        message.textContent = 'No assignment'
        removeDeleteModeListener();
        activeMode = null;
        return;
    }
    
    if (activeMode === 'edit') {
        document.getElementById('warning-msg').classList.add('hidden');
        message.classList.add('hidden');
        message.className = 'no-assignments';
        removeEditModeListeners();
    }
    
    activeMode = 'delete';
    message.classList.remove('hidden');
    message.className = 'remove-task';
    message.textContent = 'Click the task to delete';
    
    removeDeleteModeListener();
    
    document.querySelectorAll('.task').forEach(task => {
        const handler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleDeleteTask(task.dataset.index);

            if (dataBase.length > 0) {
                deleteTask();
            } else {
                const message = document.getElementById('message');
                message.classList.remove('hidden');
                message.className = 'no-assignments';
                message.textContent = 'No Assignments';
                activeMode = null;
            }
        };

        task.addEventListener('click', handler);
        deleteModeListeners.push({ task, handler });
    });
};

// Event Listener tombol tambah
document.getElementById('add-todo').addEventListener('click', (event) => {
    event.preventDefault();
    if (activeMode === 'edit' || activeMode === 'delete') {
        document.getElementById('message').classList.add('hidden');
        document.getElementById('message').className = 'no-assignments';
        document.getElementById('warning-msg').classList.add('hidden');
        removeEditModeListeners();
        removeDeleteModeListener();
    }

    message.className = 'no-assignments';
    message.textContent = 'No Assignments';
    message.classList.add('hidden');

    activeMode = null;
    typeActions.typeActions = 'add';
    localStorage.setItem('typeActions', JSON.stringify(typeActions));
    document.getElementById('modal-container').classList.remove('hidden');
    clearModalInputs();
    document.getElementById('submit-btn').textContent = 'Submit';
});

// Event Listener filter status
document.getElementById('status-filter').addEventListener('change', (e) => {
    applyStatusFilter(e.target.value);
});

// Event Listener tombol batal pada modal
document.getElementById('cancel-btn').addEventListener('click', (event) => {
    event.preventDefault();

    if(dataBase.length === 0){
        message.classList.remove('hidden');
        message.className = 'no-assignments';
        message.textContent = 'No Assignments';
    }

    document.getElementById('modal-container').classList.add('hidden');
    clearModalInputs();
});

// Event Listener tombol submit pada modal
document.getElementById('submit-btn').addEventListener('click', (event) => {
    event.preventDefault();
    const taskText = document.getElementById('task').value;
    const dueDate = document.getElementById('due-date').value;
    const dueTime = document.getElementById('due-time').value;
    task(taskText, dueDate, dueTime);
});

// Event Listener tombol edit
document.getElementById('edit-todo').addEventListener('click', () => {
    if (dataBase.length === 0) {
        const message = document.getElementById('message');
        message.classList.remove('hidden');
        message.className = 'no-assignments';
        message.textContent = 'No Assignments';
        return;
    }
    editTask();
});

// Event Listener tombol hapus
document.getElementById('remove-todo').addEventListener('click', () => {
    if (dataBase.length === 0) {
        const message = document.getElementById('message');
        message.classList.remove('hidden');
        message.className = 'no-assignments';
        message.textContent = 'No Assignments';
        return;
    }
    deleteTask();
});

// Inisialisasi awal
if (dataBase.length > 0) {
    applyStatusFilter('all');
} else {
    document.getElementById('message').classList.remove('hidden');
    document.getElementById('message').className = 'no-assignments';
    document.getElementById('message').textContent = 'No Assignments';
}
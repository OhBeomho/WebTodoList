import * as TODO_LIST from './todoList.js';

const userTheme = localStorage.getItem('color-theme');
const osTheme = window.matchMedia('(prefers-color-theme: dark)').matches ? 'dark' : 'light';
const theme = userTheme || osTheme;

let font = localStorage.getItem('font');
if (!font) font = 'Segoe UI Light';

const darkmodeInput = document.getElementById('darkmode');
const fontInput = document.getElementById('font');

document.documentElement.setAttribute('color-theme', theme);
if (theme === 'dark') darkmodeInput.checked = true;
fontInput.value = font;
document.querySelector('*').style.fontFamily = font;

darkmodeInput.addEventListener('change', () => {
	let theme = 'light';
	if (darkmodeInput.checked) theme = 'dark';

	document.documentElement.setAttribute('color-theme', theme);
	localStorage.setItem('color-theme', theme);
});
fontInput.addEventListener('change', () => {
	const font = fontInput.value;

	document.querySelector('*').style.fontFamily = font;
	localStorage.setItem('font', font);
});

let todoList = TODO_LIST.load();
const filters = TODO_LIST.filters;
const filterNames = ['active', 'complete', 'fail'];
let filterNum = 0,
	filterName = 'all';

function loadTodos() {
	document.querySelector('.todo-list').innerHTML = '';
	const filteredTodoList = filterName !== 'all' ? filters[filterNum]() : todoList;

	for (let todo of filteredTodoList) {
		let className;
		if (todo.complete) className = 'complete';
		else if (filters[0]().some((e) => e.id === todo.id)) className = 'active';
		else if (filters[2]().some((e) => e.id === todo.id)) className = 'fail';

		const todoElement = document.createElement('li');
		todoElement.className = 'todo';
		todoElement.dataset.id = todo.id;
		todoElement.innerHTML = `
			<hr>
			<div class="title">${todo.title}</div>
			<div class="date ${className}">${todo.startDate} ~ ${todo.endDate}</div>
			<div class="content">${todo.content}</div>
			<div class="buttons">
			</div>
		`;

		const editButton = document.createElement('button');
		editButton.innerText = 'Edit';
		editButton.addEventListener('click', () => {
			document.querySelector('.modal-background.edit').style.display = 'flex';

			const editModal = document.querySelector('.modal.edit');

			editModal.style.display = 'block';
			editModal.dataset.id = todo.id;

			editModal.querySelector('.title').value = todo.title;
			editModal.querySelector('.start-date').value = todo.startDate;
			editModal.querySelector('.end-date').value = todo.endDate;
			editModal.querySelector('.content').value = todo.content;
		});
		todoElement.querySelector('.buttons').appendChild(editButton);

		const deleteButton = document.createElement('button');
		deleteButton.innerText = 'Delete';
		deleteButton.addEventListener('click', () => {
			if (confirm(`Are you sure you want to delete '${todo.title}'?`)) deleteTodo(todo.id);
		});
		todoElement.querySelector('.buttons').appendChild(deleteButton);

		const completeButton = document.createElement('button');

		if (!todo.complete) {
			completeButton.innerText = 'Complete';
			completeButton.addEventListener('click', () => {
				todo.complete = true;
				TODO_LIST.save(todoList);
				loadTodos();
			});
		} else {
			completeButton.innerText = 'Uncomplete';
			completeButton.addEventListener('click', () => {
				todo.complete = false;
				TODO_LIST.save(todoList);
				loadTodos();
			});
		}

		todoElement.querySelector('.buttons').appendChild(completeButton);

		document.querySelector('.todo-list').appendChild(todoElement);
	}
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function createTodo(title, content, startDate, endDate) {
	if (!title) return 'Please enter title';
	else if (!startDate || !endDate) return 'Please enter start date and end date.';
	else if (new Date(startDate).getTime() > new Date(endDate).getTime())
		return 'Start date cannot be later than end date.';

	if (!todoList) todoList = [];
	todoList.push({
		id: guid(),
		title,
		content,
		startDate,
		endDate,
		complete: false
	});
	TODO_LIST.save(todoList);
	loadTodos();

	return null;
}

function updateTodo(id, title, content, startDate, endDate) {
	if (!title) return 'Please enter title';
	else if (!startDate || !endDate) return 'Please enter start date and end date.';
	else if (new Date(startDate).getTime() > new Date(endDate).getTime())
		return 'Start date cannot be later than end date.';

	const target = todoList.find((todo) => todo.id === id);
	target.title = title;
	target.content = content;
	target.startDate = startDate;
	target.endDate = endDate;

	TODO_LIST.save(todoList);
	loadTodos();

	return null;
}

function deleteTodo(id) {
	const target = todoList.find((todo) => todo.id === id);
	todoList.splice(todoList.indexOf(target), 1);
	TODO_LIST.save(todoList);
	loadTodos();
}

document.getElementById('create').addEventListener('click', () => {
	document.querySelector('.modal-background.create').style.display = 'flex';
	document.querySelector('.modal.create').style.display = 'block';
});
document.getElementById('settings').addEventListener('click', () => {
	document.querySelector('.modal-background.settings').style.display = 'flex';
	document.querySelector('.modal.settings').style.display = 'block';
});

const modals = document.querySelectorAll('.modal');
const close = (className) => {
	document.querySelector(`.modal-background.${className}`).style.display = 'none';
	document.querySelector(`.modal.${className}`).style.display = 'none';
};
for (let modal of modals)
	modal
		.querySelector('.close-modal')
		.addEventListener('click', () => close(modal.classList[modal.classList.length - 1]));

document.querySelector('.modal.create > .ok-close-modal').addEventListener('click', () => {
	const createModal = document.querySelector('.modal.create');
	const titleInput = createModal.querySelector('.title');
	const startDateInput = createModal.querySelector('.start-date'),
		endDateInput = createModal.querySelector('.end-date');
	const contentInput = createModal.querySelector('.content');

	const message = createTodo(titleInput.value, contentInput.value, startDateInput.value, endDateInput.value);

	if (message) alert(message);
	else close('create');
});
document.querySelector('.modal.edit > .ok-close-modal').addEventListener('click', () => {
	const editModal = document.querySelector('.modal.edit');
	const titleInput = editModal.querySelector('.title');
	const startDateInput = editModal.querySelector('.start-date'),
		endDateInput = editModal.querySelector('.end-date');
	const contentInput = editModal.querySelector('.content');

	const message = updateTodo(
		editModal.dataset.id,
		titleInput.value,
		contentInput.value,
		startDateInput.value,
		endDateInput.value
	);

	if (message) alert(message);
	else {
		titleInput.value = '';
		startDateInput.value = '';
		endDateInput.value = '';
		contentInput.value = '';

		close('edit');
	}
});

document.getElementById('filter').addEventListener('change', () => {
	filterName = document.getElementById('filter').value;
	filterNum = filterNames.indexOf(filterName);
	loadTodos();
});

if (todoList) loadTodos();

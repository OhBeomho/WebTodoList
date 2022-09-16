function load() {
	return JSON.parse(localStorage.getItem('todo-list'));
}

function save(newTodoList) {
	localStorage.setItem('todo-list', JSON.stringify(newTodoList));
}

function getActiveTodos() {
	const todoList = load();
	return todoList.filter((todo) => !todo.complete && new Date(todo.endDate).getTime() >= new Date(new Date().toDateString()).getTime());
}

function getCompletedTodos() {
	const todoList = load();
	return todoList.filter((todo) => todo.complete);
}

function getFailedTodos() {
	const todoList = load();
	return todoList.filter((todo) => !todo.complete && new Date(todo.endDate).getTime() < new Date(new Date().toDateString()).getTime());
}

const filters = [getActiveTodos, getCompletedTodos, getFailedTodos];

export { load, save, filters };

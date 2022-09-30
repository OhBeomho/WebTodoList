class Todo {
	#todo_list = JSON.parse(localStorage.getItem('todo-list'))
	#filters = [
		() =>
			this.#todo_list.filter((todo) => {
				const nextDay = new Date(new Date().toDateString())
				nextDay.setDate(nextDay.getDate() + 1)

				return (
					!todo.complete &&
					new Date(todo.startDate) < nextDay &&
					new Date(todo.endDate) >= new Date(new Date().toDateString())
				)
			}),
		() => this.#todo_list.filter((todo) => todo.complete),
		() =>
			this.#todo_list.filter(
				(todo) => !todo.complete && new Date(todo.endDate) < new Date(new Date().toDateString())
			),
		() =>
			this.#todo_list.filter(
				(todo) => !todo.complete && new Date(todo.startDate) > new Date(new Date().toDateString())
			)
	]

	get todo_list() {
		return this.#todo_list
	}

	set todo_list(new_list) {
		this.#todo_list = new_list
		localStorage.setItem('todo-list', JSON.stringify(new_list))
	}

	get filters() {
		return this.#filters
	}
}

const todoManager = new Todo()

const user_theme = localStorage.getItem('color-theme')
const os_theme = window.matchMedia('(prefers-color-theme: dark)').matches ? 'dark' : 'light'
const theme = user_theme || os_theme

let font = localStorage.getItem('font')
if (!font) font = 'Segoe UI Light'

const darkmode_input = document.getElementById('darkmode')
const font_input = document.getElementById('font')

document.documentElement.setAttribute('color-theme', theme)
if (theme === 'dark') darkmode_input.checked = true
font_input.value = font
document.querySelector('*').style.fontFamily = font

darkmode_input.addEventListener('change', () => {
	let theme = 'light'
	if (darkmode_input.checked) theme = 'dark'

	document.documentElement.setAttribute('color-theme', theme)
	localStorage.setItem('color-theme', theme)
})
font_input.addEventListener('change', () => {
	const font = font_input.value

	document.querySelector('*').style.fontFamily = font
	localStorage.setItem('font', font)
})

let todo_list = todoManager.todo_list
const filters = todoManager.filters
const filterNames = ['active', 'complete', 'fail', 'inactive']
let filterNum = 0,
	filterName = 'all'

function loadTodos() {
	document.querySelector('.todo-list').innerHTML = ''
	const filteredTodoList = filterName !== 'all' ? filters[filterNum]() : todo_list

	for (let todo of filteredTodoList) {
		let className
		if (filterName === 'all') {
			if (todo.complete) className = 'complete'
			else if (filters[0]().some((e) => e.id === todo.id)) className = 'active'
			else if (filters[2]().some((e) => e.id === todo.id)) className = 'fail'
			else if (filters[3]().some((e) => e.id === todo.id)) className = 'inactive'
		} else className = filterName

		const todoElement = document.createElement('li')
		todoElement.className = 'todo'
		todoElement.dataset.id = todo.id
		todoElement.innerHTML = `
			<hr>
			<div class="title">${todo.title}</div>
			<div class="date ${className}">${todo.startDate} ~ ${todo.endDate}</div>
			<div class="content">${todo.content}</div>
			<div class="buttons">
			</div>
		`

		const editButton = document.createElement('button')
		editButton.innerText = 'Edit'
		editButton.addEventListener('click', () => {
			document.querySelector('.modal-background.edit').style.display = 'flex'

			const editModal = document.querySelector('.modal.edit')

			editModal.style.display = 'block'
			editModal.dataset.id = todo.id

			editModal.querySelector('.title').value = todo.title
			editModal.querySelector('.start-date').value = todo.startDate
			editModal.querySelector('.end-date').value = todo.endDate
			editModal.querySelector('.content').value = todo.content
		})
		todoElement.querySelector('.buttons').appendChild(editButton)

		const deleteButton = document.createElement('button')
		deleteButton.innerText = 'Delete'
		deleteButton.addEventListener('click', () => {
			if (confirm(`Are you sure you want to delete '${todo.title}'?`)) deleteTodo(todo.id)
		})
		todoElement.querySelector('.buttons').appendChild(deleteButton)

		const completeButton = document.createElement('button')

		if (!todo.complete) {
			completeButton.innerText = 'Complete'
			completeButton.addEventListener('click', () => {
				todo.complete = true
				todoManager.todo_list = todo_list
				loadTodos()
			})
		} else {
			completeButton.innerText = 'Uncomplete'
			completeButton.addEventListener('click', () => {
				todo.complete = false
				todoManager.todo_list = todo_list
				loadTodos()
			})
		}

		todoElement.querySelector('.buttons').appendChild(completeButton)

		document.querySelector('.todo-list').appendChild(todoElement)
	}
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1)
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

function createTodo(title, content, startDate, endDate) {
	if (!title) return 'Please enter title'
	else if (!startDate || !endDate) return 'Please enter start date and end date.'
	else if (new Date(startDate).getTime() > new Date(endDate).getTime())
		return 'Start date cannot be later than end date.'

	if (!todo_list) todo_list = []
	todo_list.push({
		id: guid(),
		title,
		content,
		startDate,
		endDate,
		complete: false
	})
	todoManager.todo_list = todo_list
	loadTodos()

	return null
}

function updateTodo(id, title, content, startDate, endDate) {
	if (!title) return 'Please enter title'
	else if (!startDate || !endDate) return 'Please enter start date and end date.'
	else if (new Date(startDate).getTime() > new Date(endDate).getTime())
		return 'Start date cannot be later than end date.'

	const target = todo_list.find((todo) => todo.id === id)
	target.title = title
	target.content = content
	target.startDate = startDate
	target.endDate = endDate

	todoManager.todo_list = todo_list
	loadTodos()

	return null
}

function deleteTodo(id) {
	const target = todo_list.find((todo) => todo.id === id)
	todo_list.splice(todo_list.indexOf(target), 1)
	todoManager.todo_list = todo_list
	loadTodos()
}

document.getElementById('create').addEventListener('click', () => {
	document.querySelector('.modal-background.create').style.display = 'flex'
	document.querySelector('.modal.create').style.display = 'block'
})
document.getElementById('settings').addEventListener('click', () => {
	document.querySelector('.modal-background.settings').style.display = 'flex'
	document.querySelector('.modal.settings').style.display = 'block'
})

const modals = document.querySelectorAll('.modal')
const close = (className) => {
	document.querySelector(`.modal-background.${className}`).style.display = 'none'
	document.querySelector(`.modal.${className}`).style.display = 'none'
}
for (let modal of modals)
	modal
		.querySelector('.close-modal')
		.addEventListener('click', () => close(modal.classList[modal.classList.length - 1]))

document.querySelector('.modal.create > .ok-close-modal').addEventListener('click', () => {
	const createModal = document.querySelector('.modal.create')
	const titleInput = createModal.querySelector('.title')
	const startDateInput = createModal.querySelector('.start-date'),
		endDateInput = createModal.querySelector('.end-date')
	const contentInput = createModal.querySelector('.content')

	const message = createTodo(titleInput.value, contentInput.value, startDateInput.value, endDateInput.value)

	if (message) alert(message)
	else close('create')
})
document.querySelector('.modal.edit > .ok-close-modal').addEventListener('click', () => {
	const editModal = document.querySelector('.modal.edit')
	const titleInput = editModal.querySelector('.title')
	const startDateInput = editModal.querySelector('.start-date'),
		endDateInput = editModal.querySelector('.end-date')
	const contentInput = editModal.querySelector('.content')

	const message = updateTodo(
		editModal.dataset.id,
		titleInput.value,
		contentInput.value,
		startDateInput.value,
		endDateInput.value
	)

	if (message) alert(message)
	else {
		titleInput.value = ''
		startDateInput.value = ''
		endDateInput.value = ''
		contentInput.value = ''

		close('edit')
	}
})

document.getElementById('filter').addEventListener('change', () => {
	filterName = document.getElementById('filter').value
	filterNum = filterNames.indexOf(filterName)
	loadTodos()
})

if (todo_list) loadTodos()

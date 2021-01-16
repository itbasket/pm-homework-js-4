const files = [
    {name: 'photo-001.jpg'},
    {name: 'photo-002.jpg'},
    {name: 'funny-video.mkv'},
    {name: 'crazy-frog.mp3'},
    {name: 'test.json'},
    {name: 'index.html'},
    {name: 'hello-world.js'}
]

const container = document.querySelector('#root')

document.addEventListener('click', closeContextMenu)
container.addEventListener('contextmenu', onContainerContext)

files.forEach((file, index) => {
    showFile(file, index)
})

function onFileContext(event) {
    event.stopPropagation()
    event.preventDefault()
    closeContextMenu()
    const fileId = event.target.id.slice(event.target.id.indexOf('-') + 1)
    createContextMenu(event.clientX, event.clientY, ['rename', 'delete'], fileId)
}

function onContainerContext(event) {
    event.preventDefault()
    closeContextMenu()
    createContextMenu(event.clientX, event.clientY, ['create'])
}

function showFile(file, index) {
    const newDiv = document.createElement('div')
    newDiv.id = `file-${index + 1}`
    newDiv.classList.add(`file-item`)
    newDiv.setAttribute('draggable', true)
    newDiv.innerHTML = file.name
    newDiv.addEventListener('contextmenu', onFileContext)
    newDiv.setAttribute('ondragstart', `onDragStart(event, ${index + 1})`)
    newDiv.addEventListener('dragenter', () => { newDiv.classList.add(`droppable`) })
    newDiv.addEventListener('dragover', (event) => { event.preventDefault() })
    newDiv.addEventListener('dragleave', () => { newDiv.classList.remove(`droppable`) })
    newDiv.addEventListener('drop', (event) => { onDrop(event) })
    container.append(newDiv)
}

function createContextMenu(posX, posY, options, fileId) {
    const optionsList = options.map(option => {
        const newOption = document.createElement('li')
        const optionButton = document.createElement('div')
        switch (option) {
            case 'create':
                optionButton.innerHTML = 'Create'
                optionButton.addEventListener('click', createFile)
                newOption.append(optionButton)
                return newOption
            case 'rename':
                optionButton.innerHTML = 'Rename'
                optionButton.addEventListener('click', () => { renameFile(fileId) })
                newOption.append(optionButton)
                return newOption
            case 'delete':
                optionButton.innerHTML = 'Delete'
                optionButton.addEventListener('click', () => { deleteFile(fileId, true) })
                newOption.append(optionButton)
                return newOption
            default:
                return ''
        }
    })
    const menu = document.createElement('div')
    const list = document.createElement('ul')

    optionsList.forEach(option => {
        list.append(option)
    })
    menu.append(list)

    menu.id = 'contextMenu'
    menu.style.left = `${posX}px`
    menu.style.top = `${posY}px`

    container.append(menu)
}

function createFile() {
    const fileName = prompt('Please enter file name')
    if (fileName) {
        const file = {name: fileName}
        files.push(file)
        showFile(file, files.length - 1)
    } else {
        alert('Invalid name')
    }
}

function renameFile(id) {
    const newFileName = prompt('Please enter new file name')
    if (newFileName) {
        files[id - 1].name = newFileName
        const file = document.querySelector(`#file-${id}`)
        file.innerHTML = newFileName
    } else {
        alert('Invalid name')
    }
}

function deleteFile(deletedId, confirmation) {
    const confirmDelete = confirmation ? confirm('Are you sure?') : true
    if (confirmDelete) {
        files.splice(deletedId - 1, 1)
        const file = document.querySelector(`#file-${deletedId}`)
        file.remove()

        const filesList = document.querySelectorAll('.file-item')
        filesList.forEach(file => {
            const fileId = file.id.slice(file.id.indexOf('-') + 1)
            if (fileId > deletedId) {
                file.id = `file-${fileId - 1}`
                file.setAttribute('ondragstart', `onDragStart(event, ${fileId - 1})`)
            }
        })
    }
}

function closeContextMenu() {
    if (document.querySelector('#contextMenu')) { document.querySelector('#contextMenu').remove() }
}

function onDragStart(event, fileId) {
    event.dataTransfer.setData('text/html', fileId)
}

function onDrop(event) {
    const draggedId = event.dataTransfer.getData('text/html')
    const targetId = event.target.id.slice(event.target.id.indexOf('-') + 1)
    const draggedFile = document.querySelector(`#file-${draggedId}`)

    if (draggedId !== targetId) {
        const firstFile = files[draggedId - 1]
        const secondFile = files[targetId - 1]

        draggedFile.id = `file-${targetId}`
        draggedFile.innerHTML = secondFile.name
        draggedFile.setAttribute('ondragstart', `onDragStart(event, ${targetId})`)
        event.target.id = `file-${draggedId}`
        event.target.innerHTML = firstFile.name
        event.target.setAttribute('ondragstart', `onDragStart(event, ${draggedId})`)
    }

    event.target.classList.remove(`droppable`)
    event.dataTransfer.clearData()
}
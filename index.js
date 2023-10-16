const UNFINISHED_BOOKS = 'UNFINISHED_BOOKS'
const FINISHED_BOOKS = 'FINISHED_BOOKS'
const RENDER_EVENT = 'RENDER_EVENT'
const UNFINISHED_BOOKS_ID = 'unfinished-books'
const FINISHED_BOOKS_ID = 'finished-books'

let unfinishedBooks = []
let finishedBooks = []

window.addEventListener('load', () => {
  if (!isStorageExist()) return

  setTimeout(() => {
    initData(UNFINISHED_BOOKS)
    initData(FINISHED_BOOKS)
    document.dispatchEvent(new Event(RENDER_EVENT))
  }, 500)
})

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage')
    return false
  }
  return true
}

const initData = key => {
  const books = JSON.parse(localStorage.getItem(key))
  if (!books) return

  const target = key === UNFINISHED_BOOKS ? unfinishedBooks : finishedBooks

  for (const book of books) {
    target.push(book)
  }
}

const generateId = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

class Book {
  constructor(payload) {
    this.id = generateId()
    Object.assign(this, payload)
  }
}

const saveBookForm = document.getElementById('form-book')
saveBookForm.addEventListener('submit', event => {
  event.preventDefault()

  const id = document.querySelector('#form-book input[name="id"]').value
  const title = document.querySelector('#form-book input[name="title"]').value
  const author = document.querySelector('#form-book input[name="author"]').value
  const year = document.querySelector('#form-book input[name="year"]').value
  const isComplete = document.querySelector('#form-book input[name="isComplete"]').checked

  if (id) {
    deleteBook({ id, title, author, year, isComplete })
    deleteBook({ id, title, author, year, isComplete: !isComplete })
    document.querySelector('#form-book button[type="reset"]').remove()
    document.querySelector('#form-book button[type="submit"]').classList.remove('fit')
  }

  const book = new Book({ title, author, year, isComplete })
  saveBook(book)

  saveBookForm.reset()
})

const saveBook = book => {
  const key = book.isComplete ? FINISHED_BOOKS : UNFINISHED_BOOKS
  let books = key === UNFINISHED_BOOKS ? unfinishedBooks : finishedBooks

  if (!books) books = []
  const isExist = books.findIndex(item => item.id === book.id)
  if (isExist !== -1) {
    books[isExist] = book
  } else {
    books.push(book)
  }

  localStorage.setItem(key, JSON.stringify(books))
  renderOne(book)
}

document.querySelector(`#form-book input[name="isComplete"]`).addEventListener('change', event => {
  if (event.target.checked) {
    document.getElementById('btn-save-book').innerText = 'Selesai dibaca'
  } else {
    document.getElementById('btn-save-book').innerText = 'Belum Selesai dibaca'
  }
})

const searchBook = document.getElementById('form-search')
searchBook.addEventListener('submit', event => {
  event.preventDefault()

  const search = document.querySelector('#form-search input[name="search"]').value

  const finish = search
    ? finishedBooks.filter(book => book.title.toLowerCase().includes(search.toLowerCase()))
    : finishedBooks
  const unfinish = search
    ? unfinishedBooks.filter(book => book.title.toLowerCase().includes(search.toLowerCase()))
    : unfinishedBooks

  document.querySelector(`#${UNFINISHED_BOOKS_ID} .list`).innerHTML = ''
  document.querySelector(`#${FINISHED_BOOKS_ID} .list`).innerHTML = ''

  finish.forEach(renderOne)
  unfinish.forEach(renderOne)
})

document.addEventListener(RENDER_EVENT, () => {
  renderAll(FINISHED_BOOKS)
  renderAll(UNFINISHED_BOOKS)
})

const renderAll = (type = FINISHED_BOOKS) => {
  const books = type === UNFINISHED_BOOKS ? unfinishedBooks : finishedBooks

  books.forEach(renderOne)
}

const renderOne = book => {
  const ui = renderUI(book)
  const target = document.querySelector(
    `#${!book.isComplete ? UNFINISHED_BOOKS_ID : FINISHED_BOOKS_ID} .list`
  )
  target.appendChild(ui)
}

const renderUI = book => {
  const card = document.createElement('div')
  card.classList.add('card')
  card.id = book.id

  const cardTitle = document.createElement('div')
  cardTitle.classList.add('card-title')
  cardTitle.innerText = book.title

  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')

  const author = document.createElement('p')
  author.innerText = `Penulis: ${book.author}`

  const year = document.createElement('p')
  year.innerText = `Tahun: ${book.year}`

  const cardFooter = document.createElement('div')
  cardFooter.classList.add('card-footer')

  const confButton = document.createElement('button')
  confButton.classList.add('btn', 'bg-primary')
  confButton.innerText = `${book.isComplete ? 'Belum' : ''} Selesai Dibaca`
  confButton.onclick = () => moveBook(book)

  const editButton = document.createElement('button')
  editButton.classList.add('btn', 'bg-secondary')
  editButton.innerText = `Ubah Buku`
  editButton.onclick = () => onEdit(book)

  const deleteButton = document.createElement('button')
  deleteButton.classList.add('btn', 'bg-danger')
  deleteButton.innerText = `Hapus Buku`
  deleteButton.onclick = () => createDialog(book)

  cardBody.appendChild(author)
  cardBody.appendChild(year)

  cardFooter.appendChild(confButton)
  cardFooter.appendChild(editButton)
  cardFooter.appendChild(deleteButton)

  card.appendChild(cardTitle)
  card.appendChild(cardBody)
  card.appendChild(cardFooter)

  return card
}

const deleteBook = book => {
  if (book.isComplete) {
    finishedBooks = finishedBooks.filter(item => item.id !== book.id)
    localStorage.setItem(FINISHED_BOOKS, JSON.stringify(finishedBooks))
  } else {
    unfinishedBooks = unfinishedBooks.filter(item => item.id !== book.id)
    localStorage.setItem(UNFINISHED_BOOKS, JSON.stringify(unfinishedBooks))
  }

  document.getElementById(book.id)?.remove()
}

const createDialog = book => {
  const overlay = document.createElement('div')
  overlay.classList.add('dialog-overlay')
  overlay.id = generateId(6)

  const dialog = document.createElement('div')
  dialog.classList.add('dialog')

  const dialogTitle = document.createElement('div')
  dialogTitle.classList.add('dialog-title')
  dialogTitle.innerText = 'Hapus Buku?'

  const dialogBody = document.createElement('div')
  dialogBody.classList.add('dialog-body')
  dialogBody.innerText = `Anda yakin ingin menghapus buku ${book.title}?`

  const dialogFooter = document.createElement('div')
  dialogFooter.classList.add('dialog-footer')

  const confButton = document.createElement('button')
  confButton.classList.add('btn', 'bg-danger', 'confirm')
  confButton.innerText = 'Hapus'
  confButton.onclick = () => {
    deleteBook(book)
    document.getElementById(overlay.id).remove()
  }

  const cancelButton = document.createElement('button')
  cancelButton.classList.add('btn', 'bg-secondary', 'cancel')
  cancelButton.innerText = `Batal`
  cancelButton.onclick = () => document.getElementById(overlay.id).remove()

  dialogFooter.appendChild(cancelButton)
  dialogFooter.appendChild(confButton)

  dialog.appendChild(dialogTitle)
  dialog.appendChild(dialogBody)
  dialog.appendChild(dialogFooter)

  overlay.appendChild(dialog)

  document.getElementById('dialog-container').appendChild(overlay)
}

const moveBook = book => {
  deleteBook(book)

  book.isComplete = !book.isComplete

  if (book.isComplete) {
    finishedBooks.push(book)
    localStorage.setItem(FINISHED_BOOKS, JSON.stringify(finishedBooks))
  } else {
    unfinishedBooks.push(book)
    localStorage.setItem(UNFINISHED_BOOKS, JSON.stringify(unfinishedBooks))
  }

  renderOne(book)
}

const onEdit = book => {
  const idEl = document.querySelector(`#form-book input[name="id"]`)
  if (idEl.value === book.id) return
  idEl.value = book.id

  document.querySelector('#form-book input[name="title"]').value = book.title
  document.querySelector('#form-book input[name="author"]').value = book.author
  document.querySelector('#form-book input[name="year"]').value = book.year
  document.querySelector('#form-book input[name="isComplete"]').checked = book.isComplete

  document.getElementById('form-book-title').innerText = 'Ubah Buku'
  const cancelButton = document.createElement('button')
  cancelButton.classList.add('btn', 'small', 'bg-secondary', 'cancel')
  cancelButton.innerText = `Batal`
  cancelButton.type = 'reset'
  cancelButton.onclick = () => {
    saveBookForm.reset()
    cancelButton.remove()
    document.querySelector('#form-book button[type="submit"]').classList.remove('fit')
  }

  document.querySelector('#form-book button[type="submit"]').classList.add('fit')
  document.getElementById('form-book').appendChild(cancelButton)
}

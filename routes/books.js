const express = require("express")
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

router.get('/', async(req, res) =>{
    let query = Book.find()
    if(req.query.title != null && req.query.name != ''){
        query = query.regex('title', new RegExp(req.query.title,'i'))
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate',req.query.title)
    }
    try {
        const books = await query.exec()
        res.render('books/index',{
            books : books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/new', (req, res) =>{
    res.render('books/new', {book : new Book()})  
})

router.post('/', async(req, res) =>{
    const book = new Book({
        title: req.body.title,
        author : req.body.author,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount
    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch {
        res.render('books/new',{
            book: book,
            errorMessage:'Error creating book'
        })
    }
})

router.get('/:id', async(req, res) =>{
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('authors/show',{
            book : book
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async(req, res) =>{
    try {
        const book = await Book.findById(req.params.id)
        res.render('books/edit', {
            book : book
        })
    } catch {
        res.redirect('/books')
    }
})

router.put('/:id', async(req, res) =>{
    let book
    try {
        const book = await Book.findById(req.params.id)
        book.title = req.body.title,
        book.author = req.body.author,
        book.description = req.body.description,
        book.publishDate = new Date(req.body.publishDate),
        book.pageCount = req.body.pageCount
        if(req.body.cover != null && req.body.cover != ''){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch  {
        if(book == null){
            res.redirect('/')
        } else {
            res.render('books/edit',{
                book: book,
                errorMessage: 'Error updating book'
            })
        }
    }
})

router.delete('/:id',async(req, res) =>{
    let book
    try {
        const book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if(book == null){
            res.redirect('/')
        } else{
            res.redirect(`/books/${book.id}`)
        }
    }
})

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        boo.coverImageType = cover.type
    }
}

module.exports = router
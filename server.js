require('dotenv').config()
const express = require('express')
const app = express()
const Author = require('./models/author')
const Book = require('./models/book')

const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const morgan = require('morgan')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ limit : '10mb', extended : false}))
app.use(morgan('tiny'))
app.use(express.static('public'))

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.on('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/authors',authorRouter)
app.use('/books', bookRouter)

app.listen(process.env.PORT || 4000, () =>{
    console.log(`Connected successfully to port ${process.env.PORT}`)
})
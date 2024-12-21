import express, {
  Request,
  Response,
  NextFunction,
} from 'express'
import mysql from 'mysql2'
import dotenv from 'dotenv'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'

dotenv.config()

const app = express()

console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_NAME:', process.env.DB_NAME)

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
})

db.connect((err) => {
  if (err) {
    console.error(
      'Error connecting to MySQL:',
      err.code,
      err.message,
    )
    return
  }
  console.log('Connected to MySQL')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT}`,
  )
})

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST, DELETE',
    allowedHeaders: 'Content-Type',
  }),
)

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

import routes from './route/index'
app.use('/', routes)

app.use(
  (req: Request, res: Response, next: NextFunction) => {
    next(new Error('Not Found'))
  },
)

app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    res.status(err.status || 500).json({
      message: err.message,
      error:
        process.env.NODE_ENV === 'development' ? err : {},
    })
  },
)

app.use(express.static(path.join(__dirname, 'public')))

export default app

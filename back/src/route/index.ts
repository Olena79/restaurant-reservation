import { Router, RequestHandler } from 'express'
import mysql, { ResultSetHeader } from 'mysql2'

const router = Router()

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
})

const getReservations: RequestHandler = (req, res) => {
  const { table_id, reservation_date } = req.query

  console.log('Received parameters:', {
    table_id,
  })

  if (!table_id || !reservation_date) {
    res.status(400).json({
      message: 'Missing required query parameters.',
    })
    return
  }

  const query = `
    SELECT
      r.id AS reservation_id,
      r.reservation_date,
      r.table_id,
      r.slot_id,
      s.time AS slot_time,
      r.status
    FROM
      reservations r
    JOIN
        slots s
    ON
      r.slot_id = s.id
    WHERE
      r.table_id = ? AND
      r.reservation_date = ?;
  `

  db.query(
    query,
    [table_id, reservation_date],
    (err, results) => {
      if (err) {
        console.error('Error fetching reservations:', err)
        res
          .status(500)
          .json({ message: 'Internal server error.' })
      } else {
        res.json(results)
        console.log('Result of GET: ', results)
      }
    },
  )
}

const createReservation: RequestHandler = (req, res) => {
  const { table_id, reservation_date, slot_id } = req.body

  if (!table_id || !reservation_date || !slot_id) {
    res
      .status(400)
      .json({ message: 'Missing required fields.' })
    return
  }

  const query = `
    INSERT INTO reservations (reservation_date, table_id, slot_id) 
    VALUES (?, ?, ?);
  `

  db.query(
    query,
    [reservation_date, table_id, slot_id],
    (err, results: any) => {
      if (err) {
        console.error('Error creating reservation:', err)
        if (err.code === 'ER_DUP_ENTRY') {
          res.status(409).json({
            message: 'This reservation already exists.',
          })
        } else {
          res
            .status(500)
            .json({ message: 'Internal server error.' })
        }
      } else {
        res.status(201).json({
          message: 'Reservation created successfully.',
          reservationId: results.insertId,
        })
      }
    },
  )
}

const deleteReservation: RequestHandler = (req, res) => {
  const { reservation_id } = req.body
  console.log('reservation_id: ', reservation_id)

  if (!reservation_id) {
    res.status(400).json({
      message:
        'Missing reservation_id in the request body.',
    })
    return
  }

  const query = `
    DELETE FROM reservations
    WHERE id = ?;
  `

  db.query(
    query,
    [reservation_id],
    (err, results: ResultSetHeader) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to delete reservation.',
        })
      }
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: 'Reservation not found.' })
      }
      return res.status(200).json({
        message: 'Reservation deleted successfully.',
      })
    },
  )
}

router.get('/api/reservations', getReservations)
router.post('/api/reservations', createReservation)
router.delete('/api/reservations', deleteReservation)

export default router

//===============================================

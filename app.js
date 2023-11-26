const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//get 1
app.get('/players/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName

    FROM
      player_details
    ORDER BY
      player_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//get 2

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getBookQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName
    FROM
      player_details
    WHERE
      player_id = ${playerId};`
  const book = await db.get(getBookQuery)
  response.send(book)
})

//put 3

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const bookDetails = request.body
  const {playerName} = bookDetails
  const updateBookQuery = `
    UPDATE
      player_details
    SET
      player_name='${playerName}'
    WHERE
      player_id = ${playerId};`
  await db.run(updateBookQuery)
  response.send('Player Details Updated')
})

//get 4

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getBookQuery = `
    SELECT
      match_id AS matchId,
      match AS match,
      year AS year
    FROM
      match_details
    WHERE
      match_id = ${matchId};`
  const book = await db.get(getBookQuery)
  response.send(book)
})

// GET 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getBooksQuery = `
    SELECT
      match_id AS matchId,
      match,year
    FROM
      player_match_score NATURAL JOIN match_details
      WHERE player_id=${playerId}
      `
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//get    6

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getBooksQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName
    FROM
      player_match_score NATURAL JOIN player_details
      WHERE match_id=${matchId}
      `
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//get    7

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getBooksQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
      

    FROM
      player_match_score NATURAL JOIN player_details
      WHERE player_id=${playerId}
      `
  const booksArray = await db.get(getBooksQuery)
  response.send(booksArray)
})

module.exports = app

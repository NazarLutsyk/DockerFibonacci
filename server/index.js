const keys = require('./keys');

const express = require('express');
const cors = require('cors');
const {Pool} = require('pg');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => 'Lost PG connection');

pgClient
    .query('CREATE TABLE IF NOT EXISTS values(number INT)')
    .catch((err) => console.log(err));


const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res, next) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res, next) => {
    const values = await pgClient.query('SELECT * FROM values');
    console.log(values);
    res.send(values.rows);
});

app.get('/values/current', async (req, res, next) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res, next) => {
    const index = +req.body.index;
    if (index > 40) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');

    redisPublisher.publish('insert', index);

    await pgClient.query(`INSERT INTO "values"("number") values (${index})`);

    res.send({working: true});
});

app.listen(5000, () => {
    console.log('Listening...');
});

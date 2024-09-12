'use strict';
import express from 'express';
import session from 'express-session';
import signRouter from './routes/sign.js';
import characterRouter from './routes/chracters.js'
import itemRouter from './routes/item.js';

const app = express();
  
app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,  // 환경 변수에서 비밀 키 가져오기
    resave: false,
    saveUninitialized: true,
}));

app.use('/api/sign', signRouter);
app.use('/api/characters', characterRouter);
app.use('/api/items', itemRouter);


app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    console.log(`서버가 ${(server.address()).port} 포트에서 실행 중`);
});
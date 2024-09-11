'use strict';
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
  
app.use(express.json());

const prisma = new PrismaClient({
    // Prisma를 이용해 데이터베이스를 접근할 때, SQL을 출력해줍니다.
    log: ['query', 'info', 'warn', 'error'],
  
    // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력해줍니다.
    errorFormat: 'pretty',
  });

const user = await prisma.users.create({
    data: {
        email: "cjh@naver.com",
        password: "0913",
        nickname: "cjh"
    },
});

console.log(user);
app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    console.log(`서버가 ${(server.address()).port} 포트에서 실행 중`);
});
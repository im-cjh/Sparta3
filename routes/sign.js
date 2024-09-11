'use strict';
import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient({
    // Prisma를 이용해 데이터베이스를 접근할 때, SQL을 출력해줍니다.
    log: ['query', 'info', 'warn', 'error'],
  
    // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력해줍니다.
    errorFormat: 'pretty',
  });

const userSchema = Joi.object({
    ID: Joi.string()
        .alphanum()
        .min(6)
        .max(20)
        .required(),

    password: Joi.string()
        .alphanum()
        .min(6)
        .max(20)
        .required(),

    repeat_password: Joi.ref('password'),

    nickname: Joi.string()
        .min(1)
        .max(20)
        .required()
});

/*---------------------------------------------
                회원 가입
---------------------------------------------*/
router.post('/signup', async (req, res) => {
    const { ID, password, repeat_password, nickname} = req.body;
    
    //body 유효성 검사
    const { error, value } = userSchema.validate({
        ID,
        password,
        repeat_password,
        nickname
    })

    //클라에서도 못하게 막아야 함
    if(error){
        return res.status(400).send(error)
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    //이미 존재하는 ID인지 확인
    try {
        const isExistedID = await prisma.users.findUnique({
            where: {
                ID,
            },
            select: {
                ID: true,
            },
        });

        if(isExistedID) {
            return res.status(409).send("이미 사용 중인 ID입니다.")
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("계정을 생성하는 데 실패했습니다."+"에러 코드: "+err);
    }


    try{
        await prisma.users.create({
            data: {
                ID,
                password: hashedPwd,
                nickname
            },
        });
    } catch(err){
        console.log(err);
        return res.status(400).send("계정을 생성하는 데 실패했습니다."+"에러 코드: "+err);
    }

    return res.status(201).json({ID, nickname});
});

/*---------------------------------------------
                로그인
---------------------------------------------*/
router.post('/signin', async (req, res) => {
    const { ID, password } = req.body;
    if(!ID || !password){
        return res.status(400).json({ message: "body가 비어있습니다." });
    }


    try{
        const user = await prisma.users.findUnique({
            where: {
                ID,
            },
        });
        
        if (!user){
            return res.status(404).json({ message: '사용자가 존재하지 않습니다.' });
        }
            
        if(await bcrypt.compare(password, user.password)) {
            //로그인 성공 시 session에 ID값 부여(JWT를 사용하지 않는 곳에서 ID를 필요로 해서)
            console.log("userID는 "+user.ID)
            req.session.ID = user.ID;

            //액세스 토큰을 생성해서 반환
            const token = jwt.sign({ID: user.ID, nickname: user.nickname}, process.env.SECRET_KEY, { expiresIn: '1h' },);
            res.cookie('sign', `Bearer ${token}`)
            return res.status(200).end(token);
        } 
    } catch(err){
        console.log(err)
    }
    return res.status(404).json({ message: '비밀번호가 일치하지 않습니다.' });
});

export default router;
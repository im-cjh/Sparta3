import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authCheck } from './auth.js';

const router = express.Router();
const prisma = new PrismaClient({
    // Prisma를 이용해 데이터베이스를 접근할 때, SQL을 출력해줍니다.
    log: ['query', 'info', 'warn', 'error'],
  
    // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력해줍니다.
    errorFormat: 'pretty',
});

/*---------------------------------------------
                아이템 생성
---------------------------------------------*/
router.post('/createItem', async(req, res) => {
    const { item_code, item_name, item_stat, item_price } = req.body;
    if (!item_code || !item_name || !item_stat || !item_price) {
        return res.status(400).json({ message: "body가 비어있습니다." });
    }

    //이미 존재하는 ID인지 확인
    try {
        const isExistedID = await prisma.items.findUnique({
            where: {
                item_code,
            },
            select: {
                item_code: true,
            },
        });

        if(isExistedID) {
            return res.status(409).send("이미 사용 중인 ID입니다.")
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("아이템을 생성하는 데 실패했습니다."+"에러 코드: "+err);
    }

    
    try{
        await prisma.items.create({
            data: {
                item_code, 
                item_name, 
                item_price,
                item_stat: JSON.stringify(item_stat)
            },
        });
    } catch(err){
        console.log(err);
        return res.status(400).send("계정을 생성하는 데 실패했습니다."+"에러 코드: "+err);
    }
    return res.status(201).end();
});

/*---------------------------------------------
                아이템 수정
---------------------------------------------*/
router.post('/updateItem/:itemCode', async(req, res) => {
    const item_code = Number(req.params.itemCode);
    const { item_name, item_stat } = req.body;
    //존재하는 ID인지 확인
    try {
        const isExistedID = await prisma.items.findUnique({
            where: {
                item_code,
            },
            select: {
                item_code: true,
            },
        });

        if(!isExistedID) {
            return res.status(409).send("존재하지 않는 ID입니다.")
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("아이템을 수정하는 데 실패했습니다."+"에러 코드: "+err);
    }

    try{
        await prisma.items.update({
            where:{
                item_code
            },
            data: {
                item_name, 
                item_stat: JSON.stringify(item_stat)
            },
        });
    } catch(err){
        console.log(err);
        return res.status(400).send("아이템을 수정하는 데 실패했습니다."+"에러 코드: "+err);
    }

    return res.status(201).end();
});

/*---------------------------------------------
                아이템 목록 조회
---------------------------------------------*/
router.post('/listItem', async(req, res) => {
    try {
        const items = await prisma.items.findMany();

        if(items) {
            return res.status(200).send(items)
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("아이템을 수정하는 데 실패했습니다."+"에러 코드: "+err);
    }
});

/*---------------------------------------------
                아이템 상세 조회
---------------------------------------------*/
router.post('/listItemDetail/:itemCode', async(req, res) => {
    const item_code = Number(req.params.itemCode);
    console.log("item_code"+item_code);
    //존재하는 ID인지 확인
    try {
        const item = await prisma.items.findUnique({
            where: {
                item_code,
            },
            select: {
                item_code: true,
                item_name: true,
                item_stat: true,
                item_price: true
            },
        });

        if(item) {
            return res.status(200).send(item);
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("아이템을 조회하는 데 실패했습니다."+"에러 코드: "+err);
    }
    
});

/*---------------------------------------------
                아이템 구매
---------------------------------------------*/
router.post('/createItem', authCheck, async(req, res) => {

});

/*---------------------------------------------
                아이템 판매
---------------------------------------------*/
router.post('/createItem', authCheck, async(req, res) => {

});

/*---------------------------------------------
                인벤토리 조회
---------------------------------------------*/
router.post('/listInventory/:characterID', authCheck, async(req, res) => {

});

/*---------------------------------------------
                장착 아이템 조회
---------------------------------------------*/
router.post('/listEquiped/:characterID', authCheck, async(req, res) => {

});

/*---------------------------------------------
                아이템 장착
---------------------------------------------*/
router.post('/equipItem/:characterID', authCheck, async(req, res) => {

});

/*---------------------------------------------
                아이템 탈착
---------------------------------------------*/
router.post('/takeOffItem/:characterID', authCheck, async(req, res) => {

});
export default router;

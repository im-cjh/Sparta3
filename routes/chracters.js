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
                캐릭터 생성
    req: { name: "호호아줌마"}
    res: { message: "새로운 캐릭터 ‘호호아줌마’를 생성하셨습니다!", data: { "character_id": 321 }
}
---------------------------------------------*/
router.post('/', authCheck, async(req, res) => {
    const { character_name } = req.body;

    if(!character_name) {
        return res.status(400).json({message: "body가 비어있습니다."});
    }

    //이름 중복 검사
    try {
        const isExistedName = await prisma.characters.findUnique({
            where: {
                character_name,
            },
            select: {
                character_name: true,
            },
        });

        if(isExistedName) {
            return res.status(409).send("이미 사용 중인 캐릭터 이름입니다.")
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("캐릭터를 생성하는 데 실패했습니다."+"에러 코드: "+err);
    }


    var newCharacter;
    try{
        newCharacter = await prisma.characters.create({
            data: {
                character_name,
                owner_id: req.locals.user.ID
            },
        });
    } catch(err){
        console.log(err);
        return res.status(400).send("계정을 생성하는 데 실패했습니다."+"에러 코드: "+err);
    }
    //캐릭터 ID반환
    res.status(200).json({
        message: `새로운 캐릭터 ${character_name}를 생성하셨습니다!`,
        data: {
            character_id: newCharacter.character_id
        }
    })
});

/*---------------------------------------------
                캐릭터 삭제
                
    res: { message: "캐릭터 ‘호호아줌마’를 삭제하였습니다." }
}
---------------------------------------------*/
router.delete('/:character_id', authCheck, async(req, res) => {
    const character_id = Number(req.params.character_id);

    //자신의 캐릭터인지 확인
    try {
        const character = await prisma.characters.findUnique({
            where: {
                character_id,
                owner_id: req.locals.user.ID,
            },
            select: {
                character_name: true,
            },
        });

        if(!character) {
            return res.status(409).send("자신 계정의 캐릭터만 입력해주세요.")
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("캐릭터를 삭제하는 데 실패했습니다.");
    }


    // 캐릭터를 데이터베이스에서 삭제
    try {
        const deletedCharacter = await prisma.characters.delete({
            where: { character_id },
            select: { character_name: true },  // 삭제한 캐릭터의 이름을 선택
        });

        // 캐릭터 삭제 성공 시 응답
        return res.status(200).json({
            message: `캐릭터 ‘${deletedCharacter.character_name}’를 삭제하였습니다.`,
        });

    } catch(err){
        console.log("에러코드: "+err+character_id);
    }
    return res.status(400).send("캐릭터를 삭제하는 데 실패했습니다.");
});

/*---------------------------------------------
                캐릭터 상세 조회
    res: { data: { name: "호호아줌마", health: 500, power: 100 }
    res: { data: { name: "호호아줌마", health: 500, power: 100, money: 10000 }: 자신의 계정일 경우
}
---------------------------------------------*/
router.get('/:character_id', async(req, res) => {
    const character_id = Number(req.params.character_id);
    var character;
    //자신의 캐릭터인지 확인
    try {
        character = await prisma.characters.findUnique({
            where: {
                character_id
            },
            select: {
                character_name: true,
                health: true,
                power: true,
                money: true,
                owner_id: true
            },
        });

        if(!character) {
            return res.status(409).send("캐릭터를 찾는 데 실패했습니다..")
        }
    } catch(err){
        console.log(err);
        return res.status(400).send("캐릭터를 확인하는 데 실패했습니다.");
    }

    if(character.owner_id == req.session.ID){
        return res.status(200).json({
            character_name: character.character_name, 
            health: character.health, 
            power: character.power,
            money: character.money
        });
    }
    
    return res.status(200).json({
        character_name: character.character_name, 
        health: character.health, 
        power: character.power,
    });
});

export default router;
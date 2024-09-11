import jwt from 'jsonwebtoken';

export const authCheck = (req, res, next)=>{
    if (req.headers.authorization) {
        const token = req.headers.authorization.split('Bearer ')[1];

        try {
            const decodedValue = jwt.verify(token, process.env.SECRET_KEY);
            
            //req.locals.user와 같은 곳에 인증 사용자 정보를 담기
            req.locals = { user: {ID: decodedValue.ID, nickname: decodedValue.nickname }};
            //다음 동작을 진행
            next();
        } catch (error) {
            console.log(error)
            res.status(401).send("토큰을 인증하는 데 실패했습니다.")
        }
            
    }
    else {
        res.status(401).send("토큰이 유효하지 않습니다.");
    }

}
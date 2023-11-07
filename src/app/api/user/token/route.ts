import { signJwtAccessToken, signJwtRefreshToken, verifyRefresh, verifyJwt } from "@/app/lib/jwt";
import queryPromise from "@/app/lib/db";

export const POST = async(req: Request) => {
    // 헤더에서 mlru로 된 accessToken 값 가져오기.
    const accessToken = req.headers.get('Authorization')?.split('mlru ')[1] as string;
    
    // 헤더에서 refreshToken 값 가져오기.
    let refreshToken = req.headers.get('refreshToken') as string;

    // accessToken을 복호화.
    const decoded  = verifyJwt(accessToken);

    // 현재 시간.
    const currentTime = Math.floor(Date.now() / 1000);

    // 복호화 된 값이 없다면 => 인증 실패.
    if(!decoded) return new Response(JSON.stringify({"result":"No Authorization"}))

    // 만료 기간이 지나지 않았다면 => 리턴.
    if(decoded.exp && decoded.exp >= currentTime) return new Response(JSON.stringify({"result":"Not Expired"}))
    
    const refreshDecoded = verifyRefresh(refreshToken);

    // refresthToken이 복호화 되지 못하면 리턴.
    if(!refreshDecoded) return new Response(JSON.stringify({"result":"No Authorization"}))

    // 만료 기간이 지났으면 재생성 후 저장.
    let sql = '';
    if(refreshDecoded.exp && refreshDecoded.exp < currentTime) {
        refreshToken = await signJwtRefreshToken(decoded.user_id);
    }
    sql = 'SELECT token from TOKEN WHERE user_id = ? and token = ?';

    // 복호화 된 값에서 user_id와 refreshToken 을 가지고 db에서 일치하는지 확인.
    let result = await queryPromise(sql, [decoded.user_id, refreshToken]);

    // 일치하는 값이 없다면 => 리턴.
    if(result.length < 1) return new Response(JSON.stringify({"result":"no data"}));
    const user = {
        user_id: decoded.user_id,
        user_name: decoded.user_name
    }

    // accessToken 생성 후 리턴.
    let token = signJwtAccessToken(user);
    return new Response(JSON.stringify({"result":token}))
}
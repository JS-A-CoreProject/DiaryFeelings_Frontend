"use client";

import { signIn, signOut, useSession } from 'next-auth/react'
import { useRef, useState } from 'react'
import axios from 'axios'

const Page = () => {
    const idRef = useRef<HTMLInputElement>(null);
    const pwRef = useRef<HTMLInputElement>(null);
    const textRef = useRef<HTMLTextAreaElement>(null);
    const { data: session } = useSession();
    
    const handleSubmit = async() => {
        if(!idRef.current && !pwRef.current) return null;
        const user_id = idRef.current?.value;
        const password = pwRef.current?.value;
        
        const result = await signIn("credentials", {
            username: user_id,
            password: password,
            redirect: false,
            callbackUrl: '/'
        });
    };
    const handleSingOut = async() => {
        if(session?.user?.provider === 'kakao') {
            const result = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout/kakao`, {
                snsAccess: session?.snsAccess
            },{
                headers: {
                    'Authorization': `mlru ${session.accessToken}`
                }
            });
            const rst = result.data;
            if(rst.result === 'ok') {
                // 연결 끊기 성공.
                await signOut();
                alert('카카오 로그아웃(연결 끊기) 성공.');
            } else {
                // 에러.
                console.log(rst.result);
            }
        } else if(session?.user?.provider === 'google') {
            const result = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout/google`, {
                snsAccess: session?.snsAccess
            },{
                headers: {
                    'Authorization': `mlru ${session.accessToken}`
                }
            });
            const rst = result.data;
            if(rst.result === 'ok') {
                // 연결 끊기 성공.
                await signOut();
                alert('구글 로그아웃(연동 해제) 성공.');
            } else {
                // 에러.
                console.log(rst.result);
            }
        }
    }
    return (
        <div>
            <input type='text' ref={idRef} className='border'/>
            <input type='text' ref={pwRef} className='border'/>
            <textarea ref={textRef} className='border'/>
            <button className='border' onClick={() => handleSubmit()}>go</button>
            <button onClick={() => console.log(textRef.current?.value.split('\n'))} className='border'>ddd</button>
            <button onClick={() => handleSingOut()} className='border'>out</button>
            <button onClick={async() => signOut()} className='border'>out2</button>
        </div>
    )
};

export default Page;
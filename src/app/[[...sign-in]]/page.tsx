
"use client";

import React, { useEffect } from 'react';

import * as SignIn from '@clerk/elements/sign-in';
import * as Clerk from '@clerk/elements/common';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';


const LoginPage = () => {

    const {isLoaded,isSignedIn, user} = useUser();


    useEffect(() => {
        if (isLoaded && isSignedIn) {
            window.location.href = '/dashboard';
        }
    }
    


    return (
        <div className='h-screen flex items-center justify-center bg-lamaPurple'>
 
            <SignIn.Root>
                <SignIn.Step name= 'start' className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2">

                        <div className='flex flex-row gap-3'>
                        <Image className='rounded-full' src="/5.png" alt="" width={150} height={150}/>
                        <h1 className='text-4xl text-purple-600 font-bold flex items-center gap-2'>ARF</h1>
                        </div>
                   
                    <h2 className='text-purple-800 my-[10px] font-bold text-md'>Sign in to your account</h2>
                    <Clerk.GlobalError className='text-sm text-red-400'/>
                    <Clerk.Field name="identifier" className='flex flex-col gap-2'> 
                        <Clerk.Label className='text-xs text-gray-500'>Email</Clerk.Label>
                        <Clerk.Input type='text' className='p-2 rounded-md ring-1 ring-gray-300' required placeholder="Email" />
                        <Clerk.FieldError className='text-sm text-red-400'/>
                    </Clerk.Field>
                    <Clerk.Field name="password" className='flex flex-col gap-2'> 
                        <Clerk.Label className='text-xs text-gray-500'>Password</Clerk.Label>
                        <Clerk.Input type='password' required className='p-2 rounded-md ring-1 ring-gray-300' placeholder='******'/>
                        <Clerk.FieldError className='text-sm text-red-400'/>
                    </Clerk.Field>

                <SignIn.Action submit className='bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]'> Sign In </SignIn.Action>
                </SignIn.Step>
            </SignIn.Root>

        
        </div>
    );
    }

export default LoginPage;

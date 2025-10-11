"use client"
import { useAuth } from '@/components/hooks/authProvider';
import Image from 'next/image'
import { PencilSimpleLine} from "@phosphor-icons/react/ssr";


export default function Home() {
  const {user} = useAuth();
    return (
      <div className="h-[calc(100%-232px)] flex gap-10 flex-col items-center justify-center px-10 overflow-y-auto">
        <div  className="card w-full h-full opacity-70 gap-5 flex items-center px-10">
          <Image 
          className="rounded-full w-50 h-50"
           src={user?.avatar ?? "/images/defaultAvatare.jpg"}
           alt="profile image"
           width={500} 
           height={500}  
           priority/>
           <div className='flex flex-col'>
            <h1 className="font-medium text-2xl text-black-nave " >{user?.username}</h1>
            <PencilSimpleLine className='self-end -mt-6' size={28} weight="fill" />
            <p className='text-md text-black-nave' >{user?.email}</p>
           </div>
        </div>
        <div  className="card w-full h-full opacity-70">
        </div>
        <div  className="card w-full h-full opacity-70">
        </div>
      </div>
    );
  }
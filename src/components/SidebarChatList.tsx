'use client'

import { chartHrefConstructor } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'

interface SidebarChatListProps {
  friends: User[]
  sessionId: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({friends, sessionId}) => {

    const router = useRouter()
    const pathname = usePathname()
    const [ unseenMessages, setUnseenMessages ] = useState<Message[]>([])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderid))
            })            
        }
    }, [pathname])

  return <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
    
    {friends.sort().map((friend) => {
        
        const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
            return unseenMessage.senderid === friend.id
        }).length
        
        return <li key={friend.id}>
            <a href={`/dashboard/chat/${chartHrefConstructor(sessionId, friend.id)}`} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                {friend.name}
                {unseenMessagesCount > 0 ? (
                    <div className='bg-indigo-600 font-medium text-xs text-white h-4 w-4 rounded-full flex justify-center items-center'>
                        {unseenMessagesCount}
                    </div>
                ) : null}
            </a>
        </li>
    })}
  </ul>
}

export default SidebarChatList
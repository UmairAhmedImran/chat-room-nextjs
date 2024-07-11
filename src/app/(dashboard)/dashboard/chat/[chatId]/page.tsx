import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface PageProps {
  params: {
    chatId: string
  }
}

async function getChatMessage(chatId: string) {

  try {

    const results: string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:messages`,
      0, 
      -1
    ) 

    const dbMessage = results.map((message) => JSON.parse(message) as Message) 

    const reversedDbMessages = dbMessage.reverse()

    const messages = messageArrayValidator.parse(reversedDbMessages)

    return messages

  } catch (error) {
    notFound()
  }
}

const page = async ({ params }: PageProps) => {
  
  const {chatId} = params
  const session = await getServerSession(authOptions)

  if (!session) notFound()
  
  const {user} = session

  const [userId1, userId2] = chatId.split('--')
  
  if (user.id !== userId1 && user.id !== userId2) {
    notFound()
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1
  const chatpartner = (await db.get(`user:${chatPartnerId}`)) as User
  const initialMessages = await getChatMessage(chatId)
  

  return <div>{params.chatId}</div>
}

export default page
import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { nanoid } from 'nanoid'
import { Message, messageValidator } from "@/lib/validations/message"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"


export async function POST(req: Request) {
    try {

        const {text, chatId}: {text: string, chatId:string} = await req.json()
        const session = await getServerSession(authOptions)

        if(!session) return new Response('Unauthorized', {status: 401})
        
        const [userId1, userId2] = chatId.split('--')

        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', {status: 401})
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1

        // console.time('Fetch Friend List and Sender')
        // const [friendList, rawSender] = await Promise.all([
        //     fetchRedis('smembers', `user:${session.user.id}:friends`),
        //     fetchRedis('get', `user:${session.user.id}`)
        // ])
        // console.timeEnd('Fetch Friend List and Sender')

        // console.time('Fetch Friend List')
        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]
        // console.timeEnd('Fetch Friend List')
        const isFriend = friendList.includes(friendId)

        if (!isFriend) {
            return new Response('Unauthorized', {status: 401})
        }
        // console.time('Fetch Sender')
        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
        // console.timeEnd('Fetch Sender')
        const sender = JSON.parse(rawSender) as User

        
        const timestamp = Date.now()

        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
        }

        const message = messageValidator.parse(messageData)

        // // notify all connected chatroom clients
        // console.time('Pusher Notifications')
        await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)
        console.timeEnd('Pusher Notifications')
        console.time('pusher 2')
        await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new_message", {
            ...message,
            senderImg: sender.image,
            senderName: sender.name
        })
        // console.timeEnd('Pusher2 end')


        // all vslid send the message
        // console.time('Save Message to DB')

        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message),

        })
        // console.timeEnd('Save Message to DB')

        //  Notify all connected chatroom clients and save the message to the database
        //  console.time('Pusher and DB Operations')
        //  await Promise.all([
        //     pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message),
        //     pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new_message", {
        //         ...message,
        //         senderImg: sender.image,
        //         senderName: sender.name
        //     }),
        //     db.zadd(`chat:${chatId}:messages`, {
        //         score: timestamp,
        //         member: JSON.stringify(message),
        //     })
        // ])
        // console.timeEnd('Pusher and DB Operations')
        
        return new Response('OK')
    
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response('Internal Server Error', {status: 500})
    }
}
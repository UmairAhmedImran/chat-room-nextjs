import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)
        
        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string


    if (!idToAdd) {
        return new Response("This person does not exist.", {status: 400})
    }
        
    const session = await getServerSession(authOptions)

    if (!session) {
        return new Response('Unauthorized', {status: 401})
    }

    if (idToAdd === session.user.id) {
        return new Response('You cannot add yourself as a freind', {status: 400})       
    }

    // check if user is added

    await pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:incomin_frien_requests`), 'incomin_frien_requests',
            {
                senderId: session.user.id,
                senderEmail: session.user.email,
            }
    )


    const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incomin_frien_requests`, session.user.id) as 0 | 1

    if (isAlreadyAdded) {
        return new Response(`Already Added this user`, {status:400})
    }

    const isAlreadyFriend = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd) as 0 | 1

    if (isAlreadyFriend) {
        return new Response(`Already Friend this user`, {status:400})
    }


    // valid request, send friend request

    db.sadd(`user:${idToAdd}:incomin_frien_requests`, session.user.id)

    return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', {status: 422})
        }
        return new Response('Invalid Request', {status:400}) 
    }
}
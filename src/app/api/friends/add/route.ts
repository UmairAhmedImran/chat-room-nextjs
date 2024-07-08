import { authOptions } from "@/lib/auth"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)
        
        const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`, {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-store',
        }
    ) 

    const data = await RESTResponse.json() as {result: string | null}

    const idToAdd = data.result

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

    

    // valid request

    console.log(data)

    } catch (error) {
        
    }
}
interface User {
    name: string
    email: string
    image: string
    id: string
}
interface Chat {
    id: string
    messages: Message[]
}

interface FriendRequest {
    id: string
    senderId: string
    reciverId: string
}

interface Message {
    id: string
    senderId: string
    reciverId: string
    text: string
    timestamp: number
}
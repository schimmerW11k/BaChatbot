export interface CreateMessage {
    message: string;
}
export interface MessageEntity {
    text: string;
    sender: string;
    reply: boolean;
    date: Date;
}

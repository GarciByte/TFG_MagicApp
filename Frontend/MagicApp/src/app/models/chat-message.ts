export interface ChatMessage {
    SenderId: number;
    SenderNickname: string;
    ReceiverId: number;
    ReceiverNickname: string;
    Content: string;
}
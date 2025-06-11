export enum MsgType {
    Connection = 'Connection',
    GlobalChat = 'GlobalChat',
    PrivateChat = 'PrivateChat',
    UserBanned = 'UserBanned',
    ForumNotification = 'ForumNotification',
    ChatNotification = 'ChatNotification',
    ChatWithAI = 'ChatWithAI',
    CardDetailsWithAI = 'CardDetailsWithAI',
    CancelAIMessage = 'CancelAIMessage'
}

export interface WebSocketMessage {
    Type: MsgType;
    Content: any;
}
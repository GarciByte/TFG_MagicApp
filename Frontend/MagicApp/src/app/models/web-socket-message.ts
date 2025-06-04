export enum MsgType {
    Connection = 'Connection',
    GlobalChat = 'GlobalChat',
    PrivateChat = 'PrivateChat',
    UserBanned = 'UserBanned',
    ForumNotification = 'ForumNotification',
    ChatNotification = 'ChatNotification'
}

export interface WebSocketMessage {
    Type: MsgType;
    Content: any;
}
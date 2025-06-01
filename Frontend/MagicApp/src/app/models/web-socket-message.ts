export enum MsgType {
    Connection = 'Connection',
    GlobalChat = 'GlobalChat',
    PrivateChat = 'PrivateChat',
    UserBanned = 'UserBanned'
}

export interface WebSocketMessage {
    Type: MsgType;
    Content: any;
}
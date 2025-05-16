export enum MsgType {
    Connection = 'Connection',
    GlobalChat = 'GlobalChat',
    PrivateChat = 'PrivateChat'
}

export interface WebSocketMessage {
    Type: MsgType;
    Content: any;
}
export enum MsgType {
    Connection = 'Connection',
    GlobalChat = 'GlobalChat'
}

export interface WebSocketMessage {
    Type: MsgType;
    Content: any;
}
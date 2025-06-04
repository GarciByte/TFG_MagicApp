import { User } from "./user";

export interface ForumThread {
    id: number;
    title: string;
    createdAt: string;
    user: User;
    isClosed: boolean;
    commentCount: number;
}
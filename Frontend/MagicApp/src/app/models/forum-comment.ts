import { User } from "./user";

export interface ForumComment {
    id: number;
    threadId: number;
    createdAt: string;
    user: User;
    content: string;
}
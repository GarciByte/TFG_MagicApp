import { ForumComment } from "./forum-comment";
import { ForumThread } from "./forum-thread";

export interface ForumThreadDetail extends ForumThread {
    comments: ForumComment[];
    subscribed: boolean;
}
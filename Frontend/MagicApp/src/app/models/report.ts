export enum ReportStatus {
    InReview = 'InReview',
    Completed = 'Completed'
}

export interface Report {
    id: number;
    reporterId: number;
    reporterNickname: string;
    reportedUserId: number;
    reportedUserNickname: string;
    reason: string;
    status: ReportStatus;
}
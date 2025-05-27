export enum ReportStatus {
    InReview = 'InReview',
    Completed = 'Completed'
}

export interface Report {
    Id: number;
    ReporterId: number;
    ReportedUserId: number;
    Reason: string;
    Status: ReportStatus;
}
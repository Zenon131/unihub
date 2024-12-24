export interface Event {
    title: string;
    details: string;
    userId: string;
    date: string;
    time: string;
    creator: {
        id: string;
        username: string;
        imageUrl?: string;
    };
}

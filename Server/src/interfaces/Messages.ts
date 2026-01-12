export type Sendmessagebody = {
    sender_id: number;
    receiver_id: number;
    content: string;
};

export type Historyquery = {
    sender_id: number;
    receiver_id: number;
};

export type message = {
    sender_id: number;
    receiver: number;
    content: string;
    id: number;
    created_id: number;
};
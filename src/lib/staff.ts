import data from './staff.json';

export type StaffMember = {
    id: string;
    name: string;
    title: string;
    bio?: string;
    image?: string;
    email: string;
}

export type BoardMember = {
    id: string;
    name: string;
    title: string;
    email: string;
}

const staff: StaffMember[] = data.staff;
const board: BoardMember[] = data.board;

export function getStaff(): StaffMember[] {
    return staff;
}

export function getBoard(): BoardMember[] {
    return board;
}

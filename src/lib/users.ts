
import data from './users.json';

export type UserRole = 'Website Editor' | 'Internal Editor' | 'Internal Viewer';

export type User = {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
};

const users: User[] = data.users;

export function getUsers(): User[] {
  return users;
}

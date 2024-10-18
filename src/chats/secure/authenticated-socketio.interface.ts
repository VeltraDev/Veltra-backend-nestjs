import { Socket } from 'socket.io';
import { UsersInterface } from 'src/users/users.interface';

export interface AuthenticatedSocket extends Socket {
  user: UsersInterface;
}

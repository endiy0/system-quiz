import { io, Socket } from 'socket.io-client'

export type Role = 'user' | 'display' | 'admin'

export const socket: Socket = io("/");

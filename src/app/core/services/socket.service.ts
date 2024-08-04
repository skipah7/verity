import { Injectable } from '@angular/core';
import { RoomUpdate } from '@core/types';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  readonly #uri = 'wss://verity.kavu.dev/verity';
  #socket: Socket;

  connect(roomName: string, user: string, uri = this.#uri) {
    this.#socket = io(uri, {
      transports: ['websocket'],
      path: '/ws',
      query: { roomName },
      auth: { user },
    });

    this.#socket.on('connect_error', (error) => {
      if (this.#socket.active) {
        // temporary failure, the socket will automatically try to reconnect
      } else {
        // the connection was denied by the server
        // in that case, `socket.connect()` must be manually called in order to reconnect
        console.error('Unable to join:', error.message);
      }
    });
  }

  roomUpdates$() {
    const updates$ = new Observable<RoomUpdate>((observer) => {
      this.#socket.on('room_updated', (data) => observer.next(data));
      return () => this.#socket.disconnect();
    });
    return updates$;
  }

  broadcast$() {
    const response$ = new Observable<any>((observer) => {
      this.#socket.on('broadcast', (data) => observer.next(...data));
      return () => this.#socket.disconnect();
    });
    return response$;
  }

  broadcast(message: any) {
    this.#socket.emit('broadcast', message);
  }
}
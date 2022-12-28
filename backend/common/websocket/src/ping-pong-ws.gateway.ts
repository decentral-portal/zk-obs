import { Injectable, Logger } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { from, map, Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';
@Injectable()
@WebSocketGateway({
  // path: '/ping-pong',
  namespace: 'ping-pong',
  transports: ['websocket'],
  // allowUpgrades: true,
  // pingInterval: 30000,
  // pingTimeout: 10000,
})
export class PingPongWsGateway {
  @WebSocketServer()
  server!: Server;
  private logger: Logger = new Logger(PingPongWsGateway.name);
  afterInit(server: Server) {
    this.logger.log({ message: `${PingPongWsGateway.name} init` });
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: unknown): void {
    this.logger.log({ payload });
    this.server.emit('message', payload);
  }
  handleDisconnect(client: Socket) {
    this.logger.log({ message: `${PingPongWsGateway.name} disconnect`, client });
  }
  @SubscribeMessage('events')
  handleWithObs(@MessageBody() data: unknown): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })));
  }
  handleConnection(client: Socket, ...args: unknown[]) {
    this.logger.log({ message: `${PingPongWsGateway.name} connection`, client: client.id });
  }
}
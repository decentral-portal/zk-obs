import { Global, Module } from '@nestjs/common';
import { PingPongWsGateway } from '@common/websocket/ping-pong-ws.gateway';

@Global()
@Module({
  imports: [
    PingPongWsGateway
  ]
})
export class WebSocketModule {}
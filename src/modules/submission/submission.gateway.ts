import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserDTO } from '../user/dto/user.dto';
import { GRADER_KEY, GRADER_SECRET } from 'src/core/constants';

@WebSocketGateway()
export class SubmissionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private jwtService: JwtService) {}
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('SocketGateway');

  @SubscribeMessage('grader-to-server')
  async receiveSubmission(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ) {
    const [id, result, score, timeUsed, status, errmsg, userId] =
      JSON.parse(data);
    this.server.to(userId).emit(id, [result, score, timeUsed, status, errmsg]);
  }

  public afterInit(server: Server): void {
    return this.logger.log('Init');
  }

  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  public handleConnection(client: Socket): void {
    const { token } = client.handshake.auth;
    const { key } = client.handshake.headers;
    if (key) {
      if (key?.includes(GRADER_KEY) && GRADER_SECRET?.includes(token)) {
        return this.logger.log(`Grader connected: ${key}`);
      } else {
        client.disconnect();
        return this.logger.warn(`Grader missed match: ${key}`);
      }
    } else {
      try {
        const userInfo = this.jwtService.decode(token);
        if (!userInfo) {
          client.disconnect();
          return this.logger.warn(`Client auth failed: ${client.id}`);
        }
        const user = new UserDTO(userInfo);
        client.join(`${user.id}`);
        return this.logger.log(`Client connected: ${user.id}`);
      } catch {
        client.disconnect();
        return this.logger.warn(`Client auth failed: ${client.id}`);
      }
    }
  }
}

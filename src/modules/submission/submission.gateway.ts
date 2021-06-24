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
import { isGrader, isLoad, isUser } from 'src/utils';

const graderList = new Map();

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
    @MessageBody() data: Array<any>,
  ) {
    const { key } = client.handshake.headers;
    if (!isGrader(key)) return client.disconnect();

    const [id, result, score, timeUsed, status, errmsg, userId] = data;
    this.server
      .to(`${userId}`)
      .emit(`${id}`, [result, score, timeUsed, status, errmsg]);
  }

  @SubscribeMessage('get-free-grader')
  async getFreeGrader(
    @ConnectedSocket() client: Socket,
    @MessageBody() cb: Function,
  ) {
    const { key } = client.handshake.headers;
    if (!isLoad(key)) return client.disconnect();

    graderList.forEach((state, uid) => {
      if (state) {
        graderList.set(uid, false);
        return cb(uid);
      }
    });
    return cb(null);
  }

  @SubscribeMessage('send-queue')
  async sendQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Array<string>,
  ) {
    const { key } = client.handshake.headers;
    if (!isLoad(key)) return client.disconnect();

    const [submissionId, graderId] = data;
    if (!graderList.has(graderId)) return;

    return this.server.to(`${graderId}`).emit('grade-this-id', submissionId);
  }

  @SubscribeMessage('finish-sub')
  async setGraderFree(@ConnectedSocket() client: Socket) {
    const { key } = client.handshake.headers;
    if (!isGrader(key)) return client.disconnect();

    const uid = client.id;
    if (graderList.has(uid)) graderList.set(uid, true);
  }
  public afterInit(server: Server): void {
    return this.logger.log('Init');
  }

  public handleDisconnect(client: Socket): void {
    const { key } = client.handshake.headers;
    if (isGrader(key)) {
      graderList.delete(client.id);
      return this.logger.warn(`Grader disconnected: ${key}`);
    }
    if (isLoad(key)) {
      return this.logger.warn(`Load disconnected: ${key}`);
    }
    if (isUser(key)) {
      return this.logger.warn(`Client disconnected: ${client.id}`);
    }
  }

  public handleConnection(client: Socket) {
    const { token } = client.handshake.auth;
    const { key } = client.handshake.headers;

    if (isGrader(key)) {
      if (!process.env.GRADER_SECRET.split(',').includes(token)) {
        client.disconnect();
        return this.logger.warn(`Grader auth failed: ${key}`);
      }
      graderList.set(client.id, true);
      return this.logger.log(`Grader connected: ${key}`);
    }
    if (isLoad(key)) {
      if (token !== process.env.LOAD_SECRET) {
        client.disconnect();
        return this.logger.warn(`Load auth failed: ${key}`);
      }
      return this.logger.log(`Load connected: ${key}`);
    }
    if (isUser(key)) {
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

    return client.disconnect();
  }
}

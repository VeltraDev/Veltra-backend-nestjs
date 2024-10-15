import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { WsException, BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    let message: any;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || 'Internal server error';
      }

      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } else if (exception instanceof WsException) {
      message = exception.getError();
    } else {
      message = 'Internal server error';
    }

    client.emit('exception', {
      status: 'error',
      message: message,
      timestamp: new Date().toISOString(),
    });

    console.error('WebSocket exception: ', message);
  }
}

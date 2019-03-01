import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets'
import { RavenInterceptor } from '../../lib';
import { UseInterceptors } from '@nestjs/common';

@UseInterceptors(new RavenInterceptor())
@WebSocketGateway(4444)
export class classGateway {

    @SubscribeMessage('test_error')
    on_test_error(client, data: string): string {
        throw new Error('Something bad happened');
    }
}

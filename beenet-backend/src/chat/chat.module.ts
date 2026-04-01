import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ConversationStreamManager } from './conversation-stream.manager';
import { AgentModule } from '../agent/agent.module';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [AgentModule, SecretsModule],
  controllers: [ChatController],
  providers: [ConversationStreamManager],
  exports: [ConversationStreamManager],
})
export class ChatModule {}

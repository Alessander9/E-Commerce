import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Global module for notification services (email, etc.).
 * Exported globally so any module can inject EmailService.
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}

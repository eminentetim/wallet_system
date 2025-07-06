import {
  ThrottlerGuard,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserThrottleGuard extends ThrottlerGuard {
  constructor(protected storage: ThrottlerStorageService) {
    super(storage);
  }

  protected getTracker(req: any): string {
    return req.user?.id || req.ip;
  }
}

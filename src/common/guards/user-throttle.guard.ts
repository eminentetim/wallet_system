import {
  ThrottlerGuard,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions } from '@nestjs/throttler/dist/throttler-module-options.interface';

@Injectable()
export class UserThrottleGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storage: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storage, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id ?? req.ip;
  }
}



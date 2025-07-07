import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions } from '@nestjs/throttler/dist/throttler-module-options.interface';
export declare class UserThrottleGuard extends ThrottlerGuard {
    constructor(options: ThrottlerModuleOptions, storage: ThrottlerStorage, reflector: Reflector);
    protected getTracker(req: Record<string, any>): Promise<string>;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserThrottleGuard = void 0;
const throttler_1 = require("@nestjs/throttler");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let UserThrottleGuard = class UserThrottleGuard extends throttler_1.ThrottlerGuard {
    constructor(options, storage, reflector) {
        super(options, storage, reflector);
    }
    async getTracker(req) {
        return req.user?.id ?? req.ip;
    }
};
exports.UserThrottleGuard = UserThrottleGuard;
exports.UserThrottleGuard = UserThrottleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, core_1.Reflector])
], UserThrottleGuard);
//# sourceMappingURL=user-throttle.guard.js.map
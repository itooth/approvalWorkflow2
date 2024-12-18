"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const authService_1 = require("../services/auth/authService");
const ApiError_1 = require("../utils/ApiError");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new ApiError_1.ApiError(401, 'No token provided');
        }
        const user = yield authService_1.AuthService.verifyToken(token);
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError_1.ApiError(401, 'Not authenticated');
        }
        const hasRole = req.user.roles.some((role) => roles.includes(role));
        if (!hasRole) {
            throw new ApiError_1.ApiError(403, 'Not authorized');
        }
        next();
    };
};
exports.authorize = authorize;

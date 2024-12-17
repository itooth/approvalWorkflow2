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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../models/User");
const config_1 = require("../../config/config");
const ApiError_1 = require("../../utils/ApiError");
class AuthService {
    static login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user by email
            const user = yield User_1.User.findOne({ email });
            if (!user) {
                throw new ApiError_1.ApiError(401, 'Invalid email or password');
            }
            // Check password
            const isPasswordValid = yield user.comparePassword(password);
            if (!isPasswordValid) {
                throw new ApiError_1.ApiError(401, 'Invalid email or password');
            }
            // Generate token
            const token = this.generateToken(user._id.toString());
            return {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                },
                token,
            };
        });
    }
    static generateToken(userId) {
        return jsonwebtoken_1.default.sign({ sub: userId }, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
    }
    static verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
                const user = yield User_1.User.findById(decoded.sub);
                if (!user) {
                    throw new ApiError_1.ApiError(401, 'User not found');
                }
                return user;
            }
            catch (error) {
                throw new ApiError_1.ApiError(401, 'Invalid token');
            }
        });
    }
}
exports.AuthService = AuthService;

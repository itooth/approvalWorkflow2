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
exports.AuthController = void 0;
const authService_1 = require("../../services/auth/authService");
const User_1 = require("../../models/User");
const ApiError_1 = require("../../utils/ApiError");
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name } = req.body;
                // Check if user already exists
                const existingUser = yield User_1.User.findOne({ email });
                if (existingUser) {
                    throw new ApiError_1.ApiError(400, 'Email already registered');
                }
                // Create new user
                const user = new User_1.User({
                    email,
                    password,
                    name,
                    roles: ['user'],
                });
                yield user.save();
                // Generate token
                const token = authService_1.AuthService.generateToken(user._id.toString());
                res.status(201).json({
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                    },
                    token,
                });
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
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield authService_1.AuthService.login(email, password);
                res.json(result);
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
    }
    static me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!token) {
                    throw new ApiError_1.ApiError(401, 'No token provided');
                }
                const user = yield authService_1.AuthService.verifyToken(token);
                res.json({
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                    },
                });
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
    }
}
exports.AuthController = AuthController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/auth/authController");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.post('/register', authController_1.AuthController.register);
router.post('/login', authController_1.AuthController.login);
// Protected routes
router.get('/me', auth_1.authenticate, authController_1.AuthController.me);
exports.default = router;

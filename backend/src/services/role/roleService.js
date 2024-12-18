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
exports.RoleService = void 0;
const Role_1 = require("../../models/Role");
const ApiError_1 = require("../../utils/ApiError");
const mongoose_1 = __importDefault(require("mongoose"));
class RoleService {
    static create(roleData) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = new Role_1.Role(roleData);
            yield role.save();
            return role;
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield Role_1.Role.findById(id);
            if (!role) {
                throw new ApiError_1.ApiError(404, 'Role not found');
            }
            return role;
        });
    }
    static update(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield Role_1.Role.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
            if (!role) {
                throw new ApiError_1.ApiError(404, 'Role not found');
            }
            return role;
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if role has associated users
            const hasUsers = yield mongoose_1.default.model('User').exists({ roles: id });
            if (hasUsers) {
                throw new ApiError_1.ApiError(400, 'Cannot delete role with associated users');
            }
            const role = yield Role_1.Role.findByIdAndDelete(id);
            if (!role) {
                throw new ApiError_1.ApiError(404, 'Role not found');
            }
            return role;
        });
    }
    static getAll() {
        return __awaiter(this, arguments, void 0, function* (query = {}) {
            const roles = yield Role_1.Role.find(Object.assign(Object.assign({}, query), { active: true }))
                .sort({ name: 1 });
            return roles;
        });
    }
    static assignToUser(userId, roleIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongoose_1.default.model('User').findByIdAndUpdate(userId, { $addToSet: { roles: { $each: roleIds } } }, { new: true });
            if (!user) {
                throw new ApiError_1.ApiError(404, 'User not found');
            }
            return user;
        });
    }
    static removeFromUser(userId, roleIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongoose_1.default.model('User').findByIdAndUpdate(userId, { $pullAll: { roles: roleIds } }, { new: true });
            if (!user) {
                throw new ApiError_1.ApiError(404, 'User not found');
            }
            return user;
        });
    }
}
exports.RoleService = RoleService;

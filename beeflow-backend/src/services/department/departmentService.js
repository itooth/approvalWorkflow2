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
exports.DepartmentService = void 0;
const Department_1 = require("../../models/Department");
const ApiError_1 = require("../../utils/ApiError");
const mongoose_1 = __importDefault(require("mongoose"));
class DepartmentService {
    static create(departmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const department = new Department_1.Department(departmentData);
            yield department.save();
            return department;
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const department = yield Department_1.Department.findById(id)
                .populate('leaderId', 'name email')
                .populate('parentId', 'name');
            if (!department) {
                throw new ApiError_1.ApiError(404, 'Department not found');
            }
            return department;
        });
    }
    static update(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const department = yield Department_1.Department.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
            if (!department) {
                throw new ApiError_1.ApiError(404, 'Department not found');
            }
            return department;
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if department has children
            const hasChildren = yield Department_1.Department.exists({ parentId: id });
            if (hasChildren) {
                throw new ApiError_1.ApiError(400, 'Cannot delete department with sub-departments');
            }
            // Check if department has associated users
            const hasUsers = yield mongoose_1.default.model('User').exists({ departmentId: id });
            if (hasUsers) {
                throw new ApiError_1.ApiError(400, 'Cannot delete department with associated users');
            }
            const department = yield Department_1.Department.findByIdAndDelete(id);
            if (!department) {
                throw new ApiError_1.ApiError(404, 'Department not found');
            }
            return department;
        });
    }
    static getAll() {
        return __awaiter(this, arguments, void 0, function* (query = {}) {
            const departments = yield Department_1.Department.find(Object.assign(Object.assign({}, query), { active: true }))
                .populate('leaderId', 'name email')
                .populate('parentId', 'name')
                .sort({ level: 1, name: 1 });
            return departments;
        });
    }
    static getHierarchy() {
        return __awaiter(this, void 0, void 0, function* () {
            const departments = yield this.getAll();
            return this.buildHierarchyTree(departments);
        });
    }
    static buildHierarchyTree(departments) {
        const departmentMap = new Map();
        const roots = [];
        // First pass: Create map of departments
        departments.forEach(dept => {
            departmentMap.set(dept._id.toString(), Object.assign(Object.assign({}, dept.toObject()), { children: [] }));
        });
        // Second pass: Build tree structure
        departments.forEach(dept => {
            const department = departmentMap.get(dept._id.toString());
            if (dept.parentId) {
                const parent = departmentMap.get(dept.parentId.toString());
                if (parent) {
                    parent.children.push(department);
                }
            }
            else {
                roots.push(department);
            }
        });
        return roots;
    }
}
exports.DepartmentService = DepartmentService;

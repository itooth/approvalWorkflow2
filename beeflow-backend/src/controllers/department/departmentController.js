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
exports.DepartmentController = void 0;
const departmentService_1 = require("../../services/department/departmentService");
const ApiError_1 = require("../../utils/ApiError");
class DepartmentController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const department = yield departmentService_1.DepartmentService.create(req.body);
                res.status(201).json(department);
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
    static getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const department = yield departmentService_1.DepartmentService.getById(req.params.id);
                res.json(department);
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
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const department = yield departmentService_1.DepartmentService.update(req.params.id, req.body);
                res.json(department);
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
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield departmentService_1.DepartmentService.delete(req.params.id);
                res.status(204).send();
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
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const departments = yield departmentService_1.DepartmentService.getAll(req.query);
                res.json(departments);
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
    static getHierarchy(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hierarchy = yield departmentService_1.DepartmentService.getHierarchy();
                res.json(hierarchy);
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
exports.DepartmentController = DepartmentController;

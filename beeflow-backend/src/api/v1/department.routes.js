"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const departmentController_1 = require("../../controllers/department/departmentController");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
// All department routes require authentication
router.use(auth_1.authenticate);
// Get department hierarchy (available to all authenticated users)
router.get('/hierarchy', departmentController_1.DepartmentController.getHierarchy);
// Get all departments (available to all authenticated users)
router.get('/', departmentController_1.DepartmentController.getAll);
// Get specific department (available to all authenticated users)
router.get('/:id', departmentController_1.DepartmentController.getById);
// Admin only routes
router.use((0, auth_1.authorize)(['admin']));
// Create department
router.post('/', departmentController_1.DepartmentController.create);
// Update department
router.put('/:id', departmentController_1.DepartmentController.update);
// Delete department
router.delete('/:id', departmentController_1.DepartmentController.delete);
exports.default = router;

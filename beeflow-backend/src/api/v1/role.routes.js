"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../../controllers/role/roleController");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
// All role routes require authentication
router.use(auth_1.authenticate);
// Get all roles (available to all authenticated users)
router.get('/', roleController_1.RoleController.getAll);
// Get specific role (available to all authenticated users)
router.get('/:id', roleController_1.RoleController.getById);
// Admin only routes
router.use((0, auth_1.authorize)(['admin']));
// Create role
router.post('/', roleController_1.RoleController.create);
// Update role
router.put('/:id', roleController_1.RoleController.update);
// Delete role
router.delete('/:id', roleController_1.RoleController.delete);
// Assign roles to user
router.post('/assign', roleController_1.RoleController.assignToUser);
// Remove roles from user
router.post('/remove', roleController_1.RoleController.removeFromUser);
exports.default = router;

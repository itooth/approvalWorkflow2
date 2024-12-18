"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const auth_routes_1 = __importDefault(require("./api/v1/auth.routes"));
const department_routes_1 = __importDefault(require("./api/v1/department.routes"));
const role_routes_1 = __importDefault(require("./api/v1/role.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/departments', department_routes_1.default);
app.use('/api/v1/roles', role_routes_1.default);
// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'BeeFlow API is running' });
});
// Connect to MongoDB
mongoose_1.default
    .connect(config_1.config.mongoose.url)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
// Start server
app.listen(config_1.config.port, () => {
    console.log(`Server is running on port ${config_1.config.port}`);
});

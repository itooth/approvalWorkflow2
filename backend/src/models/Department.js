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
exports.Department = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const departmentSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    parentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Department',
    },
    leaderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    description: {
        type: String,
        trim: true,
    },
    path: {
        type: String,
        default: '',
    },
    level: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Pre-save middleware to update path and level
departmentSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.parentId) {
            const parent = yield exports.Department.findById(this.parentId);
            if (parent) {
                this.path = parent.path ? `${parent.path}/${this._id}` : this._id.toString();
                this.level = parent.level + 1;
            }
        }
        else {
            this.path = this._id.toString();
            this.level = 0;
        }
        next();
    });
});
// Method to get all children departments
departmentSchema.methods.getChildren = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return exports.Department.find({ parentId: this._id });
    });
};
// Method to get full hierarchy path
departmentSchema.methods.getHierarchyPath = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const departments = yield exports.Department.find({
            _id: { $in: this.path.split('/') }
        });
        return departments.sort((a, b) => a.level - b.level);
    });
};
exports.Department = mongoose_1.default.model('Department', departmentSchema);

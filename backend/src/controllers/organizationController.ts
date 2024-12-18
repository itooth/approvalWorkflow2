import { Response } from 'express';
import { User } from '../models/User';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class OrganizationController {
  // Department management
  async listDepts(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      // For MVP, we'll return a simple array of departments
      const depts = [
        { id: "1", pid: "0", name: "总公司" },
        { id: "2", pid: "1", name: "技术部" },
        { id: "3", pid: "1", name: "人事部" },
        { id: "4", pid: "1", name: "财务部" }
      ];
      res.json(successResponse(depts));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching departments'));
    }
  }

  // Role management
  async listRoles(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      // For MVP, we'll return a simple array of roles
      const roles = [
        { id: "1", name: "管理员" },
        { id: "2", name: "部门主管" },
        { id: "3", name: "普通员工" }
      ];
      res.json(successResponse(roles));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching roles'));
    }
  }

  // User management
  async listUsers(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const users = await User.find({}, { password: 0 });
      res.json(successResponse(users));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching users'));
    }
  }

  async getUserDetail(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const { userId } = req.query;
      const user = await User.findById(userId, { password: 0 });
      if (!user) {
        return res.status(404).json(errorResponse('User not found'));
      }
      res.json(successResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching user details'));
    }
  }

  async getLoginUserDetail(req: AuthRequest, res: Response): Promise<void | Response> {
    try {
      const user = await User.findById(req.user?.id, { password: 0 });
      if (!user) {
        return res.status(404).json(errorResponse('User not found'));
      }
      res.json(successResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }));
    } catch (error) {
      res.status(500).json(errorResponse('Error fetching login user details'));
    }
  }
} 
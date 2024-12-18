import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Role } from '../models/Role';
import { Workflow } from '../models/Workflow';
import { Form } from '../models/Form';
import bcryptjs from 'bcryptjs';

async function seedTestData() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Role.deleteMany({}),
      Workflow.deleteMany({}),
      Form.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create departments
    const departments = await Department.create([
      {
        name: 'IT Department',
        code: 'IT',
        description: 'Information Technology'
      },
      {
        name: 'HR Department',
        code: 'HR',
        description: 'Human Resources'
      },
      {
        name: 'Finance Department',
        code: 'FIN',
        description: 'Finance and Accounting'
      }
    ]);
    console.log('Created departments');

    // Create roles
    const roles = await Role.create([
      {
        name: 'Admin',
        code: 'ADMIN',
        permissions: ['*']
      },
      {
        name: 'Manager',
        code: 'MANAGER',
        permissions: ['workflow:approve', 'workflow:create', 'workflow:view']
      },
      {
        name: 'Employee',
        code: 'EMPLOYEE',
        permissions: ['workflow:submit', 'workflow:view']
      }
    ]);
    console.log('Created roles');

    // Create users
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    const users = await User.create([
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        department: departments[0]._id,
        role: roles[0]._id
      },
      {
        email: 'manager@example.com',
        password: hashedPassword,
        name: 'Manager User',
        department: departments[1]._id,
        role: roles[1]._id
      },
      {
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Regular User',
        department: departments[2]._id,
        role: roles[2]._id
      }
    ]);
    console.log('Created users');

    // Create sample form
    const form = await Form.create({
      name: 'Leave Request Form',
      description: 'Form for requesting leave',
      fields: [
        {
          name: 'leaveType',
          label: 'Leave Type',
          type: 'select',
          required: true,
          options: ['Annual Leave', 'Sick Leave', 'Personal Leave']
        },
        {
          name: 'startDate',
          label: 'Start Date',
          type: 'date',
          required: true
        },
        {
          name: 'endDate',
          label: 'End Date',
          type: 'date',
          required: true
        },
        {
          name: 'reason',
          label: 'Reason',
          type: 'textarea',
          required: true
        }
      ]
    });
    console.log('Created sample form');

    // Create sample workflow
    const workflow = await Workflow.create({
      name: 'Leave Approval Process',
      description: 'Standard leave approval workflow',
      formId: form._id,
      nodeConfig: {
        name: 'Start',
        type: 'INITIATOR',
        childNode: {
          name: 'Manager Approval',
          type: 'APPROVAL',
          label: 'Manager Approval',
          description: 'Approval from direct manager',
          assignees: [
            {
              rid: users[1]._id,
              type: 'SPECIFIC_USER'
            }
          ],
          childNode: {
            name: 'HR Review',
            type: 'APPROVAL',
            label: 'HR Review',
            description: 'Final review by HR',
            assignees: [
              {
                rid: users[0]._id,
                type: 'SPECIFIC_USER'
              }
            ]
          }
        }
      }
    });
    console.log('Created sample workflow');

    console.log('Test data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

// Run seeder
seedTestData(); 
import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const workflowExecutionValidation = {
  startWorkflow: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    }),
    body: Joi.object({
      formData: Joi.object().required(),
      options: Joi.object({
        priority: Joi.number().min(0).max(10),
        dueDate: Joi.date().iso(),
        variables: Joi.object()
      })
    })
  },

  getInstanceById: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    })
  },

  cancelInstance: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    }),
    body: Joi.object({
      reason: Joi.string().required().min(1).max(500)
    })
  },

  getTasks: {
    query: Joi.object({
      workflowInstanceId: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    })
  },

  approveTask: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    }),
    body: Joi.object({
      comment: Joi.string().min(1).max(500)
    })
  },

  rejectTask: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    }),
    body: Joi.object({
      comment: Joi.string().required().min(1).max(500)
    })
  },

  addTaskComment: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    }),
    body: Joi.object({
      content: Joi.string().required().min(1).max(1000)
    })
  },

  reassignTask: {
    params: Joi.object({
      id: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    }),
    body: Joi.object({
      newAssigneeId: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    })
  },

  getUserTasks: {
    params: Joi.object({
      userId: Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required()
    })
  }
}; 
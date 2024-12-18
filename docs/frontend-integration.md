# Frontend Integration Guide

## Overview

This guide covers integrating the BeeFlow backend with Vue.js frontend applications, specifically focusing on the workflow designer and form components.

## Setup

### 1. API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. API Services

```typescript
// src/api/workflow.ts
import apiClient from './client';

export const workflowApi = {
  create: (workflow) => apiClient.post('/workflows', workflow),
  start: (id, data) => apiClient.post(`/workflows/${id}/start`, data),
  getTasks: (userId) => apiClient.get(`/tasks/user/${userId}`),
  approveTask: (id, data) => apiClient.post(`/tasks/${id}/approve`, data)
};
```

## Components Integration

### 1. Workflow Designer

```vue
<!-- src/components/WorkflowDesigner.vue -->
<template>
  <div class="workflow-designer">
    <div class="toolbar">
      <button @click="addNode('APPROVAL')">Add Approval</button>
      <button @click="addNode('CONDITION')">Add Condition</button>
      <button @click="save">Save Workflow</button>
    </div>
    <div class="canvas">
      <!-- Implement workflow canvas -->
    </div>
    <div class="properties" v-if="selectedNode">
      <NodeProperties
        :node="selectedNode"
        @update="updateNode"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { workflowApi } from '@/api/workflow';

export default defineComponent({
  name: 'WorkflowDesigner',
  data() {
    return {
      nodes: [],
      edges: [],
      selectedNode: null
    };
  },
  methods: {
    async save() {
      try {
        const workflow = {
          name: this.name,
          description: this.description,
          nodes: this.nodes,
          edges: this.edges
        };
        await workflowApi.create(workflow);
        this.$emit('saved');
      } catch (error) {
        this.$emit('error', error);
      }
    }
  }
});
</script>
```

### 2. Form Designer

```vue
<!-- src/components/FormDesigner.vue -->
<template>
  <div class="form-designer">
    <div class="components">
      <div
        v-for="component in components"
        :key="component.type"
        @click="addComponent(component)"
      >
        {{ component.label }}
      </div>
    </div>
    <div class="form-canvas">
      <FormComponent
        v-for="field in fields"
        :key="field.id"
        :field="field"
        @update="updateField"
        @delete="deleteField"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FormDesigner',
  data() {
    return {
      components: [
        { type: 'text', label: 'Text Input' },
        { type: 'number', label: 'Number Input' },
        { type: 'select', label: 'Select' },
        { type: 'date', label: 'Date Picker' }
      ],
      fields: []
    };
  }
});
</script>
```

### 3. Task List

```vue
<!-- src/components/TaskList.vue -->
<template>
  <div class="task-list">
    <div class="filters">
      <select v-model="status">
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>
    <div class="tasks">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @approve="approveTask"
        @reject="rejectTask"
      />
    </div>
    <div class="pagination">
      <button
        :disabled="page === 1"
        @click="page--"
      >
        Previous
      </button>
      <span>Page {{ page }}</span>
      <button
        :disabled="!hasMore"
        @click="page++"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { workflowApi } from '@/api/workflow';

export default defineComponent({
  name: 'TaskList',
  data() {
    return {
      tasks: [],
      page: 1,
      limit: 10,
      status: '',
      hasMore: false
    };
  },
  methods: {
    async loadTasks() {
      const response = await workflowApi.getTasks(this.userId);
      this.tasks = response.data;
      this.hasMore = response.meta.total > this.page * this.limit;
    }
  }
});
</script>
```

## State Management

### Vuex Store

```typescript
// src/store/workflow.ts
import { Module } from 'vuex';
import { workflowApi } from '@/api/workflow';

const workflowModule: Module<any, any> = {
  state: {
    workflows: [],
    tasks: [],
    currentWorkflow: null
  },
  mutations: {
    SET_WORKFLOWS(state, workflows) {
      state.workflows = workflows;
    },
    SET_TASKS(state, tasks) {
      state.tasks = tasks;
    }
  },
  actions: {
    async fetchWorkflows({ commit }) {
      const workflows = await workflowApi.getAll();
      commit('SET_WORKFLOWS', workflows);
    },
    async fetchTasks({ commit }, userId) {
      const tasks = await workflowApi.getTasks(userId);
      commit('SET_TASKS', tasks);
    }
  }
};

export default workflowModule;
```

## Error Handling

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.error.message,
          details: data.error.details
        };
      case 401:
        return {
          type: 'auth',
          message: 'Please login to continue'
        };
      case 403:
        return {
          type: 'permission',
          message: 'You don\'t have permission'
        };
      default:
        return {
          type: 'error',
          message: 'An unexpected error occurred'
        };
    }
  }
  return {
    type: 'error',
    message: 'Network error'
  };
};
```

## Testing

### Component Tests

```typescript
// tests/components/WorkflowDesigner.spec.ts
import { mount } from '@vue/test-utils';
import WorkflowDesigner from '@/components/WorkflowDesigner.vue';

describe('WorkflowDesigner', () => {
  it('creates a new workflow', async () => {
    const wrapper = mount(WorkflowDesigner);
    await wrapper.find('.add-node').trigger('click');
    await wrapper.find('.save').trigger('click');
    expect(wrapper.emitted('saved')).toBeTruthy();
  });
});
```

## Best Practices

1. **API Calls**
   - Use API service layer
   - Handle errors consistently
   - Implement request caching
   - Add request/response interceptors

2. **State Management**
   - Use Vuex for global state
   - Keep component state local
   - Implement loading states
   - Handle optimistic updates

3. **Performance**
   - Lazy load components
   - Implement pagination
   - Use virtual scrolling
   - Cache API responses

4. **Security**
   - Validate all inputs
   - Sanitize displayed data
   - Handle token expiration
   - Implement CSRF protection 
## BeeFlow UI Description

### 1. Application List View
- Main navigation showing "审批管理" (Approval Management)
- List of applications with version numbers (e.g., v7, v17)
- Each application shows an icon, name, and visibility status
- "创建审批" (Create Approval) button in the top right
- Search bar for filtering applications

### 2. Basic Information Form
- Multi-step form interface (4 steps: Basic Info, Form Design, Flow Design, More Settings)
- Form fields include:
  - Icon upload
  - Name input (required)
  - Description text area
  - Group selection with "新增分组" (Add New Group) option
  - Flow manager selection with "香吉" as an example

### 3. Form Design Interface
- Left sidebar with form components:
  - Text components (单行文本/多行文本)
  - Numeric inputs (数字/金额)
  - Selection components (单选/多选)
  - Date components (日期/日期区间)
  - Other components (明细/图片/附件/部门/员工/关联审批/省市区)
- Main canvas area with "拖拽左侧控件至此处" (Drag controls here) prompt

### 4. Flow Design Interface
- Flow diagram editor with start and end nodes
- Node types include:
  - 审批人 (Approver)
  - 抄送人 (CC Person)
  - 办理人 (Handler)
  - 条件分支 (Condition Branch)
- Zoom controls (100% with +/- buttons)

### 5. Flow Settings Panel
- Right sidebar with flow settings:
- Approval type selection:
  - 人工审批 (Manual Approval)
  - 自动通过 (Auto Approve)
  - 自动拒绝 (Auto Reject)
- Approver settings:
  - Multiple approver types (发起人本人/上级/部门负责人/etc.)
  - Option to add multiple approvers
  - Approval timing and routing rules

### 6. Application List (Grid View)
- Grid layout of applications with icons
- Status indicators (审批中/Pending)
- Application names and descriptions
- Timestamp information

### 7. Pending Tasks View
- Left sidebar with task categories:
  - 待审批 (Pending Approval)
  - 我的申请 (My Applications)
  - 我收到的 (Received)
  - 已审批 (Approved)
- Task list with:
  - Task name
  - Submitter
  - Submission time
  - Status

### 8. Data Management View
- Table view of workflow instances
- Columns:
  - 审批名称 (Approval Name)
  - 申请编号 (Application Number)
  - 发起人 (Initiator)
  - 状态 (Status)
  - 提交时间 (Submit Time)
  - 完成时间 (Complete Time)
  - 操作 (Operations)
- Pagination controls

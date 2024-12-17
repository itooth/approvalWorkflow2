# 流程设计器

zhangjin 2023年11月27日大约 4 分钟使用指南

---

## 前言

`workflow-web` 是 `beeflow工作流` 的免费开源的流程设计器。设计器包含流程审批、表单设计、审批流程设计全套功能，开箱即用。

该设计器摒弃了晦涩难懂的传统流程编辑器的思维，使用了更加人性化的、更加漂亮的 UI 交互。

我们内部使用了相当长的一段时间，小伙伴都觉得这个设计器还不错，为了帮助更多的同学，我们决定开源前端流程设计器代码。

[👉 功能建议、BUG 反馈在这里 👈](https://gitee.com/zhangjinlibra/workflow-engine/issues)

## 技术栈

- vue3
- vue-router
- pinia
- less
- acro-design

## 快速启动

```bash
# 下载源码
# gitee 源
git clone https://gitee.com/zhangjinlibra/workflow-engine
# github 源
git clone https://github.com/zhangjinlibra/workflow-web

# 安装依赖
npm i -S

# 启动项目
# 项目中已经配置接口代理, 后端请求的是我们的演示服务器
npm run test
```

项目启动成功后，在浏览器中访问地址 [http://127.0.0.1:5174/](http://127.0.0.1:5174/)，可以看到下面的界面。如果项目启动失败，可以在 [该处](https://gitee.com/zhangjinlibra/workflow-engine/issues) 反馈。

![首页](/images/guide/intro-index.png)

## 项目结构

```
├── index.html
├── public
├── src
│   ├── api   (Api接口)
│   ├── App.vue
│   ├── assets    (静态资源)
│   ├── components
│   │   ├── common  (通用组件)
│   │   ├── flow    (流程编辑器)
│   │   ├── form-make   (表单编辑器)
│   │   ├── icons   (流程图标)
│   │   └── SvgIcon   (svg图标)
│   ├── directive   (指令)
│   ├── icons   (图标资源)
│   │   └── svg
│   ├── layout    (布局设计)
│   ├── main.js
│   ├── permission.js   (权限)
│   ├── router    (路由)
│   ├── settings.js   (App全局设置)
│   ├── stores    (pinia)
│   │   ├── index.js
│   │   └── modules
│   ├── styles    (样式)
│   ├── utils   (通用工具)
│   └── views   (页面)
│       ├── flow-data   (审批数据)
│       ├── flow-manage   (审批管理)
│       ├── my-flow   (审批)
│       └── user    (组织用户)
└── vite.config.js
```

### 表单设计器

表单设计器存放在 `src/components/form-make` 中，如果仅需要使用表单编辑器组件，将该文件夹的下的文件全部复制即可。如果存在其他的引用也许要一并复制。

```
/form-make/
├── form-make.less    (样式)
├── index.vue   (入口)
└── WidgetDetail.vue    (明细组件)
```

### 流程设计器

流程设计器组件在 `src/components/flow` 中，别的项目需要使用该组件时，复制对应位置的文件即可。

```
/flow
├── AddNode.vue   (新增节点)
├── common    (通用工具，常量等)
│   ├── ArrayUtil.js
│   ├── ChinaArea.js
│   ├── FlowConstant.js
│   ├── FormAuth.js
│   ├── FormExp.js
│   ├── ObjectUtil.js
│   └── Snowflake.js
├── dialog    (弹窗)
│   ├── Formula.vue   (计算公式，待完善)
│   ├── OrganChooseBox.vue    (用户组织选择器)
├── drawer
│   ├── ApproverDrawer.vue    (审批人)
│   ├── ConditionDrawer.vue   (条件)
│   ├── CopyerDrawer.vue    (抄送人)
│   ├── PromoterDrawer.vue    (发起人)
│   └── TransactDrawer.vue    (办理人)
├── index.vue   (组件入口)
├── NodeFormAuthSetting.vue   (节点权限)
└── NodeWrap.vue    (流程节点)
```

## 流程定义数据结构

流程编辑后的数据结构如下，后端根据该数据结构自行实现。activiti、flowable 不限。

```json
{
  // 流程配置信息
  "nodeConfig": {
    "name": "发起人", // 节点名称
    "type": 0, // 节点类型, 在 `FlowConstant` 枚举文件中
    // 子节点
    "childNode": {
      "name": "路由",
      "type": 4, // 节点类型, 在 `FlowConstant` 枚举文件中
      "childNode": null,
      "conditionNodes": [
        // 条件节点组
        {
          "name": "条件1",
          "type": 3,
          "childNode": {
            "name": "审批人",
            "type": 1,
            "assignees": [{ "rid": "616543805549580288", "assignees": ["1", "2"], "assigneeType": 4 }], // 审批节点审批人设置
            "childNode": null,
            "approvalType": 0, // 审批类型
            "flowNodeNoAuditorType": 1, // 审批人为空时枚举
            "flowNodeSelfAuditorType": 0, // 审批人为自己时枚举
            "flowNodeNoAuditorAssignee": "4", // 审批人为空时指定人员
            "multiInstanceApprovalType": 0 // 会签, 或签, 依次审批
          },
          "priorityLevel": 1, // 分支优先级
          // 分支条件组, 或运算
          "conditionGroups": [
            {
              "id": "616543762050453504",
              // 分支条件列表, 与运算
              "conditions": [
                { "id": "616543762050453505", "val": ["1000", "1001"], "varName": "initiator", "operator": 20, "operators": [20, 21] }
              ]
            }
          ],
          "conditionExpression": "${(fx.has0(initiator,\"1000\",\"1001\"))}" // 条件表达式
        },
        {
          "name": "条件2",
          "type": 3,
          // 子节点
          "childNode": {
            "ccs": [{ "rid": "616543830342111232", "ccType": 4, "assignees": ["1", "2"] }], // 抄送节点抄送人设置
            "name": "抄送人",
            "type": 2,
            "childNode": null
          },
          "priorityLevel": 2,
          "conditionGroups": [] // 默认分支没有条件
        }
      ]
    }
  },
  // 表单组件信息
  "flowWidgets": [
    // 表单组件列表, 组件类型 `type` 在 `FlowConstant` 枚举文件中
    { "name": "INPUT_616543730169548800", "type": 0, "label": "单行文本", "summary": true, "required": true, "placeholder": "请输入" }
  ],
  // 流程基本信息
  "workFlowDef": {
    "id": "1692358807143809026", // 流程id
    "icon": "approval", // 流程图标
    "name": "审批", // 流程名称
    "groupId": "1692083129064325121", // 分组id
    "cancelable": 1, // 是否可撤销
    "flowAdminIds": ["2", "3"] // 流程管理人
  },
  // 流程发起人信息
  "flowPermission": {
    "type": 1, // 发起人类型 0全员, 1指定人员, 2均不可
    "flowInitiators": [
      // 发起人配置
      { "id": "1000", "type": 0 },
      { "id": "1001", "type": 0 },
      { "id": "1", "type": 2 },
      { "id": "2", "type": 2 }
    ]
  }
}
```

注意

数据结构中的枚举全部存储在 `FlowConstant.js` 文件中，如果未找到的枚举可以自行定义。

---

[跳至主要內容](#main-content)

搜索 `` `K`

# 流程引擎

zhangjin 2023年11月27日 大约 5 分钟使用指南

---

## [前言](#前言)

服务端使用 `Java` + `activiti7` 实现，我们抽离了所有的与流程相关的业务。将系统对接以最大形式简单化。使用我们的服务只需要下面的两步：

1. 对接 **[组织架构](#organapi)**
2. [启动服务](#lanuch)

**注意**

目前只开源了流程设计器，服务端需自行实现。

也可以使用我们的配套服务端实现，联系我们进行 [授权](/license/#%E8%8E%B7%E5%8F%96%E6%8E%88%E6%9D%83)。

## [技术栈](#技术栈)

- jdk17
- springboot
- activiti7
- mybatis-plus

## [快速启动](#快速启动)

### [方式 1: 源码打包](#方式-1-源码打包)

```
# 1. 项目授权后，获取源码自行打包。
nvm package

# 2. 在jar的同级目录创建 config 文件夹，创建文件 appliaction.yml 配置文件，修改下面的配置
# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://192.168.1.44:3306/flow?useUnicode=true&characterEncoding=utf8&nullCatalogMeansCurrent=true&rewriteBatchedStatements=true
    username: root
    password: root
# 文件存储配置
flow:
  max-file-size: 100
  max-request-size: 100
  ignore-auth-url:  # 配置无需鉴权的接口
    - /opentest/**
  organ-api:  # 配置组织架构服务所在地址
    name: base-service
    path: orgApi
    url: http://192.168.1.100:8080
  file-storage-strategy: aliyun_oss # 文件策略，本地(local)或者阿里云(aliyun_oss)
  local-storage: # 文件本地策略必填
    file-path: E:/rv/xiaojv/flow.backend/tmp
  aliyun-oss: # 阿里云策略必填
    folder: flow/
    access-key-id: access-key-id
    access-key-secret: access-key-secret
    endpoint: oss-cn-shanghai.aliyuncs.com
    bucket-name: bucket-flow

# 3. 启动项目，项目启动后配合我们开源前端就能使用完整的审批的功能了。
java -jar flow-1.0.1.jar
```

### [方式 2: 获取可运行 jar 包](#方式-2-获取可运行-jar-包)

```
# 修改 appliaction.yml 配置文件
# 启动项目
java -jar flow-1.0.1.jar
```

**提示**

项目中使用 `mysql` 数据库，系统启动后会自行创建所有的表。

## [系统对接](#系统对接)

### [用户组织接口](#用户组织接口)

> 组织服务提供下面的接口，在上述配置文件中配置组织服务地址即可。

```java
public interface OrganApiService {
    /**
     * 用户认证
     *
     * @param tenantId 租户id
     * @param token
     * @return
     */
    @GetMapping("/authentication")
    public User authentication(@RequestParam("tenantId") String tenantId, @RequestParam("token") String token);

    /**
     * 获取上级id
     *
     * @param tenantId  租户id
     * @param userId    用户id
     * @param layerType 层级类型
     * @param level     层级
     * @return userId
     */
    @GetMapping("/getSuperior")
    public String getSuperior(@RequestParam("tenantId") String tenantId, @RequestParam("userId") String userId,
            @RequestParam("layerType") int layerType, @RequestParam("level") int level);

    /**
     * 获取部门领导id
     *
     * @param tenantId  租户id
     * @param userId    用户id
     * @param layerType 层级类型
     * @param level     层级
     * @return userId
     */
    @GetMapping("/getDeptLeader")
    public String getDeptLeader(@RequestParam("tenantId") String tenantId, @RequestParam("userId") String userId,
            @RequestParam("layerType") int layerType, @RequestParam("level") int level);

    /**
     * 获取多层级上级id列表
     *
     * @param tenantId  租户id
     * @param userId    用户id
     * @param layerType 层级类型
     * @param level     层级
     * @return list<userId>
     */
    @GetMapping("/getMultiLayerSuperior")
    public List<String> getMultiLayerSuperior(@RequestParam("tenantId") String tenantId,
            @RequestParam("userId") String userId, @RequestParam("layerType") int layerType,
            @RequestParam("level") int level);

    /**
     * 获取多层级部门领导id列表
     *
     * @param tenantId  租户id
     * @param userId    用户id
     * @param layerType 层级类型
     * @param level     层级
     * @return list<userId>
     */
    @GetMapping("/getMultiLayerDeptLeader")
    public List<String> getMultiLayerDeptLeader(@RequestParam("tenantId") String tenantId,
            @RequestParam("userId") String userId, @RequestParam("layerType") int layerType,
            @RequestParam("level") int level);

    /**
     * 获取所有的角色
     *
     * @param tenantId 租户id
     * @return
     */
    @GetMapping("/listRoles")
    public List<Role> listRoles(@RequestParam("tenantId") String tenantId);

    /**
     * 获取所有的用户
     *
     * @param tenantId 租户id
     * @return
     */
    @GetMapping("/listUsers")
    public List<User> listUsers(@RequestParam("tenantId") String tenantId);

    /**
     * 获取所有的部门
     *
     * @param tenantId 租户id
     * @return
     */
    @GetMapping("/listDepts")
    public List<Dept> listDepts(@RequestParam("tenantId") String tenantId);

    /**
     * 根据id获取用户
     *
     * @param tenantId 租户id
     * @param userId   用户id
     * @return
     */
    @GetMapping("/getUserById")
    public User getUserById(@RequestParam("tenantId") String tenantId, @RequestParam("userId") String userId);

    /**
     * 根据id获取部门
     *
     * @param tenantId 租户id
     * @param deptId   部门id
     * @return
     */
    @GetMapping("/getDeptById")
    public Dept getDeptById(@RequestParam("tenantId") String tenantId, @RequestParam("deptId") String deptId);

    /**
     * 获取用户详情
     *
     * @param tenantId 租户id
     * @param userId   用户id
     * @return
     */
    @GetMapping("/getUserDetailById")
    public UserDetail getUserDetailById(@RequestParam("tenantId") String tenantId,
            @RequestParam("userId") String userId);

    /**
     * 根据id列表查询用户
     *
     * @param tenantId 租户id
     * @param userIds  用户id列表
     * @return
     */
    @GetMapping("/listUserByIds")
    public List<User> listUserByIds(@RequestParam("tenantId") String tenantId, List<String> userIds);

    /**
     * 获取用户角色id列表
     *
     * @param tenantId 租户id
     * @param userId   用户id
     * @return list<roleId>
     */
    @GetMapping("/listUserRoleIds")
    public List<String> listUserRoleIds(@RequestParam("tenantId") String tenantId,
            @RequestParam("userId") String userId);

    /**
     * 获取用户部门id列表
     *
     * @param tenantId 租户id
     * @param userId   用户id
     * @return list<deptId>
     */
    @GetMapping("/listUserDeptIds")
    public List<String> listUserDeptIds(@RequestParam("tenantId") String tenantId,
            @RequestParam("userId") String userId);

    /**
     * 根据角色id查询所有的用户id
     *
     * @param tenantId 租户id
     * @param roleId   角色id
     * @return list<userId>
     */
    @GetMapping("/listUserIdsByRoleId")
    public List<String> listUserIdsByRoleId(@RequestParam("tenantId") String tenantId,
            @RequestParam("roleId") String roleId);

    /**
     * 判断用户是否属于部门
     *
     * @param tenantId 租户id
     * @param userId   用户id
     * @param deptIds  部门id列表
     * @return true/false
     */
    @GetMapping("/inDept")
    public boolean inDept(@RequestParam("tenantId") String tenantId, @RequestParam("userId") String userId,
            @RequestParam("deptIds") List<String> deptIds);

    /**
     * 判断用户是否拥有角色
     *
     * @param tenantId 租户id
     * @param userId   用户id
     * @param roleIds  角色id列表
     * @return true/false
     */
    @GetMapping("/hasRole")
    public boolean hasRole(@RequestParam("tenantId") String tenantId, @RequestParam("userId") String userId,
            @RequestParam("roleIds") List<String> roleIds);

    /**
     * 判断用户是否属于组织
     *
     * @param tenantId 租户id
     * @param userId   用户id 用户
     * @param organIds 用户、角色、部门等id
     * @return true/false
     */
    @GetMapping("/belong")
    public boolean belong(@RequestParam("tenantId") String tenantId, @RequestParam("userId") String userId,
            @RequestParam("organIds") List<String> organIds);
}
```

### [数据传输对象](#数据传输对象)

```java
// 用户
public class User {
    private String id; // 用户id
    private String name; // 用户姓名
    private String tenantId; // 租户id
}

// 用户详情
public class UserDetail {
    private String id; // 用户id
    private String name; // 用户姓名
    private String email; // 用户邮箱
    private String mobile; // 用户手机
    private String avatar; // 用户头像url
}

// 部门
public class Dept {
    private String pid; // 父id
    private String id; // id
    private String name; // 名称
}

// 角色
public class Role {
    private String id; // 角色id
    private String name; // 角色名称
}
```

### [层级枚举](#层级枚举)

```java
// 层级类型
public enum ELayerType{
    DOWN_TO_UP(0, "自下而上"),
    UP_TO_DOWN(1, "自上而下");

    private final int code;
    private final String desc;
}

// 层级
public enum ELayer {
    LEVEL_1(0, "直属"), //
    LEVEL_2(1, "第二级"), //
    ... // 中间级数省略
    LEVEL_20(19, "第二十级");

    private final int code;
    private final String desc;
}
```

---

[跳至主要內容](#main-content)

搜索 `` `K`

# 组织架构

[xiaojv](https://zhangjinlibra.github.io) 2023年11月28日大约 2 分钟使用指南

---

## [前言](#前言)

由于流程组件的完整运行离不开组织架构人员，所以我们开发了简单的案例模块，同时已经初始化了一些测试数据，供大家参考。

相关信息：

- 本板块内容 **仅适用** 于购买了流程后端授权服务的小伙伴，如果仅仅使用我们的前端开源版本则可忽略。
- 仅供参考的原因是：大多数情况下工作流仅仅是作为系统的一个组件使用，需要自行对接系统的组织架构人员模块。
- 如果有流程组件配套系统的定制化需求开发，也可联系我们。

## [技术栈](#技术栈)

- jdk17
- springboot3
- mybatis-plus

## [快速启动](#快速启动)

```
# 1. 自行获取源码，按照注释提示修改配置文件application.yml
# 2. 配置文件修改后，编辑打包成jar文件
mvn clean package -DskipTests
# 3. 启动项目，项目启动后请确保flow服务配置的organ-api地址与该项目一致
java -jar mini_org-0.0.1-SNAPSHOT.jar
```

提示：

项目中使用 `mysql` 数据库，系统启动后会自行创建所有的表和初始化测试数据。

## [头像中文乱码](#头像中文乱码)

由于测试数据中的人员头像依赖于系统字体，如果是在 linux 服务上部署可能因缺少字体而导致头像中文乱码。

解决方法如下：

```
# 1. windows目录C:\Windows\Fonts下找到微软雅黑字体
# 2. 将字体文件（可能包括msyh.ttc、msyhbd.ttc、msyhl.ttc）上传到linux服务器/usr/share/fonts目录下
# 3. 修改字体文件权限
chmod 644 /usr/share/fonts/msyh*.ttc
# 4. 刷新字体缓存
fc-cache -fv
# 5. 验证结果
fc-list | grep 'msyh'
```
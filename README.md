# 订阅提醒

这是一个订阅提醒项目

## 页面结构

页面风格要求简洁大方

### PC 端

- 高度小于 960px 时页面才出现滚动条
- 高度足够时不要出现滚动条

### 移动端

- 采用竖向布局，滚动页面查看内容。
- 内容区域如表格等单独出现滚动条。

### 代码结构

- 所有前端页面功能都写在 public/index.html 中
- 所有接口在 src/api 中，路由在 src/index.ts 中

### 页面内容布局

- url 路径 "/"
- 页面构成，header/content/footer
- header 内容，最左边有 Log 文字 "Mind"，右侧 Swagger/主题切换/Login 按钮
- 点击 Login 按钮，页面弹遮罩层提示输入 token，输入 token，点击确定或者回车，调用/api/auth/[token]校验，校验通过 token 存入 localstorage 中，其他接口请求 header 中必须携带该 token
- 登录成功后，Login 按钮变为 Logout 按钮，点击清除 token
- login 按钮左边是 dark/light 切换按钮，点击可以切换 dark/light 主题
- swagger 按钮点击，在新页面打开，内容执行 public/swagger.html 文件
- pc 端，content 区域分为左右两块，称为 content-left，content-right
- pc 端，content-left 分为两块内容，称为 content-left-top, content-left-bottom
- pc 端，content-right 也分为两块内容，称为 content-right-top,content-right-bottom
- 移动端，将这四个竖着排列

### content-left-top

- 名称：Create New Mind
- content-left-top 是一个表单
- 表单内容有 Title，Description，ScheduledTime，trigger 多选 checkbox，是否开启该 Mind 的 checkboc, 以及 Create Mind 按钮
- 表单提交调用 POST /api/mind 接口

### content-left-bottom

- 名称：Mind List
- content-left-bottom 是一个 table 列表，展示数据库存储的 mind，列 Title/Description/Scheduled Time/Triggers/Actions
- 调用接口是 GET /api/mind, 每一条有 Edit 和 Delete 按钮(Actions)，Description 最多 20 长度，超出...
- edit 按钮调用 GET /api/mind/[id] 获取数据填入 content-left-top 的表单，表单按钮变为 Update Mind, 点击后调用 PUT /api/mind/[id] 更新 mind，
- 点击 delete 接口，调用 Delete /api/mind/[id] 接口，删除 mind

### content-right-top

- 名称：Trigger Configuration
- content-right-top 是一个多 tab 页，不同 tab 是不同的 trigger 配置，tab 页名字是配置名字，内容是 json
- 第一个 tab 页是新增，Trigger Name 是配置名字，Configuration (JSON)输入框是配置内容
- 输入框可以输入 trigger 的 json 配置文件，下面是两个按钮，一个提交，一个删除
- 可以调用 GET /api/trigger 获取所有配置, 新增（修改）删除分别调用 POST 和 DELETE 的 /api/trigger 接口

### ontent-right-bottom

- 名称：Recent Executions
- content-right-bottom，是一个内容展示区 table，展示最近执行的十条 mind
- 展示 Title，Execution Time，Status，调用接口 GET /api/history

### fotter

- footer 显示，"ContactMe"，指向地址 "https://www.sixmillions.cn"

### 其他说明

- 调用新增更新删除按钮时，成功失败都要使用基础弹窗提示
- 复用 css 式样/js 方法，用最简洁的 css/js 实现
- 页面不要引入其他外部资源，使用原始 js/css 实现，调用接口使用 fetch

## dev

```txt
npm install
npm run dev
npm run deploy
```

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

# 二手物品交易管理系统（second-hand-trade-system）前端UI

> 一套基于 Spring Boot + Vue 的前后端分离二手物品交易后台管理系统，提供商品、用户、订单、分类、留言等核心管理功能。
>
> [项目说明文档](https://ycdoc.de5.net/sts-doc/%E4%BA%8C%E6%89%8B%E7%89%A9%E5%93%81%E4%BA%A4%E6%98%93%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F.html)

[后端仓库](https://github.com/Myj-2024/second-hand-trading-system)

## 快速开始

### 前置准备

1. 安装 JDK 8+、Maven 3.6+、Node.js 16+、MySQL 8.0
2. （可选）安装 Minio 并配置（或直接使用本地文件存储替代）
3. 克隆项目仓库

### 克隆后端项目

`git clone https://github.com/Myj-2024/second-hand-trading-system.git`

### 克隆前端项目

`git clone https://github.com/Myj-2024/second-hand-trading-system-ui.git`

### 后端部署

1.  进入后端项目目录，`cd second-hand-trading-system`

2.  导入 MySQL 数据库（项目根目录下如有 `sql` 文件夹，执行对应脚本；无则手动创建数据库，名称建议 `second_hand_trading`）
3.  配置数据库连接：修改 `src/main/resources/application.yml` 中的数据库用户名、密码
4.  （可选）配置 Minio 相关参数（文件存储路径、访问地址等）
5.  构建并启动项目

6.  后端启动成功后，访问接口文档：`http://localhost:8080/swagger-ui.html`

### 前端部署

1.  进入前端项目目录，`cd second-hand-trading-system-ui`
2.  安装项目依赖，`npm install`

3.  配置后端接口地址：修改 `src/utils/request.js` 中的 `baseURL`

```javascript
const service = axios.create({
  baseURL: 'http://localhost:8080', // 后端接口基础地址，保持与后端启动端口一致
  timeout: 5000
})
```

4. 启动前端项目，`npm run dev`

5. 前端启动成功后，访问：`http://localhost:9528`（默认账号：admin，密码：123456）

## 核心功能模块

1.  **文件上传模块**：支持商品图片、用户头像等文件上传，返回访问URL
2.  **用户管理模块**：用户分页查询、新增、修改、密码重置、批量删除、登录/登出、信息查询
3.  **商品分类模块**：分类分页查询、新增、修改、删除、分类下商品状态批量操作
4.  **商品管理模块**：商品分页查询、详情查询、新增、修改、状态切换、批量删除
5.  **订单管理模块**：订单分页查询、状态修改、详情查询
6.  **留言管理模块**：留言分页查询、关联订单查询


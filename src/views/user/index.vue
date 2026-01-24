<template>
    <div class="app-container">
        <!-- 搜索栏 -->
        <el-form :inline=" true " :model=" searchForm " class="search-form" label-width="80px">
            <el-form-item label="用户名">
                <el-input v-model=" searchForm.username " placeholder="请输入用户名" clearable />
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model=" searchForm.status " placeholder="请选择状态" clearable>
                    <el-option label="正常" value="1" />
                    <el-option label="禁用" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click=" getUserList ">查询</el-button>
                <el-button icon="el-icon-refresh" @click=" resetSearch ">重置</el-button>
                <el-button type="success" icon="el-icon-plus" @click=" handleAdd ">新增用户</el-button>
            </el-form-item>
        </el-form>

        <!-- 用户列表 -->
        <el-table v-loading=" loading " :data=" userList " border stripe highlight-current-row
            style="width: 100%; margin-top: 10px">
            <el-table-column prop="id" label="用户ID" width="80" align="center" />
            <el-table-column prop="username" label="用户名" width="120" align="center" />
            <el-table-column prop="nickname" label="昵称" width="120" align="center" />
            <el-table-column prop="phone" label="手机号" width="150" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                    <el-tag :type=" scope.row.status === 1 ? 'success' : 'danger' ">
                        {{ scope.row.status === 1 ? "正常" : "禁用" }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="200" align="center" />
            <el-table-column label="操作" width="350" align="center">
                <template slot-scope="scope">
                    <!-- 加一个div，强制按钮换行 -->
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <el-button type="primary" size="mini" icon="el-icon-edit"
                            @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="warning" size="mini" icon="el-icon-key"
                            @click="handleResetPwd(scope.row)">重置密码</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)"
                            :disabled=" scope.row.username === 'admin' ">删除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <el-pagination @size-change=" handleSizeChange " @current-change=" handleCurrentChange "
            :current-page=" pageNum " :page-sizes=" [5, 10, 20, 50] " :page-size=" pageSize "
            layout="total, sizes, prev, pager, next, jumper" :total=" total "
            style="margin-top: 20px; text-align: right">
        </el-pagination>

        <!-- 新增/编辑用户弹窗 -->
        <el-dialog :title=" dialogTitle " :visible.sync=" dialogVisible " width="500px" :close-on-click-modal=" false ">
            <el-form ref="userForm" :model=" userForm " :rules=" userRules " label-width="80px"
                style="margin-top: 20px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model=" userForm.username " placeholder="请输入用户名" :disabled=" isEdit " />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model=" userForm.nickname " placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model=" userForm.phone " placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="头像URL" prop="avatar">
                    <el-input v-model=" userForm.avatar " placeholder="请输入头像URL" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model=" userForm.status ">
                        <el-radio label="1">正常</el-radio>
                        <el-radio label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!isEdit">
                    <el-input v-model=" userForm.password " type="password" placeholder="请输入密码（不少于6位）" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click=" submitUserForm ">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
// 注意：确保api路径正确
import
{
    listUsers,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
} from "@/api/userManage";

export default {
    name: "UserList",
    data()
    {
        // 用户名校验
        const validateUsername = (rule, value, callback) =>
        {
            if (!value) {
                callback(new Error("请输入用户名"));
            } else {
                callback();
            }
        };
        // 昵称校验
        const validateNickname = (rule, value, callback) =>
        {
            if (!value) {
                callback(new Error("请输入昵称"));
            } else {
                callback();
            }
        };
        // 密码校验（新增时）
        const validatePassword = (rule, value, callback) =>
        {
            if (this.dialogType === "add" && !value) {
                callback(new Error("请输入密码"));
            } else if (this.dialogType === "add" && value.length < 6) {
                callback(new Error("密码长度不能少于6位"));
            } else {
                callback();
            }
        };

        return {
            // 加载状态
            loading: false,
            // 分页参数
            pageNum: 1,
            pageSize: 10,
            total: 0,
            // 搜索条件
            searchForm: {
                username: "",
                status: "",
            },
            // 用户列表
            userList: [],
            // 弹窗相关
            dialogVisible: false,
            dialogType: "add", // add:新增 edit:编辑
            dialogTitle: "新增用户",
            isEdit: false,
            // 表单数据
            userForm: {
                id: "",
                username: "",
                nickname: "",
                phone: "",
                avatar: "",
                status: "1",
                password: "",
            },
            // 表单校验规则
            userRules: {
                username: [{ validator: validateUsername, trigger: "blur" }],
                nickname: [{ validator: validateNickname, trigger: "blur" }],
                password: [{ validator: validatePassword, trigger: "blur" }],
            },
        };
    },
    created()
    {
        // 页面加载时查询用户列表
        this.getUserList();
    },
    methods: {
        // 1. 查询用户列表
        getUserList()
        {
            this.loading = true;
            const params = {
                pageNum: this.pageNum, // 前端传pageNum，后端DTO改为pageNum后匹配
                pageSize: this.pageSize,
                username: this.searchForm.username,
                status: this.searchForm.status,
            };
            listUsers(params)
                .then((response) =>
                {
                    this.loading = false;
                    if (response.code === 200) {
                        // ✅ 正确解析：records和total都在response.data里
                        this.userList = response.data.records || [];
                        this.total = response.data.total || 0;
                    } else {
                        this.$message.error(response.msg || "查询用户列表失败");
                    }
                })
                .catch((error) =>
                {
                    this.loading = false;
                    this.$message.error("查询用户列表失败：" + (error.message || error));
                });
        },

        // 2. 重置搜索条件
        resetSearch()
        {
            this.searchForm = {
                username: "",
                status: "",
            };
            this.getUserList();
        },

        // 3. 分页-每页条数改变
        handleSizeChange(val)
        {
            this.pageSize = val;
            this.getUserList();
        },

        // 4. 分页-当前页改变
        handleCurrentChange(val)
        {
            this.pageNum = val;
            this.getUserList();
        },

        // 5. 新增用户（核心修复：确保弹窗正常显示）
        handleAdd()
        {
            try {
                this.dialogType = "add";
                this.dialogTitle = "新增用户";
                this.isEdit = false;
                // 先重置表单，再显示弹窗
                this.resetUserForm();
                this.dialogVisible = true;
                // 调试日志（可选，可删除）
                console.log("新增用户按钮点击，弹窗显示状态：", this.dialogVisible);
            } catch (e) {
                console.error("新增用户按钮点击异常：", e);
                this.$message.error("操作异常，请刷新页面重试");
            }
        },

        // 6. 编辑用户
        handleEdit(row)
        {
            this.dialogType = "edit";
            this.dialogTitle = "编辑用户";
            this.isEdit = true;
            // 回显数据（确保类型匹配）
            this.userForm = {
                id: row.id || "",
                username: row.username || "",
                nickname: row.nickname || "",
                phone: row.phone || "",
                avatar: row.avatar || "",
                status: (row.status || 1) + "", // 转为字符串匹配radio
                password: "", // 编辑时不显示密码
            };
            this.dialogVisible = true;
        },

        // 7. 提交新增/编辑表单
        submitUserForm()
        {
            this.$refs.userForm.validate((valid) =>
            {
                if (valid) {
                    // 新增用户
                    if (this.dialogType === "add") {
                        addUser(this.userForm)
                            .then((response) =>
                            {
                                // 核心：先判断response是否存在
                                if (!response) {
                                    this.$message.error("新增用户失败：后端无响应");
                                    return;
                                }
                                // 判断后端返回的成功状态
                                if (response.code === 200) {
                                    this.$message.success("新增用户成功");
                                    this.dialogVisible = false; // 仅关闭弹窗，不刷新列表
                                    // 注释掉列表刷新，后续分页功能完成后再打开
                                    // this.getUserList();
                                } else {
                                    this.$message.error(response.msg || "新增用户失败");
                                }
                            })
                            .catch((error) =>
                            {
                                this.$message.error(
                                    "新增用户请求失败：" + (error.message || error)
                                );
                            });
                    } else {
                        // 编辑用户逻辑（保持不变，若暂时不需要可先注释）
                        updateUser(this.userForm)
                            .then((response) =>
                            {
                                if (!response) {
                                    this.$message.error("编辑用户失败：后端无响应");
                                    return;
                                }
                                if (response.code === 200) {
                                    this.$message.success("编辑用户成功");
                                    this.dialogVisible = false;
                                    // this.getUserList();
                                } else {
                                    this.$message.error(response.msg || "编辑用户失败");
                                }
                            })
                            .catch((error) =>
                            {
                                this.$message.error(
                                    "编辑用户请求失败：" + (error.message || error)
                                );
                            });
                    }
                } else {
                    this.$message.warning("表单校验失败，请检查输入");
                    return false;
                }
            });
        },

        // 8. 删除用户
        handleDelete(row)
        {
            this.$confirm("确定要删除该用户吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() =>
                {
                    deleteUser(row.id)
                        .then((response) =>
                        {
                            if (response.code === 200) {
                                this.$message.success("删除用户成功");
                                this.getUserList(); // 刷新列表
                            } else {
                                this.$message.error(response.msg || "删除用户失败");
                            }
                        })
                        .catch((error) =>
                        {
                            this.$message.error("删除用户失败：" + (error.message || error));
                        });
                })
                .catch(() =>
                {
                    this.$message.info("已取消删除");
                });
        },

        // 9. 重置用户密码
        handleResetPwd(row)
        {
            this.$confirm(`确定要重置【${ row.nickname }】的密码为123456吗？`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() =>
                {
                    resetPassword(row.id)
                        .then((response) =>
                        {
                            if (response.code === 200) {
                                this.$message.success("密码重置成功，新密码为123456");
                            } else {
                                this.$message.error(response.msg || "密码重置失败");
                            }
                        })
                        .catch((error) =>
                        {
                            this.$message.error("密码重置失败：" + (error.message || error));
                        });
                })
                .catch(() =>
                {
                    this.$message.info("已取消密码重置");
                });
        },

        // 重置表单（核心修复：兼容表单未渲染的情况）
        resetUserForm()
        {
            this.userForm = {
                id: "",
                username: "",
                nickname: "",
                phone: "",
                avatar: "",
                status: "1",
                password: "",
            };
            // 延迟重置校验状态，避免表单未挂载
            this.$nextTick(() =>
            {
                if (this.$refs.userForm) {
                    this.$refs.userForm.resetFields();
                }
            });
        },
    },
};
</script>

<style scoped>
/* 全局容器样式优化 */
.app-container {
    padding: 20px;
    min-width: 1000px;
    /* 避免页面过窄导致布局错乱 */
}

/* 搜索栏样式优化 */
.search-form {
    background: #f5f5f5;
    padding: 15px 20px;
    /* 增加内边距，更舒展 */
    border-radius: 6px;
    margin-bottom: 15px;
    /* 与表格拉开距离 */
    display: flex;
    align-items: center;
    gap: 10px;
    /* 按钮/表单项之间的间距 */
}

/* 表格样式优化 */
.el-table {
    --el-table-row-hover-bg-color: #f8fafc;
    /* 优化 hover 背景色 */
    --el-table-border-color: #e2e8f0;
    /* 优化边框色 */
    font-size: 14px;
}

/* 表格列宽适配优化（操作栏按钮分散） */
.el-table-column--width-250 {
    width: 280px !important;
    /* 加宽操作栏，避免按钮拥挤 */
}

.el-table-column--width-200 {
    width: 220px !important;
    /* 加宽创建时间列，避免文字换行 */
}

/* 操作栏按钮间距优化 */
.el-table .el-button--mini {
    margin-right: 8px;
    /* 按钮之间增加间距 */
}

.el-table .el-button--mini:last-child {
    margin-right: 0;
    /* 最后一个按钮取消右边距 */
}

/* 分页控件样式优化 */
.el-pagination {
    margin-top: 20px;
    padding: 10px 0;
    text-align: right;
    font-size: 14px;
}

/* 弹窗表单样式优化 */
.el-dialog__body {
    padding: 20px !important;
    /* 增加弹窗内边距 */
}

.el-form-item {
    margin-bottom: 18px !important;
    /* 表单项间距优化 */
}

.el-form-item__label {
    font-weight: 500;
    /* 标签加粗，更醒目 */
}

/* 按钮样式微调 */
.el-button--primary {
    background-color: #409eff;
}

.el-button--warning {
    background-color: #e6a23c;
}

.el-button--danger {
    background-color: #f56c6c;
}

/* 1. 强制加宽操作列（确保足够空间） */
.el-table-column--label-操作 {
    min-width: 300px !important;
    /* 加宽操作列，确保按钮不拥挤 */
}

/* 2. 操作栏按钮换行（空间不足时自动换行） */
.el-table .cell {
    white-space: normal !important;
    /* 取消按钮的强制不换行 */
    line-height: 32px;
    /* 按钮换行后的行高 */
}

/* 3. 按钮间距再加大 */
.el-table .el-button--mini {
    margin-right: 8px;
    margin-bottom: 4px;
    /* 增加按钮底部间距，换行后更美观 */
}
</style>

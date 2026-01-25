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
                <!-- 新增：批量删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" @click=" handleBatchDelete "
                    :disabled=" !multipleSelection.length ">
                    批量删除
                </el-button>
            </el-form-item>
        </el-form>

        <!-- 用户列表 -->
        <el-table v-loading=" loading " :data=" userList " border stripe highlight-current-row
            style="width: 100%; margin-top: 10px" @selection-change=" handleSelectionChange " ref="userTable">
            <!-- 新增：多选列 -->
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="id" label="用户ID" width="80" align="center" />
            <el-table-column prop="username" label="用户名" width="120" align="center" />
            <el-table-column prop="nickname" label="昵称" width="120" align="center" />
            <el-table-column prop="phone" label="手机号" width="150" align="center" />
            <!-- 新增：头像列 -->
            <el-table-column label="头像" width="100" align="center">
                <template slot-scope="scope">
                    <img :src=" scope.row.avatar || '/default-avatar.png' " class="table-avatar" alt="用户头像" />
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                    <el-tag :type=" scope.row.status === 1 ? 'success' : 'danger' ">
                        {{ scope.row.status === 1 ? "正常" : "禁用" }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="200" align="center" />
            <!-- 新增：修改时间列 -->
            <el-table-column prop="updateTime" label="修改时间" width="200" align="center" />
            <el-table-column label="操作" width="350" align="center">
                <template slot-scope="scope">
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
                <!-- 修改：头像上传组件（替换原URL输入框） -->
                <el-form-item label="头像" prop="avatar">
                    <el-upload class="avatar-uploader" action="#" :show-file-list=" false "
                        :before-upload=" beforeAvatarUpload " :http-request=" uploadAvatar "
                        :loading=" avatarUploadLoading ">
                        <img v-if="userForm.avatar" :src=" userForm.avatar " class="avatar" />
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
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
// 导入新增的接口
import
{
    listUsers,
    addUser,
    updateUser,
    deleteUsers, // 合并后的删除接口
    resetPassword,
    uploadAvatar
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
            // 新增：批量选择的用户ID
            multipleSelection: [],
            // 新增：头像上传加载状态
            avatarUploadLoading: false
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
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                username: this.searchForm.username,
                status: this.searchForm.status,
            };
            listUsers(params)
                .then((response) =>
                {
                    this.loading = false;
                    if (response.code === 200) {
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

        // 5. 新增用户
        handleAdd()
        {
            try {
                this.dialogType = "add";
                this.dialogTitle = "新增用户";
                this.isEdit = false;
                this.resetUserForm();
                this.dialogVisible = true;
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
            this.userForm = {
                id: row.id || "",
                username: row.username || "",
                nickname: row.nickname || "",
                phone: row.phone || "",
                avatar: row.avatar || "",
                status: (row.status || 1) + "",
                password: "",
            };
            this.dialogVisible = true;
        },

        // 7. 提交新增/编辑表单
        submitUserForm()
        {
            this.$refs.userForm.validate((valid) =>
            {
                if (valid) {
                    if (this.dialogType === "add") {
                        addUser(this.userForm)
                            .then((response) =>
                            {
                                if (!response) {
                                    this.$message.error("新增用户失败：后端无响应");
                                    return;
                                }
                                if (response.code === 200) {
                                    this.$message.success("新增用户成功");
                                    this.dialogVisible = false;
                                    this.getUserList(); // 新增：提交后刷新列表
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
                                    this.getUserList();
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

        // 8. 删除用户（修改：调用合并后的deleteUsers接口）
        handleDelete(row)
        {
            this.$confirm("确定要删除该用户吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() =>
                {
                    // 单个删除：传入单个ID，接口内部转为数组
                    deleteUsers(row.id)
                        .then((response) =>
                        {
                            if (response.code === 200) {
                                this.$message.success("删除用户成功");
                                this.getUserList();
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

        // 重置表单
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
            this.$nextTick(() =>
            {
                if (this.$refs.userForm) {
                    this.$refs.userForm.resetFields();
                }
            });
        },

        // 新增：头像上传前校验
        beforeAvatarUpload(file)
        {
            const isImage = file.type.startsWith('image/');
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isImage) {
                this.$message.error('只能上传图片格式文件！');
                return false;
            }
            if (!isLt2M) {
                this.$message.error('头像图片大小不能超过2MB！');
                return false;
            }
            return true;
        },

        // 新增：头像上传逻辑（对接后端upload接口）
        uploadAvatar(options)
        {
            this.avatarUploadLoading = true;
            const formData = new FormData();
            formData.append('file', options.file); // 后端接收的文件字段名

            uploadAvatar(formData)
                .then(response =>
                {
                    this.avatarUploadLoading = false;
                    if (response.code === 200) {
                        // 后端返回的图片地址赋值给表单
                        this.userForm.avatar = response.data;
                        this.$message.success('头像上传成功！');
                    } else {
                        this.$message.error(response.msg || '头像上传失败');
                    }
                })
                .catch(error =>
                {
                    this.avatarUploadLoading = false;
                    this.$message.error('头像上传失败：' + (error.message || error));
                });
        },

        // 新增：多选事件（获取选中的用户）
        handleSelectionChange(val)
        {
            this.multipleSelection = val;
        },

        // 新增：批量删除用户（修改：调用合并后的deleteUsers接口）
        handleBatchDelete()
        {
            if (!this.multipleSelection.length) {
                this.$message.warning("请选择要删除的用户");
                return;
            }

            // 过滤掉admin用户
            const canDeleteList = this.multipleSelection.filter(item => item.username !== 'admin');
            if (!canDeleteList.length) {
                this.$message.warning("admin用户不允许删除");
                return;
            }

            this.$confirm(`确定要删除选中的${ canDeleteList.length }个用户吗？`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() =>
            {
                // 提取用户ID数组，传入合并后的接口
                const ids = canDeleteList.map(item => item.id);
                deleteUsers(ids)
                    .then(response =>
                    {
                        if (response.code === 200) {
                            this.$message.success("批量删除用户成功");
                            this.getUserList(); // 刷新列表
                            this.$refs.userTable.clearSelection(); // 清空选择
                        } else {
                            this.$message.error(response.msg || "批量删除用户失败");
                        }
                    })
                    .catch(error =>
                    {
                        this.$message.error("批量删除用户失败：" + (error.message || error));
                    });
            }).catch(() =>
            {
                this.$message.info("已取消批量删除");
            });
        }
    },
};
</script>

<style scoped>
/* 全局容器样式优化 */
.app-container {
    padding: 20px;
    min-width: 1000px;
}

/* 搜索栏样式优化 */
.search-form {
    background: #f5f5f5;
    padding: 15px 20px;
    border-radius: 6px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 表格样式优化 */
.el-table {
    --el-table-row-hover-bg-color: #f8fafc;
    --el-table-border-color: #e2e8f0;
    font-size: 14px;
}

/* 表格头像样式 */
.table-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

/* 头像上传组件样式 */
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
}

.avatar {
    width: 100px;
    height: 100px;
    display: block;
    border-radius: 6px;
    object-fit: cover;
}

/* 其他原有样式保持不变 */
.el-table-column--width-250 {
    width: 280px !important;
}

.el-table-column--width-200 {
    width: 220px !important;
}

.el-table .el-button--mini {
    margin-right: 8px;
    margin-bottom: 4px;
}

.el-pagination {
    margin-top: 20px;
    padding: 10px 0;
    text-align: right;
    font-size: 14px;
}

.el-dialog__body {
    padding: 20px !important;
}

.el-form-item {
    margin-bottom: 18px !important;
}

.el-form-item__label {
    font-weight: 500;
}

.el-button--primary {
    background-color: #409eff;
}

.el-button--warning {
    background-color: #e6a23c;
}

.el-button--danger {
    background-color: #f56c6c;
}

.el-table-column--label-操作 {
    min-width: 300px !important;
}

.el-table .cell {
    white-space: normal !important;
    line-height: 32px;
}
</style>
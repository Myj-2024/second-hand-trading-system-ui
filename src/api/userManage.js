import request from "@/utils/request-user";

// 1. 新增用户
export function addUser(data)
{
    return request({
        url: "/admin/user/add",
        method: "post",
        data,
    });
}

// 2. 修改用户
export function updateUser(data)
{
    return request({
        url: "/admin/user/update",
        method: "put",
        data,
    });
}

// 3. 根据用户名查询用户
export function getUserByUsername(username)
{
    return request({
        url: "/admin/user/getByUsername",
        method: "get",
        params: { username },
    });
}

// 4. 分页查询用户列表
export function listUsers(params)
{
    return request({
        url: "/admin/user/page",
        method: "get",
        params,
    });
}

// 合并：单个/批量删除用户（核心修改）
export function deleteUsers(ids)
{
    // 统一处理参数：单个ID转为数组，数组直接使用
    const deleteIds = Array.isArray(ids) ? ids : [ids];
    return request({
        url: "/admin/user/delete", // 后端统一的删除接口地址
        method: "delete",
        data: deleteIds, // 始终传递数组
    });
}

// 6. 重置用户密码
export function resetPassword(id)
{
    return request({
        url: `/admin/user/resetPwd/${ id }`,
        method: "post",
    });
}

// 7. 新增：头像上传接口（对接后端upload公共接口）
export function uploadAvatar(data)
{
    return request({
        url: "/upload", // 后端upload公共接口地址
        method: "post",
        headers: {
            "Content-Type": "multipart/form-data", // 文件上传必须
        },
        data: data,
    });
}

// 保留原有函数名（兼容旧代码，可选，也可直接删除）
export function deleteUser(id)
{
    return deleteUsers(id);
}
export function batchDeleteUser(ids)
{
    return deleteUsers(ids);
}

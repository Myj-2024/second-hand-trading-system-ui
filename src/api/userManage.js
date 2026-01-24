// src/api/userManage.js
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

// 5. 删除用户（逻辑删除）
export function deleteUser(id)
{
    return request({
        url: `/admin/user/delete/${ id }`,
        method: "delete",
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

import request from "@/utils/request-goods";

export default {
    // 1. 新增商品
    addGoods(data)
    {
        return request({
            url: "/admin/goods/add",
            method: "post",
            data,
        });
    },

    // 2. 分页查询商品
    pageGoods(params)
    {
        return request({
            url: "/admin/goods/page",
            method: "get",
            params,
        });
    },

    // 3. 修改商品
    updateGoods(data)
    {
        return request({
            url: "/admin/goods/update",
            method: "put",
            data,
        });
    },

    // 4. 删除商品（兼容单个/批量，和用户模块写法一致）
    deleteGoods(ids)
    {
        // 统一处理参数：单个ID转为数组，数组直接使用
        const deleteIds = Array.isArray(ids) ? ids : [ids];
        return request({
            url: "/admin/goods/delete",
            method: "delete",
            data: deleteIds, // 传递JSON数组（对应后端@RequestBody）
        });
    },

    // 5. 修改商品状态（适配后端startOrStop接口）
    updateGoodsStatus(id, status)
    { // 参数顺序调整：先id，后status
        return request({
            url: `/admin/goods/status/${ status }`, // status作为路径参数
            method: "post", // 后端用@PostMapping，保持一致
            params: { id: id } // id作为请求参数传递
        });
    },

    // 6. 查询分类下的商品
    listGoodsByCategory(categoryId)
    {
        return request({
            url: "/admin/goods/list",
            method: "get",
            params: { categoryId },
        });
    },

    // 7. 根据ID查询商品
    getGoodsById(id)
    {
        return request({
            url: `/admin/goods/${ id }`,
            method: "get",
        });
    },

    // 8. 图片上传（参考用户管理的头像上传，优化请求头）
    uploadImage(formData)
    {
        return request({
            url: "/upload",
            method: "post",
            headers: {
                "Content-Type": "multipart/form-data", // 明确指定，不再用undefined
            },
            data: formData,
            transformRequest: [data => data] // 禁止axios序列化formData
        });
    },
};
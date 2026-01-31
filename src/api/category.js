import request from "@/utils/request-goods";

export default {
  // 1. 新增分类
  addCategory(data) {
    return request({
      url: "/admin/category/add",
      method: "post",
      data,
    });
  },

  // 2. 分页查询分类
  pageCategory(params) {
    return request({
      url: "/admin/category/page",
      method: "get",
      params,
    });
  },

  // 3. 修改分类
  updateCategory(data) {
    return request({
      url: "/admin/category/update",
      method: "put",
      data,
    });
  },

  // 4. 删除分类（兼容单个/批量）
  deleteCategory(ids) {
    const deleteIds = Array.isArray(ids) ? ids : [ids];
    return request({
      url: "/admin/category/delete",
      method: "delete",
      data: deleteIds,
    });
  },

  // 5. 修改分类管理商品状态（一键上、下架）
  batchOperateCategoryGoods(categoryId, targetStatus) {
    return request({
      url: '/admin/category/batchOperateGoods',
      method: 'post',
      data: {
        categoryId: categoryId, // 分类ID
        targetStatus: targetStatus // 目标状态：1-上架 0-下架
      }
    })
  },

  // 6. 根据ID查询分类
  getCategoryById(id) {
    return request({
      url: `/admin/category/${id}`,
      method: "get",
    });
  }
};

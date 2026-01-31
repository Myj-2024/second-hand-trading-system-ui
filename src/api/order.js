import request from "@/utils/request-order";

export default {
  // 订单分页查询（管理员端全量订单）
  pageOrder(params) {
    return request({
      url: "/admin/order/page",
      method: "get",
      params,
    });
  },

  // 新增：订单详情查询（根据订单ID）
  getOrderDetail(order_id) {
    return request({
      url: `/admin/order/details/${order_id}`, // 匹配后端接口路径
      method: "get"
    });
  },

  // 新增：修改订单状态接口
  updateOrderStatus(status, id) {
    return request({
      url: `/admin/order/status/${status}`,
      method: "get",
      params: { id: id }
    });
  }
};

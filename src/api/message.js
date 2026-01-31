import request from "@/utils/request-goods"; // 注意：这里使用通用request（如果没有单独的request-message，直接用项目通用的request即可）

export default {
  // 留言分页查询（匹配后端接口）
  pageMessage(params) {
    return request({
      url: "/admin/message/page",
      method: "get",
      params, // GET请求用params传递查询参数
    });
  },
};

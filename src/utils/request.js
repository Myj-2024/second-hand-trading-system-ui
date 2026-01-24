import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";

// create an axios instance
const service = axios.create({
  baseURL: "http://localhost:8080", // 后端地址，正确
  timeout: 5000, // 请求超时时间，正确
});

// request interceptor：请求拦截器（核心修复：token字段名）
service.interceptors.request.use(
  (config) => {
    if (store.getters.token) {
      // 核心修改：将X-Token改为token，匹配后端接收的字段名
      config.headers["token"] = getToken();
    }
    return config;
  },
  (error) => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor：响应拦截器（核心修复：码值和提示字段）
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 核心修改1：成功码从20000改为200（匹配后端的Result.success返回的code）
    if (res.code !== 200) {
      // 核心修改2：提示字段从res.message改为res.msg（匹配后端的提示字段）
      Message({
        message: res.msg || "Error",
        type: "error",
        duration: 5 * 1000,
      });

      // 保留前端默认的token失效逻辑，后端可根据需要返回对应码值
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          "You have been logged out, you can cancel to stay on this page, or log in again",
          "Confirm logout",
          {
            confirmButtonText: "Re-Login",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        ).then(() => {
          store.dispatch("user/resetToken").then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.msg || "Error"));
    } else {
      // 核心修改3：返回res.data而非res，让前端直接拿到业务数据
      return res.data;
    }
  },
  (error) => {
    console.log("err" + error); // for debug
    Message({
      message: error.message,
      type: "error",
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default service;

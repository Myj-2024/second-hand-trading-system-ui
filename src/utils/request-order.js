import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";

const service = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) =>
  {
    if (store.getters.token) {
      config.headers["token"] = getToken();
    }
    return config;
  },
  (error) =>
  {
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) =>
  {
    const res = response.data;
    if (res.code === 200) {
      return res;
    } else {
      Message({
        message: res.msg || "Error",
        type: "error",
        duration: 5 * 1000,
      });
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          "登录状态已过期，请重新登录",
          "确认登出",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() =>
        {
          store.dispatch("user/resetToken").then(() =>
          {
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.msg || "Error"));
    }
  },
  (error) =>
  {
    console.log("err" + error);
    Message({
      message: error.message,
      type: "error",
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default service;

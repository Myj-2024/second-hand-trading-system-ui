import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";

// 仅用于用户管理接口的axios实例
const service = axios.create({
    baseURL: "http://localhost:8080", // 和全局一致
    timeout: 5000,
});

// 请求拦截器（和全局一致，保证token正常传递）
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

// 响应拦截器（适配用户管理接口的响应格式）
service.interceptors.response.use(
    (response) =>
    {
        const res = response.data;
        // 成功：直接返回完整res对象（包含code/msg/data），不返回res.data
        if (res.code === 200) {
            return res; // 关键：返回完整对象，供用户管理页面解析code
        } else {
            // 失败：保留原有提示逻辑
            Message({
                message: res.msg || "Error",
                type: "error",
                duration: 5 * 1000,
            });
            if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
                MessageBox.confirm(
                    "You have been logged out, you can cancel to stay on this page, or log in again",
                    "Confirm logout",
                    {
                        confirmButtonText: "Re-Login",
                        cancelButtonText: "Cancel",
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

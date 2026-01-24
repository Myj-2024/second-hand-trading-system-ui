import { login, logout, getInfo } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { resetRouter } from "@/router";

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    avatar: "",
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
};

const actions = {
  // user login 核心修复：响应解析逻辑
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then((response) => {
          // 核心修改1：去掉多余的data解构，直接从response取token
          // 因为request.js已经返回了res.data（即UserLoginVO），response就是UserLoginVO
          const token = response.token;
          if (!token) {
            reject("登录成功但未获取到token");
            return;
          }
          commit("SET_TOKEN", token);
          setToken(token);
          resolve();
        })
        .catch((error) => {
          console.error("登录请求失败：", error); // 新增错误日志，便于排查
          reject(error);
        });
    });
  },

  // get user info 同步修复：response已经是res.data，无需再解构data
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          // 核心修改2：去掉const { data } = response，直接用response
          if (!response) {
            return reject("Verification failed, please Login again.");
          }

          // 匹配后端返回的字段（后端返回{name:"admin", avatar:""}）
          const { name, avatar } = response;

          commit("SET_NAME", name);
          commit("SET_AVATAR", avatar);
          resolve(response);
        })
        .catch((error) => {
          console.error("获取用户信息失败：", error); // 新增错误日志
          reject(error);
        });
    });
  },

  // user logout 无需修改（若后端logout接口返回正常即可）
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken();
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken();
      commit("RESET_STATE");
      resolve();
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

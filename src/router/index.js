import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

/**
 * constantRoutes
 * 所有角色均可访问的基础页面
 */
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "主页",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "主页", icon: "el-icon-s-data" }, // Element UI 数据图标
      },
    ],
  },

  // 用户管理路由（Element UI 图标）
  {
    path: "/user",
    component: Layout,
    redirect: "/user/index",
    name: "UserManage",
    meta: { title: "用户管理", icon: "el-icon-user" }, // Element UI 用户图标
    children: [
      {
        path: "index",
        name: "UserList",
        component: () => import("@/views/user/index"),
        meta: { title: "用户列表", icon: "el-icon-user-solid" }, // 实心用户图标
      },
    ],
  },

  // 商品管理路由（Element UI 图标）
  {
    path: "/goods",
    component: Layout,
    redirect: "/goods/index",
    name: "Goods",
    meta: { title: "商品管理", icon: "el-icon-s-goods" }, // Element UI 商品图标
    children: [
      {
        path: "index",
        name: "GoodsList",
        component: () => import("@/views/goods/index"),
        meta: { title: "商品列表", icon: "el-icon-goods" }, // 子菜单用菜单图标
      },
    ],
  },

  // 新增：商品分类管理路由
  {
    path: "/category",
    component: Layout,
    redirect: "/category/index",
    name: "Category",
    meta: { title: "分类管理", icon: "el-icon-s-menu" }, // Element UI 分类/排序图标
    children: [
      {
        path: "index",
        name: "CategoryList",
        component: () => import("@/views/category/index"), // 对应分类管理页面组件路径
        meta: { title: "分类列表", icon: "el-icon-menu" }, // 子菜单保持和商品管理一致的图标
      },
    ],
  },

  // 订单管理路由（Element UI 订单图标）
  {
    path: "/order",
    component: Layout,
    redirect: "/order/index",
    name: "Order",
    meta: { title: "订单管理", icon: "el-icon-s-order" }, // 订单专属图标
    children: [
      {
        path: "index",
        name: "OrderList",
        component: () => import("@/views/order/index"),
        meta: { title: "订单列表", icon: "el-icon-document-copy" }, // 子菜单图标
      },
    ],
  },

  // ========== 新增：留言管理路由 ==========
  {
    path: "/message",
    component: Layout,
    redirect: "/message/index",
    name: "Message",
    meta: { title: "留言管理", icon: "el-icon-chat-dot-round" }, // 留言/聊天专属图标
    children: [
      {
        path: "index",
        name: "MessageList",
        component: () => import("@/views/message/index"),
        meta: { title: "留言列表", icon: "el-icon-chat-line-round" }, // 子菜单图标
      },
    ],
  },

  {
    path: "external-link",
    component: Layout,
    children: [
      {
        path: "https://panjiachen.github.io/vue-element-admin-site/#/",
        meta: { title: "项目文档", icon: "el-icon-link" }, // Element UI 链接图标
      },
    ],
  },

  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  });

const router = createRouter();

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher;
}

export default router;

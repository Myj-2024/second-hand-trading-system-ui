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
        name: "仪表盘",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "仪表盘", icon: "el-icon-s-data" }, // Element UI 数据图标
      },
    ],
  },

  // {
  //   path: "/example",
  //   component: Layout,
  //   redirect: "/example/table",
  //   name: "Example",
  //   meta: { title: "示例管理", icon: "el-icon-s-tools" }, // Element UI 工具图标
  //   children: [
  //     {
  //       path: "table",
  //       name: "Table",
  //       component: () => import("@/views/table/index"),
  //       meta: { title: "表格示例", icon: "el-icon-s-grid" }, // Element UI 表格图标
  //     },
  //     {
  //       path: "tree",
  //       name: "Tree",
  //       component: () => import("@/views/tree/index"),
  //       meta: { title: "树形示例", icon: "el-icon-tree" }, // Element UI 树形图标
  //     },
  //   ],
  // },

  // {
  //   path: "/form",
  //   component: Layout,
  //   children: [
  //     {
  //       path: "index",
  //       name: "Form",
  //       component: () => import("@/views/form/index"),
  //       meta: { title: "表单示例", icon: "el-icon-s-form" }, // Element UI 表单图标
  //     },
  //   ],
  // },

  // {
  //   path: "/nested",
  //   component: Layout,
  //   redirect: "/nested/menu1",
  //   name: "Nested",
  //   meta: {
  //     title: "嵌套菜单",
  //     icon: "el-icon-menu", // Element UI 菜单图标
  //   },
  //   children: [
  //     {
  //       path: "menu1",
  //       component: () => import("@/views/nested/menu1/index"),
  //       name: "Menu1",
  //       meta: { title: "菜单1", icon: "el-icon-minus" }, // 子菜单图标
  //       children: [
  //         {
  //           path: "menu1-1",
  //           component: () => import("@/views/nested/menu1/menu1-1"),
  //           name: "Menu1-1",
  //           meta: { title: "菜单1-1", icon: "el-icon-minus" },
  //         },
  //         {
  //           path: "menu1-2",
  //           component: () => import("@/views/nested/menu1/menu1-2"),
  //           name: "Menu1-2",
  //           meta: { title: "菜单1-2", icon: "el-icon-minus" },
  //           children: [
  //             {
  //               path: "menu1-2-1",
  //               component: () =>
  //                 import("@/views/nested/menu1/menu1-2/menu1-2-1"),
  //               name: "Menu1-2-1",
  //               meta: { title: "菜单1-2-1", icon: "el-icon-minus" },
  //             },
  //             {
  //               path: "menu1-2-2",
  //               component: () =>
  //                 import("@/views/nested/menu1/menu1-2/menu1-2-2"),
  //               name: "Menu1-2-2",
  //               meta: { title: "菜单1-2-2", icon: "el-icon-minus" },
  //             },
  //           ],
  //         },
  //         {
  //           path: "menu1-3",
  //           component: () => import("@/views/nested/menu1/menu1-3"),
  //           name: "Menu1-3",
  //           meta: { title: "菜单1-3", icon: "el-icon-minus" },
  //         },
  //       ],
  //     },
  //     {
  //       path: "menu2",
  //       component: () => import("@/views/nested/menu2/index"),
  //       name: "Menu2",
  //       meta: { title: "菜单2", icon: "el-icon-minus" },
  //     },
  //   ],
  // },

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
    redirect: "/goods/list",
    name: "Goods",
    meta: { title: "商品管理", icon: "el-icon-s-goods" }, // Element UI 商品图标
    children: [
      {
        path: "list",
        name: "GoodsList",
        component: () => import("@/views/goods/index"),
        meta: { title: "商品列表", icon: "el-icon-menu" }, // 子菜单用菜单图标
      },
    ],
  },
  {
    path: "external-link",
    component: Layout,
    children: [
      {
        path: "https://panjiachen.github.io/vue-element-admin-site/#/",
        meta: { title: "官方文档", icon: "el-icon-link" }, // Element UI 链接图标
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

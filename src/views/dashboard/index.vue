<template>
  <div class="dashboard-container">
    <!-- 欢迎文本（单行显示+字体调整） -->
    <div class="dashboard-text">📦 欢迎登陆二手物品交易管理系统</div>

    <!-- 统计区容器：横向排列用户+商品统计模块 -->
    <div class="stats-wrapper">
      <!-- 用户统计区：靠左固定大小，卡片式布局 -->
      <div class="stat-section">
        <!-- 总用户数卡片（顶部） -->
        <div class="total-card card-shadow" hover-effect>
          <div class="total-text">总用户数</div>
          <div class="total-count" v-if="!userLoading">{{ totalUser }}人</div>
          <el-skeleton v-else animated :rows=" 1 " class="total-skeleton"></el-skeleton>
        </div>

        <!-- 底部分栏：正常+禁用用户卡片 -->
        <div class="status-card-row">
          <!-- 正常用户卡片 -->
          <div class="status-card success-card card-shadow" hover-effect>
            <div class="status-text">正常</div>
            <div class="status-count" v-if="!userLoading">{{ normalUser }}人</div>
            <el-skeleton v-else animated :rows=" 1 " class="status-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage=" normalUserRate " stroke-width="4" color="#67c23a"
              class="status-progress" />
          </div>

          <!-- 禁用用户卡片 -->
          <div class="status-card danger-card card-shadow" hover-effect>
            <div class="status-text">禁用</div>
            <div class="status-count" v-if="!userLoading">{{ disableUser }}人</div>
            <el-skeleton v-else animated :rows=" 1 " class="status-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage=" disableUserRate " stroke-width="4" color="#f56c6c"
              class="status-progress" />
          </div>
        </div>
      </div>

      <!-- ========== 新增：商品统计区 ========== -->
      <div class="stat-section">
        <!-- 总商品数卡片（顶部） -->
        <div class="total-card card-shadow" hover-effect>
          <div class="total-text">总商品数</div>
          <div class="total-count" v-if="!goodsLoading">{{ totalGoods }}件</div>
          <el-skeleton v-else animated :rows=" 1 " class="total-skeleton"></el-skeleton>
        </div>

        <!-- 底部分栏：上架+下架商品卡片 -->
        <div class="status-card-row">
          <!-- 上架商品卡片 -->
          <div class="status-card success-card card-shadow" hover-effect>
            <div class="status-text">上架中</div>
            <div class="status-count" v-if="!goodsLoading">{{ onSaleGoods }}件</div>
            <el-skeleton v-else animated :rows=" 1 " class="status-skeleton"></el-skeleton>
            <el-progress v-if="!goodsLoading" :percentage=" onSaleRate " stroke-width="4" color="#67c23a"
              class="status-progress" />
          </div>

          <!-- 下架商品卡片 -->
          <div class="status-card danger-card card-shadow" hover-effect>
            <div class="status-text">已下架</div>
            <div class="status-count" v-if="!goodsLoading">{{ offSaleGoods }}件</div>
            <el-skeleton v-else animated :rows=" 1 " class="status-skeleton"></el-skeleton>
            <el-progress v-if="!goodsLoading" :percentage=" offSaleRate " stroke-width="4" color="#f56c6c"
              class="status-progress" />
          </div>
        </div>
      </div>
      <!-- ========== 商品统计区结束 ========== -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { listUsers } from "@/api/userManage";
// ========== 新增：导入商品API ==========
import goodsApi from '@/api/goods'

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["name"]),
    // 用户统计百分比
    normalUserRate()
    {
      return this.totalUser === 0 ? 0 : Math.round((this.normalUser / this.totalUser) * 100);
    },
    disableUserRate()
    {
      return this.totalUser === 0 ? 0 : Math.round((this.disableUser / this.totalUser) * 100);
    },
    // ========== 新增：商品统计百分比 ==========
    onSaleRate()
    {
      return this.totalGoods === 0 ? 0 : Math.round((this.onSaleGoods / this.totalGoods) * 100);
    },
    offSaleRate()
    {
      return this.totalGoods === 0 ? 0 : Math.round((this.offSaleGoods / this.totalGoods) * 100);
    }
  },
  data()
  {
    return {
      // 用户统计数据
      userLoading: true,
      totalUser: 0,
      normalUser: 0,
      disableUser: 0,
      // ========== 新增：商品统计数据 ==========
      goodsLoading: true,
      totalGoods: 0,
      onSaleGoods: 0,
      offSaleGoods: 0
    };
  },
  created()
  {
    this.getUserStatData();
    // ========== 新增：初始化商品统计数据 ==========
    this.getGoodsStatData();
  },
  methods: {
    // 用户统计数据获取
    getUserStatData()
    {
      this.userLoading = true;
      const params = {
        pageNum: 1,
        pageSize: 9999,
        username: "",
        status: "",
      };
      listUsers(params)
        .then((response) =>
        {
          this.userLoading = false;
          if (response.code === 200) {
            const userList = response.data.records || [];
            this.totalUser = response.data.total || 0;
            this.normalUser = userList.filter((item) => item.status === 1).length;
            this.disableUser = userList.filter((item) => item.status === 0).length;
          } else {
            this.$message.error(response.msg || "获取用户统计数据失败");
          }
        })
        .catch((error) =>
        {
          this.userLoading = false;
          this.$message.error("获取用户统计数据失败：" + (error.message || error));
        });
    },
    // ========== 新增：商品统计数据获取 ==========
    getGoodsStatData()
    {
      this.goodsLoading = true;
      // 查询所有商品数据（不分页）
      const params = {
        pageNum: 1,
        pageSize: 9999,
        goodsName: '',
        categoryId: '',
        status: '',
        sortField: 'id',
        sortOrder: 'asc'
      };
      goodsApi.pageGoods(params)
        .then((response) =>
        {
          this.goodsLoading = false;
          if (response.code === 200) {
            const goodsList = response.data.records || [];
            this.totalGoods = response.data.total || 0;
            // 筛选上架/下架商品
            this.onSaleGoods = goodsList.filter((item) => Number(item.status) === 1).length;
            this.offSaleGoods = goodsList.filter((item) => Number(item.status) === 0).length;
          } else {
            this.$message.error(response.msg || "获取商品统计数据失败");
          }
        })
        .catch((error) =>
        {
          this.goodsLoading = false;
          this.$message.error("获取商品统计数据失败：" + (error.message || error));
        });
    }
  },
};
</script>

<style lang="scss" scoped>
/* 取消页面默认红点（通常是浏览器默认样式，重置body/margin） */
body {
  margin: 0;
  padding: 0;
  list-style: none;
  outline: none;
}

.dashboard {
  &-container {
    margin: 30px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* 调整为靠左对齐，适配多模块布局 */
  }

  &-text {
    font-size: 24px;
    line-height: 40px;
    margin-bottom: 30px;
    font-weight: 600;
    color: #303133;
    text-align: center;
    padding: 8px 20px;
    border-radius: 12px;
    background: linear-gradient(120deg, #f0f9ff 0%, #e6f7ff 100%);
    box-shadow: 0 4px 12px rgba(145, 213, 255, 0.2);
    letter-spacing: 1px;
    white-space: nowrap;
    align-self: center;
    /* 欢迎文本保持居中 */
  }
}

/* ========== 新增：统计模块容器，横向排列 ========== */
.stats-wrapper {
  display: flex;
  gap: 20px;
  /* 用户和商品模块之间的间距 */
  flex-wrap: wrap;
  /* 小屏幕自动换行 */
}

/* 统计区：固定大小 */
.stat-section {
  width: 400px;
  margin-bottom: 20px;
}

/* 通用卡片样式：阴影 + 圆角 + 过渡 */
.card-shadow {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb !important;
}

/* hover动效：提升阴影 + 轻微上浮 */
[hover-effect]:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 总数量卡片（通用，用户/商品共用） */
.total-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;

  /* 卡片装饰角标 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #409eff10 0%, #409eff20 100%);
    border-radius: 0 12px 0 100%;
  }

  .total-text {
    font-size: 18px;
    color: #606266;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .total-count {
    font-size: 32px;
    font-weight: 700;
    color: #409eff;
    letter-spacing: 1px;
  }

  .total-skeleton {
    width: 100px;
    height: 32px;
  }
}

/* 底部分栏容器 */
.status-card-row {
  display: flex;
  gap: 8px;
}

/* 状态卡片（通用，用户/商品共用） */
.status-card {
  flex: 1;
  height: 120px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: relative;
  overflow: hidden;

  /* 卡片装饰色条 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    border-radius: 12px 0 0 12px;
  }

  .status-text {
    font-size: 16px;
    color: #606266;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .status-count {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .status-progress {
    width: 85%;
  }

  .status-skeleton {
    width: 80px;
    height: 24px;
  }

  /* 成功状态（正常/上架）装饰色 */
  &.success-card::before {
    background: #67c23a;
  }

  /* 危险状态（禁用/下架）装饰色 */
  &.danger-card::before {
    background: #f56c6c;
  }

  /* 状态数字颜色 */
  &.success-card .status-count {
    color: #67c23a;
  }

  &.danger-card .status-count {
    color: #f56c6c;
  }
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .stats-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .stat-section {
    width: 100%;
    max-width: 400px;
  }
}
</style>
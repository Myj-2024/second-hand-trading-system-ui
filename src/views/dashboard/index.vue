<template>
  <div class="dashboard-container">
    <!-- 欢迎文本（单行显示+字体调整） -->
    <div class="dashboard-text">📦 欢迎登陆二手物品交易管理系统</div>

    <!-- 统计区：靠左固定大小，卡片式布局 -->
    <div class="stat-section">
      <!-- 总用户数卡片（顶部） -->
      <div class="total-card card-shadow" hover-effect>
        <div class="total-text">总用户数</div>
        <div class="total-count" v-if="!loading">{{ totalUser }}人</div>
        <el-skeleton v-else animated :rows=" 1 " class="total-skeleton"></el-skeleton>
      </div>

      <!-- 底部分栏：正常+禁用用户卡片 -->
      <div class="status-card-row">
        <!-- 正常用户卡片 -->
        <div class="status-card success-card card-shadow" hover-effect>
          <div class="status-text">正常</div>
          <div class="status-count" v-if="!loading">{{ normalUser }}人</div>
          <el-skeleton v-else animated :rows=" 1 " class="status-skeleton"></el-skeleton>
          <el-progress v-if="!loading" :percentage=" normalUserRate " stroke-width="4" color="#67c23a"
            class="status-progress" />
          <!-- 已删除：进度条下方的百分比文本 -->
        </div>

        <!-- 禁用用户卡片 -->
        <div class="status-card danger-card card-shadow" hover-effect>
          <div class="status-text">禁用</div>
          <div class="status-count" v-if="!loading">{{ disableUser }}人</div>
          <el-skeleton v-else animated :rows=" 1 " class="status-skeleton"></el-skeleton>
          <el-progress v-if="!loading" :percentage=" disableUserRate " stroke-width="4" color="#f56c6c"
            class="status-progress" />
          <!-- 已删除：进度条下方的百分比文本 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 脚本部分保持不变
import { mapGetters } from "vuex";
import { listUsers } from "@/api/userManage";

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["name"]),
    normalUserRate()
    {
      return this.totalUser === 0 ? 0 : Math.round((this.normalUser / this.totalUser) * 100);
    },
    disableUserRate()
    {
      return this.totalUser === 0 ? 0 : Math.round((this.disableUser / this.totalUser) * 100);
    },
  },
  data()
  {
    return {
      loading: true,
      totalUser: 0,
      normalUser: 0,
      disableUser: 0,
    };
  },
  created()
  {
    this.getUserStatData();
  },
  methods: {
    getUserStatData()
    {
      this.loading = true;
      const params = {
        pageNum: 1,
        pageSize: 9999,
        username: "",
        status: "",
      };
      listUsers(params)
        .then((response) =>
        {
          this.loading = false;
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
          this.loading = false;
          this.$message.error("获取用户统计数据失败：" + (error.message || error));
        });
    },
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
    align-items: center;
    /* 容器内元素居中 */
  }

  // 欢迎标题：单行显示+字体减小
  &-text {
    font-size: 24px;
    /* 字体减小 */
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
    /* 强制单行显示 */
  }
}

/* 统计区：靠左固定大小 */
.stat-section {
  width: 400px;
  margin-bottom: 20px;
  align-self: flex-start;
  /* 统计区保持靠左 */
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

/* 总用户数卡片（顶部） */
.total-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  /* 与底部卡片的间距 */
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
  /* 两个卡片之间的间距 */
}

/* 正常/禁用用户卡片（平分宽度） */
.status-card {
  flex: 1;
  height: 120px;
  /* 加高，和总卡片视觉平衡 */
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
    /* 移除margin-bottom，让进度条更紧凑 */
  }

  .status-skeleton {
    width: 80px;
    height: 24px;
  }

  /* 正常卡片装饰色 */
  &.success-card::before {
    background: #67c23a;
  }

  /* 禁用卡片装饰色 */
  &.danger-card::before {
    background: #f56c6c;
  }

  .success-card & .status-count {
    color: #67c23a;
  }

  .danger-card & .status-count {
    color: #f56c6c;
  }
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .stat-section {
    width: 100%;
    max-width: 400px;
    align-self: center;
    /* 小屏幕下统计区也居中 */
  }
}
</style>
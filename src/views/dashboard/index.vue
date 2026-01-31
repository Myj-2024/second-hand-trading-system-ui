<template>
  <div class="dashboard-container">
    <!-- 欢迎文本 -->
    <div class="dashboard-text">📦 欢迎登陆二手物品交易管理系统</div>

    <!-- 统计区容器：用户+商品+订单（完全不变） -->
    <div class="stats-wrapper">
      <!-- 用户统计 -->
      <div class="stat-section" @click="goToPage('/user/index')">
        <div class="total-card card-shadow" hover-effect>
          <div class="total-text">
            <i class="el-icon-user-solid"></i> 总用户数
          </div>
          <div class="total-count" v-if="!userLoading">{{ totalUser }}人</div>
          <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
        </div>
        <div class="status-card-row">
          <div class="status-card success-card card-shadow" hover-effect>
            <div class="status-text">正常</div>
            <div class="status-count" v-if="!userLoading">{{ normalUser }}人</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="normalUserRate" stroke-width="4" color="#67c23a" class="status-progress" />
          </div>
          <div class="status-card danger-card card-shadow" hover-effect>
            <div class="status-text">禁用</div>
            <div class="status-count" v-if="!userLoading">{{ disableUser }}人</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="disableUserRate" stroke-width="4" color="#f56c6c" class="status-progress" />
          </div>
        </div>
      </div>

      <!-- 商品统计 -->
      <div class="stat-section" @click="goToPage('/goods/index')">
        <div class="total-card card-shadow" hover-effect>
          <div class="total-text">
            <i class="el-icon-s-goods"></i> 总商品数
          </div>
          <div class="total-count" v-if="!goodsLoading">{{ totalGoods }}件</div>
          <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
        </div>
        <div class="status-card-row">
          <div class="status-card success-card card-shadow" hover-effect>
            <div class="status-text">上架中</div>
            <div class="status-count" v-if="!goodsLoading">{{ onSaleGoods }}件</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="onSaleRate" stroke-width="4" color="#67c23a" class="status-progress" />
          </div>
          <div class="status-card danger-card card-shadow" hover-effect>
            <div class="status-text">已下架</div>
            <div class="status-count" v-if="!goodsLoading">{{ offSaleGoods }}件</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="offSaleRate" stroke-width="4" color="#f56c6c" class="status-progress" />
          </div>
        </div>
      </div>

      <!-- 订单统计 -->
      <div class="stat-section order-stat-section" @click="goToPage('/order/index')">
        <div class="total-card card-shadow" hover-effect>
          <div class="total-text">
            <i class="el-icon-s-order"></i> 总订单数
          </div>
          <div class="total-count" v-if="!orderLoading">{{ totalOrder }}单</div>
          <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
        </div>
        <div class="status-card-row order-status-full-row">
          <div class="status-card warning-card card-shadow" hover-effect>
            <div class="status-text">待付款</div>
            <div class="status-count" v-if="!orderLoading">{{ waitPayOrder }}单</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="waitPayRate" stroke-width="4" color="#e6a23c" class="status-progress" />
          </div>
          <div class="status-card info-card card-shadow" hover-effect>
            <div class="status-text">待发货</div>
            <div class="status-count" v-if="!orderLoading">{{ waitShipOrder }}单</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="waitShipRate" stroke-width="4" color="#409eff" class="status-progress" />
          </div>
          <div class="status-card primary-card card-shadow" hover-effect>
            <div class="status-text">待收货</div>
            <div class="status-count" v-if="!orderLoading">{{ waitReceiveOrder }}单</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="waitReceiveRate" stroke-width="4" color="#909399" class="status-progress" />
          </div>
          <div class="status-card success-card card-shadow" hover-effect>
            <div class="status-text">已完成</div>
            <div class="status-count" v-if="!orderLoading">{{ finishOrder }}单</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="finishRate" stroke-width="4" color="#67c23a" class="status-progress" />
          </div>
          <div class="status-card danger-card card-shadow" hover-effect>
            <div class="status-text">已取消</div>
            <div class="status-count" v-if="!orderLoading">{{ cancelOrder }}单</div>
            <el-skeleton v-else animated :rows="1" class="total-skeleton"></el-skeleton>
            <el-progress v-if="!userLoading" :percentage="cancelRate" stroke-width="4" color="#f56c6c" class="status-progress" />
          </div>
        </div>
      </div>
    </div>

    <!-- 下方区域：分类统计 + 留言滚动区域 -->
    <div class="bottom-wrapper">
      <!-- 分类统计区域（占 2/3） -->
      <div class="category-stat-section">
        <!-- 顶部总统计行 -->
        <div class="category-summary-card card-shadow">
          <div class="summary-title">
            <i class="el-icon-menu"></i> 总分类数<span class="text-blue">{{ totalCategory }}</span>个
          </div>
          <div class="summary-desc">
            总商品数<span class="text-blue">{{ totalCategoryGoods }}</span>件，
            上架<span class="text-green">{{ totalCategoryOnlineGoods }}</span>件，
            下架<span class="text-red">{{ totalCategoryOfflineGoods }}</span>件
          </div>
        </div>

        <!-- 分类卡片横向布局 -->
        <div class="category-grid">
          <div
            class="category-item card-shadow"
            hover-effect
            v-for="category in categoryList"
            :key="category.id"
            @click="goToPage('/category/index')"
          >
            <div class="item-name">
              <i class="el-icon-folder-opened"></i> {{ category.categoryName }}
            </div>
            <div class="item-stats">
              总商品<span class="text-blue">{{ category.totalGoodsCount }}</span>件，
              上架<span class="text-green">{{ category.onlineGoodsCount }}</span>件，
              下架<span class="text-red">{{ category.offlineGoodsCount }}</span>件
            </div>
          </div>
        </div>
      </div>

      <!-- 留言滚动区域（占 1/3，高度与分类卡片一致） -->
      <div class="message-scroll-section">
        <div class="message-card card-shadow">
          <div class="message-title">
            <i class="el-icon-chat-line-round"></i> 用户留言
          </div>
          <!-- 滚动容器（高度固定120px，与分类卡片一致） -->
          <div class="scroll-container" ref="scrollContainer">
            <div class="scroll-content" ref="scrollContent">
              <div class="message-item" v-for="item in messageList" :key="item.id">
                <div class="message-user">
                  <span class="user-name">{{ item.fromUserName }}</span>
                  <span class="order-no">订单：{{ item.orderNo }}</span>
                </div>
                <div class="message-content">{{ item.content }}</div>
                <div class="message-time">{{ item.createTime }}</div>
              </div>
              <!-- 重复渲染（实现循环滚动） -->
              <div class="message-item" v-for="item in messageList" :key="`clone-${item.id}`">
                <div class="message-user">
                  <span class="user-name">{{ item.fromUserName }}</span>
                  <span class="order-no">订单：{{ item.orderNo }}</span>
                </div>
                <div class="message-content">{{ item.content }}</div>
                <div class="message-time">{{ item.createTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { listUsers } from "@/api/userManage";
import goodsApi from '@/api/goods'
import orderApi from '@/api/order'
import categoryApi from '@/api/category'
import messageApi from '@/api/message' // 引入留言接口

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["name"]),
    // 用户统计百分比
    normalUserRate() {
      return this.totalUser === 0 ? 0 : Math.round((this.normalUser / this.totalUser) * 100);
    },
    disableUserRate() {
      return this.totalUser === 0 ? 0 : Math.round((this.disableUser / this.totalUser) * 100);
    },
    // 商品统计百分比
    onSaleRate() {
      return this.totalGoods === 0 ? 0 : Math.round((this.onSaleGoods / this.totalGoods) * 100);
    },
    offSaleRate() {
      return this.totalGoods === 0 ? 0 : Math.round((this.offSaleGoods / this.totalGoods) * 100);
    },
    // 订单统计百分比
    waitPayRate() {
      return this.totalOrder === 0 ? 0 : Math.round((this.waitPayOrder / this.totalOrder) * 100);
    },
    waitShipRate() {
      return this.totalOrder === 0 ? 0 : Math.round((this.waitShipOrder / this.totalOrder) * 100);
    },
    waitReceiveRate() {
      return this.totalOrder === 0 ? 0 : Math.round((this.waitReceiveOrder / this.totalOrder) * 100);
    },
    finishRate() {
      return this.totalOrder === 0 ? 0 : Math.round((this.finishOrder / this.totalOrder) * 100);
    },
    cancelRate() {
      return this.totalOrder === 0 ? 0 : Math.round((this.cancelOrder / this.totalOrder) * 100);
    }
  },
  data() {
    return {
      // 用户/商品/订单统计（完全不变）
      userLoading: true,
      totalUser: 0,
      normalUser: 0,
      disableUser: 0,
      goodsLoading: true,
      totalGoods: 0,
      onSaleGoods: 0,
      offSaleGoods: 0,
      orderLoading: true,
      totalOrder: 0,
      waitPayOrder: 0,
      waitShipOrder: 0,
      waitReceiveOrder: 0,
      finishOrder: 0,
      cancelOrder: 0,
      // 分类统计数据
      categoryLoading: true,
      totalCategory: 0,
      categoryList: [],
      totalCategoryGoods: 0,
      totalCategoryOnlineGoods: 0,
      totalCategoryOfflineGoods: 0,
      // 留言数据
      messageList: [],
      scrollTimer: null // 滚动定时器
    };
  },
  created() {
    this.getUserStatData();
    this.getGoodsStatData();
    this.getOrderStatData();
    this.getCategoryStatData();
    this.getMessageList(); // 获取留言数据
  },
  mounted() {
    // 等待DOM渲染完成后启动滚动
    this.$nextTick(() => {
      this.startScroll();
    });
  },
  beforeDestroy() {
    // 清除定时器
    if (this.scrollTimer) clearInterval(this.scrollTimer);
  },
  methods: {
    goToPage(path) {
      this.$router.push(path);
    },

    // 用户统计
    getUserStatData() {
      this.userLoading = true;
      const params = { pageNum: 1, pageSize: 9999, username: "", status: "" };
      listUsers(params)
        .then((response) => {
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
        .catch((error) => {
          this.userLoading = false;
          this.$message.error("获取用户统计数据失败：" + (error.message || error));
        });
    },

    // 商品统计
    getGoodsStatData() {
      this.goodsLoading = true;
      const params = { pageNum: 1, pageSize: 9999, goodsName: '', categoryId: '', status: '' };
      goodsApi.pageGoods(params)
        .then((response) => {
          this.goodsLoading = false;
          if (response.code === 200) {
            const goodsList = response.data.records || [];
            this.totalGoods = response.data.total || 0;
            this.onSaleGoods = goodsList.filter((item) => Number(item.status) === 1).length;
            this.offSaleGoods = goodsList.filter((item) => Number(item.status) === 0).length;
          } else {
            this.$message.error(response.msg || "获取商品统计数据失败");
          }
        })
        .catch((error) => {
          this.goodsLoading = false;
          this.$message.error("获取商品统计数据失败：" + (error.message || error));
        });
    },

    // 订单统计
    getOrderStatData() {
      this.orderLoading = true;
      const params = { pageNum: 1, pageSize: 9999, orderNo: '', status: '' };
      orderApi.pageOrder(params)
        .then((response) => {
          this.orderLoading = false;
          if (response.code === 200) {
            const orderList = response.data.records || [];
            this.totalOrder = response.data.total || 0;
            this.waitPayOrder = orderList.filter((item) => Number(item.status) === 0).length;
            this.waitShipOrder = orderList.filter((item) => Number(item.status) === 1).length;
            this.waitReceiveOrder = orderList.filter((item) => Number(item.status) === 2).length;
            this.finishOrder = orderList.filter((item) => Number(item.status) === 3).length;
            this.cancelOrder = orderList.filter((item) => Number(item.status) === 4).length;
          } else {
            this.$message.error(response.msg || "获取订单统计数据失败");
          }
        })
        .catch((error) => {
          this.orderLoading = false;
          this.$message.error("获取订单统计数据失败：" + (error.message || error));
        });
    },

    // 分类统计
    getCategoryStatData() {
      this.categoryLoading = true;
      this.totalCategoryGoods = 0;
      this.totalCategoryOnlineGoods = 0;
      this.totalCategoryOfflineGoods = 0;

      const params = { pageNum: 1, pageSize: 9999, categoryName: '' };
      categoryApi.pageCategory(params)
        .then((response) => {
          if (response.code === 200) {
            this.categoryList = (response.data.records || []).map(item => ({
              ...item,
              totalGoodsCount: 0,
              onlineGoodsCount: 0,
              offlineGoodsCount: 0
            }));
            this.totalCategory = response.data.total || 0;

            this.categoryList.forEach(category => {
              goodsApi.pageGoods({
                categoryId: category.id,
                pageNum: 1,
                pageSize: 9999,
                isDeleted: 0
              }).then(res => {
                const goodsList = res.data.records || [];
                category.totalGoodsCount = goodsList.length;
                category.onlineGoodsCount = goodsList.filter(g => g.status === 1).length;
                category.offlineGoodsCount = goodsList.filter(g => g.status === 0).length;

                this.totalCategoryGoods += category.totalGoodsCount;
                this.totalCategoryOnlineGoods += category.onlineGoodsCount;
                this.totalCategoryOfflineGoods += category.offlineGoodsCount;
              }).catch(err => {
                console.warn(`统计分类${category.categoryName}失败：`, err);
                category.totalGoodsCount = 0;
                category.onlineGoodsCount = 0;
                category.offlineGoodsCount = 0;
              });
            });
          }
          this.categoryLoading = false;
        })
        .catch((error) => {
          this.categoryLoading = false;
          this.$message.error("获取分类统计失败：" + error.message);
        });
    },

    // 获取留言数据（和留言页面逻辑一致）
    getMessageList() {
      const params = {
        pageNum: 1,
        pageSize: 5, // 显示5条留言（可调整）
        orderNo: '',
        fromUserName: '',
        toUserName: ''
      };
      messageApi.pageMessage(params).then(res => {
        this.messageList = (res.data.records || []).map(item => ({
          ...item,
          id: item.id || '',
          orderNo: item.orderNo || '无订单编号',
          fromUserName: item.fromUserName || '未知用户',
          content: item.content || '无留言内容',
          createTime: item.createTime || ''
        }));
        // 重新启动滚动
        this.$nextTick(() => {
          this.startScroll();
        });
      }).catch(err => {
        this.$message.error('获取留言失败：' + (err.message || '网络异常'));
      });
    },

    // 启动无缝循环滚动（仅修改此方法，其他不变）
    startScroll() {
      // 清除原有定时器
      if (this.scrollTimer) clearInterval(this.scrollTimer);
      if (this.messageList.length === 0) return;

      const container = this.$refs.scrollContainer;
      const content = this.$refs.scrollContent;
      if (!container || !content) return;

      let scrollTop = 0;
      const itemHeight = 100; // 每条留言高度，与分类卡片一致
      const originalHeight = this.messageList.length * itemHeight; // 原始留言列表高度（关键：无缝衔接的阈值）

      this.scrollTimer = setInterval(() => {
        scrollTop += 1;
        // 核心修改：滚动到原始列表高度时，瞬间重置scrollTop为0（视觉上无缝衔接，无卡顿）
        // 因为我们重复渲染了留言列表，重置后用户看不到跳转痕迹
        if (scrollTop >= originalHeight) {
          scrollTop = 0;
          // 取消过渡效果，避免重置时出现滑动动画
          content.style.transition = 'none';
          content.style.transform = `translateY(-${scrollTop}px)`;
          // 下一帧恢复过渡效果，保证后续滚动平滑
          requestAnimationFrame(() => {
            content.style.transition = 'transform 0.1s linear';
          });
        } else {
          content.style.transform = `translateY(-${scrollTop}px)`;
        }
      }, 40); // 滚动速度（数值越小越快）
    }
  }
};
</script>

<style scoped>
/* 原有样式完全不动 */
.dashboard-container {
  margin: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.dashboard-text {
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
}
.stats-wrapper {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
}
.stat-section {
  width: 400px;
  margin-bottom: 20px;
  cursor: pointer;
}
.card-shadow {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb !important;
}
[hover-effect]:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
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
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #409eff10 0%, #409eff20 100%);
  }
  .total-text {
    font-size: 18px;
    color: #606266;
    margin-bottom: 12px;
    font-weight: 500;
    i {
      margin-right: 6px;
      color: #409eff;
    }
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
.status-card-row {
  display: flex;
  gap: 8px;
}
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
  &.success-card::before {
    background: #67c23a;
  }
  &.danger-card::before {
    background: #f56c6c;
  }
  &.success-card .status-count {
    color: #67c23a;
  }
  &.danger-card .status-count {
    color: #f56c6c;
  }
}
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
.order-stat-section {
  width: auto;
  flex: 1;
  min-width: 400px;
}
.order-status-full-row {
  margin-bottom: 0;
}
.status-card.warning-card::before {
  background: #e6a23c;
}
.status-card.warning-card .status-count {
  color: #e6a23c;
}
.status-card.info-card::before {
  background: #409eff;
}
.status-card.info-card .status-count {
  color: #409eff;
}
.status-card.primary-card::before {
  background: #909399;
}
.status-card.primary-card .status-count {
  color: #909399;
}

/* 下方区域：分类统计占2/3，留言占1/3 */
.bottom-wrapper {
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}
.category-stat-section {
  flex: 2;
  display: flex;
  flex-direction: column;
}
.category-summary-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 10px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #409eff10 0%, #409eff20 100%);
  }
  .summary-title {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 8px;
    i {
      margin-right: 6px;
      color: #409eff;
    }
  }
  .summary-desc {
    font-size: 16px;
    color: #606266;
  }
}
.category-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.category-item {
  flex: 1;
  min-width: 280px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 15px;
  text-align: center;
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  .item-name {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
    i {
      margin-right: 6px;
      color: #409eff;
    }
  }
  .item-stats {
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

/* 留言滚动区域样式（高度与分类卡片一致） */
.message-scroll-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.message-card {
  background: #fff;
  border-radius: 12px;
  height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.message-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  i {
    margin-right: 8px;
    color: #409eff;
  }
}
.scroll-container {
  flex: 1;
  overflow: hidden;
  padding: 0 20px;
  position: relative;
  /* 高度与分类卡片一致 */
  height: 120px;
}
.scroll-content {
  width: 100%;
  transition: transform 0.1s linear;
}
.message-item {
  padding: 15px 0;
  border-bottom: 1px dashed #f0f0f0;
  height: 120px;
  box-sizing: border-box;
}
.message-user {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  .order-no {
    font-size: 12px;
    color: #909399;
  }
}
.message-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.message-time {
  font-size: 12px;
  color: #909399;
}

/* 文字颜色样式（与系统统一） */
.text-blue {
  color: #409eff;
  font-weight: 700;
}
.text-green {
  color: #67c23a;
  font-weight: 700;
}
.text-red {
  color: #f56c6c;
  font-weight: 700;
}
</style>

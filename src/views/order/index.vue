<template>
  <div class="app-container">
    <!-- 搜索表单（仅修改成交价格输入框的 controls 属性） -->
    <el-form :inline="true" :model="queryParams" class="search-form" @submit.prevent>
      <el-form-item label="订单编号">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable style="width: 200px">
          <el-option label="待付款" value="0" />
          <el-option label="待发货" value="1" />
          <el-option label="待收货" value="2" />
          <el-option label="已完成" value="3" />
          <el-option label="已取消" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="成交价格">
        <!-- 取消步进按钮：添加 controls="false" -->
        <el-input v-model="queryParams.minPrice" placeholder="最低价格" clearable style="width: 150px" type="number"  align="center" />
        <span style="margin: 0 5px">-</span>
        <!-- 取消步进按钮：添加 controls="false" -->
        <el-input v-model="queryParams.maxPrice" placeholder="最高价格" clearable style="width: 150px" type="number"  align="center"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getList()">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 订单列表（完全不变） -->
    <el-table v-loading="loading" :data="orderList" border fit highlight-current-row style="width: 100%;" >
      <el-table-column label="订单ID" prop="id" width="80" align="center" />
      <el-table-column label="订单编号" prop="orderNo" width="180" align="center" />
      <el-table-column label="商品ID" prop="goodsId" width="120" align="center" />
      <el-table-column label="买家ID" prop="buyerId" width="120" align="center" />
      <el-table-column label="卖家ID" prop="sellerId" width="120" align="center" />
      <el-table-column label="成交价格" prop="price" width="150" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" prop="status" width="150" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.statusDesc || getStatusDesc(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
      <el-table-column label="操作" width="380" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-view" @click="handleView(scope.row)">查看详情</el-button>
          <el-button size="mini" type="success" icon="el-icon-edit" @click="handleUpdateStatus(scope.row)" style="margin-left: 10px;">修改状态</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件（完全不变） -->
    <el-pagination
      v-show="total > 0"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 订单详情弹窗（完全不变） -->
    <el-dialog :title="'订单详情（编号：' + currentOrder.orderNo + '）'" :visible.sync="dialogOpen" width="600px" append-to-body>
      <el-table :data="[currentOrderDetail]" border fit style="width: 100%;" v-if="currentOrderDetail">
        <el-table-column label="商品快照信息" align="center" min-width="400">
          <template slot-scope="scope">
            <div class="goods-info-wrap">
              <div class="goods-info-item">
                <span class="label">商品名称：</span>
                <span class="value">{{ scope.row.goodsName || '暂无' }}</span>
              </div>
              <div class="goods-info-item">
                <span class="label">商品图片：</span>
                <div class="img-container">
                  <el-image
                    v-if="scope.row.goodsImage"
                    :src="scope.row.goodsImage"
                    style="width: 80px; height: 80px; object-fit: cover;"
                    preview-src-list="[scope.row.goodsImage]"
                    fit="cover"
                  />
                  <span v-else class="no-img">暂无图片</span>
                </div>
              </div>
              <div class="goods-info-item">
                <span class="label">成交价格：</span>
                <span class="value price">{{ scope.row.price || '0.00' }}</span>
              </div>
              <div class="goods-info-item">
                <span class="label">详情ID：</span>
                <span class="value">{{ scope.row.id || '暂无' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改订单状态弹窗（完全不变） -->
    <el-dialog title="修改订单状态" :visible.sync="statusDialogOpen" width="400px" append-to-body>
      <el-form label-width="80px" :model="statusForm">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTagType(statusForm.oldStatus)">{{ getStatusDesc(statusForm.oldStatus) }}</el-tag>
        </el-form-item>
        <el-form-item label="目标状态" required>
          <el-select v-model="statusForm.newStatus" placeholder="请选择目标状态" clearable style="width: 200px">
            <el-option label="待付款" value="0" />
            <el-option label="待发货" value="1" />
            <el-option label="待收货" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已取消" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="statusDialogOpen = false">取 消</el-button>
        <el-button type="primary" @click="confirmUpdateStatus">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import orderApi from '@/api/order'

export default {
  name: 'OrderManagement',
  data() {
    return {
      loading: false,
      total: 0,
      orderList: [],
      dialogOpen: false,
      currentOrder: {},
      currentOrderDetail: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        status: '',
        minPrice: '',
        maxPrice: ''
      },
      statusDialogOpen: false,
      statusForm: {
        orderId: '',
        oldStatus: '',
        newStatus: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      orderApi.pageOrder(this.queryParams).then(res => {
        const formattedOrders = (res.data.records || []).map(item => ({
          ...item,
          id: item.id || '',
          orderNo: item.orderNo || item.order_no || '',
          goodsId: item.goodsId || item.goods_id || '',
          buyerId: item.buyerId || item.buyer_id || '',
          sellerId: item.sellerId || item.seller_id || '',
          price: item.price || '0.00',
          status: item.status !== undefined ? Number(item.status) : 0,
          statusDesc: item.statusDesc || item.status_desc || '',
          createTime: item.createTime || item.create_time || '',
          updateTime: item.updateTime || item.update_time || ''
        }))
        this.orderList = formattedOrders
        this.total = res.data.total || 0
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$message.error('查询订单失败：' + err.message)
      })
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        status: '',
        minPrice: '',
        maxPrice: ''
      }
      this.getList()
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    handleView(row) {
      this.currentOrder = row
      this.currentOrderDetail = {}
      orderApi.getOrderDetail(row.id).then(res => {
        this.currentOrderDetail = {
          id: res.data.id || '',
          goodsName: res.data.goodsName || res.data.goods_name || '暂无',
          goodsImage: res.data.goodsImage || res.data.goods_image || '',
          price: res.data.price || '0.00'
        }
        this.dialogOpen = true
      }).catch(err => {
        this.$message.error('查询订单详情失败：' + err.message)
      })
    },
    getStatusTagType(status) {
      switch (Number(status)) {
        case 0: return 'warning'
        case 1: return 'info'
        case 2: return 'primary'
        case 3: return 'success'
        case 4: return 'danger'
        default: return 'default'
      }
    },
    getStatusDesc(status) {
      switch (Number(status)) {
        case 0: return '待付款'
        case 1: return '待发货'
        case 2: return '待收货'
        case 3: return '已完成'
        case 4: return '已取消'
        default: return '未知状态'
      }
    },
    handleUpdateStatus(row) {
      this.statusForm = {
        orderId: row.id,
        oldStatus: row.status,
        newStatus: ''
      }
      this.statusDialogOpen = true
    },
    confirmUpdateStatus() {
      if (!this.statusForm.newStatus && this.statusForm.newStatus !== 0) {
        this.$message.warning('请选择目标订单状态')
        return
      }
      orderApi.updateOrderStatus(this.statusForm.newStatus, this.statusForm.orderId).then(res => {
        this.$message.success('订单状态修改成功')
        this.statusDialogOpen = false
        this.getList()
      }).catch(err => {
        this.$message.error('订单状态修改失败：' + err.message)
      })
    }
  }
}
</script>

<style scoped>
/* 原有样式保持不变，新增以下 CSS */
/* 隐藏数字输入框的步进按钮（Chrome/Safari） */
::v-deep input[type="number"]::-webkit-outer-spin-button,
::v-deep input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* 隐藏数字输入框的步进按钮（Firefox） */
::v-deep input[type="number"] {
  -moz-appearance: textfield;
}

/* 原有样式（以下完全不变） */
.app-container {
  padding: 20px;
  min-width: 1000px;
}

.el-table {
  --el-table-row-hover-bg-color: #f8fafc;
  --el-table-border-color: #e2e8f0;
  font-size: 12px;
  margin-top: 10px;
}

.el-pagination {
  margin-top: 20px;
  padding: 5px 0;
  text-align: right;
  font-size: 10px;
}

.search-form {
  background: #f5f5f5;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-footer {
  text-align: center;
}

.goods-info-wrap {
  padding: 10px 0;
  font-size: 14px;
}

.goods-info-item {
  margin-bottom: 12px;
  line-height: 1.8;
  display: flex;
  align-items: flex-start;
}

.label {
  color: #666;
  font-weight: 500;
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 10px;
  flex-shrink: 0;
}

.value {
  color: #333;
  flex: 1;
}

.price {
  color: #ff4d4f;
  font-weight: 600;
}

.img-container {
  flex: 1;
}

.no-img {
  color: #999;
  line-height: 80px;
}

/deep/ .el-image {
  border-radius: 4px;
  transition: transform 0.2s ease;
}

/deep/ .el-image:hover {
  transform: scale(1.05);
}
</style>

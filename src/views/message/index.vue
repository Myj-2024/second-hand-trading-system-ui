<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="queryParams" class="search-form" @submit.prevent>
      <el-form-item label="订单编号">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="发送人用户名">
        <el-input
          v-model="queryParams.fromUserName"
          placeholder="请输入发送人用户名"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="接收人用户名">
        <el-input
          v-model="queryParams.toUserName"
          placeholder="请输入接收人用户名"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getList()">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="messageList"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 15px"
    >
      <el-table-column label="留言ID" prop="id" width="100" align="center" />
      <el-table-column label="订单ID" prop="orderId" width="100" align="center" />
      <el-table-column label="订单编号" prop="orderNo" width="250" align="center" />
      <el-table-column label="发送人ID" prop="fromUserId" width="100" align="center" />
      <el-table-column label="发送人用户名" prop="fromUserName" width="150" align="center" />
      <el-table-column label="接收人ID" prop="toUserId" width="100" align="center" />
      <el-table-column label="接收人用户名" prop="toUserName" width="150" align="center" />
      <el-table-column label="留言内容" prop="content" width="400" align="left">
        <template slot-scope="scope">
          <span title="点击查看完整内容" @mouseenter="showFullContent(scope.row.content)">
            {{ scope.row.content.length > 50 ? scope.row.content.slice(0, 50) + '...' : scope.row.content }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="200" align="center" />
    </el-table>

    <!-- 分页组件 -->
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
  </div>
</template>

<script>
import messageApi from '@/api/message'

export default {
  name: 'MessageManagement',
  data() {
    return {
      // 加载状态
      loading: false,
      // 总条数
      total: 0,
      // 留言列表数据
      messageList: [],
      // 查询参数（匹配后端MessagePageQueryDTO）
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        fromUserName: '',
        toUserName: ''
      }
    }
  },
  created() {
    // 页面加载时查询数据
    this.getList()
  },
  methods: {
    /**
     * 获取留言列表数据
     */
    getList() {
      this.loading = true
      messageApi.pageMessage(this.queryParams).then(res => {
        // 格式化返回数据，兼容字段格式
        this.messageList = (res.data.records || []).map(item => ({
          ...item,
          id: item.id || '',
          orderId: item.orderId || '',
          orderNo: item.orderNo || '无订单编号',
          fromUserId: item.fromUserId || '',
          fromUserName: item.fromUserName || '未知用户',
          toUserId: item.toUserId || '',
          toUserName: item.toUserName || '未知用户',
          content: item.content || '',
          createTime: item.createTime || ''
        }))
        // 赋值总条数
        this.total = res.data.total || 0
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$message.error('查询留言列表失败：' + (err.message || '网络异常'))
      })
    },

    /**
     * 重置查询条件
     */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        fromUserName: '',
        toUserName: ''
      }
      this.getList()
    },

    /**
     * 查看完整留言内容（可选）
     */
    showFullContent(content) {
      this.$message.info({
        message: content || '该留言无内容',
        duration: 3000
      })
    },

    /**
     * 每页条数改变
     */
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },

    /**
     * 当前页码改变
     */
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  min-width: 1000px;
}

.search-form {
  background: #f5f5f5;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-table {
  --el-table-row-hover-bg-color: #f8fafc;
  --el-table-border-color: #e2e8f0;
  font-size: 12px;
}

.el-pagination {
  font-size: 12px;
}
</style>

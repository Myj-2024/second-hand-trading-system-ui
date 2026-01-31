<template>
  <div class="app-container">
    <!-- 搜索表单：在重置按钮左侧添加查询按钮 -->
    <el-form :inline="true" :model="queryParams" class="search-form" @submit.prevent>
      <el-form-item label="分类名称">
        <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="全部" value="" />
          <el-option label="上架中" value="1" />
          <el-option label="已下架" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <!-- 新增：查询按钮 -->
        <el-button type="primary" icon="el-icon-search" @click="handleQuery()">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery()">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd()">新增分类</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域：无变更 -->
    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange" border fit
              highlight-current-row ref="categoryTable" style="width: 100%;">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分类ID" prop="id" width="80" align="center" />
      <el-table-column label="分类名称" prop="categoryName" width="200" align="center"/>
      <el-table-column label="商品总数" prop="totalGoodsCount" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.totalGoodsCount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="上架数" prop="onlineGoodsCount" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.onlineGoodsCount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="下架数" prop="offlineGoodsCount" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.offlineGoodsCount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="450">
        <template slot-scope="scope">
          <div style="display: flex; gap: 6px;">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleSingleDelete(scope.row.id)">删除</el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-circle-check"
              @click="handleBatchOperateGoods(scope.row, 1)"
              :loading="scope.row.statusLoading"
              :disabled="scope.row.offlineGoodsCount === 0"
            >
              一键上架
            </el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-circle-close"
              @click="handleBatchOperateGoods(scope.row, 0)"
              :loading="scope.row.statusLoading"
              :disabled="scope.row.onlineGoodsCount === 0"
            >
              一键下架
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件：无变更 -->
    <el-pagination v-show="total > 0" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize"
                   :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                   @current-change="handleCurrentChange" style="margin-top: 20px; text-align: right; min-width: 1400px;" />

    <!-- 新增/编辑弹窗：无变更 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="categoryForm" :model="categoryForm" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm()">确 定</el-button>
        <el-button @click="cancel()">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import categoryApi from '@/api/category'
import goodsApi from '@/api/goods'

export default {
  name: 'CategoryManagement',
  components: {},
  data() {
    return {
      loading: false,
      total: 0,
      categoryList: [],
      multipleSelection: [],
      open: false,
      title: '',
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryName: '',
        status: '',
        sortField: 'id',
        sortOrder: 'asc'
      },
      categoryForm: {
        id: '',
        categoryName: ''
      },
      rules: {
        categoryName: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' },
          { max: 30, message: '分类名称长度不能超过30个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * 新增：查询按钮对应的方法（复用getList）
     */
    handleQuery() {
      this.queryParams.pageNum = 1 // 查询时重置页码为1
      this.getList()
    },

    /**
     * 获取分类列表：无变更
     */
    getList() {
      this.loading = true
      categoryApi.pageCategory(this.queryParams).then(res => {
        const categoryRecords = (res.data.records || []).map(item => ({
          ...item,
          createTime: item.create_time || item.createTime || '',
          updateTime: item.update_time || item.updateTime || '',
          statusLoading: false,
          totalGoodsCount: 0,
          onlineGoodsCount: 0,
          offlineGoodsCount: 0
        })).sort((a, b) => a.id - b.id)

        this.categoryList = categoryRecords
        this.total = res.data.total || 0
        this.loading = false
        this.calcCategoryGoodsStats()
      }).catch(err => {
        this.loading = false
        this.$message.error('查询失败：' + err.message)
      })
    },

    // 计算统计数据：无变更
    calcCategoryGoodsStats() {
      if (this.categoryList.length === 0) return
      this.categoryList.forEach(category => {
        goodsApi.pageGoods({
          categoryId: category.id,
          pageNum: 1,
          pageSize: 9999,
          isDeleted: 0
        }).then(res => {
          const goodsList = res.data.records || []
          category.totalGoodsCount = goodsList.length
          category.onlineGoodsCount = goodsList.filter(g => g.status === 1).length
          category.offlineGoodsCount = goodsList.filter(g => g.status === 0).length
        }).catch(err => {
          console.warn(`计算分类${category.categoryName}的商品统计失败：`, err)
          category.totalGoodsCount = 0
          category.onlineGoodsCount = 0
          category.offlineGoodsCount = 0
        })
      })
    },

    // 重置查询条件：无变更
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        categoryName: '',
        status: '',
        sortField: 'id',
        sortOrder: 'asc'
      }
      this.getList()
    },

    // 新增分类：无变更
    handleAdd() {
      this.open = true
      this.title = '新增分类'
      this.categoryForm = {
        id: '',
        categoryName: ''
      }
      this.$nextTick(() => {
        if (this.$refs.categoryForm) this.$refs.categoryForm.resetFields()
      })
    },

    // 编辑分类：无变更
    handleEdit(row) {
      this.open = true
      this.title = '编辑分类'
      this.categoryForm = {
        ...row,
      }
    },

    // 提交表单：无变更
    submitForm() {
      this.$refs.categoryForm.validate(valid => {
        if (valid) {
          const submitData = {
            ...this.categoryForm
          }
          const submitPromise = this.categoryForm.id
            ? categoryApi.updateCategory(submitData)
            : categoryApi.addCategory(submitData)

          submitPromise.then(res => {
            this.$message.success(this.categoryForm.id ? '修改成功！' : '新增成功！')
            this.open = false
            this.getList()
          }).catch(err => {
            this.$message.error((this.categoryForm.id ? '修改' : '新增') + '失败：' + err.message)
          })
        }
      })
    },

    // 以下方法完全不变
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id)
    },
    handleSingleDelete(id) {
      this.$confirm('是否确认删除该分类？删除后关联商品不会被删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        categoryApi.deleteCategory([id]).then(res => {
          this.$message.success('删除成功！')
          this.getList()
        }).catch(err => {
          const errorMsg = err.response?.data?.message || '删除失败'
          this.$message.error(errorMsg)
        })
      })
    },
    handleBatchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的分类')
        return
      }
      this.$confirm('是否确认删除选中的分类？', '提示', {
        type: 'warning'
      }).then(() => {
        categoryApi.deleteCategory(this.multipleSelection).then(res => {
          this.$message.success('删除成功！')
          this.getList()
          this.$refs.categoryTable.clearSelection()
        }).catch(err => {
          const errorMsg = err.response?.data?.message || '删除失败'
          this.$message.error(errorMsg)
        })
      })
    },
    handleBatchOperateGoods(row, targetStatus) {
      const operateText = targetStatus === 1 ? '上架' : '下架';
      const goodsCount = targetStatus === 1 ? row.offlineGoodsCount : row.onlineGoodsCount;
      const goodsStatusText = targetStatus === 1 ? '下架' : '上架';

      if (goodsCount === 0) {
        this.$message.warning(`该分类下暂无${goodsStatusText}商品，无需${operateText}`)
        return
      }

      this.$confirm(`是否确认${operateText}该分类下的${goodsCount}个${goodsStatusText}商品？`, '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.statusLoading = true;
        categoryApi.batchOperateCategoryGoods(row.id, targetStatus).then(res => {
          this.$message.success(`${operateText}成功！共操作${goodsCount}个商品`);
          row.statusLoading = false;
          this.calcCategoryGoodsStats();
        }).catch(err => {
          this.$message.error(`${operateText}失败：` + (err.message || '系统异常'));
          row.statusLoading = false;
        })
      })
    },
    cancel() {
      this.open = false
      if (this.$refs.categoryForm) {
        this.$refs.categoryForm.resetFields()
      }
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    }
  }
}
</script>

<style scoped>
/* 样式部分完全不变 */
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

.el-table-column--label-操作 {
  min-width: 400px !important;
}
</style>

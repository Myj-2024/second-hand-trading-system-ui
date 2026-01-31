<template>
  <div class="app-container">
    <el-form :inline=" true " :model=" queryParams " class="search-form" @submit.prevent>
      <el-form-item label="商品名称">
        <el-input v-model=" queryParams.goodsName " placeholder="请输入商品名称" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="商品分类">
        <el-select v-model=" queryParams.categoryId " placeholder="请选择分类" clearable style="width: 200px">
          <el-option v-for="category in categoryList" :key=" category.id " :label=" category.categoryName "
                     :value=" category.id " />
        </el-select>
      </el-form-item>
      <el-form-item label="商品状态">
        <el-select v-model=" queryParams.status " placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="上架中" value="1" />
          <el-option label="已下架" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getList()">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery()">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter=" 10 " class="mb8">
      <el-col :span=" 1.5 ">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd()">新增</el-button>
      </el-col>
      <el-col :span=" 1.5 ">
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete()"
                   :disabled=" multipleSelection.length === 0 ">批量删除</el-button>
      </el-col>
    </el-row>

    <el-table v-fit-columns v-loading=" loading " :data=" goodsList " @selection-change=" handleSelectionChange " border fit
              highlight-current-row ref="goodsTable" style="width: 100%;">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="商品ID" prop="id" width="60" align="center" />
      <el-table-column label="商品名称" prop="goodsName" width="200" align="center"/>
      <el-table-column label="商品分类" prop="categoryName" width="80" align="center" />
      <el-table-column label="商品价格" prop="price" width="80" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="原价" prop="originalPrice" width="80" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.originalPrice || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="商品描述" prop="goodsDesc" width="400" />
      <el-table-column label="商品图片" width="120" align="center">
        <template slot-scope="scope">
          <img :src=" scope.row.goodsImages && scope.row.goodsImages.trim() ? scope.row.goodsImages : '/default-goods.png' "
               class="table-img" alt="商品图片" @error=" handleImageError " />
        </template>
      </el-table-column>
      <el-table-column label="商品状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type=" scope.row.status === 1 ? 'success' : 'danger' ">
            {{ scope.row.status === 1 ? '上架中' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="90" align="center" />
      <el-table-column label="更新时间" prop="updateTime" width="90" align="center" />
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <div style="display: flex; flex-wrap: wrap; gap: 3px;">
            <el-button size="mini" type="primary" icon="el-icon-edit"
                       @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete"
                       @click="handleSingleDelete(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-refresh"
                       @click="handleStatusChange(scope.row)" :loading=" scope.row.statusLoading ">
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-show=" total > 0 " :current-page=" queryParams.pageNum " :page-size=" queryParams.pageSize "
                   :total=" total " layout="total, sizes, prev, pager, next, jumper" @size-change=" handleSizeChange "
                   @current-change=" handleCurrentChange " style="margin-top: 20px; text-align: right; min-width: 1400px;" />

    <el-dialog :title=" title " :visible.sync=" open " width="800px" append-to-body>
      <el-form ref="goodsForm" :model=" goodsForm " :rules=" rules " label-width="100px">
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model=" goodsForm.goodsName " placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model=" goodsForm.categoryId " placeholder="请选择商品分类">
            <el-option v-for="category in categoryList" :key=" category.id "
                       :label=" category.categoryName " :value=" category.id " />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model=" goodsForm.price " placeholder="请输入商品价格" type="number" step="0.01" min="0.01"
                    @blur=" formatPrice " />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input v-model=" goodsForm.originalPrice " placeholder="请输入原价" type="number" step="0.01"
                    min="0" />
        </el-form-item>
        <el-form-item label="商品描述" prop="goodsDesc">
          <el-input v-model=" goodsForm.goodsDesc " placeholder="请输入商品描述" type="textarea" :rows=" 5 " />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload class="img-uploader" :show-file-list=" false " :before-upload=" beforeImgUpload "
                     :http-request=" uploadImg " :loading=" imageUploadLoading ">
            <img v-if="goodsForm.goodsImages" :src=" goodsForm.goodsImages " class="upload-img" />
            <i v-else class="el-icon-plus upload-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model=" goodsForm.status ">
            <el-radio label="1">上架中</el-radio>
            <el-radio label="0">已下架</el-radio>
          </el-radio-group>
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
import goodsApi from '@/api/goods'
// 1. 引入分类API（和分类管理页面使用同一个）
import categoryApi from '@/api/category'

export default {
  name: 'GoodsManagement',
  components: {},
  data()
  {
    return {
      loading: false,
      total: 0,
      goodsList: [],
      multipleSelection: [],
      open: false,
      title: '',
      categoryList: [], // 改为空数组，不再初始化模拟数据
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: '',
        categoryId: '',
        status: '',
        sortField: 'id',
        sortOrder: 'asc'
      },
      goodsForm: {
        id: '',
        goodsName: '',
        categoryId: '',
        price: '',
        originalPrice: '',
        goodsDesc: '',
        goodsImages: '',
        status: "1"
      },
      imageUploadLoading: false,
      rules: {
        goodsName: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '商品分类不能为空', trigger: 'change' }
        ],
        price: [
          { required: true, message: '商品价格不能为空', trigger: 'blur' },
          {
            validator: (rule, value, callback) =>
            {
              if (value) {
                const num = Number(value);
                if (isNaN(num)) {
                  callback(new Error('商品价格必须为数字'));
                } else if (num < 0.01) {
                  callback(new Error('商品价格不能小于0.01'));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        status: [
          { required: true, message: '商品状态不能为空', trigger: 'change' }
        ]
      }
    }
  },
  created()
  {
    this.getList()
    this.getCategoryList() // 加载真实分类数据
  },
  methods: {
    handleImageError()
    {
      this.$message.warning('图片加载失败，请检查URL是否有效')
    },

    formatPrice()
    {
      if (this.goodsForm.price) {
        const num = Number(this.goodsForm.price);
        this.goodsForm.price = isNaN(num) ? '' : num.toFixed(2);
      }
    },

    getList()
    {
      this.loading = true
      goodsApi.pageGoods(this.queryParams).then(res =>
      {
        const sortedRecords = (res.data.records || []).map(item => ({
          ...item,
          goodsImages: item.goods_images || item.goodsImages || '',
          createTime: item.create_time || item.createTime || '',
          updateTime: item.update_time || item.updateTime || '',
          status: item.status !== undefined ? Number(item.status) : 1,
          statusLoading: false
        })).sort((a, b) => a.id - b.id);

        this.goodsList = sortedRecords;
        this.total = res.data.total || 0
        this.loading = false
      }).catch(err =>
      {
        this.loading = false
        this.$message.error('查询失败：' + err.message)
      })
    },

    resetQuery()
    {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        goodsName: '',
        categoryId: '',
        status: '',
        sortField: 'id',
        sortOrder: 'asc'
      }
      this.getList()
    },

    handleSelectionChange(val)
    {
      this.multipleSelection = val.map(item => item.id)
    },

    handleAdd()
    {
      this.open = true
      this.title = '新增商品'
      this.goodsForm = {
        id: '',
        goodsName: '',
        categoryId: '', // 清空分类选择
        price: '',
        originalPrice: '',
        goodsDesc: '',
        goodsImages: '',
        status: "1"
      }
      this.imageUploadLoading = false
      this.$nextTick(() =>
      {
        if (this.$refs.goodsForm) this.$refs.goodsForm.resetFields()
      })
    },

    handleEdit(row)
    {
      this.open = true
      this.title = '编辑商品'
      this.goodsForm = {
        ...row,
        price: row.price ? row.price.toString() : '',
        originalPrice: row.originalPrice ? row.originalPrice.toString() : '',
        goodsImages: row.goodsImages || '',
        status: row.status.toString()
      }
      this.imageUploadLoading = false
    },

    handleDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的商品');
        return;
      }

      this.$confirm('是否确认删除选中的商品？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        goodsApi.deleteGoods(this.multipleSelection).then(res => {
          this.$message.success('删除成功！');
          this.getList();
          this.$refs.goodsTable.clearSelection();
        }).catch(err => {
          const errorMsg = err.response?.data?.message;
          this.$message.error(errorMsg);
        })
      })
    },

    handleSingleDelete(id) {
      this.$confirm('是否确认删除该商品？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        goodsApi.deleteGoods([id]).then(res => {
          this.$message.success('删除成功！');
          this.getList();
        }).catch(err => {
          const errorMsg = err.response?.data?.message;
          this.$message.error(errorMsg);
        })
      })
    },

    handleStatusChange(row)
    {
      const newStatus = row.status === 1 ? 0 : 1
      this.$confirm(`是否确认将该商品${ newStatus === 1 ? '上架' : '下架' }？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() =>
      {
        row.statusLoading = true
        goodsApi.updateGoodsStatus(row.id, newStatus).then(res =>
        {
          this.$message.success('状态修改成功！')
          row.status = newStatus
          row.statusLoading = false
        }).catch(err =>
        {
          this.$message.error('状态修改失败：' + (err.message || '请检查商品ID是否有效'))
          row.statusLoading = false
        })
      })
    },

    submitForm()
    {
      this.$refs.goodsForm.validate(valid =>
      {
        if (valid) {
          const submitData = {
            ...this.goodsForm,
            price: this.goodsForm.price ? Number(this.goodsForm.price) : 0,
            originalPrice: this.goodsForm.originalPrice ? Number(this.goodsForm.originalPrice) : 0,
            status: Number(this.goodsForm.status),
            goods_images: this.goodsForm.goodsImages
          }
          const submitPromise = this.goodsForm.id
            ? goodsApi.updateGoods(submitData)
            : goodsApi.addGoods(submitData)

          submitPromise.then(res =>
          {
            this.$message.success(this.goodsForm.id ? '修改成功！' : '新增成功！')
            this.open = false
            this.getList()
          }).catch(err =>
          {
            this.$message.error((this.goodsForm.id ? '修改' : '新增') + '失败：' + err.message)
          })
        }
      })
    },

    cancel()
    {
      this.open = false
      this.imageUploadLoading = false
      this.goodsForm.status = "1"
      this.goodsForm.goodsImages = ''
      if (this.$refs.goodsForm) {
        this.$refs.goodsForm.resetFields()
      }
    },

    beforeImgUpload(file)
    {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImage) this.$message.error('只能上传图片格式文件！')
      if (!isLt2M) this.$message.error('图片大小不能超过2MB！')
      return isImage && isLt2M
    },

    uploadImg(options)
    {
      this.imageUploadLoading = true
      const formData = new FormData()
      formData.append('file', options.file)

      goodsApi.uploadImage(formData).then(res =>
      {
        this.imageUploadLoading = false
        if (res.code === 200 && res.data) {
          this.goodsForm.goodsImages = res.data
          this.$message.success('图片上传成功！')
        } else {
          this.$message.error('图片上传失败，请重试！')
        }
      }).catch(err =>
      {
        this.imageUploadLoading = false
        this.$message.error('图片上传失败：' + err.message)
      })
    },

    /**
     * 2. 重写getCategoryList方法：调用后端真实分类接口
     */
    getCategoryList() {
      // 调用分类分页接口，获取所有分类（pageSize设为9999）
      categoryApi.pageCategory({
        pageNum: 1,
        pageSize: 9999, // 获取全部分类
        categoryName: '',
        sortField: 'sort', // 按排序字段排序
        sortOrder: 'asc'
      }).then(res => {
        // 格式化分类数据，只保留id和categoryName
        this.categoryList = (res.data.records || []).map(item => ({
          id: item.id,
          categoryName: item.categoryName
        }))
      }).catch(err => {
        console.warn('获取分类列表失败：', err)
        // 容错：接口失败时显示默认分类（避免页面无数据）
        this.categoryList = [
          { id: 0, categoryName: '暂无分类' }
        ]
        this.$message.warning('获取分类数据失败，将使用默认分类')
      })
    },

    handleSizeChange(val)
    {
      this.queryParams.pageSize = val
      this.getList()
    },

    handleCurrentChange(val)
    {
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

.table-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
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

.img-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.img-uploader .el-upload:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-img {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  object-fit: cover;
}
</style>

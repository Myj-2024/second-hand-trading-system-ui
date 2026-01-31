<template>
  <div class="global-footer">
    <p>© 2026 二手物品交易管理系统 | 作者：yujie&colour008</p>
  </div>
</template>

<script>
export default {
  name: 'GlobalFooter'
}
</script>

<style scoped>
.global-footer {
  /* 核心修改：移除白色背景，改为透明 */
  background-color: #ffffff;
  text-align: center; /* 强制文字居中 */
  color: #ccc; /* 浅灰色文字，适配深色背景 */
  font-size: 12px;
  position: fixed;
  left: 130px;
  bottom: 0;
  width: 100%;
  z-index: 99;
  padding-bottom: 5px; /* 登录页无侧边栏，强制无偏移 */
}



/* 适配侧边栏折叠（仅后台页面） */
@media (max-width: 992px) or (min-width: 992px) and (max-width: 1200px) {
  :not(.login-container) .global-footer {
    margin-left: 80px;
  }
}

/* 移动端适配（所有页面） */
@media (max-width: 768px) {
  .global-footer {
    margin-left: 0 !important;
  }
}
</style>

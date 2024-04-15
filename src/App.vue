<script setup>
import {computed, onMounted, ref} from "vue";
import {routes} from "./router.js";
import NotFound from "./pages/NotFound.vue";
import {requestDataSync} from "./api/index.js";

//默认展示home组件
const currentPath = ref("/");
window.addEventListener("hashchange", () => {
  const hashUrl = window.location.hash
  // 去除参数
  const hashUrlWithoutParam = hashUrl.split('?')[0]
  // 去除#
  currentPath.value = hashUrlWithoutParam.substring(1)
});
const currentView = computed(() => {
  return routes[currentPath.value] || NotFound;
});

onMounted(() => {
  requestDataSync()
})
</script>

<template>
  <div class="wrapper">
    <component :is="currentView"></component>
  </div>
</template>

<style scoped>
.wrapper {
}
</style>

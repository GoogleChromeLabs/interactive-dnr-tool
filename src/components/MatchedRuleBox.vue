<script setup>
import { computed } from 'vue';
import { useRulesStore } from '../stores/rulesStore';
const rulesStore = useRulesStore();
let matchedRuleString = computed(() => rulesStore.getMatchedRuleString);
</script>

<template>
  <div class="matched-rule-container">
    <pre>{{ matchedRuleString }}</pre>
  </div>
</template>

<style scoped>
.matched-rule-container {
  display: flex;
  align-items: center;
  height: 200px;
  position: relative;
}
.box {
  width: 100%;
  height: 100%;
  background-color: gray;
  margin: 0 auto;
  position: relative;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
  white-space: pre-wrap;
  display: flex;
}

pre {
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: monospace;
  color: white;
}

@media (prefers-color-scheme: light) {
  pre {
    width: 100%;
    height: 100%;
    margin: 0;
    font-family: monospace;
    color: black;
  }
}
</style>

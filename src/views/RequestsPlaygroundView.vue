<script setup>
import { useRouter } from 'vue-router';
import { useRulesStore } from '@/stores/rulesStore';
import { computed, onMounted } from 'vue';
import RequestInput from '@/components/RequestInput.vue';
import AnimationStage from '@/components/AnimationStage.vue';

const rulesStore = useRulesStore();
const router = useRouter();
const parsedRulesList = rulesStore.getParsedRulesList;
let requestMatched = computed(() => rulesStore.getRequestMatched);
onMounted(() => {
  if (parsedRulesList.length === 0) {
    let result = confirm(
      '0 parsed rules found. Proceed to upload ruleset file(s)?'
    );
    if (result) {
      router.push({ name: 'home' });
    }
  }
});
</script>

<template>
  <main>
    <h1>Requests Playground</h1>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/rules">Rules Editor</RouterLink>
      </nav>
    </div>
    <div class="flexbox">
      <div><RequestInput :parsed-rules="parsedRulesList" /></div>
      <div><AnimationStage v-show="requestMatched" /></div>
    </div>
  </main>
</template>

<style scoped>
nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.flexbox {
  display: flex;
  justify-content: space-between;
  align-items: right;
  margin-top: 2rem;
}
</style>

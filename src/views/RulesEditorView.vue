<script setup>
import { useRouter } from 'vue-router';
import 'jsoneditor/dist/jsoneditor.css';
import JSONRulesEditor from '@/components/JSONRulesEditor.vue';
import { useRulesStore } from '@/stores/rulesStore';
import { onMounted } from 'vue';

const rulesStore = useRulesStore();
const parsedRulesList = rulesStore.getParsedRulesListLength;

const router = useRouter();
onMounted(() => {
  if (parsedRulesList === 0) {
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
    <h1>Rules Editor</h1>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/requests">Requests Playground</RouterLink>
      </nav>
    </div>
    <JSONRulesEditor />
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
</style>

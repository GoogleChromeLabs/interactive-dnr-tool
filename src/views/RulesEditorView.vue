<script setup>
import 'jsoneditor/dist/jsoneditor.css';
import JSONRulesEditor from '@/components/JSONRulesEditor.vue';
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

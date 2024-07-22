<script></script>

<template>
  <main>
    <h1>Hello</h1>
    <div class="wrapper">
      <!--The nav below needs to only be on Requests Playground and Rules Editor pages-->
      <!--
      <nav>
        <RouterLink to="/">Requests Playground</RouterLink>
        <RouterLink to="/about">Rules Editor</RouterLink>
      </nav>
      -->
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
</style>

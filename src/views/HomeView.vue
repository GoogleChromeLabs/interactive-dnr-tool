<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRulesStore } from '@/stores/rulesStore';
import LandingDescription from '../components/LandingDescription.vue';
import ExtensionUploadArea from '../components/ExtensionUploadArea.vue';
import OverlayCard from '@/components/OverlayCard.vue';
import { useManifestStore } from '@/stores/manifestStore';
const rulesStore = useRulesStore();
const manifestStore = useManifestStore();
let filesUploaded = computed(() => rulesStore.parsedRulesList.length > 0);
let isFirstVisit = computed(() => manifestStore.isFirstVisit);

const router = useRouter();

function goToRequests() {
  if (filesUploaded.value) {
    router.push({ name: 'requests' });
  }
}
</script>

<template>
  <main>
    <OverlayCard v-show="isFirstVisit" />
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/rules">Rules Editor</RouterLink>
        <RouterLink to="/rules">Requests Playground</RouterLink>
      </nav>
    </div>
    <header>
      <div class="left-section">
        <img
          alt="Google Chrome Labs"
          class="logo"
          src="@/assets/ChromeLabsLogo.png"
          width="65"
          height="65"
        />
        <div class="wrapper">
          <LandingDescription />
        </div>
      </div>
      <div class="right-section">
        <ExtensionUploadArea />
      </div>
    </header>
    <button v-show="filesUploaded" @click="goToRequests">
      Go to Requests Playground
    </button>
  </main>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1.5;
  max-height: 100vh;
}

.left-section {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.logo {
  margin-right: 2rem;
}

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

.wrapper {
  display: flex;
  flex-direction: column;
}

.right-section {
  display: flex;
  align-items: flex-start;
}

@media (min-width: 1024px) {
  header {
    padding-right: calc(var(--section-gap) / 2);
  }

  .wrapper {
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>

<script setup>
import { computed } from 'vue'
import { useRulesStore } from '@/stores/rulesStore'
import LandingDescription from '../components/LandingDescription.vue'
import ExtensionUploadArea from '../components/ExtensionUploadArea.vue'
const rulesStore = useRulesStore()
let filesUploaded = computed(() => rulesStore.rulesetFilesUploaded)
</script>

<template>
  <main>
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
    <button v-show="filesUploaded">GO!</button>
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
  flex-direction: column;
  align-items: flex-start;
}

.logo {
  margin-bottom: 2rem;
}

.wrapper {
  display: flex;
  flex-direction: column;
}

.right-section {
  display: flex;
  align-items: center;
}

@media (min-width: 1024px) {
  header {
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  .wrapper {
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>

<script setup>
import { computed } from 'vue'
import { useRulesStore } from '@/stores/rulesStore'
import ExtensionUploadArea from '../components/ExtensionUploadArea.vue'
const rulesStore = useRulesStore()
let filesUploaded = computed(() => rulesStore.rulesetFilesUploaded)
</script>

<template>
  <main>
    <ExtensionUploadArea />
    <button v-show="filesUploaded">GO!</button>
  </main>
</template>

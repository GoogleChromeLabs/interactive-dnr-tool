<script setup>
import { computed } from 'vue';
import { useManifestStore } from '@/stores/manifestStore';
const manifestStore = useManifestStore();
let isFirstVisit = computed(() => manifestStore.isFirstVisit);
function hideCard() {
  manifestStore.setIsFirstVisit(false);
}
</script>

<template>
  <div>
    <div v-if="isFirstVisit" class="overlay" @click="hideCard">
      <div class="card" @click.stop>
        <h3>Welcome to Interactive DNR Tool!</h3>
        <p>
          <br />
          <strong>How to Use:</strong><br />
          <strong>1. Upload Your Manifest File:</strong><br />
          Click on the "Upload Manifest" section or drag and drop your
          <code>manifest.json</code> file. Ensure that the file contains all
          necessary fields.<br /><br />

          <strong>2. Upload Ruleset Files:</strong><br />
          After uploading the manifest, proceed to upload one or more ruleset
          files by clicking the "Upload Ruleset Files" section or by dragging
          and dropping them. Files should be in JSON format and follow the
          specified ruleset structure.<br /><br />

          <strong>3. Create HTTP Requests to find the matching rule:</strong
          ><br />
          Fill out the form and click submit to see the matching rule.<br /><br />

          <strong>4. Review and Modify Rules:</strong><br />
          Once uploaded, your rules will be displayed in the rules editor. You
          can review, modify, or delete rules directly within this editor.<br /><br />
        </p>
        <button @click="hideCard">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.card {
  background: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  max-width: 50%;
  text-align: left;
}

button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

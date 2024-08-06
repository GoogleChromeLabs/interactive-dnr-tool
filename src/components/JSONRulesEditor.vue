<script setup>
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

import { ref, onBeforeUnmount } from 'vue';
import { useRulesStore } from '@/stores/rulesStore';
import { useManifestStore } from '@/stores/manifestStore';

const rulesStore = useRulesStore();
const manifestStore = useManifestStore();

const rulesetFileName = defineModel();
let rulesetToEdit = [];
const fileNames = manifestStore.getRulesetFilePaths.map(
  (rulesetFilePathObject) => rulesetFilePathObject.rulesetFilePath
);

const jsonEditor = ref(null);
let editor = null;

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
  }
});

const loadFile = () => {
  // rulesetFileName has been set from the drop-down by the user
  rulesetToEdit = rulesStore.getRuleset(rulesetFileName.value);
  const container = jsonEditor.value;
  const options = {
    mode: 'code',
    onChange: () => {
      // pass
    }
  };

  if (editor) {
    editor.destroy();
  }

  editor = new JSONEditor(container, options);
  editor.set(rulesetToEdit);
};

const saveRuleset = () => {
  try {
    rulesStore.saveRuleset(rulesetFileName.value, editor.get());
    window.alert('Saved changes to ' + rulesetFileName.value);
  } catch (error) {
    console.error(error);
    window.alert('Error saving ruleset');
  }
};
</script>

<template>
  <main>
    <select v-model="rulesetFileName" @change="loadFile">
      <option v-for="fileName in fileNames" :key="fileName">
        {{ fileName }}
      </option>
    </select>
    <div class="rules-editor"></div>
    <div ref="jsonEditor" class="jsoneditor-container"></div>
    <button @click="saveRuleset">Save</button>
  </main>
</template>

<style scoped>
.rules-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.jsoneditor-container {
  width: 100%;
  height: 500px;
  margin-bottom: 20px;
}
</style>

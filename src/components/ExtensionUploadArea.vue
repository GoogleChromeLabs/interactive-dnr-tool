<script setup>
import { ref } from 'vue';
import { useManifestStore } from '@/stores/manifestStore';
import { useRulesStore } from '@/stores/rulesStore';
import FileUploadHeading from './FileUploadHeading.vue';
import ExtensionIcon from './icons/IconExtension.vue';

const manifestStore = useManifestStore();
const rulesStore = useRulesStore();

let manifestFileName = ref('');
let manifestFile = null;

let rulesetFileNames = ref('');
let rulesetFilesUploaded = false;

function parseManifestFile(manifestFile) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const manifestObject = JSON.parse(e.target.result);
      let manifestValidationResult =
        manifestStore.isValidManifest(manifestObject); // true if no errors, error object otherwise
      if (manifestValidationResult === true) {
        manifestFileName.value = manifestFile.name;
        // if manifestValidationResult is true, i.e., there are no errors
        manifestStore.clearRulesetFilePaths();
        manifestStore.setRulesetFilePaths(manifestObject);
      } else {
        let output = 'Issues found:\n';

        for (let i = 0; i < manifestValidationResult['type'].length; i++) {
          if (manifestValidationResult['type'][i] === 'missingFields') {
            let missingFields =
              manifestValidationResult['missingFields'].join(', ');
            output += `- Missing fields: ${missingFields}\n`;
          }
          if (manifestValidationResult['type'][i] === 'invalidValueTypes') {
            let invalidValueTypes =
              manifestValidationResult['invalidValueTypes'].join(', ');
            output += `- Invalid value types for: ${invalidValueTypes}\n`;
          }
        }
        window.alert(output);
      }
    } catch (error) {
      window.alert('Error parsing manifest JSON');
    }
  };
  reader.readAsText(manifestFile);
}

function manifestDropHandler(ev) {
  ev.preventDefault();
  let numFiles = 0;

  if (ev.dataTransfer.items) {
    numFiles = ev.dataTransfer.items.length;
    if (numFiles === 0) {
      window.alert('No files were dropped');
      return;
    } else if (numFiles > 1) {
      window.alert('Only one file can be dropped at a time');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      if (ev.dataTransfer.items[i].kind === 'file') {
        manifestFile = ev.dataTransfer.items[i].getAsFile();
      }
    }
  } else {
    numFiles = ev.dataTransfer.files.length;
    if (numFiles === 0) {
      window.alert('No files were dropped');
      return;
    } else if (numFiles > 1) {
      window.alert('Only one file can be dropped at a time');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      manifestFile = ev.dataTransfer.files[i];
    }
  }
  parseManifestFile(manifestFile);
  removeDragData(ev);
}

function parseRulesetFile(rulesetFile) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const rulesetObject = JSON.parse(e.target.result);
      let rulesetValidationResult = rulesStore.isValidRuleset(rulesetObject); // true if no errors, error object otherwise
      if (rulesetValidationResult === true) {
        manifestStore.addRulesetFilePath(rulesetFile.name);
        rulesStore.setParsedRulesList(rulesetObject);
      } else {
        let output = 'Issues found:\n';

        for (let i = 0; i < rulesetValidationResult['type'].length; i++) {
          if (rulesetValidationResult['type'][i] === 'missingFields') {
            let missingFields =
              rulesetValidationResult['missingFields'].join(', ');
            output += `- Missing fields: ${missingFields}\n`;
          }
          if (rulesetValidationResult['type'][i] === 'invalidValueTypes') {
            let invalidValueTypes =
              rulesetValidationResult['invalidValueTypes'].join(', ');
            output += `- Invalid value types for: ${invalidValueTypes}\n`;
          }
        }
        window.alert(output);
      }
    } catch (error) {
      console.log(error);
      window.alert('Error parsing ruleset JSON');
    }
  };
  reader.readAsText(rulesetFile);
}

function rulesDropHandler(ev) {
  ev.preventDefault();
  let numFiles = 0;

  let rulesetFiles = [];

  if (ev.dataTransfer.items) {
    numFiles = ev.dataTransfer.items.length;
    if (numFiles < 1) {
      window.alert('One or more files expected');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      if (ev.dataTransfer.items[i].kind === 'file') {
        rulesetFiles.push(ev.dataTransfer.items[i].getAsFile());
      }
    }
  } else {
    numFiles = ev.dataTransfer.files.length;
    if (numFiles === 0) {
      window.alert('One or more files expected');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      rulesetFiles.push(ev.dataTransfer.files[i]);
    }
  }
  rulesetFileNames.value = rulesetFiles.map((file) => file.name).join(', ');
  for (let i = 0; i < rulesetFiles.length; i++) {
    parseRulesetFile(rulesetFiles[i]);
  }
  rulesetFilesUploaded = true;
  rulesStore.setRulesetFilesUploaded(rulesetFilesUploaded);
  removeDragData(ev);
}

function dragOverHandler(ev) {
  ev.preventDefault();
}

function removeDragData(ev) {
  if (ev.dataTransfer.items) {
    ev.dataTransfer.items.clear();
  }
}
</script>

<template>
  <h2>Upload Extension Files</h2>
  <FileUploadHeading>
    <template #icon>
      <ExtensionIcon />
    </template>
    <template #heading>Upload Manifest</template>
    <div
      class="drop_zone"
      id="manifest_drop_zone"
      @drop="manifestDropHandler"
      @dragover="dragOverHandler"
    >
      <p v-if="!manifestFileName">Drag manifest.json file ...</p>
      <p v-else>{{ manifestFileName }}</p>
    </div>
  </FileUploadHeading>
  <br />
  <FileUploadHeading v-show="manifestFileName">
    <template #icon>
      <ExtensionIcon />
    </template>
    <template #heading>Upload Ruleset Files</template>
    <div
      class="drop_zone"
      id="ruleset_drop_zone"
      @drop="rulesDropHandler"
      @dragover="dragOverHandler"
    >
      <p v-if="rulesetFileNames === ''">Drag one or more ruleset files ...</p>
      <p v-else>{{ rulesetFileNames }}</p>
    </div>
  </FileUploadHeading>
</template>

<style scoped>
.drop_zone {
  border: dashed;
  width: 200px;
  height: 100px;
}
</style>

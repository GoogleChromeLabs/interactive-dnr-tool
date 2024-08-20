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
let rulesetFilesUploaded = ref(false);

function parseManifestFile(manifestFile) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const manifestObject = JSON.parse(e.target.result);
      let manifestValidationResult =
        manifestStore.isValidManifest(manifestObject); // true if no errors, error object otherwise
      if (manifestValidationResult === true) {
        manifestFileName.value = manifestFile.name;
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
      console.log(error);
      window.alert('Error parsing manifest JSON');
    }
  };
  reader.readAsText(manifestFile);
}

function manifestInputHandler(ev) {
  ev.preventDefault();
  let numFiles = 0;
  let files = [];

  // Check if the file was dropped or selected from the file input
  if (ev.dataTransfer.items) {
    // Dropped file
    files = ev.dataTransfer.items;
  } else {
    // Selected from file input
    files = ev.target.files;
  }

  if (files.length != 0) {
    numFiles = files.length;
    if (numFiles === 0) {
      window.alert('No files were dropped');
      return;
    } else if (numFiles > 1) {
      window.alert('Only one file can be dropped at a time');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      if (files[i].kind === 'file') {
        manifestFile = files[i].getAsFile();
      } else {
        manifestFile = files[i];
      }
    }
  } else {
    files = ev.dataTransfer.files;
    numFiles = files.length;
    if (numFiles === 0) {
      window.alert('No files were dropped');
      return;
    } else if (numFiles > 1) {
      window.alert('Only one file can be dropped at a time');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      manifestFile = files[i];
    }
  }
  parseManifestFile(manifestFile);
  removeDragData(ev);
}

function parseRulesetFile(rulesetFile) {
  const reader = new FileReader();
  const fileName = rulesetFile.name;
  reader.onload = function (e) {
    try {
      const ruleset = JSON.parse(e.target.result); // Array of rules for the ruleset (one ruleset per file)
      let rulesetValidationResult = rulesStore.isValidRuleset(ruleset); // true if no errors, error object otherwise
      if (rulesetValidationResult === true) {
        rulesStore.setParsedRulesList(ruleset, fileName);
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

function rulesetFilesInputHandler(ev) {
  ev.preventDefault();
  let numFiles = 0;
  let tempRulesetFiles = [];
  let rulesetFiles = [];

  // Check if the files were dropped or selected from the file input
  if (ev.dataTransfer.items) {
    // Dropped files
    tempRulesetFiles = ev.dataTransfer.items;
  } else {
    // Selected from file input
    tempRulesetFiles = Array.from(ev.target.files);
  }

  if (tempRulesetFiles.length != 0) {
    numFiles = tempRulesetFiles.length;
    if (numFiles < 1) {
      window.alert('One or more files expected');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      if (tempRulesetFiles[i].kind === 'file') {
        rulesetFiles.push(tempRulesetFiles[i].getAsFile());
      } else {
        rulesetFiles.push(tempRulesetFiles[i]);
      }
    }
  } else {
    tempRulesetFiles = ev.dataTransfer.files;
    numFiles = tempRulesetFiles.length;
    if (numFiles === 0) {
      window.alert('One or more files expected');
      return;
    }
    for (let i = 0; i < numFiles; i++) {
      rulesetFiles.push(tempRulesetFiles[i]);
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
  try {
    if (ev.dataTransfer.items) {
      ev.dataTransfer.items.clear();
    } else {
      ev.target.value = ''; // Clear the file input element
    }
  } catch (e) {
    document.getElementById('manifest_file_input').value = '';
    document.getElementById('ruleset_files_input').value = '';
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
    <label class="drop-zone-label">
      <div
        class="drop_zone"
        id="manifest_drop_zone"
        @drop="manifestInputHandler"
        @dragover="dragOverHandler"
      >
        <p v-if="!manifestFileName">
          Drag manifest.json file, or click to browse ...
        </p>
        <p v-else>{{ manifestFileName }}</p>
        <input
          type="file"
          id="manifest_file_input"
          @change="manifestInputHandler"
        />
      </div>
    </label>
  </FileUploadHeading>
  <br />
  <FileUploadHeading v-show="manifestFileName">
    <template #icon>
      <ExtensionIcon />
    </template>
    <template #heading>Upload Ruleset Files</template>
    <label class="drop-zone-label">
      <div
        class="drop_zone"
        id="ruleset_drop_zone"
        @drop="rulesetFilesInputHandler"
        @dragover="dragOverHandler"
      >
        <p v-if="rulesetFileNames === ''">
          Drag one or more ruleset files, or click to browse...
        </p>
        <p v-else>{{ rulesetFileNames }}</p>
        <input
          type="file"
          id="ruleset_files_input"
          @change="rulesetFilesInputHandler"
          multiple
        />
      </div>
    </label>
  </FileUploadHeading>
</template>

<style scoped>
.drop_zone {
  border: dashed;
  width: 200px;
  height: 100px;
}
input[type='file'] {
  display: none;
}
</style>

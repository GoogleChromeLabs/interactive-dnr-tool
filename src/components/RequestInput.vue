<script setup>
import { ref } from 'vue';
import { useRulesStore } from '../stores/rulesStore';

const rulesStore = useRulesStore();

const httpMethod = ref('GET');
const url = ref('');
const headers = ref('');
const body = ref('');
const response = ref(null);
const matchedRule = ref(null);

function displayExtensionRule(extensionRule) {
  matchedRule = toRaw(extensionRule);
}

function submitRequest(ev) {
  ev.preventDefault();

  // Headers validity checking
  let requestHeaders = {};
  try {
    requestHeaders = JSON.parse(headers.value);
  } catch (e) {
    window.alert('Invalid headers');
    headers.value = '';
    return;
  }

  const formObject = {
    httpMethod: httpMethod.value,
    url: url.value,
    headers: requestHeaders || {},
    body: body.value
  };
}
</script>

<template>
  <div>
    <form @submit.prevent="submitRequest">
      <div>
        <p>HTTP Method:</p>
        <select v-model="httpMethod" id="method">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
      </div>
      <div>
        <p>Request URL:</p>
        <input type="url" v-model="url" id="httpRequestURL" required />
      </div>
      <div>
        <p>HTTP Headers:</p>
        <textarea
          v-model="headers"
          id="headers"
          value="HTTP Headers"
        ></textarea>
      </div>
      <div>
        <p>Body:</p>
        <textarea v-model="body" id="body" value="Body"></textarea>
      </div>
      <button type="submit">Submit Request</button>
    </form>
    <div v-if="matchedRule">
      <h2>Matched Rule</h2>
      <!-- <pre>{{ matchedRule }}</pre> -->
    </div>
  </div>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}

form > div {
  margin-bottom: 1rem;
}

label {
  margin-bottom: 0.5rem;
}

input,
select,
textarea,
button {
  padding: 0.5rem;
  font-size: 1rem;
}
</style>

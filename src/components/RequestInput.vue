<script setup>
import { ref } from 'vue';
import { useRulesStore } from '../stores/rulesStore';

const rulesStore = useRulesStore();

const httpMethod = ref('GET');
const url = ref('');
const headers = ref('');
const body = ref('');
const matchedRule = ref(null);
let matchedRuleString = '';

function submitRequest(ev) {
  ev.preventDefault();

  // Headers validity checking
  let requestHeaders = {};
  try {
    requestHeaders = JSON.parse(headers.value || '{}');
  } catch (e) {
    window.alert('Invalid headers');
    headers.value = '';
    return;
  }

  const formObject = {
    httpMethod: httpMethod.value,
    url: url.value,
    headers: requestHeaders,
    body: body.value
  };
  matchedRule.value = rulesStore.requestMatcher(formObject)[0];
  // When matchedRule.value is undefined, it means no matching rule was found
  try {
    matchedRuleString = JSON.stringify(matchedRule.value.rule, null, 2);
  } catch (e) {
    window.alert('No matching rule found.');
  }
  rulesStore.setMatchedRuleString(matchedRuleString);
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

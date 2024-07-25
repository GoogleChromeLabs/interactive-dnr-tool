<script setup>
import { ref } from 'vue';
import { getHighestPriorityRules } from '@/utils';
import { useURLFilterStore } from '@/stores/urlFilterStore';
import { defineProps } from 'vue';

const props = defineProps({
  parsedRules: Array
});
const urlFilterStore = useURLFilterStore();

const httpMethod = ref('GET');
const url = ref('');
const headers = ref('');
const body = ref('');
const response = ref(null);

const parsedRules = props.parsedRules;

function submitRequest(ev) {
  ev.preventDefault();
  const formObject = {
    httpMethod: httpMethod.value,
    url: url.value,
    headers: JSON.parse(headers.value || '{}'),
    body: body.value
  };
  requestMatcher(formObject);
  httpMethod.value = 'GET';
  url.value = '';
  headers.value = '';
  body.value = '';
}

function requestMatcher(request) {
  let matchedRulesList = [];
  let output = '';
  for (let rule of parsedRules) {
    // console.log(rule); // correct
    // console.log(request.url); // correct
    if (
      urlFilterStore.urlMatcher(request.url, rule.urlParserIndexedRule) === true
    ) {
      matchedRulesList.push(rule);
    }
  }
  console.log('Matched rules (1): ' + matchedRulesList.join(',\n'));
  let highestPriorityRules = getHighestPriorityRules(matchedRulesList);
  for (let rule of highestPriorityRules) {
    output += JSON.stringify(rule, null, 2) + '\n';
  }
  console.log('Matched rules (2): ' + output);
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
    <div v-if="response">
      <h3>Response</h3>
      <pre>{{ response }}</pre>
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

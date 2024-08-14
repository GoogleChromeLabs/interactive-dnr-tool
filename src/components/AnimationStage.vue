<script setup>
import { ref } from 'vue';

const requestAction = ref('');

function processRequest(action) {
  requestAction.value = action;
}

function resetRequest() {
  requestAction.value = '';
}

// Example usage
setTimeout(() => processRequest('allowed'), 1000);
setTimeout(() => processRequest('blocked'), 4000);
setTimeout(() => processRequest('redirected'), 7000);
setTimeout(() => processRequest('schema-upgraded'), 10000);
setTimeout(() => processRequest('headers-modified'), 13000);
</script>


<!-- Extension Template -->

<template>
  <div class="animation-container">
    <div class="request" :class="requestAction" @animationend="resetRequest">
      Request
    </div>
    <div class="box">Extension</div>
  </div>
</template>

<script>
  function displayExtensionRule(extensionRule) {
    const heading = document.getElementsByClassName("box")[0]
    heading.innerHTML = extensionRule
  }
</script>

<style scoped>
.animation-container {
  display: flex;
  align-items: center;
  height: 200px;
  position: relative;
}

.request {
  position: absolute;
  left: 0;
  transition: all 2s;
}

.box {
  width: 100px;
  height: 100px;
  background-color: gray;
  margin: 0 auto;
  position: relative;
}

.request.allowed {
  left: calc(100% - 100px);
}

.request.blocked {
  left: 0;
  animation: bounce-back 2s forwards;
}

.request.redirected {
  left: calc(100% - 100px);
  animation: deflect 2s forwards;
}

.request.schema-upgraded {
  left: calc(100% - 100px);
  background-color: blue;
}

.request.headers-modified {
  left: calc(100% - 100px);
  animation: show-change 2s forwards;
}

@keyframes bounce-back {
  50% {
    left: calc(50% - 50px);
  }
  100% {
    left: 0;
  }
}

@keyframes deflect {
  50% {
    transform: translateY(-50px);
  }
  100% {
    left: calc(100% - 100px);
    transform: translateY(-50px);
  }
}

@keyframes show-change {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    left: calc(100% - 100px);
  }
}
</style>

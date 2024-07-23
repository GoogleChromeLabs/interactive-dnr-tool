/**
 * Copyright 2024 [TODO: COPYRIGHT HOLDER NAME]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// rules.js

import { urlFilterParse, urlMatcher } from './urlFilterParser.js';
import { rulesetFilePaths } from './manifest.js';

/* Each object in this list has the following signature
   {
      rule: {
          the rule itself
      }
      urlParserIndexedRule: {
          anchorLeft: 'BOUNDARY' | 'SUBDOMAIN' | 'NONE',
          urlPatternType: 'SUBSTRING' | 'WILDCARDED',
          urlPattern: 'abc*def',
          anchorRight: 'BOUNDARY' | 'NONE'
          },
      ruleId: 1 | 2 | ... ,
      rulesetId: 1 | 2 | ...,
      ruleEnabled: true | false
   }*/
let parsedRulesList = [];

let request = {}; // Will be assigned with request created in the request matching tester

// Uploading and displaying ruleset files
const filesInput = document.getElementById('ruleFilesInput');
filesInput.addEventListener('change', (event) => {
  const files = event.target.files;
  if (files) {
    for (const file of files) {
      let rulesetIndex = 0;
      if (rulesetFilePaths.length != 0) {
        for (const rulesetFilePathObject of rulesetFilePaths) {
          if (file.name === rulesetFilePathObject.rulesetFilePath) {
            rulesetIndex = rulesetFilePathObject.rulesetId;
          }
        }
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const rulesetJSONParsed = JSON.parse(e.target.result);
          const rulesetObject = {
            ruleset: rulesetJSONParsed,
            rulesetId: rulesetIndex
          };
          if (isValidRuleset(rulesetObject.ruleset)) {
            displayRules(rulesetObject);
          } else {
            document.getElementById('ruleFilesInfo').textContent =
              `Invalid ruleset with id: ${rulesetObject.rulesetId}`;
          }
        } catch (error) {
          console.log('Error parsing rule files: ', error);
          document.getElementById('ruleFilesInfo').textContent =
            'Error parsing rule file';
        }
      };
      reader.readAsText(file);
    }
  }
});

// Display rules defined in a ruleset
function displayRules(rulesetObject) {
  const ruleFilesInfo = document.getElementById('ruleFilesInfo');

  const fileInfo = document.createElement('div');
  const header = document.createElement('h3');
  header.innerText = `Ruleset ${rulesetObject.rulesetId}:`;
  fileInfo.appendChild(header);
  const list = document.createElement('ul');

  rulesetObject.ruleset.forEach((rule) => {
    const urlFilterString = rule.condition.urlFilter;
    const ruleID = rule.id;
    let ruleIsValid = '';
    if (isValidRule(rule)) {
      ruleIsValid = 'Valid.';
    } else {
      ruleIsValid = 'Invalid.';
    }
    const listItem = document.createElement('li');
    listItem.innerText = `Rule ID = ${ruleID}: URLFilter String = ${urlFilterString}, Rules Validity: ${ruleIsValid}`;
    list.appendChild(listItem);

    let indexedRule = urlFilterParse(rule.condition.urlFilter);
    parsedRulesList.push({
      rule: rule,
      urlParserIndexedRule: indexedRule,
      ruleId: ruleID,
      rulesetId: rulesetObject.rulesetId
    });
  });
  fileInfo.appendChild(list);
  ruleFilesInfo.appendChild(fileInfo);
}

// Checks validity of URLFilter string
function isValidURLFilter(urlFilterString) {
  // Ensure only valid constructs are present
  const validConstructs = /^[*|^a-zA-Z0-9_\-.%?/;=@&:]+$/;
  if (!validConstructs.test(urlFilterString)) {
    return false; // Invalid constructs present
  }
  // Check for ASCII characters
  for (let i = 0; i < urlFilterString.length; i++) {
    if (urlFilterString.charCodeAt(i) > 127) {
      return false; // Non-ASCII character found
    }
  }
  if (urlFilterString.startsWith('||*')) {
    return false; // Cannot start with ||* - use only * at the beginning for the intended effect.
  }
  if (urlFilterString.includes('|') && !urlFilterString.includes('||')) {
    if (!urlFilterString.startsWith('|') && !urlFilterString.endsWith('|')) {
      return false; // Cannot start or end without |.
    }
    if (urlFilterString.length === 1) {
      return false; // Cannot have only |.
    }
  }
  if (urlFilterString.includes('||')) {
    if (!urlFilterString.startsWith('||')) {
      return false; // Cannot have || in the middle.
    }
    if (urlFilterString.length === 2) {
      return false; // Cannot have only ||.
    }
    if (
      urlFilterString.slice(2).includes('|') &&
      !urlFilterString.endsWith('|')
    ) {
      return false; // Cannot have | in the middle.
    }
  }
  if (
    urlFilterString.slice(1, -1).includes('|') &&
    urlFilterString.slice(0, 2) !== '||'
  ) {
    return false; // Cannot have | in the middle.
  }
  return true;
}

// Checks validity of rule, including checking validity of its condition, i.e., the URLFilter string
function isValidRule(rule) {
  let isValid = true;
  if (!rule.id || (rule.id && !Number.isInteger(rule.id))) {
    isValid = false;
    console.log('id');
  }
  if (rule.priority && !Number.isInteger(rule.priority)) {
    isValid = false;
    console.log('priority');
  }
  if (
    !rule.action ||
    typeof rule.action != 'object' ||
    !rule.action.type ||
    (rule.action && typeof rule.action.type != 'string')
  ) {
    isValid = false;
    console.log('action');
  }
  if (!rule.condition || typeof rule.condition != 'object') {
    isValid = false;
    console.log('condition');
  }
  if (!isValidURLFilter(rule.condition.urlFilter)) {
    isValid = false;
  }
  return isValid;
}

// Checks syntax and validity of ruleset file
function isValidRuleset(ruleset) {
  // Check if the ruleset is an array and is non-empty
  if (!Array.isArray(ruleset) || ruleset.length === 0) {
    return false;
  }

  // Validate each rule in the ruleset
  for (let rule of ruleset) {
    if (!isValidRule(rule)) {
      return false;
    }
  }

  return true;
}

// TODO: Priority resolution in case of multiple request-rule matches
document
  .getElementById('RequestTestForm')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = {};
    formData.forEach((value, key) => {
      if (key === 'httpHeaders') {
        value = JSON.parse(value);
      }
      formObject[key] = value;
    });
    const output = document.getElementById('RequestOutput');
    output.textContent = JSON.stringify(formObject, null, 2);
    request = formObject;
    if (parsedRulesList.length !== 0) {
      requestMatcher();
    } else {
      console.log(
        "requestMatcher() could not be called as parsedRulesList isn't populated."
      );
    }
  });

// Show all rules that matched with the given request
function requestMatcher() {
  const output = document.getElementById('RequestTestOutput');
  let outputTextContent = '';
  let matchedRulesList = [];
  for (let i = 0; i < parsedRulesList.length; i++) {
    const rule = parsedRulesList[i];
    if (
      urlMatcher(request.httpRequestUrl, rule.urlParserIndexedRule) === true
    ) {
      matchedRulesList.push(rule);
      console.log('Matched rule: ', JSON.stringify(rule, null, 2));
    }
  }
  let highestPriorityRules = getHighestPriorityRules(matchedRulesList);
  for (let rule of highestPriorityRules) {
    outputTextContent += JSON.stringify(rule, null, 2) + '\n';
  }
  output.textContent = outputTextContent;
}

function getHighestPriorityRules(matchedRulesList) {
  // priority based on priority value
  const highestPriority = Math.max(
    ...matchedRulesList.map((rule) => rule.rule.priority)
  );
  let highestPriorityRules = matchedRulesList.filter(
    (rule) => rule.rule.priority === highestPriority
  );
  if (highestPriorityRules.length === 1) {
    return highestPriorityRules;
  }
  // priority based on action type
  const actionByPriority = [
    'allow',
    'allowAllRequests',
    'block',
    'upgradeScheme',
    'redirect',
    'modifyHeaders'
  ]; // 'modifyHeaders' dealt with differently
  const highestPriorityAction = Math.max(
    ...highestPriorityRules.map((rule) =>
      actionByPriority.indexOf(rule.rule.action.type)
    )
  );
  highestPriorityRules = highestPriorityRules.filter(
    (rule) => rule.rule.action.type === actionByPriority[highestPriorityAction]
  );
  // If priority is not block or redirect, and a 'modifyHeaders' rule exists
  let modifyHeadersRules = matchedRulesList.filter(
    (rule) => rule.rule.action.type === 'modifyHeaders'
  );
  if (
    actionByPriority[highestPriorityAction] !== 'block' &&
    actionByPriority[highestPriorityAction] !== 'redirect' &&
    modifyHeadersRules.length !== 0
  ) {
    // Check for allow or allowAllRequests rule
    let allowRules = highestPriorityRules.filter(
      (rule) =>
        rule.rule.action.type === 'allow' ||
        rule.rule.action.type === 'allowAllRequests'
    );
    // Find highest priority allow or allowAllRequests rule
    let highestAllowPriority = -1;
    let eligibleModifyHeadersRules = [];
    if (allowRules.length > 0) {
      highestAllowPriority = Math.max(
        ...allowRules.map((rule) => rule.rule.priority)
      );
      // Then find all modifyHeaders rules with the same priority or higher
      eligibleModifyHeadersRules = modifyHeadersRules.filter(
        (rule) => rule.rule.priority <= highestAllowPriority
      );
    } else {
      eligibleModifyHeadersRules = modifyHeadersRules;
    }
    // Then find the highest priority modifyHeaders rule based on dev defined priority
    const highestModifyHeadersPriority = Math.max(
      ...eligibleModifyHeadersRules.map((rule) => rule.rule.priority)
    );
    let highestModifyHeadersRules = eligibleModifyHeadersRules.filter(
      (rule) => rule.rule.priority === highestModifyHeadersPriority
    );
    // If there is only one highest priority modifyHeaders rule, return it
    highestPriorityRules = highestModifyHeadersRules;
    // TODO: If not, check the type of headers modified
  }
  return highestPriorityRules;
}

export {
  parsedRulesList,
  displayRules,
  isValidRule,
  isValidURLFilter,
  isValidRuleset
};

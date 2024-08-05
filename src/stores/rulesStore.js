import { defineStore } from 'pinia';
import { useURLFilterStore } from './urlFilterStore';
import { useManifestStore } from './manifestStore';
import { isValidURLFilter, sortRules } from '@/utils';
import { parse } from 'vue/compiler-sfc';

// const urlFilterStore = useURLFilterStore()

export const useRulesStore = defineStore('rules', {
  state: () => ({
    /* Signature of each element of parsedRulesList:
    {
      rule: {
          id: 1,
          priority: 1,
          condition: {
              urlFilter: 'example.com'
          },
          action: {
              type: 'block'
          }
      },
      ruleId: 1,
      rulesetId: 1,
      urlParserIndexedRule: {},
      isEnabled: true | false,
      rulesetFileName: 'rules_1.json'
    }
    */
    parsedRulesList: [],
    rulesetFilesUploaded: false,
    requestMatched: false,
    matchedRule: {},
    urlFilterStore: useURLFilterStore(),
    manifestStore: useManifestStore()
  }),
  getters: {
    getParsedRulesList(state) {
      return state.parsedRulesList;
    },
    getRulesetFilesUploaded(state) {
      return state.rulesetFilesUploaded;
    },
    getRequestMatched(state) {
      return state.requestMatched;
    },
    getRulsetsList(state) {
      return state.rulesetsList;
    }
  },
  actions: {
    clearParsedRulesList() {
      this.parsedRulesList = [];
    },
    setRulesetFilesUploaded(value) {
      this.rulesetFilesUploaded = value;
    },
    getRuleset(rulesetFileName) {
      if (!this.getParsedRulesList) {
        return [];
      }
      let ruleset = [];
      for (let index in this.parsedRulesList) {
        const ruleItem = this.parsedRulesList[index];

        if (ruleItem.rulesetFileName === rulesetFileName) {
          ruleset.push(ruleItem.rule);
        }
      }
      return ruleset;
    },
    saveRuleset(rulesetFileName, ruleset) {
      let updatedRulesList = [];
      let processedRuleIds = new Set();

      for (let parsedRule of this.parsedRulesList) {
        if (parsedRule.rulesetFileName === rulesetFileName) {
          let ruleUpdated = false;

          for (let rule of ruleset) {
            if (!this.isValidRule(rule)) continue;
            let indexedRule = this.urlFilterStore.parseURLFilter(
              rule.condition.urlFilter
            );

            if (rule.id === parsedRule.ruleId) {
              parsedRule.rule = rule;
              parsedRule.urlParserIndexedRule = indexedRule;
              updatedRulesList.push(parsedRule);
              processedRuleIds.add(rule.id);
              ruleUpdated = true;
              break; // Exit the inner loop since the rule is updated
            }
          }

          if (!ruleUpdated) {
            updatedRulesList.push(parsedRule);
          }
        } else {
          updatedRulesList.push(parsedRule);
        }
      }

      // Add new rules that are not present in parsedRulesList
      for (let rule of ruleset) {
        if (processedRuleIds.has(rule.id)) continue;
        if (this.isValidRule(rule)) {
          let indexedRule = this.urlFilterStore.parseURLFilter(
            rule.condition.urlFilter
          );
          updatedRulesList.push({
            rule: rule,
            urlParserIndexedRule: indexedRule,
            ruleId: rule.id,
            rulesetID: this.getRulesetIdForFileName(rulesetFileName), // Assuming a method to get rulesetID
            isEnabled: true,
            rulesetFileName: rulesetFileName
          });
        }
      }

      this.parsedRulesList = updatedRulesList;
    },
    // Checks validity of URLFilter string
    isValidURLFilter,
    // Checks validity of rule, including checking validity of its condition, i.e., the URLFilter string
    isValidRule(rule) {
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
      if (!this.isValidURLFilter(rule.condition.urlFilter)) {
        isValid = false;
      }
      return isValid;
    },
    // Checks syntax and validity of ruleset file
    isValidRuleset(ruleset) {
      // Check if the ruleset is an array and is non-empty
      if (!Array.isArray(ruleset) || ruleset.length === 0) {
        return false;
      }

      // Validate each rule in the ruleset
      for (let rule of ruleset) {
        if (!this.isValidRule(rule)) {
          return false;
        }
      }

      return true;
    },
    setParsedRulesList(ruleset, fileName) {
      for (let rulesetFileInfoObjects of this.manifestStore.getRulesetFilePaths)
        if (rulesetFileInfoObjects.rulesetFilePath === fileName) {
          ruleset.forEach((rule) => {
            if (this.isValidRule(rule)) {
              let indexedRule = this.urlFilterStore.parseURLFilter(
                rule.condition.urlFilter
              );
              this.parsedRulesList.push({
                rule: rule,
                urlParserIndexedRule: indexedRule,
                ruleId: rule.id,
                rulesetID: rulesetFileInfoObjects.rulesetId,
                isEnabled: rulesetFileInfoObjects.isEnabled,
                rulesetFileName: fileName
              });
            }
          });
        }
      sortRules(this.parsedRulesList);
    },
    clearParsedRulesList() {
      this.parsedRulesList = [];
    },
    requestMatcher(request) {
      let url = request.url;
      let matchedRules = [];
      for (let i = 0; i < this.parsedRulesList.length; i++) {
        let indexedRule = this.parsedRulesList[i].urlParserIndexedRule;
        if (this.urlFilterStore.urlMatcher(url, indexedRule)) {
          matchedRules.push(this.parsedRulesList[i]);
        }
      }
      this.requestMatched = true;
      return matchedRules;
    }
  },
  persist: {
    storage: sessionStorage,
    paths: ['parsedRulesList']
  }
});

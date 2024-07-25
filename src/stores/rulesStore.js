import { defineStore } from 'pinia';
import { useURLFilterStore } from './urlFilterStore';
import { useManifestStore } from './manifestStore';
import { isValidURLFilter, getHighestPriorityRules } from '@/utils';

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
      isEnabled: true | false
    }
    */
    parsedRulesList: [],
    rulesetFilesUploaded: false,
    urlFilterStore: useURLFilterStore(),
    manifestStore: useManifestStore()
  }),
  getters: {
    getParsedRulesList(state) {
      return state.parsedRulesList;
    }
  },
  actions: {
    clearParsedRulesList() {
      this.parsedRulesList = [];
    },
    setRulesetFilesUploaded(value) {
      this.rulesetFilesUploaded = value;
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
    setParsedRulesList(rulesList, fileName) {
      let rulesetId = 0;
      let isEnabled = false;
      for (let ruleset of this.manifestStore.getRulesetFilePaths)
        if (ruleset.rulesetFilePath === fileName) {
          rulesetId = ruleset.rulesetId;
          isEnabled = ruleset.isEnabled;
        }
      rulesList.forEach((rule) => {
        const ruleID = rule.id;
        if (this.isValidRule(rule)) {
          let indexedRule = this.urlFilterStore.parseURLFilter(
            rule.condition.urlFilter
          );
          this.parsedRulesList.push({
            rule: rule,
            urlParserIndexedRule: indexedRule,
            ruleId: ruleID,
            rulesetId: rulesetId,
            isEnabled: isEnabled
          });
        }
      });
    },
    requestMatcher(request) {
      let url = request.url;
      let ruleset = this.parsedRulesList;
      let matchedRules = [];
      for (let i = 0; i < ruleset.length; i++) {
        let indexedRule = ruleset[i].urlParserIndexedRule;
        if (this.urlFilterStore.urlMatcher(url, indexedRule)) {
          matchedRules.push(ruleset[i]);
        }
      }
      let highestPriorityRules = getHighestPriorityRules(matchedRules);
      return highestPriorityRules;
    }
  }
});

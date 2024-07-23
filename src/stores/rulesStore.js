import { defineStore } from 'pinia';
import { useURLFilterStore } from './urlFilterStore';
import { isValidURLFilter, getHighestPriorityRules } from '@/utils';

// const urlFilterStore = useURLFilterStore()

export const useRulesStore = defineStore('rules', {
  state: () => ({
    parsedRulesList: [],
    rulesetFilesUploaded: false,
    urlFilterStore: useURLFilterStore()
  }),
  getters: {
    getParsedRulesList(state) {
      return state.parsedRulesList;
    }
  },
  actions: {
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
    // Test input url against the generated indexedRule object
    urlMatcher(url, indexedRule) {
      const urlPattern = indexedRule.urlPattern;

      if (indexedRule.urlPatternType === 'SUBSTRING') {
        if (!url.includes(urlPattern)) {
          return false;
        } else {
          return true;
        }
      } else if (indexedRule.urlPatternType === 'WILDCARDED') {
        let substrings = [];
        let string = '';
        for (let i = 0; i < urlPattern.length; i++) {
          if (
            urlPattern[i] === '*' ||
            urlPattern[i] === '^' ||
            urlPattern[i] === '|'
          ) {
            if (string) {
              substrings.push(string);
              string = '';
            }
          } else {
            string += urlPattern[i];
          }
        }
        substrings.push(string);
        let x = 0; // index in urlPattern
        let index; // index in url where the checking starts
        if (indexedRule.anchorLeft === 'BOUNDARY') {
          index = 0;
        } else {
          index = url.indexOf(substrings[0]);
          if (index == -1) {
            return false;
          }
        }
        if (indexedRule.anchorRight === 'BOUNDARY') {
          if (
            urlPattern[urlPattern.length - 1] != '^' &&
            urlPattern[urlPattern.length - 1] != '*' &&
            url.endsWith(substrings[substrings.length - 1])
          ) {
            return true;
          }
        }
        if (indexedRule.anchorLeft === 'SUBDOMAIN') {
          index = url.indexOf(substrings[0]);
          if (index == -1) {
            return false;
          }
        }
        let unmatchables =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.%';
        // DOUBT: Can multiple wildcards be present in the urlPattern?
        while (urlPattern[x] == '*') {
          x++;
        }
        while (urlPattern[x] == '^') {
          if (unmatchables.includes(url[index])) {
            return false;
          }
          x++;
          index++;
        }
        let inOrder = url.indexOf(substrings[0], index) != -1;
        for (let i = 1; i < substrings.length; i++) {
          if (
            url.indexOf(substrings[i], url.indexOf(substrings[i - 1])) == -1
          ) {
            inOrder = false;
            break;
          }
        }
        if (inOrder) {
          return true;
        } else {
          return false;
        }
      }
    },
    /*
    const rulesetObject = {
        ruleset: rulesetJSONParsed,
        rulesetId: rulesetIndex
    }
    */
    setParsedRulesList(rulesetObject) {
      rulesetObject.ruleset.forEach((rule) => {
        const ruleID = rule.id;
        if (this.isValidRule(rule)) {
          let indexedRule = this.urlFilterStore.parseURLFilter(
            rule.condition.urlFilter
          );
          this.parsedRulesList.push({
            rule: rule,
            urlParserIndexedRule: indexedRule,
            ruleId: ruleID,
            rulesetId: rulesetObject.rulesetId
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
        if (this.urlMatcher(url, indexedRule)) {
          matchedRules.push(ruleset[i]);
        }
      }
      let highestPriorityRules = getHighestPriorityRules(matchedRules);
      return highestPriorityRules;
    }
  }
});

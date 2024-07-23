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

export { isValidURLFilter, getHighestPriorityRules };

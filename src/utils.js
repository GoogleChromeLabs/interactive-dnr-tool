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
function sortRules(parsedRulesList) {
  parsedRulesList.sort((a, b) => {
    // Compare by developer-defined priority
    if (a.rule.priority !== b.rule.priority) {
      return b.rule.priority - a.rule.priority;
    }

    // If priorities are equal, compare by action field
    const actionOrder = [
      'allow',
      'allowAllRequests',
      'block',
      'upgradeScheme',
      'redirect'
    ];
    const aActionIndex = actionOrder.indexOf(a.rule.action.type);
    const bActionIndex = actionOrder.indexOf(b.rule.action.type);

    if (aActionIndex !== bActionIndex) {
      return aActionIndex - bActionIndex;
    }

    // If both priority and action type are the same, compare modifyHeaders rules
    if (a.rule.action.type !== 'block' && a.rule.action.type !== 'redirect') {
      const aModifyHeaders = a.rule.action.modifyHeaders || [];
      const bModifyHeaders = b.rule.action.modifyHeaders || [];

      for (
        let i = 0;
        i < Math.min(aModifyHeaders.length, bModifyHeaders.length);
        i++
      ) {
        const aHeader = aModifyHeaders[i];
        const bHeader = bModifyHeaders[i];

        // Compare header modification operations
        if (aHeader.operation !== bHeader.operation) {
          const operationOrder = ['append', 'set', 'remove'];
          const aOperationIndex = operationOrder.indexOf(aHeader.operation);
          const bOperationIndex = operationOrder.indexOf(bHeader.operation);
          return aOperationIndex - bOperationIndex;
        }
      }
    }

    // If all criteria are the same, retain original order
    return 0;
  });
}

export { isValidURLFilter, sortRules };

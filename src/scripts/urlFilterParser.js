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

// urlFilterParser.js

import { isValidURLFilter } from "./rules.js";

let indexedRuleTest = {}; // Object to store the parsed rule (since only one rule is parsed at a time, this variable is just for testing purposes)

/* URLFilterParser: Class for parsing the URLFilter string of a rule, borrows generously from Chromium source code:-
   https://source.chromium.org/chromium/chromium/src/+/main:extensions/browser/api/declarative_net_request/indexed_rule.cc;l=47
   Helper class contaning methods to parse the URLFilter string of a rule
   Returns an object 'indexedRule' with the following signature:-
   {
       anchorLeft: 'BOUNDARY' | 'SUBDOMAIN' | 'NONE',
       urlPatternType: 'SUBSTRING' | 'WILDCARDED',
       urlPattern: 'abc*def',
       anchorRight: 'BOUNDARY' | 'NONE'
   }*/

class URLFilterParser {
    constructor(urlFilter, indexedRule) {
        this.urlFilter = urlFilter || '';
        this.urlFilterLen = this.urlFilter.length;
        this.index = 0;
        this.indexedRule = indexedRule;
    }
    static parse(urlFilter, indexedRule) {
        if (!indexedRule) {
            throw new Error('IndexedRule is required');
        }
        if(!isValidURLFilter(urlFilter)){
            throw new Error('Invalid URLFilter string');            
        }
        new URLFilterParser(urlFilter, indexedRule).parseImpl();
    }
    parseImpl() {
        this.parseLeftAnchor();
        console.assert(this.index <= 2, 'Index should be less than or equal to 2');

        this.parseFilterString();
        console.assert(this.index === this.urlFilterLen || this.index + 1 === this.urlFilterLen,
        'Index should be at the end or one before the end of urlFilter length');

        this.parseRightAnchor();
        console.assert(this.index === this.urlFilterLen, 'Index should be equal to urlFilter length');
    }
    parseLeftAnchor() {
        this.indexedRule.anchorLeft = 'NONE';
        if (this.isAtAnchor()) {
            ++this.index;
            this.indexedRule.anchorLeft = 'BOUNDARY';
            if (this.isAtAnchor()) {
                ++this.index;
                this.indexedRule.anchorLeft = 'SUBDOMAIN';
            }
        }
    }
    parseFilterString() {
        this.indexedRule.urlPatternType = 'SUBSTRING';
        let leftIndex = this.index;
        while (this.index < this.urlFilterLen && !this.isAtRightAnchor()) {
            if (this.isAtSeparatorOrWildcard()) {
                this.indexedRule.urlPatternType = 'WILDCARDED';
            }
            ++this.index;
        }
        this.indexedRule.urlPattern = this.urlFilter.substring(leftIndex, this.index);
    }
    parseRightAnchor() {
        this.indexedRule.anchorRight = 'NONE';
        if (this.isAtRightAnchor()) {
            ++this.index;
            this.indexedRule.anchorRight = 'BOUNDARY';
        }
    }
    isAtSeparatorOrWildcard() {
        return this.isAtValidIndex() && (this.urlFilter[this.index] === '^' || this.urlFilter[this.index] === '*');
    }
    isAtRightAnchor() {
        return this.isAtAnchor() && this.index > 0 && this.index + 1 === this.urlFilterLen;
    }
    isAtValidIndex() {
        return this.index < this.urlFilterLen;
    }
    isAtAnchor() {
        return this.isAtValidIndex() && this.urlFilter[this.index] === '|';
    }
}

// Demo for urlFilterParse()
function urlFilterParseDemo() {
    const urlFilter = document.getElementById('urlFilterInput').value;
    let indexedRule = {};
    URLFilterParser.parse(urlFilter, indexedRule);
    document.getElementById('parsedRuleOutput').textContent = JSON.stringify(indexedRule, null, 2);
    indexedRuleTest = indexedRule; // For testing purposes
}

// Create indexedRule object for given URLFilter string
function urlFilterParse(urlFilterString) {
    let indexedRule = {};
    URLFilterParser.parse(urlFilterString, indexedRule);
    return indexedRule;
}

// Test input url against the generated indexedRule object
function urlMatcher(url, indexedRule){
    const urlPattern = indexedRule.urlPattern;

    if(indexedRule.urlPatternType === 'SUBSTRING'){
        if(!url.includes(urlPattern)){
            return false;
        } else {
            return true;
        }
    } else if(indexedRule.urlPatternType === 'WILDCARDED'){        
        let substrings = [];
        let string = "";
        for(let i = 0; i < urlPattern.length; i++){
            if(urlPattern[i] === '*' || urlPattern[i] === '^' || urlPattern[i] === '|'){
                if(string){
                    substrings.push(string);
                    string = "";
                }
            } else {
                string += urlPattern[i];
            }
        }
        substrings.push(string);
        let x = 0; // index in urlPattern
        let y = 0; // index in substrings
        let index; // index in url where the checking starts
        if(indexedRule.anchorLeft === 'BOUNDARY'){
            index = 0;
        } else {
            index = url.indexOf(substrings[0]);
            if(index == -1){
                return false;
            }
        }
        if(indexedRule.anchorRight === 'BOUNDARY'){
            if((urlPattern[urlPattern.length - 1] != '^' && urlPattern[urlPattern.length - 1] != '*') && url.endsWith(substrings[substrings.length - 1])){
                return true;
            }
        }
        if(indexedRule.anchorLeft === 'SUBDOMAIN'){
            index = url.indexOf(substrings[0]);
            if(index == -1){
                return false;
            }
        }
        let unmatchables = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.%";
        // DOUBT: Can multiple wildcards be present in the urlPattern?
        while(urlPattern[x] == '*'){
            x++;
        }
        while(urlPattern[x] == '^'){
            if(unmatchables.includes(url[index])){
                return false;
            }
            x++;
            index++;
        }
        let inOrder = (url.indexOf(substrings[0], index) != -1);
        for(let i = 1; i < substrings.length; i++){
            if(url.indexOf(substrings[i], url.indexOf(substrings[i - 1])) == -1){
                inOrder = false;
                break;
            }
        }
        if(inOrder){
            return true;
        } else {
            return false;
        }
    }
}

document.getElementById("UrlFilterParseDemoButton").addEventListener("click", urlFilterParseDemo);

// Testing request matching
document.getElementById("UrlTestButton").addEventListener("click", () => {
    const testUrlElement = document.getElementById("urlTestInput");
    const outputElement = document.getElementById("urlTestOutput");
    if(!testUrlElement.checkValidity()){
        outputElement.textContent = "Invalid URL entered";
        return false;
    }
    const testUrl = testUrlElement.value;
    let urlMatcherOutput = urlMatcher(testUrl, indexedRuleTest);
    outputElement.textContent = urlMatcherOutput;
});

// TODO: Better state sharing
export { URLFilterParser, urlFilterParseDemo, urlFilterParse, urlMatcher };

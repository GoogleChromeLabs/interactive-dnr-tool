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

// manifest.js

let rulesetFilePaths = [];

// Uploading and displaying manifest file
const manifestFileInput = document.getElementById('manifestFileInput');
manifestFileInput.addEventListener('change', (event) => {
    const manifestFile = event.target.files[0];
    if(manifestFile){
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const manifestObject = JSON.parse(e.target.result);
                let manifestValidationResult = isValidManifest(manifestObject); // true if no errors, error object otherwise
                if(manifestValidationResult === true){ // if manifestValidationResult is true, i.e., there are no errors
                    displayRulesetFilePaths(manifestObject);
                } else {
                    const fileInfoDiv = document.getElementById('manifestFileInfo');

                    let output = "Issues found:\n";

                    for (let i = 0; i < manifestValidationResult['type'].length; i++) {
                        if (manifestValidationResult['type'][i] === 'missingFields') {
                            let missingFields = manifestValidationResult['missingFields'].join(', ');
                            output += `- Missing fields: ${missingFields}\n`;
                        }
                        if (manifestValidationResult['type'][i] === 'invalidValueTypes') {
                            let invalidValueTypes = manifestValidationResult['invalidValueTypes'].join(', ');
                            output += `- Invalid value types for: ${invalidValueTypes}\n`;
                        }
                    }
                    
                    fileInfoDiv.innerText = output;
                        
                }
            } catch(error){
                console.log("Error parsing manifest JSON: ", error);
                document.getElementById('manifestFileInfo').textContent = 'Error parsing manifest.json file';
            }
        }
        reader.readAsText(manifestFile);
    }
});

// Display the paths for the ruleset files, as defined in the manifest
function displayRulesetFilePaths(manifest){
    const fileInfo = document.getElementById('manifestFileInfo');
    let output = 'Ruleset Files:\n';    
    if(manifest.declarative_net_request.rule_resources){
        manifest.declarative_net_request.rule_resources.forEach(ruleset => {
            output += `- ${ruleset.id}: ${ruleset.path}, Enabled: ${ruleset.enabled}\n`;
            rulesetFilePaths.push({rulesetFilePath: ruleset.path, rulesetId: ruleset.id});
        });
        fileInfo.innerText = output;     
    }       
}

// Returns true if the manifest is valid, else returns an object with the errors
function isValidManifest(manifest) {
    let syntaxError = {};
    syntaxError['type'] = [];

    // Check for declarativeNetRequest permission
    if(!manifest.permissions.includes('declarativeNetRequest')){
        syntaxError.isError = true;
        syntaxError['type'].push('missingPermissions');
    }

    // TODO: Check for declarativeNetRequestFeedback permission if debug-only features used
    

    // Check for required fields
    const requiredFieldsAndTypes = { // "description" and "icon" required for uploading to web store
        "name": "string",
        "version": "string",
        "manifest_version": "number",
    }
    for (let field of Object.keys(requiredFieldsAndTypes)) {
        if (!manifest.hasOwnProperty(field)) {
            syntaxError.isError = true;
            syntaxError['type'].push('missingFields');
            syntaxError['missingFields'] = [];
            syntaxError['missingFields'].push(requiredFields[i]);
        } else if(manifest.hasOwnProperty(field) && (typeof manifest[field] !== requiredFieldsAndTypes[field])){
            syntaxError.isError = true;
            if(!syntaxError['type'].includes('invalidValueTypes')){
                syntaxError['type'].push('invalidValueTypes');
                syntaxError['invalidValueTypes'] = [];
            }
            syntaxError['invalidValueTypes'].push(field);
        }
    }

    const otherFieldsAndTypes = {
        "action": "object",
        "author": "string",
        "background": "object",
        "browser_action": "object",
        "chrome_settings_overrides": "object",
        "chrome_ui_overrides": "object",
        "chrome_url_overrides": "object",
        "commands": "object",
        "content_security_policy": "string",
        "content_scripts": "array",
        "converted_from_user_script": "boolean",
        "current_locale": "string",
        "default_locale": "string",
        "description": "string",
        "devtools_page": "string",
        "event_rules": "array",
        "externally_connectable": "object",
        "file_browser_handlers": "array",
        "file_system_provider_capabilities": "object",
        "homepage_url": "string",
        "host_permissions": "array",
        "icons": "object",
        "import": "array",
        "incognito": "object",
        "input_components": "object",
        "key": "string",
        "minimum_chrome_version": "string",
        "nacl_modules": "array",
        "oauth2": "object",
        "offline_enabled": "boolean",
        "omnibox": "object",
        "optional_permissions": "array",
        "options_page": "string",
        "options_ui": "object",
        "page_action": "object",
        "permissions": "array",
        "platforms": "object",
        "replacement_web_app": "object",
        "requirements": "object",
        "sandbox": "object",
        "short_name": "string",
        "sidebar_action": "object",
        "storage": "object",
        "tts_engine": "object",
        "update_url": "string",
        "version_name": "string",
        "web_accessible_resources": "array",
        "webview": "object"
    };
    
    for(let field of Object.keys(otherFieldsAndTypes)){

        if(manifest.hasOwnProperty(field)){
            if(otherFieldsAndTypes[field] === "array"){
                if(!Array.isArray(manifest[field])){
                    syntaxError.isError = true;
                    if(!syntaxError['type'].includes('invalidValueTypes')){
                        syntaxError['type'].push('invalidValueTypes');
                        syntaxError['invalidValueTypes'] = [];
                    }
                    syntaxError['invalidValueTypes'].push(field);
                }
            } else {
                if(typeof manifest[field] !== otherFieldsAndTypes[field]){
                    syntaxError.isError = true;
                    if(!syntaxError['type'].includes('invalidValueTypes')){
                        syntaxError['type'].push('invalidValueTypes');
                        syntaxError['invalidValueTypes'] = [];
                    }
                    syntaxError['invalidValueTypes'].push(field);
                }
            }
        }

        /*if(manifest.hasOwnProperty(field) && (otherFieldsAndTypes[field] !== "array") && (typeof manifest[field] !== otherFieldsAndTypes[field])){
            syntaxError.isError = true;
            if(!syntaxError['type'].includes('invalidValueTypes')){
                syntaxError['type'].push('invalidValueTypes');
            }
            syntaxError['invalidValueTypes'].push(field);
        }
        if(manifest.hasOwnProperty(field) && (otherFieldsAndTypes[field] === "array") && !Array.isArray(manifest[field])){
            syntaxError.isError = true;
            if(!syntaxError['type'].includes('invalidValueTypes')){
                syntaxError['type'].push('invalidValueTypes');
            }
            syntaxError['invalidValueTypes'].push(field);
        }*/
    }

    if(syntaxError.isError == true){
        return syntaxError;
    } else {
        return true;
    }
}

// TODO: Better state sharing
export { rulesetFilePaths, displayRulesetFilePaths, isValidManifest };

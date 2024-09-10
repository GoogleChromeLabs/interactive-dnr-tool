
# Interactive DNR Tool
## About
The goal of this project is to create a user-friendly web application that helps extension developers make extensions that use the [declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest). It aims to provide a visual representation of the flow of data and the execution of rules, helping developers monitor, preview and debug their extensions’ behaviour effectively.

Complete project proposal: [GSoC '24 Proposal - DNR Interactive Tool for Chrome Extensions](https://docs.google.com/document/d/1u1KM-eUJV1uFelV0dwjk4DaX8g7enOsITz9cWW7NVq4/edit?usp=sharing)

## Installation

To set up and run this project locally, follow these steps:
   
1. __Clone the Repository__: Clone the project repository to your local machine using the command `git clone https://github.com/GoogleChromeLabs/interactive-dnr-tool.git`.
2. __Navigate to the Project Directory__: Open your command line tool and navigate to the project directory using `cd interactive-dnr-tool`.
3. __Install Dependencies__: Run `npm install` to install all the necessary packages and dependencies.
4. __Run the Project__: Start the development server by running `npm run dev`. Open your web browser and go to the specified port to view the application.

If you encounter any issues during installation, make sure all dependencies are correctly installed, review any error messages for clues, and check the project documentation or open an issue on GitHub for further assistance.


## How to Use
To use this tool, you need to acquire the extension's source code and do the following:

1. __Upload Your Manifest File:__ Click on the "Upload Manifest" section or drag and drop your `manifest.json` file. Ensure that the file contains all necessary fields.
2.  __Upload Ruleset files:__ After uploading the manifest, proceed to upload one or more ruleset files by clicking  the "Upload Ruleset Files" section or by dragging and dropping them. Files should  be in JSON format and follow the specified ruleset structure.
3. __Create HTTP Requests to find the matching rule:__ Fill out the form and click submit to see the matching rule.
4. __Review and Modify Rules:__ Once uploaded, your rules will be displayed in the rules editor. You can review, modify, or delete rules directly within this editor.

## TODO
This project is still a long way from being complete, so contributions are welcome!

1.  Animations to show events like when a rule matches a request, and improving user experience, flow of usage, and general look-and-feel (includes using properly licensed images)    
2.  Functionality to export modified rulesets    
3.  Embedding URL filter string parsing component as part of the [documentation](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)    
4.  Including [response headers](https://github.com/w3c/webextensions/issues/460)    
5.  Writing tests, especially for key functions such as URL filter string parsing and matching    
6.  Enabling more requests types and with specific headers, the frame that made the request, etc.

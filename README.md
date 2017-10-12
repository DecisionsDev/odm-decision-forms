# [HTDS Playground]
![Build Status]([[BUILD_STATUS_URL]])

A React-based UI to init and run Hosted Transparent Decision Services

## Features
- describe

## Requirements
- describe

## Install

```bash
npm install -g odm-htds-playground
```

## Quick Start

Run the server

```bash
odm-htds-playground
```

Then open your browser at:

    http://localhost:3000

```
Usage: odm-htds-playground <RULESETPATH> {OPTIONS} {CONFIG}

RULESETPATH of the Decisison Service to invoke. Eg: /MyRuleApp/1.0/MyRuleset/2.0

--env development --port 3000 --url https://brsv2-3ed79a06.eu-gb.bluemix.net/DecisionService --username resAdmin --password vbt0gh82utrn

OPTIONS:

    --env           One of development, production.

    --port          Express server port. Default is 3000.

CONFIG:

    --url           Url of the Decision Service Runtime. Default is http://localhost:9080/DecisionService

    --username      Username to execute the Decision Service. Default is 'resAdmin'.

    --password      Username's password. Default is 'resAdmin'.

```

# Issues and contributions
For issues relating to the HTDS playground, please use the [GitHub issue tracker](../../issues).
We welcome contributions following [our guidelines](CONTRIBUTING.md).

# License
The source files found in this project are licensed under the [Apache License 2.0](LICENSE).

# Notice
© Copyright IBM Corporation 2017.

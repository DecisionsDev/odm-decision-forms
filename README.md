# HTDS Playground

![Build Status]([[BUILD_STATUS_URL]])

A React-based UI to init and run Hosted Transparent Decision Services

## Prerequisites

This package works on top of [IBM Operational Decision Manager](http://www-03.ibm.com/software/products/en/odm). 
It has been tested with [ODM 8.9.0](https://www-01.ibm.com/common/ssi/cgi-bin/ssialias?infotype=OC&subtype=NA&htmlfid=897/ENUS5725-B69&appname=totalstorage#description).
<br>It is also aimed at working with [IBM ODM on Cloud](http://www-03.ibm.com/software/products/en/ibm-operational-decision-manager-on-cloud)
as well as [IBM Business Rules for Bluemix](https://console.bluemix.net/catalog/services/business-rules).

## Features

This package offers a simple web-based UI serving a form representing the input data of a given Decision Service stored in 
ODM Decision Server Rules.
This allows anyone to easily test a Decision Service, without having to write a JSON payload manually.
From this UI, you can trigger the rule service and get a human-readable representation of the output data returned by 
the service.

## Install

```bash
npm install -g odm-htds-playground
```

## Quick Start

Run the server

```bash
odm-htds-playground <RULESETPATH>
```

Then open your browser at:

    http://localhost:3000

## Usage

```
Usage: odm-htds-playground <RULESETPATH> {OPTIONS} {CONFIG}

RULESETPATH of the Decisison Service to invoke. Eg: /MyRuleApp/1.0/MyRuleset/2.0

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

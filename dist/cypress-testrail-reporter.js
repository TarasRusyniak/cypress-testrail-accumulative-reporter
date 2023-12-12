"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var chalk = require('chalk');
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var reporterOptions = options.reporterOptions;
        _this.testRail = new testrail_1.TestRail(reporterOptions);
        _this.validate(reporterOptions, 'domain');
     if (process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME === undefined) {
        _this.validate(reporterOptions, 'username');
      }
     if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD === undefined) {
        _this.validate(reporterOptions, 'password');
      }
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'suiteId');
        runner.on('start', function () {
            var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
           if (process.env.CYPRESS_TESTRAIL_REPORTER_BROWSER === undefined) {
            var name = (reporterOptions.runName || 'Automated test run') + " " + executionDateTime;
            }
            else {
            var name = (reporterOptions.runName || 'Automated test run') + " " + process.env.CYPRESS_TESTRAIL_REPORTER_BROWSER + " " + executionDateTime;
            }
            var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
            _this.testRail.createRun(name, description);
        });
        runner.on('pass', function (test) {
            let file = test.parent.parent.file;
            let logObject = "";
            if(test.parent.parent.ctx.logObject ){
                logObject = test.parent.parent.ctx.logObject.join(", >> ");
            }
            file = file.split("/")[file.split("/").length-1];
            //file =file.split("/")[file.split("/").length-2]+"/"+file.split("/")[file.split("/").length-1];
            var caseIds = shared_1.titleToCaseIds(test.title);
            test.title=test.title+" https://output.circle-artifacts.com/output/job/"+process.env.CYPRESS_CIRCLE_WORKFLOW_JOB_ID+"/artifacts/0/cypress/videos/"+file+".mp4";

            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Passed,
                        comment: "Execution time: " + test.duration + "ms "+test.title,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        runner.on('fail', function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    if((test.err.message+"").includes("<BLOCKED>")){
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Blocked,
                            comment: "" + test.err.message,
                        };
                    }
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: "" + test.err.message,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        runner.on('pending', function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.OutofScope,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        runner.on('end', function () {
            if (_this.results.length == 0) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
               // _this.testRail.deleteRun();
                return;
            }
            _this.testRail.publishResults(_this.results.sort((a,b) =>  (a.status_id - b.status_id)));
        });
        return _this;
    }
    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map

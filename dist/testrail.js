"use strict";
var globalRunId = null;
Object.defineProperty(exports, "__esModule", {value: true});
var axios = require('axios');
axios.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify(request, null, 2))
    return request
})

axios.interceptors.response.use(response => {
    console.log('Response:', JSON.stringify(response.data, null, 2))
    return response
})
var chalk = require('chalk');
var ids ;
var TestRail = /** @class */ (function () {

    function TestRail(options) {
        this.options = options;
        if (process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME !== undefined) {
            this.options.username = process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD !== undefined) {
            this.options.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
        }
        this.base = "https://" + options.domain + "/index.php?/api/v2";
    }

    TestRail.prototype.createRun = function (name, description) {
        if (globalRunId == null) {
            var _this = this;
            axios({
                method: 'get',

                url: this.base+"/get_cases/"+this.options.projectId+"&suite_id="+this.options.suiteId,
                headers: {},
                auth: {
                    username: this.options.username,
                    password: this.options.password,
                },

            })
                .then(function (response1) {
                    // console.log("Create run: "+JSON.stringify(response1))
                    //console.log("Create run data: "+JSON.stringify(response1.data))
                    ids=response1.data.cases.filter(testcase => testcase.section_id != 26244&&testcase.section_id != 27496).map(testcase => testcase.id)
                    console.log("Create run data: "+JSON.stringify(ids))
                    axios({
                        method: 'post',
                        url: _this.base + "/add_run/" + _this.options.projectId,
                        headers: {'Content-Type': 'application/json'},
                        auth: {
                            username: _this.options.username,
                            password: _this.options.password,
                        },
                        data: JSON.stringify({
                            suite_id: _this.options.suiteId,
                            name: name,
                            description: description,
                            include_all: false,
                            case_ids: ids
                        }),
                    })
                        .then(function (response) {
                            _this.runId = response.data.id;
                            globalRunId = response.data.id
                        })
                        .catch(function (error) {
                            console.log("Create run data: "+JSON.stringify(ids))
                            return console.error(error);
                        });
                })
        };
    };
    TestRail.prototype.deleteRun = function () {
        axios({
            method: 'post',
            url: this.base + "/delete_run/" + globalRunId,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(function (error) {
            return console.error(error);
        });
    };
    TestRail.prototype.publishResults = function (results) {
        var _this = this;
        axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + globalRunId,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({results: results}),
        })
            .then(function (response) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.log('\n', " - Results are published to " + chalk.magenta("https://" + _this.options.domain + "/index.php?/runs/view/" + globalRunId), '\n');
            })
            .catch(function (error) {
                return console.error(error);
            });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map

"use strict";
var FormData = require('form-data');
var globalRunId = null;
var shared_1 = require("./shared");
var excludedGroups;
var includedStatuses;
Object.defineProperty(exports, "__esModule", {value: true});
var axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie')
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
//axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ cookieJar }));
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
var runids ;
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
        setTimeout(() => {
            var _this = this;
            axios({
                method: 'get',
                url: this.base+"/get_runs/"+this.options.projectId+"&limit=3",
                headers: {},
                auth: {
                    username: this.options.username,
                    password: this.options.password,
                },

            }).then(function (responseRuns) {
                runids= responseRuns.data.runs.filter(run => (run.name.includes(process.env.pipelineNumber))).map(run => run.id);;
                console.log("Found next IDs: "+JSON.stringify(runids))
                if (runids.length){
                    _this.runId = runids[0];
                    globalRunId = runids[0];

                    console.log("Next values set into test context"+_this.runId+ "|"+globalRunId)
                    return
                }
                if (globalRunId == null) {

                    const caseIds = shared_1.titleToCaseIds(process.env.tags);
                    console.log("Case Ids: "+caseIds)
                    if (caseIds.length){
                        console.log("Creating test run for test id = " +caseIds)
/////////
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
                                name: process.env.pipelineNumber+" "+ name,
                                description: description,
                                include_all: false,
                                case_ids: caseIds
                            }),
                        })
                            .then(function (response) {
                                _this.runId = response.data.id;
                                globalRunId = response.data.id
                                console.log("Next values set into test context"+_this.runId+ "|"+globalRunId)
                            })
                            .catch(function (error) {
                                console.log("Create run data: "+JSON.stringify(ids))
                                return console.error(error);
                            });
                        ////////

                        return;
                    }
                    console.log("Get test ids: ")
                    axios({
                        method: 'get',

                        url: _this.base+"/get_cases/"+_this.options.projectId+"&suite_id="+_this.options.suiteId,
                        headers: {},
                        auth: {
                            username: _this.options.username,
                            password: _this.options.password,
                        },

                    }).then(function (response1) {
                        if (response1.data._links.next){
                            console.log("inside next: ")
                            return axios({
                                method: 'get',

                                url: _this.base+"/get_cases/"+_this.options.projectId+"&suite_id="+_this.options.suiteId+"&limit=250&offset=250",
                                headers: {},
                                auth: {
                                    username: _this.options.username,
                                    password: _this.options.password,
                                },

                            }).then(function (response2) {
                                console.log("inside respose2: "+response2.data.cases)
                                response1.data.cases=response1.data.cases.concat(response2.data.cases);
                                console.log("added ncases respose2: "+response1.data.cases)
                                return response1;
                            })
                        }else{
                            return response1;
                        }
                    })
                        .then(function (response1) {
                            debugger
                            // console.log("inside ids: "+response1.data._links.next)
                            // if (response1.data._links.next){
                            //     console.log("inside next: ")
                            //     axios({
                            //         method: 'get',
                            //
                            //         url: _this.base+"/get_cases/"+_this.options.projectId+"&suite_id="+_this.options.suiteId+"&limit=250&offset=250",
                            //         headers: {},
                            //         auth: {
                            //             username: _this.options.username,
                            //             password: _this.options.password,
                            //         },
                            //
                            //     }).then(function (response2) {
                            //         console.log("inside respose2: "+response2.data.cases)
                            //         response1.data.cases=response1.data.cases.concat(response2.data.cases);
                            //         console.log("added ncases respose2: "+response1.data.cases)
                            //     })
                            // }else{
                            //
                            // }

                            // console.log("Create run: "+JSON.stringify(response1))
                            //console.log("Create run data: "+JSON.stringify(response1.data))
                            excludedGroups=shared_1.getExcludedGroups(_this.options.excludedGroups);
                            includedStatuses=shared_1.getIncludedStatuses(_this.options.includedStatuses);
                            ids=response1.data.cases.filter(testcase => (!excludedGroups.some(group=>group==testcase.section_id))&&(includedStatuses.some(status=>status==testcase.custom_automation_status))).map(testcase => testcase.id) // testcase.custom_automation_status==3||testcase.custom_automation_status==1||testcase.custom_automation_status==6)).map(testcase => testcase.id)
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
                                    name: process.env.pipelineNumber+" "+ name,
                                    description: description,
                                    include_all: false,
                                    case_ids: ids
                                }),
                            })
                                .then(function (response) {
                                    _this.runId = response.data.id;
                                    globalRunId = response.data.id
                                    console.log("Next values set into test context"+_this.runId+ "|"+globalRunId)
                                })
                                .catch(function (error) {
                                    console.log("Create run data: "+JSON.stringify(ids))
                                    return console.error(error);
                                });
                        })
                };})
        }, (Math.floor(Math.random() * 10) + 1)*1000);
        /////end
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
        var bodyFormData = new FormData();
        bodyFormData.append('name', _this.options.username);
        bodyFormData.append('password', _this.options.password);
        bodyFormData.append('rememberme', 1);
        client.post(
            "https://" + _this.options.domain + "/index.php?/auth/login/",
            bodyFormData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                jar: cookieJar,
                withCredentials: true
            }
        )
            .then(function (response) {
                console.log('cookie 123' +JSON.stringify(response.headers))
                return client.get( "https://" + _this.options.domain + "/index.php?/cases/defects/"+(results[0].case_id),{
                    jar: cookieJar,
                    withCredentials: true
                })
            }).then(
            function (response2){
                debugger
                console.log("results 123: "+JSON.stringify(results))
                // console.log('defects 123' +response2.data)
                var re = new RegExp(".*defectLink.*rel=\"([-a-zA-Z0-9]+)\".*","g");
                var s = response2.data;
                var m;
                // const matches = response2.data.matchAll(re);
                //
                // for (const match of matches) {
                //     console.log("Match 123: "+match);
                //     console.log("Match 123: "+match.index);
                // }

                do {
                    m = re.exec(s);
                    if (m) {
                        console.log("results 123: "+JSON.stringify(results))
                        // console.log("Match");
                        console.log(m[1]);
                        results[0].status_id=6;
                        results[0].comment="[Defect:"+m[1]+"]"+results[0].comment;
                    }else{
                        console.log("no Matches found in text");
                    }
                } while (m);
                axios({
                    method: 'post',
                    url: _this.base + "/add_results_for_cases/" + globalRunId,
                    headers: {'Content-Type': 'application/json'},
                    auth: {
                        username: _this.options.username,
                        password: _this.options.password,
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
            }
        )
            .catch(function (response) {
                //handle error
                console.log(response);
            });


    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map

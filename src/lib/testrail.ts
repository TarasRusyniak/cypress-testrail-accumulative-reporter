const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;
  private ids: Array<Number>;

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  public createRun(name: string, description: string) {
    console.log('\n', chalk.magenta.underline.bold('Started getting testrail tests'));
    console.log('\n', chalk.magenta.underline.bold(`${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`));
    axios({
      method: 'get',
      url: `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`,
      headers: { },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).then(response => {
      console.log("Create run: "+JSON.stringify(response))
      console.log("Create run data: "+JSON.stringify(response.data))
      this.ids=response.data.cases.filter(testcase => testcase.section_id != 26244&&testcase.section_id != 27496).map(testcase => testcase.id)
      axios({
        method: 'post',
        url: `${this.base}/add_run/${this.options.projectId}`,
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
        data: JSON.stringify({
          suite_id: this.options.suiteId,
          name,
          description,
          include_all: false,
          case_ids: this.ids,
        }),
      })
          .then(response => {
            this.runId = response.data.id;
          })
          .catch(error => console.error("Failed to create run "+error));
    })

  }

  public deleteRun() {
    axios({
      method: 'post',
      url: `${this.base}/delete_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).catch(error => console.error(error));
  }

  public publishResults(results: TestRailResult[]) {
    axios({
      method: 'post',
      url: `${this.base}/add_results_for_cases/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({ results }),
    })
      .then(response => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log(
          '\n',
          ` - Results are published to ${chalk.magenta(
            `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
          )}`,
          '\n'
        );
      })
      .catch(error => console.error(error));
  }
}

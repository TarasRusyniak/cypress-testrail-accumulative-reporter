"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
function titleToCaseIds(title) {
    var caseIds = [];
    var testCaseIdRegExp = /\bT?C(\d+)\b/g;
    var m;
    while ((m = testCaseIdRegExp.exec(title)) !== null) {
        var caseId = parseInt(m[1]);
        caseIds.push(caseId);
    }
    return caseIds;
}
exports.titleToCaseIds = titleToCaseIds;
/**
 * Split Groups
 * @param groups
 * @returns {any}
 */
function getExcludedGroups(excludedGroups) {
    var groupIds = [];
    if (excludedGroups){
    groupIds = excludedGroups.split(",");}
    return groupIds;
}

/**
 * Split included statuses
 * @param statuses
 * @returns {any}
 */
function getIncludedStatuses(includedStatuses) {
    var includedStatusesIds = [];
    if (includedStatuses){
        includedStatusesIds = includedStatuses.split(",");}
    return includedStatusesIds;
}
exports.getIncludedStatuses = getIncludedStatuses;
exports.getExcludedGroups = getExcludedGroups;
//# sourceMappingURL=shared.js.map
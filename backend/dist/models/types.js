"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRS_STAGE_NAMES = exports.SRS_INTERVALS = exports.SRSStage = void 0;
// SRS Stages (0-7)
var SRSStage;
(function (SRSStage) {
    SRSStage[SRSStage["APPRENTICE_1"] = 0] = "APPRENTICE_1";
    SRSStage[SRSStage["APPRENTICE_2"] = 1] = "APPRENTICE_2";
    SRSStage[SRSStage["APPRENTICE_3"] = 2] = "APPRENTICE_3";
    SRSStage[SRSStage["APPRENTICE_4"] = 3] = "APPRENTICE_4";
    SRSStage[SRSStage["GURU_1"] = 4] = "GURU_1";
    SRSStage[SRSStage["GURU_2"] = 5] = "GURU_2";
    SRSStage[SRSStage["MASTER"] = 6] = "MASTER";
    SRSStage[SRSStage["ENLIGHTENED"] = 7] = "ENLIGHTENED";
})(SRSStage || (exports.SRSStage = SRSStage = {}));
// SRS stage intervals in hours
exports.SRS_INTERVALS = {
    [SRSStage.APPRENTICE_1]: 4, // 4 hours
    [SRSStage.APPRENTICE_2]: 8, // 8 hours
    [SRSStage.APPRENTICE_3]: 24, // 1 day
    [SRSStage.APPRENTICE_4]: 72, // 3 days
    [SRSStage.GURU_1]: 168, // 1 week
    [SRSStage.GURU_2]: 336, // 2 weeks
    [SRSStage.MASTER]: 720, // 1 month (30 days)
    [SRSStage.ENLIGHTENED]: 2880, // 4 months (120 days)
};
// SRS stage names for display
exports.SRS_STAGE_NAMES = {
    [SRSStage.APPRENTICE_1]: 'Apprentice I',
    [SRSStage.APPRENTICE_2]: 'Apprentice II',
    [SRSStage.APPRENTICE_3]: 'Apprentice III',
    [SRSStage.APPRENTICE_4]: 'Apprentice IV',
    [SRSStage.GURU_1]: 'Guru I',
    [SRSStage.GURU_2]: 'Guru II',
    [SRSStage.MASTER]: 'Master',
    [SRSStage.ENLIGHTENED]: 'Enlightened',
};

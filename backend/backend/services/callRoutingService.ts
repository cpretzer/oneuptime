export default {
    findBy: async function({ query, skip, limit, select, populate }: $TSFixMe) {
        if (!skip) skip = 0;

        if (!limit) limit = 0;

        if (typeof skip === 'string') skip = parseInt(skip);

        if (typeof limit === 'string') limit = parseInt(limit);

        if (!query) query = {};

        if (!query.deleted) query.deleted = false;

        let callRoutingQuery = CallRoutingModel.find(query)
            .lean()
            .sort([['createdAt', -1]])
            .limit(limit)
            .skip(skip);
        callRoutingQuery = handleSelect(select, callRoutingQuery);
        callRoutingQuery = handlePopulate(populate, callRoutingQuery);

        const callRouting = await callRoutingQuery;
        return callRouting;
    },

    create: async function(data: $TSFixMe) {
        const callRoutingModel = new CallRoutingModel();
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projectId' does not exist on type 'Docum... Remove this comment to see the full error message
        callRoutingModel.projectId = data.projectId;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'phoneNumber' does not exist on type 'Doc... Remove this comment to see the full error message
        callRoutingModel.phoneNumber = data.phoneNumber;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'locality' does not exist on type 'Docume... Remove this comment to see the full error message
        callRoutingModel.locality = data.locality;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'region' does not exist on type 'Document... Remove this comment to see the full error message
        callRoutingModel.region = data.region;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'capabilities' does not exist on type 'Do... Remove this comment to see the full error message
        callRoutingModel.capabilities = data.capabilities;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'price' does not exist on type 'Document<... Remove this comment to see the full error message
        callRoutingModel.price = data.price;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'priceUnit' does not exist on type 'Docum... Remove this comment to see the full error message
        callRoutingModel.priceUnit = data.priceUnit;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'countryCode' does not exist on type 'Doc... Remove this comment to see the full error message
        callRoutingModel.countryCode = data.countryCode;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'numberType' does not exist on type 'Docu... Remove this comment to see the full error message
        callRoutingModel.numberType = data.numberType;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'stripeSubscriptionId' does not exist on ... Remove this comment to see the full error message
        callRoutingModel.stripeSubscriptionId = data.stripeSubscriptionId;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'sid' does not exist on type 'Document<an... Remove this comment to see the full error message
        callRoutingModel.sid = data.sid;

        const numbers = await callRoutingModel.save();
        return numbers;
    },

    countBy: async function(query: $TSFixMe) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;
        const count = await CallRoutingModel.countDocuments(query);
        return count;
    },

    deleteBy: async function(query: $TSFixMe, userId: $TSFixMe) {
        if (!query) {
            query = {};
        }

        query.deleted = false;
        const numbers = await CallRoutingModel.findOneAndUpdate(
            query,
            {
                $set: {
                    deleted: true,
                    deletedById: userId,
                    deletedAt: Date.now(),
                },
            },
            {
                new: true,
            }
        );
        const stripeSubscriptionId = numbers.stripeSubscriptionId;
        await Promise.all([
            TwilioService.releasePhoneNumber(numbers.projectId, numbers.sid),
            PaymentService.removeSubscription(stripeSubscriptionId),
        ]);

        return numbers;
    },

    findOneBy: async function({ query, select, populate }: $TSFixMe) {
        if (!query) {
            query = {};
        }
        if (!query.deleted) query.deleted = false;

        let callRoutingQuery = CallRoutingModel.findOne(query)
            .lean()
            .sort([['createdAt', -1]]);
        callRoutingQuery = handleSelect(select, callRoutingQuery);
        callRoutingQuery = handlePopulate(populate, callRoutingQuery);

        const callRouting = await callRoutingQuery;
        return callRouting;
    },

    updateOneBy: async function(query: $TSFixMe, data: $TSFixMe) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;

        const updatedCallRouting = await CallRoutingModel.findOneAndUpdate(
            query,
            {
                $set: data,
            },
            {
                new: true,
            }
        );
        return updatedCallRouting;
    },

    updateBy: async function(query: $TSFixMe, data: $TSFixMe) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;
        let updatedData = await CallRoutingModel.updateMany(query, {
            $set: data,
        });
        const populate = [{ path: 'projectId', select: 'name slug _id' }];
        const select =
            'projectId deleted phoneNumber locality region capabilities routingSchema sid price priceUnit countryCode numberType stripeSubscriptionId';
        updatedData = await this.findBy({ query, populate, select });
        return updatedData;
    },

    reserveNumber: async function(data: $TSFixMe, projectId: $TSFixMe) {
        let confirmBuy = null;
        const hasCustomTwilioSettings = await TwilioService.hasCustomSettings(
            projectId
        );
        if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ query: { _id: any; }; select: ... Remove this comment to see the full error message
            const project = await ProjectService.findOneBy({
                query: { _id: projectId },
                select: 'users',
            });
            let owner = project.users.filter(
                (user: $TSFixMe) => user.role === 'Owner'
            );
            owner = owner && owner.length ? owner[0] : owner;
            const user = await UserService.findOneBy({
                query: { _id: owner.userId },
                select: 'stripeCustomerId',
            });
            const stripeCustomerId = user.stripeCustomerId;
            const stripeSubscription = await PaymentService.createSubscription(
                stripeCustomerId,
                data.price
            );
            if (
                stripeSubscription &&
                stripeSubscription.id &&
                stripeSubscription.id.length
            ) {
                data.stripeSubscriptionId = stripeSubscription.id;
            } else {
                const error = new Error('Error Creating Subscription.');
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'code' does not exist on type 'Error'.
                error.code = 400;
                throw error;
            }
            if (
                data &&
                data.stripeSubscriptionId &&
                data.stripeSubscriptionId.length
            ) {
                confirmBuy = await TwilioService.buyPhoneNumber(
                    data.projectId,
                    data.phoneNumber
                );
            }
        } else {
            confirmBuy = await TwilioService.buyPhoneNumber(
                data.projectId,
                data.phoneNumber
            );
        }
        data.sid = confirmBuy && confirmBuy.sid ? confirmBuy.sid : null;
        const CallRouting = await this.create(data);
        return CallRouting;
    },

    findTeamMember: async function(type: $TSFixMe, id: $TSFixMe) {
        let user;
        const selectEscalation = 'teams createdAt deleted deletedAt';

        const populateEscalation = [
            {
                path: 'teams.teamMembers.user',
                select: 'name email',
            },
            {
                path: 'teams.teamMembers.groups',
                select: 'teams name',
            },
        ];
        if (type && type === 'TeamMember') {
            user = await UserService.findOneBy({
                query: { _id: id },
                select: 'alertPhoneNumber _id',
            });
            if (user && user.alertPhoneNumber && user.alertPhoneNumber.length) {
                return {
                    forwardingNumber: user.alertPhoneNumber,
                    error: null,
                    userId: user && user._id ? user._id : null,
                };
            } else {
                return {
                    forwardingNumber: null,
                    error: 'Active team have not added their phone number yet',
                    userId: user && user._id ? user._id : null,
                };
            }
        } else if (type && type === 'Schedule') {
            const schedules = await ScheduleService.findOneBy({
                query: { _id: id },
                select: '_id escalationIds',
            });
            const escalationId =
                schedules &&
                schedules.escalationIds &&
                schedules.escalationIds.length
                    ? schedules.escalationIds[0]
                    : null;
            const escalation = escalationId
                ? await EscalationService.findOneBy({
                      query: { _id: escalationId },
                      select: selectEscalation,
                      populate: populateEscalation,
                  })
                : null;
            const activeTeam =
                escalation && escalation.activeTeam
                    ? escalation.activeTeam
                    : null;
            if (
                activeTeam &&
                activeTeam.teamMembers &&
                activeTeam.teamMembers.length
            ) {
                let dutyCheck = 0;
                for (const teamMember of activeTeam.teamMembers) {
                    const [isOnDuty, user] = await Promise.all([
                        AlertService.checkIsOnDuty(
                            teamMember.startTime,
                            teamMember.endTime
                        ),
                        UserService.findOneBy({
                            query: { _id: teamMember.userId },
                            select: 'alertPhoneNumber _id',
                        }),
                    ]);
                    if (!user || !isOnDuty) {
                        continue;
                    }
                    if (
                        user &&
                        user.alertPhoneNumber &&
                        user.alertPhoneNumber.length
                    ) {
                        dutyCheck++;
                        return {
                            forwardingNumber: user.alertPhoneNumber,
                            error: null,
                            userId: user && user._id ? user._id : null,
                        };
                    }
                }
                if (dutyCheck <= 0) {
                    const user = await UserService.findOneBy({
                        query: { _id: activeTeam.teamMembers[0].userId },
                        select: '_id alertPhoneNumber',
                    });
                    if (
                        user &&
                        user.alertPhoneNumber &&
                        user.alertPhoneNumber.length
                    ) {
                        return {
                            forwardingNumber: user.alertPhoneNumber,
                            error: null,
                            userId: user && user._id ? user._id : null,
                        };
                    }
                } else {
                    return {
                        forwardingNumber: null,
                        error:
                            'Active team have not added their phone number yet',
                        // @ts-expect-error ts-migrate(2339) FIXME: Property '_id' does not exist on type 'never'.
                        userId: user && user._id ? user._id : null,
                    };
                }
            } else {
                return {
                    forwardingNumber: null,
                    error: 'Active team unavailable',
                    // @ts-expect-error ts-migrate(2339) FIXME: Property '_id' does not exist on type 'never'.
                    userId: user && user._id ? user._id : null,
                };
            }
        }
    },

    chargeRoutedCall: async function(projectId: $TSFixMe, body: $TSFixMe) {
        const callSid = body['CallSid'];
        const callStatus = body['CallStatus'] || null;
        const callDetails = await TwilioService.getCallDetails(
            projectId,
            callSid
        );
        if (callDetails && callDetails.price) {
            const duration = callDetails.duration;
            let price = callDetails.price;
            if (price && price.includes('-')) {
                price = price.replace('-', '');
            }
            price = price * 10;
            const hasCustomTwilioSettings = await TwilioService.hasCustomSettings(
                projectId
            );
            if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ query: { _id: any; }; select: ... Remove this comment to see the full error message
                const project = await ProjectService.findOneBy({
                    query: { _id: projectId },
                    select: 'users',
                });
                let owner = project.users.filter(
                    (user: $TSFixMe) => user.role === 'Owner'
                );
                owner = owner && owner.length ? owner[0] : owner;
                await PaymentService.chargeAlert(
                    owner.userId,
                    projectId,
                    price
                );
            }
            const callRoutingLog = await CallRoutingLogService.findOneBy({
                query: { callSid },
                select: 'callSid dialTo _id',
            });
            if (callRoutingLog && callRoutingLog.callSid) {
                let dialTo =
                    callRoutingLog.dialTo && callRoutingLog.dialTo.length
                        ? callRoutingLog.dialTo
                        : [];
                dialTo = dialTo.map((dt: $TSFixMe) => {
                    if (dt.callSid !== callSid) {
                        dt.status =
                            callStatus && callStatus.length
                                ? callStatus
                                : dt.status;
                    }
                    return dt;
                });
                await CallRoutingLogService.updateOneBy(
                    { _id: callRoutingLog._id },
                    { price, duration, dialTo }
                );
            } else {
                await CallRoutingLogService.updateOneBy(
                    { callSid: callSid },
                    { price, duration }
                );
            }
        }
        return 'Customer has been successfully charged for the call.';
    },

    getCallResponse: async function(
        data: $TSFixMe,
        to: $TSFixMe,
        body: $TSFixMe,
        backup: $TSFixMe
    ) {
        const fromNumber = body['From'];
        const callSid = body['CallSid'];
        const dialCallSid = body['DialCallSid'] || null;
        const callStatus = body['CallStatus'] || null;
        const dialCallStatus = body['DialCallStatus'] || null;

        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ query: { _id: any; }; select: ... Remove this comment to see the full error message
        const project = await ProjectService.findOneBy({
            query: { _id: data.projectId },
            select: 'balance alertOptions',
        });
        const balance = project.balance;
        const customThresholdAmount = project.alertOptions
            ? project.alertOptions.minimumBalance
            : null;
        const isBalanceMoreThanMinimum = balance > 10;
        const isBalanceMoreThanCustomThresholdAmount = customThresholdAmount
            ? balance > customThresholdAmount
            : null;
        const hasEnoughBalance = isBalanceMoreThanCustomThresholdAmount
            ? isBalanceMoreThanCustomThresholdAmount && isBalanceMoreThanMinimum
            : isBalanceMoreThanMinimum;

        if (!hasEnoughBalance) {
            // @ts-expect-error ts-migrate(2448) FIXME: Block-scoped variable 'response' used before its d... Remove this comment to see the full error message
            response.reject();
            // @ts-expect-error ts-migrate(2448) FIXME: Block-scoped variable 'response' used before its d... Remove this comment to see the full error message
            return response;
        }

        const routingSchema =
            data && data.routingSchema && data.routingSchema.type
                ? data.routingSchema
                : {};
        let memberId = null;
        const response = new twilio.twiml.VoiceResponse();
        let forwardingNumber, error, userId, scheduleId;

        const {
            type,
            id,
            phonenumber,
            backup_type,
            backup_id,
            backup_phonenumber,
            introAudio,
            introtext,
            backup_introAudio,
            backup_introtext,
            callDropText,
            showAdvance,
        } = routingSchema;

        if (!backup && showAdvance && introtext && introtext.length) {
            response.say(introtext);
        }
        if (
            backup &&
            showAdvance &&
            backup_introtext &&
            backup_introtext.length
        ) {
            response.say(backup_introtext);
        }
        if (!backup && showAdvance && introAudio && introAudio.length) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'apiHost' does not exist on type 'Global ... Remove this comment to see the full error message
            response.play(`${global.apiHost}/file/${introAudio}`);
        }
        if (
            backup &&
            showAdvance &&
            backup_introAudio &&
            backup_introAudio.length
        ) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'apiHost' does not exist on type 'Global ... Remove this comment to see the full error message
            response.play(`${global.apiHost}/file/${backup_introAudio}`);
        }

        if (type && !backup) {
            if (id && id.length && type !== 'PhoneNumber') {
                const result = await this.findTeamMember(type, id);
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                forwardingNumber = result.forwardingNumber;
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                error = result.error;
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                userId = result.userId;
                scheduleId = type === 'Schedule' ? id : null;
                if (userId) {
                    memberId = userId;
                }
            } else if (
                type === 'PhoneNumber' &&
                phonenumber &&
                phonenumber.length
            ) {
                forwardingNumber = phonenumber;
                error = null;
                userId = null;
            }
        } else if (backup_type && backup) {
            if (
                backup_id &&
                backup_id.length &&
                backup_type !== 'PhoneNumber'
            ) {
                const result = await this.findTeamMember(
                    backup_type,
                    backup_id
                );
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                forwardingNumber = result.forwardingNumber;
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                error = result.error;
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                userId = result.userId;
                scheduleId = backup_type === 'Schedule' ? backup_id : null;
                if (userId) {
                    memberId = userId;
                }
            } else if (
                backup_type === 'PhoneNumber' &&
                backup_phonenumber &&
                backup_phonenumber.length
            ) {
                forwardingNumber = backup_phonenumber;
                error = null;
                userId = null;
            }
        } else {
            if (showAdvance && callDropText && callDropText.length) {
                response.say(callDropText);
            } else {
                response.say('Sorry could not find anyone on duty');
            }
        }
        if (
            !forwardingNumber ||
            (forwardingNumber && !forwardingNumber.length)
        ) {
            if (showAdvance && callDropText && callDropText.length) {
                response.say(callDropText);
            } else {
                response.say('Sorry could not find anyone on duty');
            }
        }
        if (
            forwardingNumber &&
            (!error || (error && error.length <= 0)) &&
            !backup
        ) {
            response.dial(
                {
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'apiHost' does not exist on type 'Global ... Remove this comment to see the full error message
                    action: `${global.apiHost}/callRouting/routeBackupCall`,
                },
                forwardingNumber
            );
        } else if (
            forwardingNumber &&
            (!error || (error && error.length <= 0)) &&
            backup
        ) {
            response.dial(forwardingNumber);
        } else if (!forwardingNumber && error && error.length) {
            response.say(error);
        }
        const callRoutingLog = await CallRoutingLogService.findOneBy({
            query: { callSid },
            select: '_id dialTo callSid',
        });
        if (callRoutingLog && callRoutingLog.callSid) {
            let dialTo =
                callRoutingLog.dialTo && callRoutingLog.dialTo.length
                    ? callRoutingLog.dialTo
                    : [];
            dialTo = dialTo.map((dt: $TSFixMe) => {
                dt.callSid =
                    dialCallSid && dialCallSid.length ? dialCallSid : callSid;
                dt.status =
                    dialCallStatus && dialCallStatus.length
                        ? dialCallStatus
                        : callStatus;
                return dt;
            });
            dialTo.push({
                callSid: callSid,
                userId: memberId,
                scheduleId: scheduleId,
                phoneNumber: phonenumber,
                status: callStatus,
            });
            await CallRoutingLogService.updateOneBy(
                { _id: callRoutingLog._id },
                { dialTo }
            );
        } else if (data && data._id) {
            await CallRoutingLogService.create({
                callRoutingId: data && data._id ? data._id : null,
                calledFrom: fromNumber,
                calledTo: to,
                dialTo: [
                    {
                        callSid: callSid,
                        userId: memberId,
                        scheduleId: scheduleId,
                        phoneNumber: phonenumber,
                        status: callStatus ? callStatus : null,
                    },
                ],
                callSid: callSid,
            });
        }
        response.say('Goodbye');
        return response;
    },

    updateRoutingSchema: async function(data: $TSFixMe) {
        const currentCallRouting = await this.findOneBy({
            query: { _id: data.callRoutingId },
            select: 'routingSchema',
        });
        const routingSchema =
            currentCallRouting && currentCallRouting.routingSchema
                ? currentCallRouting.routingSchema
                : {};
        const showAdvance =
            Object.keys(data).indexOf('showAdvance') > -1
                ? data.showAdvance
                : 'null';

        if (showAdvance !== 'null') {
            routingSchema.showAdvance = data.showAdvance;
            routingSchema.type = data.type;
            if (data.type && data.type === 'TeamMember') {
                routingSchema.id = data.teamMemberId;
            } else if (data.type && data.type === 'Schedule') {
                routingSchema.id = data.scheduleId;
            } else if (data.type && data.type === 'PhoneNumber') {
                routingSchema.phoneNumber = data.phoneNumber;
            }
            if (showAdvance) {
                routingSchema.backup_type = data.backup_type;
                routingSchema.introtext = data.introtext;
                routingSchema.backup_introtext = data.backup_introtext;
                routingSchema.callDropText = data.callDropText;
                if (data.backup_type && data.backup_type === 'TeamMember') {
                    routingSchema.backup_id = data.backup_teamMemberId;
                } else if (
                    data.backup_type &&
                    data.backup_type === 'Schedule'
                ) {
                    routingSchema.backup_id = data.backup_scheduleId;
                } else if (
                    data.backup_type &&
                    data.backup_type === 'PhoneNumber'
                ) {
                    routingSchema.backup_phoneNumber = data.backup_phoneNumber;
                }
            }
        }
        const CallRouting = await this.updateOneBy(
            { _id: data.callRoutingId },
            { routingSchema }
        );

        return CallRouting;
    },

    updateRoutingSchemaAudio: async function(data: $TSFixMe) {
        const currentCallRouting = await this.findOneBy({
            query: { _id: data.callRoutingId },
            select: 'routingSchema',
        });
        const routingSchema =
            currentCallRouting && currentCallRouting.routingSchema
                ? currentCallRouting.routingSchema
                : {};
        const currentIntroAudio =
            routingSchema &&
            routingSchema.introAudio &&
            routingSchema.introAudio.length
                ? routingSchema.introAudio
                : null;
        const currentBackupIntroAudio =
            routingSchema &&
            routingSchema.backup_introAudio &&
            routingSchema.backup_introAudio.length
                ? routingSchema.backup_introAudio
                : null;

        if (data.audioFieldName && data.audioFieldName === 'introAudio') {
            if (currentIntroAudio) {
                await FileService.deleteOneBy({
                    filename: currentIntroAudio,
                });
            }
            if (data.file && data.file.length) {
                routingSchema.introAudio = data.file;
            }
            if (data.fileName && data.fileName.length) {
                routingSchema.introAudioName = data.fileName;
            }
        } else if (
            data.audioFieldName &&
            data.audioFieldName === 'backup_introAudio'
        ) {
            if (currentBackupIntroAudio) {
                await FileService.deleteOneBy({
                    filename: currentBackupIntroAudio,
                });
            }
            if (data.file && data.file.length) {
                routingSchema.backup_introAudio = data.file;
            }
            if (data.fileName && data.fileName.length) {
                routingSchema.backup_introAudioName = data.fileName;
            }
        }
        const CallRouting = await this.updateOneBy(
            { _id: data.callRoutingId },
            { routingSchema }
        );

        return CallRouting;
    },

    getCallRoutingLogs: async function(projectId: $TSFixMe) {
        let logs: $TSFixMe = [];
        const callRouting = await this.findBy({
            query: { projectId },
            select: '_id',
        });
        if (callRouting && callRouting.length) {
            const select =
                'callRoutingId callSid price calledFrom calledTo duration dialTo';
            for (let i = 0; i < callRouting.length; i++) {
                const callRoutingId = callRouting[i]._id;
                const callLogs = await CallRoutingLogService.findBy({
                    query: { callRoutingId },
                    select,
                });
                if (callLogs && callLogs.length) {
                    logs = logs.concat(callLogs);
                }
            }
        }
        return logs;
    },

    hardDeleteBy: async function(query: $TSFixMe) {
        await CallRoutingModel.deleteMany(query);
        return 'Call routing Number(s) Removed Successfully!';
    },
};

import CallRoutingModel from '../models/callRouting';
import CallRoutingLogService from '../services/callRoutingLogService';
import PaymentService from './paymentService';
import TwilioService from './twilioService';
import ScheduleService from './scheduleService';
import AlertService from './alertService';
import EscalationService from './escalationService';
import UserService from './userService';
import twilio from 'twilio';
// @ts-expect-error ts-migrate(2614) FIXME: Module '"../config/server"' has no exported member... Remove this comment to see the full error message
import { IS_SAAS_SERVICE } from '../config/server';
import ProjectService from './projectService';
import FileService from './fileService';
import handleSelect from '../utils/select';
import handlePopulate from '../utils/populate';

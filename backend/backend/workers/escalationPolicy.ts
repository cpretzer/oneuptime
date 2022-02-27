import ErrorService from 'common-server/utils/error';
import OnCallScheduleStatusService from '../services/onCallScheduleStatusService';
import AlertService from '../services/alertService';
import DateTime from '../utils/DateTime';
import IncidentService from '../services/incidentService';
import ScheduleService from '../services/scheduleService';

export default {
    checkActiveEscalationPolicyAndSendAlerts: async () => {
        try {
            /* 

            #1 - Get all the OnCallScheduleStatus where incidentAcknowledged is false. 
            #2 - Check if incident attached to those schedule is actually NOT ack. If ack, mark this OnCallScheduleStatus.incidentAcknowledged = true and skip; 
            #3 - If incident is not ack, then continue steps below. 
            #4 - Query Alert collection, and get all the alerts attached to that OnCallScheduleStatus
            #5 - Get EscalationPolicy related to OnCallScheduleStatus. 
            #6 - Check if proper alerts are sent. 
            #7 - if proper alert reminders are exhaused, then escalate this incident and alert next set of team members. 
            
            */

            //#1

            const selectOnCallScheduleStatus =
                'escalations createdAt project schedule activeEscalation activeEscalation incident incidentAcknowledged alertedEveryone isOnDuty deleted deletedAt deletedById';

            const populateOnCallScheduleStatus = [
                { path: 'incidentId', select: 'name slug' },
                { path: 'project', select: 'name slug' },
                { path: 'scheduleId', select: 'name slug' },
                { path: 'schedule', select: '_id name slug' },
                {
                    path: 'activeEscalationId',
                    select: 'projectId teams scheduleId',
                },
            ];

            const notAcknowledgedCallScheduleStatuses = await OnCallScheduleStatusService.findBy(
                {
                    query: {
                        incidentAcknowledged: false,
                        alertedEveryone: false,
                    },
                    limit: 9999999,
                    skip: 0,
                    select: selectOnCallScheduleStatus,
                    populate: populateOnCallScheduleStatus,
                }
            );

            for (const notAcknowledgedCallScheduleStatus of notAcknowledgedCallScheduleStatuses) {
                if (!notAcknowledgedCallScheduleStatus) {
                    continue;
                }

                // #2
                if (!notAcknowledgedCallScheduleStatus.incident) {
                    await OnCallScheduleStatusService.updateOneBy({
                        query: { _id: notAcknowledgedCallScheduleStatus._id },
                        data: {
                            incidentAcknowledged: true,
                        },
                    });
                    continue;
                }

                const populate = [
                    {
                        path: 'monitors.monitorId',
                        select: 'name slug componentId projectId type',
                        populate: { path: 'componentId', select: 'name slug' },
                    },
                    { path: 'createdById', select: 'name' },
                    { path: 'projectId', select: 'name slug' },
                    { path: 'resolvedBy', select: 'name' },
                    { path: 'acknowledgedBy', select: 'name' },
                    { path: 'incidentPriority', select: 'name color' },
                    {
                        path: 'acknowledgedByIncomingHttpRequest',
                        select: 'name',
                    },
                    { path: 'resolvedByIncomingHttpRequest', select: 'name' },
                    { path: 'createdByIncomingHttpRequest', select: 'name' },
                    { path: 'probes.probeId', select: 'name _id' },
                ];
                const select =
                    'slug notifications acknowledgedByIncomingHttpRequest resolvedByIncomingHttpRequest _id monitors createdById projectId createdByIncomingHttpRequest incidentType resolved resolvedBy acknowledged acknowledgedBy title description incidentPriority criterionCause probes acknowledgedAt resolvedAt manuallyCreated deleted customFields idNumber';

                const incident = await IncidentService.findOneBy({
                    query: { _id: notAcknowledgedCallScheduleStatus.incident },
                    select,
                    populate,
                });

                if (!incident) {
                    await OnCallScheduleStatusService.updateOneBy({
                        query: { _id: notAcknowledgedCallScheduleStatus._id },
                        data: {
                            incidentAcknowledged: true,
                        },
                    });
                    continue;
                }

                if (incident && incident.acknowledged) {
                    await OnCallScheduleStatusService.updateOneBy({
                        query: { _id: notAcknowledgedCallScheduleStatus._id },
                        data: {
                            incidentAcknowledged: true,
                        },
                    });
                    continue;
                }

                // #3 and #4
                // get active escalation policy.

                const alerts = await AlertService.findBy({
                    query: {
                        onCallScheduleStatus:
                            notAcknowledgedCallScheduleStatus._id,
                    },
                    limit: 9999,
                    skip: 0,
                    sort: { createdAt: -1 },
                    select: 'createdAt',
                }); //sort by createdAt descending.
                if (alerts && alerts.length > 0 && alerts[0]) {
                    //check when the last alert was sent.
                    const lastAlertSentAt = alerts[0].createdAt; //we take '0' index because list is reverse sorted.
                    if (!DateTime.isOlderThanLastMinute(lastAlertSentAt)) {
                        continue;
                    }
                }
                const populateSchedule = [
                    { path: 'userIds', select: 'name' },
                    { path: 'createdById', select: 'name' },
                    { path: 'monitorIds', select: 'name' },
                    {
                        path: 'projectId',
                        select: '_id name slug',
                    },
                    {
                        path: 'escalationIds',
                        select: 'teamMember',
                        populate: {
                            path: 'teamMember.userId',
                            select: 'name',
                        },
                    },
                ];

                const selectSchedule =
                    '_id userIds name slug projectId createdById monitorsIds escalationIds createdAt isDefault userIds';
                let schedule = await ScheduleService.findOneBy({
                    query: { _id: notAcknowledgedCallScheduleStatus.schedule },
                    populate: populateSchedule,
                    select: selectSchedule,
                });
                if (!schedule) {
                    schedule = await ScheduleService.findOneBy({
                        query: {
                            isDefault: true,
                            projectId:
                                notAcknowledgedCallScheduleStatus.project._id ||
                                notAcknowledgedCallScheduleStatus.project,
                        },
                        populate: populateSchedule,
                        select: selectSchedule,
                    });
                }
                //and the rest happens here.

                const monitors = incident.monitors.map(
                    (monitor: $TSFixMe) =>
                        monitor.monitorId._id || monitor.monitorId
                );
                for (const monitor of monitors) {
                    AlertService.sendAlertsToTeamMembersInSchedule({
                        schedule,
                        incident,
                        monitorId: monitor,
                    }).catch(error => {
                        ErrorService.log(
                            'AlertService.sendAlertsToTeamMembersInSchedule',
                            error
                        );
                    });
                }
            }
        } catch (error) {
            ErrorService.log(
                'escalationPolicyCron.checkActiveEscalationPolicyAndSendAlerts',
                error
            );
            throw error;
        }
    },
};

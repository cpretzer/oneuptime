import moment from 'moment';
const MonitorService = require('../services/monitorService'),
    MonitorLogService = require('../services/monitorLogService'),
    MonitorStatusService = require('../services/monitorStatusService'),
    ProbeService = require('../services/probeService'),
    ErrorService = require('common-server/utils/error');

export default {
    checkAllServerMonitors: async () => {
        try {
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            const newDate = new moment();
            const monitors = await MonitorService.findBy({
                query: { type: 'server-monitor' },
                select: 'lastPingTime _id criteria',
            });

            if (monitors) {
                monitors.forEach(async (monitor: $TSFixMe) => {
                    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                    const d = new moment(monitor.lastPingTime);
                    const log = await MonitorLogService.findOneBy({
                        query: { monitorId: monitor._id },
                        select: '_id',
                    });
                    const monitorStatus = await MonitorStatusService.findOneBy({
                        query: { monitorId: monitor._id },
                        select: 'status',
                    });

                    if (
                        newDate.diff(d, 'minutes') > 3 &&
                        (!log ||
                            (monitorStatus &&
                                monitorStatus.status !== 'offline'))
                    ) {
                        await job(monitor);
                    }
                });
            } else {
                return;
            }
        } catch (error) {
            ErrorService.log('serverMonitorCron.checkAllServerMonitor', error);
            throw error;
        }
    },
};

const job = async (monitor: $TSFixMe) => {
    try {
        const { stat: validUp, successReasons } =
            monitor && monitor.criteria && monitor.criteria.up
                ? ProbeService.conditions(monitor.type, monitor.criteria.up)
                : { stat: false, successReasons: [] };
        const { stat: validDown } =
            monitor && monitor.criteria && monitor.criteria.down
                ? ProbeService.conditions(monitor.type, monitor.criteria.down)
                : { stat: false };
        if (!validUp || validDown) {
            await ProbeService.saveMonitorLog({
                monitorId: monitor._id,
                status: 'offline',
                reason: await successReasons.filter(function(
                    item: $TSFixMe,
                    pos: $TSFixMe,
                    self: $TSFixMe
                ) {
                    return self.indexOf(item) == pos;
                }),
            });
        }
    } catch (error) {
        ErrorService.log('serverMonitorCron.job', error);
        throw error;
    }
};

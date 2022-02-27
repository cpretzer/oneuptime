// @ts-expect-error ts-migrate(2614) FIXME: Module '"../util/db"' has no exported member 'upda... Remove this comment to see the full error message
import { updateMany, removeFieldsFromMany } from '../util/db';

const statusPageCollection = 'statuspages';

async function run() {
    await updateMany(
        statusPageCollection,
        { moveIncidentToTheTop: true },
        {
            layout: {
                visible: [
                    { name: 'Header', key: 'header' },
                    {
                        name: 'Active Announcement',
                        key: 'anouncement',
                    },
                    {
                        name: 'Ongoing Scheduled Events',
                        key: 'ongoingSchedule',
                    },
                    { name: 'Incidents List', key: 'incidents' },
                    { name: 'Overall Status of Resources', key: 'resources' },
                    { name: 'Resource List', key: 'services' },
                    {
                        name: 'Past Announcements List',
                        key: 'AnnouncementLogs',
                    },
                    {
                        name: 'Future Scheduled Events',
                        key: 'maintenance',
                    },

                    { name: 'Footer', key: 'footer' },
                ],
                invisible: [
                    { name: 'Scheduled Events Completed', key: 'pastEvents' },
                    { name: 'Twitter Updates', key: 'twitter' },
                ],
            },
        }
    );

    await removeFieldsFromMany(
        statusPageCollection,
        { moveIncidentToTheTop: { $exists: true } },
        { moveIncidentToTheTop: '' }
    );

    return `Script completed`;
}

export default run;

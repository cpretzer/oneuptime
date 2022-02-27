import JsonToCsv from './jsonToCsv';
import { GridFSBucket } from 'mongodb';

export default {
    sendEmptyResponse(req: $TSFixMe, res: $TSFixMe) {
        //purge request.
        //req = null;
        return res.status(200).send();
    },

    sendFileResponse(req: $TSFixMe, res: $TSFixMe, file: $TSFixMe) {
        /** create read stream */

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'client' does not exist on type 'Global &... Remove this comment to see the full error message
        const gfs = new GridFSBucket(global.client, {
            bucketName: 'uploads',
        });

        const readstream = gfs.openDownloadStreamByName(file.filename);

        /** set the proper content type */
        res.set('Content-Type', file.contentType);
        res.status(200);
        /** return response */
        readstream.pipe(res);
    },

    sendErrorResponse: function(req: $TSFixMe, res: $TSFixMe, error: $TSFixMe) {
        //log error to the console.
        // eslint-disable-next-line no-console
        console.error(error);

        if (error.statusCode && error.message) {
            res.resBody = { message: error.message }; // To be used in 'auditLog' middleware to log reponse data;
            return res
                .status(error.statusCode)
                .send({ message: error.message });
        } else if (
            error.code &&
            error.message &&
            typeof error.code === 'number'
        ) {
            let status = error.code;
            if (
                error.code &&
                error.status &&
                typeof error.code === 'number' &&
                typeof error.status === 'number' &&
                error.code > 600
            ) {
                status = error.status;
            }
            res.resBody = { message: error.message };
            return res.status(status).send({ message: error.message });
        } else {
            res.resBody = { message: 'Server Error.' };
            return res.status(500).send({ message: 'Server Error.' });
        }
    },

    sendListResponse: async function(
        req: $TSFixMe,
        res: $TSFixMe,
        list: $TSFixMe,
        count: $TSFixMe
    ) {
        // remove __v, deleted, deletedAt and deletedById if not Master Admin
        const response = {};

        if (!list) {
            list = [];
        }

        if (list) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
            response.data = list;
        }

        if (count) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'count' does not exist on type '{}'.
            response.count = count;
        } else {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'count' does not exist on type '{}'.
            if (list) response.count = list.length;
        }

        if (req.query.skip) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'skip' does not exist on type '{}'.
            response.skip = parseInt(req.query.skip);
        }

        if (req.query.limit) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'limit' does not exist on type '{}'.
            response.limit = parseInt(req.query.limit);
        }

        //purge request.
        //req = null;
        if (req.query['output-type'] === 'csv') {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
            if (!Array.isArray(response.data)) {
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                const properties = Object.keys(response.data);
                const newObj = {};
                properties.forEach(prop => {
                    if (
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                        typeof response.data[[prop]] === 'object' &&
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                        response.data[[prop]] !== null
                    ) {
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                        if (response.data[[prop]].name)
                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                            response.data[[prop]] = response.data[[prop]].name;
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                        else if (response.data[[prop]].title)
                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                            response.data[[prop]] = response.data[[prop]].title;
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                        else if (response.data[[prop]]._id)
                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                            response.data[[prop]] = response.data[[prop]]._id;
                    }
                    // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                    newObj[[prop]] = response.data[[prop]];
                });
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                response.data = JSON.parse(JSON.stringify(newObj));
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                response.data = [response.data];
            } else {
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
                response.data = response.data.map((i: $TSFixMe) => {
                    i = i._doc ? i._doc : i;
                    const properties = Object.keys(i);
                    const newObj = {};
                    properties.forEach(prop => {
                        if (
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            typeof i[[prop]] === 'object' &&
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            i[[prop]] !== null
                        ) {
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            if (i[[prop]].name) i[[prop]] = i[[prop]].name;
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            else if (i[[prop]].title)
                                // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                                i[[prop]] = i[[prop]].title;
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            else if (i[[prop]]._id) i[[prop]] = i[[prop]]._id;
                        }
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        newObj[[prop]] = i[[prop]];
                    });
                    return JSON.parse(JSON.stringify(newObj));
                });
            }

            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
            response.data = await JsonToCsv.ToCsv(response.data);
        }

        res.resBody = response; // To be used in 'auditLog' middleware to log reponse data;

        return res.status(200).send(response);
    },

    async sendItemResponse(req: $TSFixMe, res: $TSFixMe, item: $TSFixMe) {
        if (req.query['output-type'] === 'csv') {
            if (!Array.isArray(item)) {
                const properties = Object.keys(item);
                const newObj = {};
                properties.forEach(prop => {
                    if (
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        typeof item[[prop]] === 'object' &&
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        item[[prop]] !== null
                    ) {
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        if (item[[prop]].name) item[[prop]] = item[[prop]].name;
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        else if (item[[prop]].title)
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            item[[prop]] = item[[prop]].title;
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        else if (item[[prop]]._id)
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            item[[prop]] = item[[prop]]._id;
                    }
                    // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                    newObj[[prop]] = item[[prop]];
                });
                item = JSON.parse(JSON.stringify(newObj));
                item = [item];
            } else {
                item = item.map(i => {
                    i = i._doc ? i._doc : i;
                    const properties = Object.keys(i);
                    const newObj = {};
                    properties.forEach(prop => {
                        if (
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            typeof i[[prop]] === 'object' &&
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            i[[prop]] !== null
                        ) {
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            if (i[[prop]].name) i[[prop]] = i[[prop]].name;
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            else if (i[[prop]].title)
                                // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                                i[[prop]] = i[[prop]].title;
                            // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                            else if (i[[prop]]._id) i[[prop]] = i[[prop]]._id;
                        }
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
                        newObj[[prop]] = i[[prop]];
                    });
                    return JSON.parse(JSON.stringify(newObj));
                });
            }
            item = await JsonToCsv.ToCsv(item);
        }

        res.resBody = item; // To be used in 'auditLog' middleware to log reponse data;

        return res.status(200).send(item);
    },
};

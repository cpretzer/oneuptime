import express from 'express';
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
import ApiStatusService from '../services/apiStatusService';

const router = express.Router();

// store account details to the db
router.get('/', async (req, res) => {
    try {
        const data = {
            status: 'online',
            lastOperation: 'create',
        };

        const response = {
            backend: {
                status: 200,
                message: 'Service Status - OK',
                serviceType: 'oneuptime-api',
            },
            database: {
                status: 'Up',
                message: 'Mongodb database connection is healthy',
            },
            redis: {
                status: 'Up',
                message: 'Redis connection is healthy',
            },
        };

        // handle db related operation to test the health
        try {
            let status = await ApiStatusService.findOneBy({
                query: {
                    status: 'online',
                },
                select: 'status lastOperation',
            });

            if (!status) {
                status = await ApiStatusService.create(data);
            }

            if (status) {
                data.lastOperation = 'update';
                status = await ApiStatusService.updateOneBy(
                    { _id: status._id },
                    data
                );
            }
        } catch (error) {
            response.database.status = 'Down';
            response.database.message = error.message;
        }

        // handle redis related operation to test the health
        try {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'redisClient' does not exist on type 'Glo... Remove this comment to see the full error message
            if (global.redisClient) {
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'redisClient' does not exist on type 'Glo... Remove this comment to see the full error message
                await global.redisClient.set(
                    'status',
                    'Redis status is online'
                );
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'redisClient' does not exist on type 'Glo... Remove this comment to see the full error message
                const value = await global.redisClient.get('status');

                if (!value) {
                    response.redis.status = 'Down';
                    response.redis.message =
                        'There is issue with redis CRUD api';
                }
            }
        } catch (error) {
            response.redis.status = 'Down';
            response.redis.message = error.message;
        }

        return sendItemResponse(req, res, response);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

export default router;

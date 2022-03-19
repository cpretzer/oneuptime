import { deleteApi, getApi, postApi, putApi } from '../api';
import * as types from '../constants/webHook';

export const deleteWebHookRequest = () => {
    return {
        type: types.DELETE_WEB_HOOK_REQUEST,
    };
};

export const deleteWebHookError = (error: $TSFixMe) => {
    return {
        type: types.DELETE_WEB_HOOK_FAILED,
        payload: error,
    };
};

export const deleteWebHookSuccess = (deleteWebHook: $TSFixMe) => {
    return {
        type: types.DELETE_WEB_HOOK_SUCCESS,
        payload: deleteWebHook,
    };
};

export const resetDeleteWebHook = () => {
    return {
        type: types.DELETE_WEB_HOOK_RESET,
    };
};

// Calls the API to link webhook team to project
export const deleteWebHook = (projectId: $TSFixMe, webhookId: $TSFixMe) => {
    return function (dispatch: $TSFixMe) {
        const promise = deleteApi(
            `webhook/${projectId}/delete/${webhookId}`,
            null
        );

        dispatch(deleteWebHookRequest());

        return promise.then(
            function (webhook) {
                dispatch(deleteWebHookSuccess(webhook.data));

                return webhook.data;
            },
            function (error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(deleteWebHookError(error));
            }
        );
    };
};

export const getWebHookRequest = (promise: $TSFixMe) => {
    return {
        type: types.GET_WEB_HOOK_REQUEST,
        payload: promise,
    };
};

export const getWebHookError = (error: $TSFixMe) => {
    return {
        type: types.GET_WEB_HOOK_FAILED,
        payload: error,
    };
};

export const getWebHookSuccess = (webhooks: $TSFixMe) => {
    return {
        type: types.GET_WEB_HOOK_SUCCESS,
        payload: webhooks,
    };
};

export const resetGetWebHook = () => {
    return {
        type: types.GET_WEB_HOOK_RESET,
    };
};

export function getWebHook(
    projectId: $TSFixMe,
    skip: $TSFixMe,
    limit: $TSFixMe
) {
    return function (dispatch: $TSFixMe) {
        let promise = null;
        promise = getApi(
            `webhook/${projectId}/hooks?skip=${skip || 0}&limit=${limit || 10}`
        );
        dispatch(getWebHookRequest(promise));

        promise.then(
            function (webhooks) {
                dispatch(getWebHookSuccess(webhooks.data));
            },
            function (error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(getWebHookError(error));
            }
        );

        return promise;
    };
}

export function getWebHookMonitor(
    projectId: $TSFixMe,
    monitorId: $TSFixMe,
    skip: $TSFixMe,
    limit: $TSFixMe
) {
    return function (dispatch: $TSFixMe) {
        let promise = null;
        promise = getApi(
            `webhook/${projectId}/hooks/${monitorId}?skip=${skip || 0}&limit=${
                limit || 10
            }`
        );
        dispatch(getWebHookRequest(promise));

        promise.then(
            function (webhooks) {
                dispatch(getWebHookSuccess(webhooks.data));
            },
            function (error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(getWebHookError(error));
            }
        );

        return promise;
    };
}

export const createWebHookRequest = () => {
    return {
        type: types.CREATE_WEB_HOOK_REQUEST,
    };
};

export const createWebHookError = (error: $TSFixMe) => {
    return {
        type: types.CREATE_WEB_HOOK_FAILED,
        payload: error,
    };
};

export const createWebHookSuccess = (newWebHook: $TSFixMe) => {
    return {
        type: types.CREATE_WEB_HOOK_SUCCESS,
        payload: newWebHook,
    };
};

export const resetCreateWebHook = () => {
    return {
        type: types.CREATE_WEB_HOOK_RESET,
    };
};

// Calls the API to add webhook to project
export const createWebHook = (projectId: $TSFixMe, data: $TSFixMe) => {
    return function (dispatch: $TSFixMe) {
        const promise = postApi(`webhook/${projectId}/create`, data);

        dispatch(createWebHookRequest());

        return promise.then(
            function (webhook) {
                dispatch(createWebHookSuccess(webhook.data));

                return webhook.data;
            },
            function (error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(createWebHookError(error));
            }
        );
    };
};

export const updateWebHookRequest = () => {
    return {
        type: types.UPDATE_WEB_HOOK_REQUEST,
    };
};

export const updateWebHookError = (error: $TSFixMe) => {
    return {
        type: types.UPDATE_WEB_HOOK_FAILED,
        payload: error,
    };
};

export const updateWebHookSuccess = (newWebHook: $TSFixMe) => {
    return {
        type: types.UPDATE_WEB_HOOK_SUCCESS,
        payload: newWebHook,
    };
};

export const resetUpdateWebHook = () => {
    return {
        type: types.UPDATE_WEB_HOOK_RESET,
    };
};

// Calls the API to add webhook to project
export function updateWebHook(
    projectId: $TSFixMe,
    webhookId: $TSFixMe,
    data: $TSFixMe
) {
    return function (dispatch: $TSFixMe) {
        const promise = putApi(`webhook/${projectId}/${webhookId}`, data);

        dispatch(updateWebHookRequest());

        return promise.then(
            function (webhook) {
                dispatch(updateWebHookSuccess(webhook.data));

                return webhook.data;
            },
            function (error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(updateWebHookError(error));
            }
        );
    };
}

// Implements pagination for Webhooks Members table

export const paginateNext = () => {
    return {
        type: types.PAGINATE_NEXT,
    };
};

export const paginatePrev = () => {
    return {
        type: types.PAGINATE_PREV,
    };
};

export const paginateReset = () => {
    return {
        type: types.PAGINATE_RESET,
    };
};

export const paginate = (type: $TSFixMe) => {
    return function (dispatch: $TSFixMe) {
        type === 'next' && dispatch(paginateNext());
        type === 'prev' && dispatch(paginatePrev());
        type === 'reset' && dispatch(paginateReset());
    };
};

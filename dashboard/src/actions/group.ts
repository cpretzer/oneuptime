import * as types from '../constants/group';
import { postApi, getApi, deleteApi, putApi } from '../api';
import { User } from '../config.js';

// Add Group
export const addGroupRequest = () => ({
    type: types.CREATE_GROUP_REQUEST,
});

export const addGroupSuccess = (payload: $TSFixMe) => ({
    type: types.CREATE_GROUP_SUCCESS,
    payload,
});

export const addGroupFailure = (error: $TSFixMe) => ({
    type: types.CREATE_GROUP_FAILURE,
    payload: error,
});

export const createGroup = (projectId: $TSFixMe, data: $TSFixMe) => async (
    dispatch: $TSFixMe
) => {
    dispatch(addGroupRequest());

    try {
        const response = await postApi(`group/${projectId}`, data);
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        dispatch(addGroupSuccess(response.data));
        dispatch(getGroups());
        return response;
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(addGroupFailure(errorMsg));
        return { error: errorMsg };
    }
};

// Edit and update Groups
export const updateGroupRequest = (payload: $TSFixMe) => ({
    type: types.UPDATE_GROUP_REQUEST,
    payload,
});

export const updateGroupSuccess = (payload: $TSFixMe) => ({
    type: types.UPDATE_GROUP_SUCCESS,
    payload,
});

export const updateGroupFailure = (error: $TSFixMe) => ({
    type: types.UPDATE_GROUP_FAILURE,
    payload: error,
});

export const updateGroup = (
    projectId: $TSFixMe,
    groupId: $TSFixMe,
    data: $TSFixMe
) => async (dispatch: $TSFixMe) => {
    dispatch(updateGroupRequest(groupId));

    try {
        const response = await putApi(`group/${projectId}/${groupId}`, data);
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        dispatch(updateGroupSuccess(response.data));
        return response;
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(updateGroupFailure(errorMsg));
        return { error: errorMsg };
    }
};

// Get all project and subproject groups
export const getGroupsRequest = () => ({
    type: types.GET_GROUPS_REQUEST,
});

export const getGroupsSuccess = (payload: $TSFixMe) => ({
    type: types.GET_GROUPS_SUCCESS,
    payload,
});

export const getGroupsFailure = (error: $TSFixMe) => ({
    type: types.GET_GROUPS_FAILURE,
    payload: error,
});

export const getGroups = () => async (dispatch: $TSFixMe) => {
    dispatch(getGroupsRequest());
    const projectId = User.getCurrentProjectId();
    try {
        const response = await getApi(`group/${projectId}/groups`);
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        dispatch(getGroupsSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(getGroupsFailure(errorMsg));
    }
};

// Get project groups
export const getProjectGroupsRequest = () => ({
    type: types.GET_PROJECT_GROUPS_REQUEST,
});

export const getProjectGroupsSuccess = (payload: $TSFixMe) => ({
    type: types.GET_PROJECT_GROUPS_SUCCESS,
    payload,
});

export const getProjectGroupsFailure = (error: $TSFixMe) => ({
    type: types.GET_PROJECT_GROUPS_FAILURE,
    payload: error,
});

export const getProjectGroups = (
    projectId: $TSFixMe,
    skip: $TSFixMe,
    limit: $TSFixMe
) => async (dispatch: $TSFixMe) => {
    dispatch(getProjectGroupsRequest());
    try {
        const response = await getApi(
            `group/${projectId}?skip=${skip}&limit=${limit}`
        );
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        dispatch(getProjectGroupsSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(getProjectGroupsFailure(errorMsg));
    }
};

// Delete Group
export const deleteGroupRequest = () => ({
    type: types.DELETE_GROUP_REQUEST,
});

export const deleteGroupSuccess = (payload: $TSFixMe) => ({
    type: types.DELETE_GROUP_SUCCESS,
    payload,
});

export const deleteGroupFailure = (error: $TSFixMe) => ({
    type: types.DELETE_GROUP_FAILURE,
    payload: error,
});

export const deleteGroup = (projectId: $TSFixMe, groupId: $TSFixMe) => async (
    dispatch: $TSFixMe
) => {
    dispatch(deleteGroupRequest());

    try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        const response = await deleteApi(`group/${projectId}/${groupId}`);
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        dispatch(deleteGroupSuccess(response.data));
        dispatch(getGroups());
        return response;
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';

        dispatch(deleteGroupFailure(errorMsg));
        return errorMsg;
    }
};

//Reset error message
export const resetErrorMessage = () => ({
    type: types.RESET_ERROR_MESSAGE,
});

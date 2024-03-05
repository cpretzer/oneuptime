import ObjectID from 'Common/Types/ObjectID';
import IncidentState from 'Model/Models/IncidentState';
import ModelAPI from 'CommonUI/src/Utils/ModelAPI/ModelAPI';
import { LIMIT_PER_PROJECT } from 'Common/Types/Database/LimitMax';
import SortOrder from 'Common/Types/BaseDatabase/SortOrder';
import ListResult from 'CommonUI/src/Utils/BaseDatabase/ListResult';

export default class IncidentStateUtil {
    public static async getUnresolvedIncidentStates(
        projectId: ObjectID
    ): Promise<IncidentState[]> {
        const incidentStates: ListResult<IncidentState> =
            await ModelAPI.getList<IncidentState>({
                modelType: IncidentState,
                query: {
                    projectId: projectId,
                },
                skip: 0,
                limit: LIMIT_PER_PROJECT,
                sort: {
                    order: SortOrder.Ascending,
                },
                select: {
                    _id: true,
                    isResolvedState: true,
                },
            });

        const unresolvedIncidentStates: Array<IncidentState> = [];

        for (const state of incidentStates.data) {
            if (!state.isResolvedState) {
                unresolvedIncidentStates.push(state);
            } else {
                break; // everything after resolved state is resolved
            }
        }

        return unresolvedIncidentStates;
    }
}
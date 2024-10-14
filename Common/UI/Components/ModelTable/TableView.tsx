import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import TableView from "../../../Models/DatabaseModels/TableView";
import ObjectID from "../../../Types/ObjectID";
import MoreMenu from "../MoreMenu/MoreMenu";
import MoreMenuItem from "../MoreMenu/MoreMenuItem";
import ListResult from "../../Utils/BaseDatabase/ListResult";
import ModelAPI from "../../Utils/ModelAPI/ModelAPI";
import { LIMIT_PER_PROJECT } from "../../../Types/Database/LimitMax";
import SortOrder from "../../../Types/BaseDatabase/SortOrder";
import API from "../../../Utils/API";
import MoreMenuSection from "../MoreMenu/MoreMenuSection";
import { ButtonStyleType } from "../Button/Button";
import IconProp from "../../../Types/Icon/IconProp";
import { BarLoader } from "react-spinners";
import ConfirmModal from "../Modal/ConfirmModal";
import ModelFormModal from "../ModelFormModal/ModelFormModal";
import { FormType } from "../Forms/ModelForm";
import FormFieldSchemaType from "../Forms/Types/FormFieldSchemaType";
import { PromiseVoidFunction } from "../../../Types/FunctionTypes";
import { GetReactElementArrayFunction } from "../../Types/FunctionTypes";
import ProjectUtil from "../../Utils/Project";
import User from "../../Utils/User";
import Icon, { SizeProp, ThickProp } from "../Icon/Icon";

export interface ComponentProps {
  tableId: string;
  onViewChange: (tableView: TableView | null) => void;
  currentTableView: TableView | null;
}

const TableViewElement: FunctionComponent<ComponentProps> = (
  props: ComponentProps,
): ReactElement => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allTableViews, setAllTableViews] = useState<Array<TableView>>([]);
  const [tableViewToDelete, setTableViewToDelete] = useState<
    TableView | undefined
  >(undefined);
  const [tableViewToEdit, setTableViewToEdit] = useState<TableView | undefined>(
    undefined,
  );
  const [showCreateNewViewModal, setShowCreateNewViewModel] =
    useState<boolean>(false);

  const [currentlySelectedView, setCurrentlySelectedView] =
    useState<TableView | null>(null);

  // load all the filters for this user and for this project.
  const fetchTableViews: PromiseVoidFunction = async (): Promise<void> => {
    try {
      setError("");
      setIsLoading(true);

      const tableViews: ListResult<TableView> = await ModelAPI.getList({
        modelType: TableView,
        query: {
          projectId: ProjectUtil.getCurrentProjectId()!,
          createdByUserId: User.getUserId(),
          tableId: props.tableId,
        },
        limit: LIMIT_PER_PROJECT,
        skip: 0,
        select: {
          sort: true,
          itemsOnPage: true,
          query: true,
          name: true,
        },
        sort: {
          name: SortOrder.Ascending,
        },
      });

      setAllTableViews(tableViews.data);
    } catch (err) {
      setError(API.getFriendlyErrorMessage(err as Error));
    }

    setIsLoading(false);
  };

  type DeleteTableViewFunction = (tableView: TableView) => Promise<void>;

  const deleteTableView: DeleteTableViewFunction = async (
    tableView: TableView,
  ): Promise<void> => {
    const tableViewId: ObjectID = tableView.id!;

    try {
      setError("");
      setIsLoading(true);

      await ModelAPI.deleteItem({
        modelType: TableView,
        id: tableViewId,
      });

      await fetchTableViews();
    } catch (err) {
      setError(API.getFriendlyErrorMessage(err as Error));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchTableViews().catch((err: Error) => {
      setError(API.getFriendlyErrorMessage(err as Error));
    });
  }, []);

  type GetRightElementForTableViewMenuItemFunction = (
    item: TableView,
  ) => React.JSX.Element;

  const getRightElementForTableViewMenuItem: GetRightElementForTableViewMenuItemFunction =
    (item: TableView): ReactElement => {
      return (
        <div className="flex">
          <div className="h-4 w-4 mr-2">
            <Icon
              icon={IconProp.Edit}
              className="text-gray-400 hover:text-gray-600"
              size={SizeProp.Regular}
              thick={ThickProp.Thick}
              onClick={() => {
                setTableViewToEdit(item);
              }}
            />
          </div>
          <div className="h-4 w-4">
            <Icon
              className="text-gray-400 hover:text-gray-600"
              icon={IconProp.Trash}
              size={SizeProp.Regular}
              thick={ThickProp.Thick}
              onClick={() => {
                setTableViewToDelete(item);
              }}
            />
          </div>
        </div>
      );
    };

  type GetViewItemsFunction = () => Array<ReactElement>;

  const getViewItems: GetViewItemsFunction = (): Array<ReactElement> => {
    return allTableViews.map((item: TableView, index: number) => {
      return (
        <MoreMenuItem
          key={index}
          rightElement={getRightElementForTableViewMenuItem(item)}
          text={item.name || ""}
          className="text-gray-600 hover:text-gray-800"
          icon={IconProp.Window}
          onClick={() => {
            props.onViewChange && props.onViewChange(item);
            setCurrentlySelectedView(item);
          }}
        />
      );
    });
  };

  const getMenuContents: GetReactElementArrayFunction =
    (): Array<ReactElement> => {
      if (isLoading) {
        return [<BarLoader />];
      }

      const elements: Array<ReactElement> = [];

      if (allTableViews.length > 0) {
        elements.push(
          <MoreMenuSection title="Saved Views">
            {getViewItems()}
          </MoreMenuSection>,
        );
      }

      elements.push(
        <MoreMenuItem
          text="Save as New View"
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 font-medium -mt-2"
          icon={IconProp.Add}
          iconClassName=""
          onClick={() => {
            setShowCreateNewViewModel(true);
          }}
        ></MoreMenuItem>,
      );

      return elements;
    };

  if (error) {
    return (
      <ConfirmModal
        title={`Something went wrong...`}
        description={error}
        isLoading={false}
        submitButtonText={"Close"}
        onSubmit={() => {
          return setError("");
        }}
      />
    );
  }

  if (tableViewToEdit) {
    return (
      <ModelFormModal<TableView>
        modelType={TableView}
        modelIdToEdit={tableViewToEdit.id!}
        name="Edit View"
        title="Edit View"
        description="You can rename this table view to any name you like."
        onClose={() => {
          setTableViewToEdit(undefined);
        }}
        submitButtonText="Save Changes"
        onSuccess={async () => {
          setTableViewToEdit(undefined);
          await fetchTableViews();
        }}
        formProps={{
          name: "Edit View",
          modelType: TableView,
          id: "edit-table-view",
          fields: [
            {
              field: {
                name: true,
              },
              fieldType: FormFieldSchemaType.Text,
              placeholder: "Name of the view",
              description: "Please enter the new name of the view",
              title: "Name",
              required: true,
            },
          ],
          formType: FormType.Update,
        }}
      />
    );
  }

  if (tableViewToDelete) {
    return (
      <ConfirmModal
        description={`Are you sure you want to delete view - ${tableViewToDelete.name}?`}
        title={`Delete ${tableViewToDelete.name}`}
        isLoading={isLoading}
        onSubmit={async () => {
          await deleteTableView(tableViewToDelete);
          setTableViewToDelete(undefined);
        }}
        onClose={() => {
          setTableViewToDelete(undefined);
        }}
        submitButtonText={`Delete`}
        submitButtonType={ButtonStyleType.DANGER}
      />
    );
  }

  if (showCreateNewViewModal) {
    return (
      <ModelFormModal<TableView>
        modelType={TableView}
        name="Save New View"
        title="Save New View"
        description="You can save the current table settings as a new view."
        onClose={() => {
          setShowCreateNewViewModel(false);
        }}
        submitButtonText="Save Changes"
        onBeforeCreate={(tableView: TableView) => {
          tableView.tableId = props.tableId;
          tableView.query = props.currentTableView?.query || {};
          tableView.itemsOnPage = props.currentTableView?.itemsOnPage || 10;
          tableView.sort = props.currentTableView?.sort || {};
          return Promise.resolve(tableView);
        }}
        onSuccess={async () => {
          setShowCreateNewViewModel(false);
          await fetchTableViews();
        }}
        formProps={{
          name: "Save New View",
          modelType: TableView,
          id: "save-table-view",
          fields: [
            {
              field: {
                name: true,
              },
              fieldType: FormFieldSchemaType.Text,
              placeholder: "Name of the view",
              description: "Please enter the new name of the view",
              title: "Name",
              required: true,
            },
          ],
          formType: FormType.Create,
        }}
      />
    );
  }

  type GetElementToBeShownInsteadOfButtonFunction = () => ReactElement | undefined;

  const getElementToBeShownInsteadOfButton: GetElementToBeShownInsteadOfButtonFunction = (): ReactElement | undefined => {
    if (!currentlySelectedView) {
      return undefined;
    }

    return (
      <div className="ml-2 mt-1 cursor-pointer font-semibold flex rounded-full border-2 border-gray-600 text-gray-600 text-xs p-1 pl-2 pr-2">
        {currentlySelectedView.name}
        <div className="h-4 w-4 rounded-full bg-gray-500 text-white hover:bg-gray-800 ml-3 -mr-1 p-1">
          <Icon
            icon={IconProp.Close}
            size={SizeProp.Regular}
            thick={ThickProp.Thick}
            onClick={() => {
              setCurrentlySelectedView(null);
              props.onViewChange && props.onViewChange(null);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <MoreMenu
      elementToBeShownInsteadOfButton={getElementToBeShownInsteadOfButton()}
    >
      {getMenuContents()}
    </MoreMenu>
  );
};

export default TableViewElement;

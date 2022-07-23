import React, { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { ButtonStyleType } from '../Button/Button';
import BasicFormModal from '../FormModal/BasicFormModal';
import FormFieldSchemaType from '../Forms/Types/FormFieldSchemaType';
import ConfirmModal from '../Modal/ConfirmModal';

export interface PaginationNavigationItem {
    pageNumber: number;
}

export interface ComponentProps {
    currentPageNumber: number;
    totalItemsCount: number;
    itemsOnPage: number;
    onNavigateToPage: (pageNumber: number) => void;
    isLoading: boolean;
    isError: boolean;
    singularLabel: string;
    pluralLabel: string;
}

const Pagination: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {


    const [minPageNumber, setMinPageNumber] = useState<number>(1);
    const [maxPageNumber, setMaxPageNumber] = useState<number>(1);

    const setMinAndMaxPageNumber = () => {
        setMinPageNumber(1);
        let maxPageNo = props.totalItemsCount % props.itemsOnPage === 0 ? (props.totalItemsCount / props.itemsOnPage) + 1 : (props.totalItemsCount / props.itemsOnPage);
    
        if (maxPageNo < 1) {
            maxPageNo = 1;
        }
        
        setMaxPageNumber(maxPageNo);
    
    }

    useEffect(() => {
        setMinAndMaxPageNumber();
    }, []);

    useEffect(()=> {
        setMinAndMaxPageNumber();
    },[props.totalItemsCount, props.itemsOnPage])
   
    const isPreviousDisabled: boolean = (props.currentPageNumber === 1 || props.isLoading || props.isError);
    const isNextDisabled: boolean = (
        props.currentPageNumber * props.itemsOnPage >= props.totalItemsCount
        || props.isLoading || props.isError
    );
    const isCurrentPageButtonDisabled: boolean = props.totalItemsCount === 0 || props.isLoading || props.isError;

    const [showPaginationModel, setShowPaginationModel] = useState<boolean>(false);


    return (
        <div className='justify-space-between'>
            <div>
                <p
                    style={{ "padding": "17px", "margin": "0px" }}
                    className='color-light-grey'>{props.totalItemsCount} {props.totalItemsCount > 1 ? props.pluralLabel : props.singularLabel}</p>
            </div>
            <div>
                <nav className="" aria-label="Page navigation example" style={{
                    "height": "45px"
                }}>
                    <ul className="pagination" style={{
                        marginTop: "15px",
                        marginBottom: "15px",
                        marginRight: "15px",
                    }}>
                        <li onClick={() => {
                            if (props.onNavigateToPage && !isPreviousDisabled) {
                                props.onNavigateToPage(props.currentPageNumber - 1);
                            }
                        }}
                            className={`page-item ${isPreviousDisabled ? "disabled" : ""}`} style={{ "padding": "0px" }}>
                            <a href="#" className="page-link">Previous</a>
                        </li>
                        <li className={`page-item ${isCurrentPageButtonDisabled ? "disabled" : ""}`} style={{ "padding": "0px" }}>
                            <a onClick={() => {
                                setShowPaginationModel(true);
                            }} className="pointer page-link">{props.currentPageNumber}</a>
                        </li>
                        <li onClick={() => {
                            if (props.onNavigateToPage && !isNextDisabled) {
                                props.onNavigateToPage(props.currentPageNumber + 1);
                            }
                        }} className={`page-item ${isNextDisabled ? "disabled" : ""}`} style={{ "padding": "0px" }}>
                            <a className="pointer page-link">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>

            {showPaginationModel && maxPageNumber !== minPageNumber && 
                <BasicFormModal<PaginationNavigationItem>
                title={'Navigate to Page'}
                onClose={() => {
                    setShowPaginationModel(false);
                }}
                submitButtonText={'Go to Page'}
                onSuccess={(item: PaginationNavigationItem) => {
                    if (props.onNavigateToPage && !isNextDisabled) {
                        props.onNavigateToPage(item.pageNumber);
                    }
                    setShowPaginationModel(false);
                }}
                formProps={{
                    initialValues: {
                        pageNumber:  props.currentPageNumber
                    },
                    fields: [{
                        title: "Page Number",
                        description: `You can enter page numbers from ${minPageNumber} to ${maxPageNumber}. Please enter it here:`,
                        field: {
                            pageNumber: true
                        },
                        placeholder: "1",
                        required: true,
                        validation: {
                            minValue: minPageNumber,
                            maxValue: maxPageNumber
                        },
                        fieldType: FormFieldSchemaType.PositveNumber,
                    }]
                }}
                />}
            
            {showPaginationModel && maxPageNumber === minPageNumber && <ConfirmModal
                title={`Navigate to Page`}
                description={`You cannot navigate to any other page because this table does not have more than 1 page. You don't have enough ${props.pluralLabel.toLowerCase()} in this project.`}
                submitButtonText={'Close'}
                onSubmit={() => {
                    setShowPaginationModel(false);
                }}
                submitButtonType={ButtonStyleType.NORMAL}
            />}

        </div>)
};

export default Pagination;

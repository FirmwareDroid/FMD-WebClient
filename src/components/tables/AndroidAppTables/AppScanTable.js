import {useFetch} from "../../../hooks/fetch/useFetch";
import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import {Container, Spinner} from "react-bootstrap";
import {dateFormatter, nullCheckFormatter} from "../../../utils/formatters/TableDataFormatter";
import { useCookies } from 'react-cookie';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useState, useEffect } from "react";


const AppScanTable = ({dataFieldName, dataFieldLabel, appPageNumber}) => {
  const requestUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/android_app/get_page/" + appPageNumber;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSize, setTotalSize] = useState(0);
  const [paginationSize, setPaginationSize] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(20);
  const pageSizes = [10, 20, 40, 50, 100];

  const [csrfCookie,] = useCookies(['csrf_access_token']);
  const requestOptions = {
    method: 'POST',
    headers: {
      "X-CSRF-TOKEN": csrfCookie.csrf_access_token
    },
    credentials: "same-origin"
  };
  const [isLoading, tableData, setTableData] = useFetch(requestUrl, requestOptions);
  const [appData, setAppData] = useState([]);
  const theme = localStorage.getItem("theme");
  const tableClasses = theme === 'light' ? 'table-light' : 'table-dark';

  useEffect(() => {
    if(tableData && appData.length === 0){
      setSizePerPage(sizePerPage);
      setAppData(tableData.android_app_list.slice(0, sizePerPage));
      setSizePerPage(sizePerPage);
      setCurrentPage(tableData.current_page);
      setTotalSize(tableData.total_number_of_items_that_match_query);
      setPaginationSize(tableData.total_pages_for_query);
    }
  }, [tableData]);

  const columns = [{
    dataField: 'id',
    text: 'App-ID',
    formatter: nullCheckFormatter,
    hidden: true
  },{
    dataField: 'filename',
    text: 'Filename',
    sort: true,
    formatter: nullCheckFormatter
  }, {
    dataField: 'indexed_date',
    text: 'Indexed',
    sort: true,
    formatter: dateFormatter
  }, {
    dataField: 'file_size_bytes',
    text: 'Size (Bytes)',
    sort: true,
    formatter: nullCheckFormatter
  }, {
    dataField: dataFieldName,
    text: dataFieldLabel,
    formatter: nullCheckFormatter
  }];

  let containerContent = <></>;
  if(isLoading){
    containerContent = <Spinner animation="border" />
  }else{
    if(tableData && appData !== undefined && Array.isArray(appData)){
      const selectRow = {
        mode: 'checkbox',
        clickToSelect: true
      };

      const onTableChange = (event, page) => {
        console.log('onTableChange', 'page:', page,'event', event);
      };

      const paginationOptions = {
        onSizePerPageChange: (sizePerPage, page) => {
          const paginationFactor = tableData.item_per_page / sizePerPage;
          setPaginationSize(tableData.total_pages_for_query * paginationFactor);
          const currentIndex = (page - 1) * sizePerPage;
          setAppData(tableData.android_app_list.slice(currentIndex, currentIndex + sizePerPage));
          setSizePerPage(sizePerPage);
        },
        onPageChange: (page, sizePerPage) => {
          let pageFactor = Math.ceil((page * sizePerPage) / 100);

          fetch("https://firmwaredroid.cloudlab.zhaw.ch/api/v1/android_app/get_page/" + pageFactor, requestOptions)
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error(response.json().toString());
              }
            })
            .then((data) => {
              setTableData(data);
              const currentIndex = (page - 1) * sizePerPage;
              setAppData(data.android_app_list.slice(currentIndex, currentIndex + sizePerPage));
              setSizePerPage(page.sizePerPage);
              setCurrentPage(page);
              setTotalSize(data.total_number_of_items_that_match_query);
            })
            .catch(error => {
              console.error(error);
            });
        },
        page: currentPage,
        paginationSize: paginationSize,
        sizePerPage: sizePerPage,
        sizePerPageList: pageSizes,
        totalSize: totalSize
      };

      containerContent = <BootstrapTable keyField='id'
                                         remote
                                         bordered
                                         striped
                                         hover
                                         custom={true}
                                         onTableChange={onTableChange}
                                         pagination={ paginationFactory(paginationOptions)}
                                         noDataIndication="No data available"
                                         classes={tableClasses}
                                         data={appData}
                                         selectRow={selectRow}
                                         columns={columns} />
    }
  }

  return (
    <Container>
      {containerContent}
    </Container>
  );
};

export default AppScanTable;
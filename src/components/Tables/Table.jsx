import { Spinner } from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import React from 'react';
import ExportCSV from "../CustomButton/ExportCSVButton";
const { SearchBar } = Search;

const NoDataIndication = () => (
  <div>
    <p>Looks like there is no data...</p>
  </div>
);

/**
 * Add a column to the table
 * @param columns: the {Array} on which the data will be added.
 * @param dataField: str the identifier (name) of the datafield
 * @param text: str to be shown as header.
 */
function add_column(columns, dataField, text){
  columns.push({
    dataField: dataField,
    text: text,
    sort: true,
    headerTitle: true,
  })
}

/**
 * Creats the structure needed for showing a table for dict data.
 * @param data: object as dict(key, value)
 * @param columnTitles: header titles
 * @returns {Array}
 */
function create_data_arrays(data, columnTitles){
  let table_data = [];
  let first_datafield = columnTitles[0];
  let second_datafield = columnTitles[1];
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      let row = {};
      row[first_datafield] = key;
      row[second_datafield] = data[key];
      table_data.push(row);
    }
  }

  return table_data
}


/**
 * Creates a basic table from the given data.
 * @param data: the data to show in the table.
 * @param columnTitles: the header title of the column
 * @returns {*}
 * @constructor
 */
function Table({data, columnTitles}) {
  if(!data || data === undefined || data.length === 0) return <Spinner animation="border" variant="primary" size="mg"/>;
  //console.log("tableData", data);
  let columns = [];
  let table_data = [];
  columnTitles.forEach(element => add_column(columns, element, element));
  if (columnTitles.length === 2){
    table_data = create_data_arrays(data, columnTitles)
  }

  return <ToolkitProvider
    keyField={ columnTitles[0] }
    data={ table_data }
    columns={ columns }
    exportCSV
    search
  >
    {
      props => (
        <div>
          <SearchBar { ...props.searchProps } />
          <BootstrapTable { ...props.baseProps }
                          headerClasses="thead-dark"
                          striped
                          hover
                          condensed
                          pagination={ paginationFactory() }
                          noDataIndication={ () => <NoDataIndication /> }
                          filter={ filterFactory() }/>
          <ExportCSV { ...props.csvProps } />
        </div>
      )
    }
  </ToolkitProvider>
}

export default Table;



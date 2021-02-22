/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import { Tasks } from "components/Tasks/Tasks.jsx";
import {
  statsEndpoint,
  stats_endpoint_android_version
} from "variables/Variables.jsx";
import PieChart from "../components/Diagrams/PieChart";
import Table from "../components/Tables/Table";
import DataFetcher from "../components/DataFetcher/DataFetcher";
import HorizontalBarChart from "../components/Diagrams/HorizontalBarChart";
import VerticalBarChart from "../components/Diagrams/VerticalBarChart";



class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number_of_firmware_by_android_version: [],
      number_of_firmware_by_brand: [],
      number_of_firmware_by_model: [],
      number_of_firmware_by_locale: [],
      number_of_firmware_by_manufacturer: [],
      number_of_firmware_files: 0,
      number_of_firmware_by_region: [],
      number_of_apps_total: 0,
      packagename_count_dict: [],
      total_firmware_byte_size: 0,
      androguard_report_count: 0,
      report_date: 0,
      isLoadingStatsComplete: false,
    };
    this.state_callback_handler = this.state_callback_handler.bind(this)
  }

  state_callback_handler(data){
    console.log("Callback executed");
    this.setState({
      number_of_firmware_by_android_version: data.number_of_firmware_by_android_version,
      number_of_firmware_by_brand: data.number_of_firmware_by_brand,
      number_of_firmware_by_model: data.number_of_firmware_by_model,
      number_of_firmware_by_locale: data.number_of_firmware_by_locale,
      number_of_firmware_by_manufacturer: data.number_of_firmware_by_manufacturer,
      number_of_firmware_files: data.number_of_firmware_files,
      number_of_firmware_by_region: data.number_of_firmware_by_region,
      number_of_apps_total: data.number_of_apps_total,
      packagename_count_dict: data.packagename_count_dict,
      total_firmware_byte_size: data.total_firmware_byte_size,
      androguard_report_count: data.androguard_report_count,
      report_date: data.report_date,
      isLoadingStatsComplete: true})
  };

  render() {
    const {
      number_of_firmware_by_android_version,
      number_of_firmware_by_brand,
      number_of_firmware_by_model,
      number_of_firmware_by_locale,
      number_of_firmware_by_manufacturer,
      number_of_firmware_files,
      number_of_firmware_by_region,
      number_of_apps_total,
      packagename_count_dict,
      total_firmware_byte_size,
      androguard_report_count,
      report_date,
      isLoadingStatsComplete} = this.state;
    let data_fetcher;
    if (!isLoadingStatsComplete){
      data_fetcher = <DataFetcher dataUrl={statsEndpoint} stateCallback={this.state_callback_handler}/>
    }

    let byte_units = ["Byte", "KB", "MB", "GB", "TB", "PB"];
    let rounded_total_firmware_byte_size = total_firmware_byte_size;
    let byte_iterations = 0;
    if(rounded_total_firmware_byte_size >= 1){
      while(rounded_total_firmware_byte_size > 1024){
        rounded_total_firmware_byte_size = rounded_total_firmware_byte_size / 1024;
        byte_iterations++;
      }
      //rounded_total_firmware_byte_size = rounded_total_firmware_byte_size * 1024;
      rounded_total_firmware_byte_size = Number(rounded_total_firmware_byte_size.toFixed(3));
    }

    let report_date_pretty = new Date(report_date).toUTCString();

    return (
      <div className="content">
        {data_fetcher}
        <Container fluid>
          <Row>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-warning" />}
                statsText={"Capacity " + byte_units[byte_iterations]}
                statsValue={rounded_total_firmware_byte_size}
                statsIcon={<i className="fa fa-refresh" />}
                statsIconText={report_date_pretty}
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-wallet text-success" />}
                statsText="Firmware Samples"
                statsValue={number_of_firmware_files}
                statsIcon={<i className="fa fa-calendar-o" />}
                statsIconText={report_date_pretty}
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-graph1 text-danger" />}
                statsText="App Samples"
                statsValue={number_of_apps_total}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText={report_date_pretty}
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-graph1 text-danger" />}
                statsText="AndroGuard Reports"
                statsValue={androguard_report_count}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText={report_date_pretty}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Android version distribution"
                category="Firmware by Versions"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Table data={number_of_firmware_by_android_version} columnTitles={["Version","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Android version distribution"
                category="Firmware by Versions"
                content={
                  <PieChart data={number_of_firmware_by_android_version} labelOffset={5} legendPosition={'top'} />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Brand distribution"
                category="Firmware by Brands"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Table data={number_of_firmware_by_brand} columnTitles={["Brand","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Brand distribution"
                category="Firmware by Brands"
                content={
                  <PieChart data={number_of_firmware_by_brand} labelOffset={5} legendPosition={'top'} />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Phones Models"
                category="Firmware by models"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Table data={number_of_firmware_by_model} columnTitles={["Model","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Phones Models"
                category="Firmware by models"
                content={
                  <HorizontalBarChart data={number_of_firmware_by_model} height={400} onlyInteger={true} offset={150}/>
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Location"
                category="Firmware by locale"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Table data={number_of_firmware_by_locale} columnTitles={["Locale","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Location"
                category="Firmware by locale"
                content={
                  <PieChart data={number_of_firmware_by_locale} labelOffset={5} legendPosition={'top'} />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Phone Manufacturer"
                category="Firmware by locale"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Table data={number_of_firmware_by_manufacturer} columnTitles={["Manufacturer","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Location"
                category="Firmware by locale"
                content={
                  <PieChart data={number_of_firmware_by_manufacturer} labelOffset={5} legendPosition={'top'} />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Region"
                category="Firmware by region"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Table data={number_of_firmware_by_region} columnTitles={["Region","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Region"
                category="Firmware by region"
                content={
                  <PieChart data={number_of_firmware_by_region} labelOffset={5} legendPosition={'top'} />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Card
                title="Packagename over all Firmwaresamples "
                category="Count per App packagename"
                content={
                  <Table data={packagename_count_dict} columnTitles={["Packagename","Count"]}/>
                }
              />
            </Col>
            <Col>
              <Card
                title="Packagename over all firmware samples"
                category="Count per App packagename"
                content={
                  <p>No Diagram yet...coming soon</p>
                }
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Dashboard;

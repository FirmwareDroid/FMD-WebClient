import React from "react";
import {CardGroup, Container} from "react-bootstrap";
import ScannerCard from "../../../components/cards/scanner-controls/ScannerCard";


const ScannerControls = () => {
  return (
    <Container fluid style={{"margin-top": 20}}>
      <h4>App Scanners</h4>
      <CardGroup>
        <ScannerCard cardTitle={"AndroGuard"}
                     cardRedirectLink={"/admin/scanner/0"}
                     cardInfoText={"AndroGuard is a tool..."}
                     cardFooterLink={"https://github.com/androguard/androguard"}/>

        <ScannerCard cardTitle={"Androwarn"}
                     cardRedirectLink={"/admin/scanner/1"}
                     cardInfoText={"Androwarn is a tool..."}
                     cardFooterLink={"https://github.com/maaaaz/androwarn"}/>

        <ScannerCard cardTitle={"APKiD"}
                     cardRedirectLink={"/admin/scanner/2"}
                     cardInfoText={"APKiD is a tool..."}
                     cardFooterLink={"https://github.com/rednaga/APKiD"}/>

        <ScannerCard cardTitle={"Qark"}
                     cardRedirectLink={"/admin/scanner/3"}
                     cardInfoText={"Qark is a tool..."}
                     cardFooterLink={"https://github.com/linkedin/qark/"}/>

        <ScannerCard cardTitle={"VirusTotal"}
                     cardRedirectLink={"/admin/scanner/4"}
                     cardInfoText={"VirusTotal is a tool..."}
                     cardFooterLink={"https://www.virustotal.com/"}/>
      </CardGroup>

      <CardGroup>
        <ScannerCard cardTitle={"Quark-Engine"}
                     cardRedirectLink={"/admin/scanner/5"}
                     cardInfoText={"Quark-Engine is a tool..."}
                     cardFooterLink={"https://github.com/quark-engine/quark-engine"}/>

        <ScannerCard cardTitle={"Exodus"}
                     cardRedirectLink={"/admin/scanner/6"}
                     cardInfoText={"Exodus is a tool..."}
                     cardFooterLink={"https://github.com/exodus-privacy/exodus"}/>

        <ScannerCard cardTitle={"SUPER"}
                     cardRedirectLink={"/admin/scanner/7"}
                     cardInfoText={"SUPER is a tool..."}
                     cardFooterLink={"https://github.com/SUPERAndroidAnalyzer/super"}/>

        <ScannerCard cardTitle={"APKLeaks"}
                     cardRedirectLink={"/admin/scanner/8"}
                     cardInfoText={"APKLeaks is a tool..."}
                     cardFooterLink={"https://github.com/dwisiswant0/apkleaks"}/>
      </CardGroup>
    </Container>
  );
};

export default ScannerControls;
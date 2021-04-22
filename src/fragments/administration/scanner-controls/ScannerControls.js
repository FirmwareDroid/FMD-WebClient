import React from "react";
import {CardGroup, Container} from "react-bootstrap";
import ScannerCard from "../../../components/cards/scanner-controls/ScannerCard";


const ScannerControls = () => {
  return (
    <Container fluid style={{"marginTop": 20}}>
      <h4>App Scanners</h4>
      <CardGroup>
        <ScannerCard cardTitle={"AndroGuard"}
                     cardRedirectLink={"/admin/scanner/0"}
                     cardInfoText={"Androguard is a full python tool to play with Android files. It let's you extract" +
                     "permissions, certificates, strings and much more."}
                     cardFooterLink={"https://github.com/androguard/androguard"}/>

        <ScannerCard cardTitle={"Androwarn"}
                     cardRedirectLink={"/admin/scanner/1"}
                     cardInfoText={"Androwarn is a vulnerability and privacy scanner. It can detect common APIs and the" +
                     "use of UNIX shell commands."}
                     cardFooterLink={"https://github.com/maaaaz/androwarn"}/>

        <ScannerCard cardTitle={"APKiD"}
                     cardRedirectLink={"/admin/scanner/2"}
                     cardInfoText={"APKiD is a tool to detect compilers, packers, anti-vm and anti-debugging methods."}
                     cardFooterLink={"https://github.com/rednaga/APKiD"}/>

        <ScannerCard cardTitle={"Qark"}
                     cardRedirectLink={"/admin/scanner/3"}
                     cardInfoText={"The Quick Android Review Kit is a vulnerability scanner designed to look for several " +
                     "security related Android application vulnerabilities."}
                     cardFooterLink={"https://github.com/linkedin/qark/"}/>

        <ScannerCard cardTitle={"VirusTotal"}
                     cardRedirectLink={"/admin/scanner/4"}
                     cardInfoText={"VirusTotal is a commercial web service that allows you to analyze suspicious files " +
                     "and URLs to detect types of malware."}
                     cardFooterLink={"https://www.virustotal.com/"}/>
      </CardGroup>

      <CardGroup>
        <ScannerCard cardTitle={"Quark-Engine"}
                     cardRedirectLink={"/admin/scanner/5"}
                     cardInfoText={"Quark-Engine is a malware analysis tool with an integrated malware scoring system."}
                     cardFooterLink={"https://github.com/quark-engine/quark-engine"}/>

        <ScannerCard cardTitle={"Exodus"}
                     cardRedirectLink={"/admin/scanner/6"}
                     cardInfoText={"Exodus is a tool to track the trackers. It is made to detect known advertising " +
                     "trackers."}
                     cardFooterLink={"https://github.com/exodus-privacy/exodus"}/>

        <ScannerCard cardTitle={"SUPER"}
                     cardRedirectLink={"/admin/scanner/7"}
                     cardInfoText={"SUPER Android Analyzer is a vulnerability scanner implemented in Rust."}
                     cardFooterLink={"https://github.com/SUPERAndroidAnalyzer/super"}/>

        <ScannerCard cardTitle={"APKLeaks"}
                     cardRedirectLink={"/admin/scanner/8"}
                     cardInfoText={"APKLeaks is a tool to scan for URIs, endpoints and secrets."}
                     cardFooterLink={"https://github.com/dwisiswant0/apkleaks"}/>
      </CardGroup>
    </Container>
  );
};

export default ScannerControls;
import React, {useState} from "react";
import {Emulator, Logcat, EmulatorStatus} from "android-emulator-webrtc/emulator";
import {ButtonGroup, Col, Container, Row, ToggleButton} from "react-bootstrap";
import LogcatView from "../components/emulator/LogcatView";
function EmulatorPage() {
    const [logcatPollingInterval, setLogcatPollingInterval] = useState(1000);
    const [maxHistoryValue, setMaxHistoryValue] = useState(30000);
    const [logcatData, setLogcatData] = useState("\n");
    const [radioEmulatorViewValue, setRadioEmulatorViewValue] = useState('webrtc');
    const radiosEmulatorView = [
        { name: 'WebRTC', value: 'webrtc' },
        { name: 'PNG', value: 'png' },
    ];
    const radioEmulatorSourceValue = "https://fmd-aosp.init-lab.ch"

    const onChangeEmulatorSource = (e) => {
        localStorage.setItem("emulatorSource", e.currentTarget.value);
    };

    const onChangeEmulatorView = (e) => {
        setRadioEmulatorViewValue(e.currentTarget.value)
    };

    const stateChange = (s) => {
        console.log(s)
    };

    const onError = (err) => {
        console.error(JSON.stringify(err))
    };

    return (<>
            <h1>Emulator</h1>
            <Container className="container-sm">
                <Row>
                    <Col md={3}>
                        <ButtonGroup>
                            {radiosEmulatorView.map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-${idx}`}
                                    type="radio"
                                    variant={idx % 2 ? 'outline-primary' : 'outline-secondary'}
                                    name="radio"
                                    value={radio.value}
                                    checked={radioEmulatorViewValue === radio.value}
                                    onChange={onChangeEmulatorView}
                                >
                                    {radio.name}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <Emulator
                            uri={radioEmulatorSourceValue}
                            width={200}
                            height={600}
                            onError={onError}
                            onStateChange={stateChange}
                            view={radioEmulatorViewValue}
                        />
                    </Col>
                    <Col md={9}>
                        <h5>Logcat</h5>
                        <LogcatView
                            emulatorUri={radioEmulatorSourceValue}
                            maxHistoryValue={maxHistoryValue}
                            logcatPollingInterval={logcatPollingInterval}
                        >
                        </LogcatView>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5>Emulator Status</h5>
                        <p>Source: {radioEmulatorSourceValue}</p>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default EmulatorPage;
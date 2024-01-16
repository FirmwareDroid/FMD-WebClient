import React, {useState} from "react";
import {Emulator} from "android-emulator-webrtc/emulator";
import {
    Button,
    ButtonGroup,
    Col,
    Container,
    Form,
    InputGroup,
    Row, SplitButton,
    Tab,
    TabContent,
    Tabs,
    ToggleButton
} from "react-bootstrap";
import LogcatView from "../components/emulator/LogcatView";
import {CiLocationOff, CiLocationOn} from "react-icons/ci";
import FormRange from 'react-bootstrap/FormRange'

function EmulatorPage() {
    const [emulatorConnectionState, setEmulatorConnectionState] = useState({ emuState: "" });
    const [hasEmulatorAudio, setHasEmulatorAudio] = useState({ hasAudio: false });
    const [longitudeValue, setLongitudeValue] = useState(8.72932);
    const [latitudeValue, setLatitudeValue] = useState(47.4974);
    const [hasEmulatorError, setHasEmulatorError] = useState(false);
    const [gpsLocation, setGpsLocation] = useState({ gps: {latitude: 47.4974, longitude: 8.72932} });
    const [volumeState, setVolumeState] = useState({ volume: 0, muted: true });
    const [isLogcatPaused, setIsLogcatPause] = useState(false);
    const [isLogcatFollowing, setIsLogcatFollowing] = useState(true);
    const [logcatPollingInterval, setLogcatPollingInterval] = useState(1000);
    const [maxHistoryValue, setMaxHistoryValue] = useState(80000);
    const [radioEmulatorViewValue, setRadioEmulatorViewValue] = useState('webrtc');
    const radiosEmulatorView = [
        { name: 'WebRTC', value: 'webrtc' },
        { name: 'PNG', value: 'png' },
    ];
    const radioEmulatorSourceValue = "https://fmd-aosp.init-lab.ch/0"
    const terminalCommands = {
        connect: "connect to emulator via adb"
    };

    const onChangeEmulatorView = (e) => {
        setRadioEmulatorViewValue(e.currentTarget.value)
    };


    return (<>
            <Container className="container-sm mt-3">
                <h5>Emulator (experimental) </h5>
                <Row>
                    <Col>
                        <p>Source: {radioEmulatorSourceValue}</p>
                        {!hasEmulatorError && <p>State: {emulatorConnectionState.emuState}</p>}
                        {hasEmulatorError && <p>State: ERROR</p>}
                        <ButtonGroup size="sm" className="mr-3 mb-3">
                            {radiosEmulatorView.map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-${idx}`}
                                    type="radio"
                                    variant={"outline-success"}
                                    name="radio"
                                    value={radio.value}
                                    checked={radioEmulatorViewValue === radio.value}
                                    onChange={onChangeEmulatorView}
                                >
                                    {radio.name}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                        <InputGroup size="sm" className="mb-3">
                            <Button
                                type="submit"
                                color="inherit"
                                onClick={(e) => setGpsLocation({
                                    gps: {
                                        latitude: latitudeValue,
                                        longitude: longitudeValue}
                                    }
                                )}
                                size="large">
                                <CiLocationOn /> Set GPS
                            </Button>
                            <Form.Control
                                aria-label="Longitude"
                                type="float"
                                required
                                onChange={(e) => setLongitudeValue(Number(e.target.value))}
                                placeholder="Longitude"
                            />
                            <Form.Control
                                aria-label="Latitude"
                                type="float"
                                required
                                onChange={(e) => setLatitudeValue(Number(e.target.value))}
                                placeholder="Latitude"
                            />
                        </InputGroup>
                        <Form
                            disabled={hasEmulatorAudio}
                        >
                            <Form.Label>
                                Volume {Math.floor(volumeState.volume*100)}%
                            </Form.Label>
                            <Form.Range
                                min='0'
                                max='1'
                                step='0.01'
                                onChange={(e) => {
                                    let value = Number(e.target.value)
                                    let muted = value === 0
                                    setVolumeState({volume: value, muted: muted})
                                }}
                                value={volumeState.volume}
                                disabled={false}
                            />
                        </Form>

                        {hasEmulatorError &&
                            <p>Oopps...some connection problem occurred!</p>
                        }
                        {!hasEmulatorError &&
                            <Emulator
                                uri={radioEmulatorSourceValue}
                                width={200}
                                height={600}
                                onError={(error) => {
                                    console.error("Emulator error", error)
                                    if(!error.contains("receiveJsepMessages")){
                                        setHasEmulatorError(true)}
                                    }
                                }
                                onStateChange={(state) => {
                                    console.info("Emulator state changed", state)
                                    setEmulatorConnectionState({emuState: state})
                                }}
                                onAudioStateChange={(audioState) => setHasEmulatorAudio({ hasAudio: audioState })}
                                view={radioEmulatorViewValue}
                                gps={gpsLocation}
                                volume={volumeState.volume}
                                muted={volumeState.muted}
                            />
                        }
                    </Col>
                    <Col md={9}>
                        <Tabs
                            defaultActiveKey="terminal"
                            id="tool-tabs"
                            className="mb-3"
                        >
                            <Tab eventKey="terminal" title="ADB">
                                <h5>ADB shell</h5>
                                <p>Shell connection: "adb connect IP:5555"</p>

                                <h5>ADB screen mirroring with <a href="https://github.com/Genymobile/scrcpy/tree/master">scrcpy</a></h5>
                                <p>Connect: "scrcpy --tcpip=IP:5555"</p>
                            </Tab>
                            <Tab eventKey="logcat" title="Logcat">
                                <ButtonGroup size="sm" className="mx-1 mb-1">
                                    <ToggleButton
                                        id="toggle-follow-logcat"
                                        type="checkbox"
                                        variant="outline-success"
                                        checked={isLogcatFollowing}
                                        value="1"
                                        onChange={(e) => setIsLogcatFollowing(e.currentTarget.checked)}
                                    >Log Follow
                                    </ToggleButton>
                                </ButtonGroup>
                                <ButtonGroup size="sm" className="mx-1 mb-1">
                                    <ToggleButton
                                        id="toggle-pause-logcat"
                                        type="checkbox"
                                        variant="outline-success"
                                        checked={isLogcatPaused}
                                        value="1"
                                        onChange={(e) => setIsLogcatPause(e.currentTarget.checked)}
                                    >Pause
                                    </ToggleButton>
                                </ButtonGroup>
                                {hasEmulatorError &&
                                    <p>Oopps...some connection problem occurred!</p>
                                }
                                {!hasEmulatorError &&
                                    <LogcatView
                                        emulatorUri={radioEmulatorSourceValue}
                                        maxHistoryValue={maxHistoryValue}
                                        logcatPollingInterval={logcatPollingInterval}
                                        follow={isLogcatFollowing}
                                        isLogcatPaused={isLogcatPaused}
                                    >
                                    </LogcatView>
                                }
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default EmulatorPage;
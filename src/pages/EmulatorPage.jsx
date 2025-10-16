import React, {useEffect, useState} from 'react';
import {Button, ButtonGroup, Col, Container, Form, InputGroup, Row, Spinner, ToggleButton} from "react-bootstrap";
import {MapPin} from "lucide-react";

function EmulatorPage() {
    useEffect(() => {
        import("bootstrap/dist/css/bootstrap.min.css");
    }, []);

    const emulatorUrisFromStorage = JSON.parse(sessionStorage.getItem('emulatorUris')) || [];
    const radiosEmulatorView = [{name: 'WebRTC', value: 'webrtc'}, {name: 'PNG', value: 'png'},]
    const [emulatorViewCounter, setEmulatorViewCounter] = useState(2);
    const [emulatorViews, setEmulatorViews] = useState([{
        emulatorConnectionState: {emuState: ""},
        hasEmulatorAudio: {hasAudio: false},
        longitudeValue: 8.72932,
        latitudeValue: 47.4974,
        hasEmulatorError: false,
        emulatorErrorMessage: null,
        gpsLocation: {gps: {latitude: 47.4974, longitude: 8.72932}},
        volumeState: {volume: 0, muted: true},
        radioEmulatorViewValue: 'png',
        emulatorUri: emulatorUrisFromStorage[0] || "https://fmd.localhost:4443/",
        radiosEmulatorView: radiosEmulatorView,
    }, {
        emulatorConnectionState: {emuState: ""},
        hasEmulatorAudio: {hasAudio: false},
        longitudeValue: 8.72932,
        latitudeValue: 47.4974,
        hasEmulatorError: false,
        emulatorErrorMessage: null,
        gpsLocation: {gps: {latitude: 47.4974, longitude: 8.72932}},
        volumeState: {volume: 0, muted: true},
        radioEmulatorViewValue: 'png',
        emulatorUri: emulatorUrisFromStorage[1] || "https://fmd-aosp.init-lab.ch:4443/0",
        radiosEmulatorView: radiosEmulatorView,
    }, {
        emulatorConnectionState: {emuState: ""},
        hasEmulatorAudio: {hasAudio: false},
        longitudeValue: 8.72932,
        latitudeValue: 47.4974,
        hasEmulatorError: false,
        emulatorErrorMessage: null,
        gpsLocation: {gps: {latitude: 47.4974, longitude: 8.72932}},
        volumeState: {volume: 0, muted: true},
        radioEmulatorViewValue: 'png',
        emulatorUri: emulatorUrisFromStorage[1] || "https://fmd-aosp.init-lab.ch:4443/1",
        radiosEmulatorView: radiosEmulatorView,
    }]);
    const [selectedEmulatorViewIndex, setSelectedEmulatorViewIndex] = useState(null);


    const updateEmulatorView = (index, key, value) => {
        setEmulatorViews(prevEmulatorViews => prevEmulatorViews.map((emulatorView, i) => {
            if (i === index) {
                return {...emulatorView, [key]: value};
            } else {
                return emulatorView;
            }
        }));
    };

    const addEmulatorView = () => {
        const newEmulatorView = {
            emulatorConnectionState: {emuState: ""},
            hasEmulatorAudio: {hasAudio: true},
            longitudeValue: 0.0,
            latitudeValue: 0.0,
            hasEmulatorError: false,
            emulatorErrorMessage: null,
            gpsLocation: {gps: {latitude: 0.0, longitude: 0.0}},
            volumeState: {volume: 0, muted: true},
            radioEmulatorViewValue: 'png',
            emulatorUri: "https://fmd-aosp.init-lab.ch:4443/" + emulatorViewCounter,
            radiosEmulatorView: radiosEmulatorView,
        };
        setEmulatorViews(prevEmulatorViews => [...prevEmulatorViews, newEmulatorView]);
        setEmulatorViewCounter(emulatorViewCounter + 1);
    };

    const connectAllEmulators = () => {
        emulatorViews.forEach((emulatorView, index) => {
            updateEmulatorView(index, 'emulatorConnectionState', {emuState: "connecting"});
        });
    };

    return (
        <Container className="container-sm mt-3">
            <h5>Emulator (experimental) </h5>
            <Row className="mt-3 mb-3">
                <Col xs={12} sm={6} md={4}>
                    {selectedEmulatorViewIndex === null ? (<>
                        <Button
                            className={"mr-3"}
                            variant={"outline-light"}
                            onClick={addEmulatorView}>Add Emulator View
                        </Button>
                        <Button
                            variant={"outline-light"}
                            onClick={connectAllEmulators}>Connect All
                        </Button>
                    </>) : (<a className="mt-3 mb-3"
                               href="#"
                               onClick={() => setSelectedEmulatorViewIndex(null)}>Multiple Emulator Views
                    </a>)}
                </Col>
            </Row>
            <Row>
                {selectedEmulatorViewIndex !== null ? (<Col className="mt-3 mb-3" xs={10}>
                    <EmulatorView
                        index={selectedEmulatorViewIndex}
                        emulatorConnectionState={emulatorViews[selectedEmulatorViewIndex].emulatorConnectionState}
                        setEmulatorConnectionState={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'emulatorConnectionState', value)}
                        hasEmulatorAudio={emulatorViews[selectedEmulatorViewIndex].hasEmulatorAudio}
                        setHasEmulatorAudio={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'hasEmulatorAudio', value)}
                        longitudeValue={emulatorViews[selectedEmulatorViewIndex].longitudeValue}
                        setLongitudeValue={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'longitudeValue', value)}
                        latitudeValue={emulatorViews[selectedEmulatorViewIndex].latitudeValue}
                        setLatitudeValue={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'latitudeValue', value)}
                        hasEmulatorError={emulatorViews[selectedEmulatorViewIndex].hasEmulatorError}
                        setHasEmulatorError={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'hasEmulatorError', value)}
                        emulatorErrorMessage={emulatorViews[selectedEmulatorViewIndex].emulatorErrorMessage}
                        setEmulatorErrorMessage={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'emulatorErrorMessage', value)}
                        gpsLocation={emulatorViews[selectedEmulatorViewIndex].gpsLocation}
                        setGpsLocation={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'gpsLocation', value)}
                        volumeState={emulatorViews[selectedEmulatorViewIndex].volumeState}
                        setVolumeState={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'volumeState', value)}
                        radioEmulatorViewValue={emulatorViews[selectedEmulatorViewIndex].radioEmulatorViewValue}
                        setRadioEmulatorViewValue={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'radioEmulatorViewValue', value)}
                        emulatorUri={emulatorViews[selectedEmulatorViewIndex].emulatorUri}
                        setEmulatorUri={(value) => updateEmulatorView(selectedEmulatorViewIndex, 'emulatorUri', value)}
                        radiosEmulatorView={emulatorViews[selectedEmulatorViewIndex].radiosEmulatorView}
                        onSelect={() => setSelectedEmulatorViewIndex(selectedEmulatorViewIndex)}
                        selectedEmulatorViewIndex={selectedEmulatorViewIndex}
                    />
                </Col>) : (emulatorViews.map((emulatorView, index) => (
                    <Col className="mt-3 mb-3" xs={12} sm={6} md={4} key={index}>
                        <EmulatorView
                            index={index}
                            emulatorConnectionState={emulatorView.emulatorConnectionState}
                            setEmulatorConnectionState={(value) => updateEmulatorView(index, 'emulatorConnectionState', value)}
                            hasEmulatorAudio={emulatorView.hasEmulatorAudio}
                            setHasEmulatorAudio={(value) => updateEmulatorView(index, 'hasEmulatorAudio', value)}
                            longitudeValue={emulatorView.longitudeValue}
                            setLongitudeValue={(value) => updateEmulatorView(index, 'longitudeValue', value)}
                            latitudeValue={emulatorView.latitudeValue}
                            setLatitudeValue={(value) => updateEmulatorView(index, 'latitudeValue', value)}
                            hasEmulatorError={emulatorView.hasEmulatorError}
                            setHasEmulatorError={(value) => updateEmulatorView(index, 'hasEmulatorError', value)}
                            emulatorErrorMessage={emulatorView.emulatorErrorMessage}
                            setEmulatorErrorMessage={(value) => updateEmulatorView(index, 'emulatorErrorMessage', value)}
                            gpsLocation={emulatorView.gpsLocation}
                            setGpsLocation={(value) => updateEmulatorView(index, 'gpsLocation', value)}
                            volumeState={emulatorView.volumeState}
                            setVolumeState={(value) => updateEmulatorView(index, 'volumeState', value)}
                            radioEmulatorViewValue={emulatorView.radioEmulatorViewValue}
                            setRadioEmulatorViewValue={(value) => updateEmulatorView(index, 'radioEmulatorViewValue', value)}
                            emulatorUri={emulatorView.emulatorUri}
                            setEmulatorUri={(value) => updateEmulatorView(index, 'emulatorUri', value)}
                            radiosEmulatorView={emulatorView.radiosEmulatorView}
                            onSelect={() => setSelectedEmulatorViewIndex(index)}
                            selectedEmulatorViewIndex={null}
                        />
                    </Col>)))}
            </Row>
        </Container>
    );
}

function EmulatorView({
                          index,
                          emulatorConnectionState,
                          setEmulatorConnectionState,
                          hasEmulatorAudio,
                          setHasEmulatorAudio,
                          longitudeValue,
                          setLongitudeValue,
                          latitudeValue,
                          setLatitudeValue,
                          hasEmulatorError,
                          setHasEmulatorError,
                          emulatorErrorMessage,
                          setEmulatorErrorMessage,
                          gpsLocation,
                          setGpsLocation,
                          volumeState,
                          setVolumeState,
                          radioEmulatorViewValue,
                          setRadioEmulatorViewValue,
                          emulatorUri,
                          setEmulatorUri,
                          radiosEmulatorView,
                          selectedEmulatorViewIndex,
                          onSelect
                      }) {
    const [showEmulator, setShowEmulator] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isSelected = index === selectedEmulatorViewIndex;
    useEffect(() => {
        if (emulatorConnectionState.emuState === "connecting") {
            setIsLoading(true);
            setShowEmulator(true);
        }
    }, [emulatorConnectionState]);

    const handleEmulatorUriChange = (e) => {
        const newUri = String(e.target.value);
        let emulatorUris = JSON.parse(sessionStorage.getItem('emulatorUris')) || [];
        emulatorUris[index] = newUri;
        sessionStorage.setItem('emulatorUris', JSON.stringify(emulatorUris));
        setEmulatorUri(newUri);
    };

    const onChangeEmulatorView = (e) => {
        setRadioEmulatorViewValue(e.currentTarget.value)
    };

    const onEmulatorError = (error) => {
        console.error("Emulator error", error)
        if (!error.contains("receiveJsepMessages")) {
            setHasEmulatorError(true);
            setEmulatorErrorMessage(error);
        }
    }

    const onEmulatorStateChange = (state) => {
        console.info("Emulator state changed", state)
        setEmulatorConnectionState({emuState: state});
        if (state === "disconnected") {
            setIsLoading(false);
        }
        if (state === "connecting") {
            setShowEmulator(true);
            setIsLoading(true);
        }
        if (state === "connected") {
            setIsLoading(false);
        }
    }

    const onClickConnect = () => {
        if (showEmulator) {
            setShowEmulator(false);
            setIsLoading(false);
        } else {
            setShowEmulator(true);
            setIsLoading(true);
        }
    };

    function onClickDisconnect() {
        setShowEmulator(false);
        setIsLoading(false);
    }


    return (
        <Container>
            <Row>
                <Col className="border-box noUserSelect">
                    {hasEmulatorError &&
                        <p>Oopps...some connection problem occurred!</p>
                    }
                    {isLoading && showEmulator &&
                        <div className="center-content">
                            <Button
                                variant={"outline-light"}
                                onClick={onClickConnect}
                            >
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Connecting...
                            </Button>
                        </div>
                    }
                    {showEmulator && !hasEmulatorError &&
                        <Emulator
                            uri={emulatorUri}
                            width={100}
                            height={400}
                            onError={onEmulatorError}
                            onStateChange={onEmulatorStateChange}
                            onAudioStateChange={(audioState) => setHasEmulatorAudio({hasAudio: audioState})}
                            view={radioEmulatorViewValue}
                            gps={gpsLocation}
                            volume={volumeState.volume}
                            muted={volumeState.muted}
                        />
                    }
                    {!showEmulator &&
                        <div className="center-content">
                            <Button
                                variant={"outline-light"}
                                onClick={onClickConnect}>Connect
                            </Button>
                        </div>
                    }
                </Col>
                <Col>
                    {showEmulator &&
                        <Button
                            className="mt-3 mb-3 mr-1"
                            variant={"outline-light"}
                            size="sm"
                            onClick={onClickDisconnect}>
                            Disconnect
                        </Button>
                    }
                    {!isSelected &&
                        <Button className="mt-3 mb-3"
                                variant={"outline-light"}
                                size="sm"
                                onClick={() => onSelect(index)}>View
                        </Button>
                    }
                    {!hasEmulatorError && <p>State: {emulatorConnectionState.emuState}</p>}
                    {hasEmulatorError && <p>State: ERROR</p>}
                    <Form className="mt-3 mb-3">
                        <Form.Group controlId="userInput">
                            <Form.Control
                                type="text"
                                size="sm"
                                placeholder="Emulator URL"
                                value={emulatorUri}
                                onChange={handleEmulatorUriChange}
                            />
                        </Form.Group>
                    </Form>
                    {isSelected &&
                        <>
                            <ButtonGroup size="sm" className="mr-3 mb-3">
                                {radiosEmulatorView.map((radio, idx) => (
                                    <ToggleButton
                                        key={`${idx}-${index}`}
                                        id={`radio-${idx}-${index}`}
                                        type="radio"
                                        variant={"outline-light"}
                                        name={`radio-${index}`}
                                        value={radio.value}
                                        checked={radioEmulatorViewValue.toString() === radio.value.toString()}
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
                                    variant={"outline-light"}
                                    onClick={(e) => setGpsLocation({
                                            gps: {
                                                latitude: latitudeValue,
                                                longitude: longitudeValue
                                            }
                                        }
                                    )}
                                    size="large">
                                    <MapPin/>
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
                                    Volume {Math.floor(volumeState.volume * 100)}%
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
                        </>
                    }
                </Col>
            </Row>
        </Container>
    );
}

export default EmulatorPage;
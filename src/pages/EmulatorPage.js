import {
    Button,
    Col,
    Container,
    Row,
} from "react-bootstrap";
import React, {useState} from 'react';
import EmulatorView from "../components/emulator/EmulatorView";


function EmulatorPage() {
    const emulatorUrisFromStorage = JSON.parse(sessionStorage.getItem('emulatorUris')) || [];
    const radiosEmulatorView = [
        {name: 'WebRTC', value: 'webrtc'},
        {name: 'PNG', value: 'png'},
    ]
    const [emulatorViews, setEmulatorViews] = useState([
        {
            emulatorConnectionState: {emuState: ""},
            hasEmulatorAudio: {hasAudio: false},
            longitudeValue: 8.72932,
            latitudeValue: 47.4974,
            hasEmulatorError: false,
            emulatorErrorMessage: null,
            gpsLocation: {gps: {latitude: 47.4974, longitude: 8.72932}},
            volumeState: {volume: 0, muted: true},
            radioEmulatorViewValue: 'png',
            emulatorUri: emulatorUrisFromStorage[0] || "https://fmd.localhost:4443/0",
            radiosEmulatorView: radiosEmulatorView,
        },
        {
            emulatorConnectionState: {emuState: ""},
            hasEmulatorAudio: {hasAudio: false},
            longitudeValue: 8.72932,
            latitudeValue: 47.4974,
            hasEmulatorError: false,
            emulatorErrorMessage: null,
            gpsLocation: {gps: {latitude: 47.4974, longitude: 8.72932}},
            volumeState: {volume: 0, muted: true},
            radioEmulatorViewValue: 'png',
            emulatorUri: emulatorUrisFromStorage[1] || "https://fmd-aosp.init-lab/0",
            radiosEmulatorView: radiosEmulatorView,
        },
        {
            emulatorConnectionState: {emuState: ""},
            hasEmulatorAudio: {hasAudio: false},
            longitudeValue: 8.72932,
            latitudeValue: 47.4974,
            hasEmulatorError: false,
            emulatorErrorMessage: null,
            gpsLocation: {gps: {latitude: 47.4974, longitude: 8.72932}},
            volumeState: {volume: 0, muted: true},
            radioEmulatorViewValue: 'png',
            emulatorUri: emulatorUrisFromStorage[1] || "https://fmd-aosp.init-lab/1",
            radiosEmulatorView: radiosEmulatorView,
        }
    ]);


    const updateEmulatorView = (index, key, value) => {
        setEmulatorViews(prevEmulatorViews => prevEmulatorViews.map((emulatorView, i) => {
            if (i === index) {
                return { ...emulatorView, [key]: value };
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
            emulatorUri: "https://fmd.localhost:4443/0",
            radiosEmulatorView: radiosEmulatorView,
        };
        setEmulatorViews(prevEmulatorViews => [...prevEmulatorViews, newEmulatorView]);
    };


    return (<>
            <Container className="container-sm mt-3">
                <h5>Emulator (experimental) </h5>
                <Row className="mt-3 mb-3">
                    <Col xs={12} sm={6} md={4}>
                        <Button
                            variant={"outline-light"}
                            onClick={addEmulatorView}>Add Emulator View
                        </Button>
                    </Col>
                </Row>
                <Row>
                        {emulatorViews.map((emulatorView, index) => (
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
                                />
                            </Col>
                        ))}
                </Row>
            </Container>
        </>
    );
}

export default EmulatorPage;
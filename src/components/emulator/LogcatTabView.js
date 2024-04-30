import {ButtonGroup, ToggleButton} from "react-bootstrap";
import LogcatView from "./LogcatView";
import React, {useState} from "react";

const LogcatControlView = (options) => {
    const [isLogcatPaused, setIsLogcatPause] = useState(false);
    const [isLogcatFollowing, setIsLogcatFollowing] = useState(true);
    const [logcatPollingInterval, setLogcatPollingInterval] = useState(1000);
    const [maxHistoryValue, setMaxHistoryValue] = useState(80000);

    return (<>
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
            <LogcatView
                emulatorUri={options.emulatorUri}
                maxHistoryValue={maxHistoryValue}
                logcatPollingInterval={logcatPollingInterval}
                follow={isLogcatFollowing}
                isLogcatPaused={isLogcatPaused}
            >
            </LogcatView>
        </>
    );
};

export default LogcatControlView;
import React, {useState} from "react";
import {Logcat} from "android-emulator-webrtc/emulator";
import { LazyLog } from 'react-lazylog';
import { useEffect } from 'react';

const LogcatView = (options) => {
    const [isLogcatPolling, setIsLogcatPolling] = useState(false);
    const [logcatData, setLogcatData] = useState("\n");
    const logcat = new Logcat(options.emulatorUri);
    const pollInterval = options.logcatPollingInterval || 1000;

    useEffect(() => {
        if(options.isLogcatPaused === false){
            logcat.start((logLine) => {
            }, pollInterval);

            logcat.on("data", (logLine) => {
                let outputLog = logcatData + logLine
                let allLines = outputLog.split("\n")
                if(allLines.length > options.maxHistoryValue){
                    outputLog = logLine
                }
                setLogcatData(outputLog)
            }, pollInterval);
        }
        return () => {
            logcat.stop();
        };
    }, [logcat, options.isLogcatPaused, setIsLogcatPolling]);

    return (<>
            <LazyLog extraLines={1}
                     text={logcatData}
                     enableSearch
                     follow={options.follow}
                     height={800}
                     selectableLines={true}
                     />
        </>
    );
};


export default LogcatView;
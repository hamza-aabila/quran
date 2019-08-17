import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTh,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faPlayCircle,
    faPauseCircle,
    faStopCircle
} from "@fortawesome/free-solid-svg-icons";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { withThemeContext } from "../../context/Theme";
import { CommandIcons } from "./../Modal/Commands";
import Utils from "../../services/utils";

function Sidebar({ app, player, themeContext }) {
    const onClick = (e, id) => {
        switch (id) {
            case "Theme":
                toggleTheme();
                // app.setPopup(null);
                break;
            case "Mask":
                app.setMaskStart();
                app.closePopup();
                break;
            case "Copy":
                Utils.copy2Clipboard(app.getSelectedText());
                break;
            case "Share":
                break;
            case "Fullscreen":
                Utils.requestFullScreen();
                return;
            case "Play":
                if (player.audioState === AudioState.playing) {
                    player.pause();
                } else if (player.audioState === AudioState.paused) {
                    player.resume();
                } else {
                    player.play();
                }
                break;
            case "Tafseer":
                app.selectAya();
            default:
                if (app.popup == id) {
                    app.closePopup();
                } else {
                    app.setPopup(id);
                }
        }
        app.setShowMenu(false);
        app.pushRecentCommand(id);
        e.preventDefault();
    };

    const toggleTheme = e => {
        themeContext.toggleTheme();
        // app.setShowMenu(false);
        // app.pushRecentCommand("Theme");
    };

    // useEffect(() => {
    // 	updateShowButtons(!app.isNarrow);
    // }, [app.isNarrow]);

    const toggleButtons = () => {
        app.toggleShowMenu();
    };

    const showPlayer = () => {
        if (player.playingAya !== -1) {
            app.gotoAya(player.playingAya, { sel: true, replace: false });
        }
        if (app.popup === "AudioPlayer") {
            app.closePopup();
        } else {
            player.show();
        }
    };

    const play = e => {
        player.play();
    };
    const stop = e => {
        player.stop();
    };
    const resume = e => {
        player.resume();
    };
    const pause = e => {
        player.pause();
    };

    const renderPlayer = () => {
        let btn = null,
            stopBtn = null;

        if (player.audioState !== AudioState.stopped) {
            stopBtn = (
                <button onClick={stop}>
                    <FontAwesomeIcon icon={faStopCircle} />
                </button>
            );
        }

        switch (player.audioState) {
            case AudioState.paused:
                btn = (
                    <button onClick={resume} className="blinking">
                        <FontAwesomeIcon icon={faPauseCircle} />
                    </button>
                );
                break;
            case AudioState.playing:
                btn = (
                    <button onClick={pause}>
                        <FontAwesomeIcon icon={faPauseCircle} />
                    </button>
                );
                break;
            default:
                btn = (
                    <button onClick={play}>
                        <FontAwesomeIcon icon={faPlayCircle} />
                    </button>
                );
        }
        return (
            <>
                <button
                    onClick={showPlayer}
                    className={
                        "ReciterSideButton" +
                        (player.audioState === AudioState.playing
                            ? " blinking"
                            : "")
                    }
                    style={{
                        backgroundImage:
                            "url(" +
                            process.env.PUBLIC_URL +
                            "/images/" +
                            player.reciter +
                            ".jpg)"
                    }}
                />
                {btn} {stopBtn}
            </>
        );
    };

    return (
        <div
            className="Sidebar"
            style={{
                bottom:
                    app.showMenu || !app.isNarrow
                        ? app.isNarrow
                            ? 25
                            : 0
                        : "auto"
            }}
        >
            <button
                onClick={toggleButtons}
                //style={{ display: app.isNarrow ? "block" : "none" }}
                style={{ visibility: app.isNarrow ? "visible" : "hidden" }}
            >
                <FontAwesomeIcon
                    icon={app.showMenu ? faAngleDoubleUp : faAngleDoubleDown}
                />
            </button>
            <div
                className="ButtonsList"
                style={{
                    display: app.showMenu || !app.isNarrow ? "block" : "none"
                }}
            >
                <button onClick={e => onClick(e, "Commands")}>
                    <FontAwesomeIcon icon={CommandIcons["Commands"]} />
                </button>
                {/* <button onClick={e => onClick(e, "Fullscreen")}>
					<FontAwesomeIcon icon={CommandIcons["Fullscreen"]} />
				</button> */}
                {renderPlayer()}
                <div id="RecentCommands">
                    {app.recentCommands
                        .filter(c => c != null)
                        .map(command => {
                            return (
                                <button
                                    key={command}
                                    onClick={e => onClick(e, command)}
                                    title={command}
                                    command={command}
                                >
                                    <FontAwesomeIcon
                                        icon={CommandIcons[command]}
                                    />
                                </button>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

export default withThemeContext(AppConsumer(PlayerConsumer(Sidebar)));

import React, { Component, useContext } from "react";
import "./AudioPlayer.scss";
import { AppConsumer, AppContext } from "../../context/App";
import {
    PlayerConsumer,
    AudioState,
    PlayerContext
} from "../../context/Player";
import QData from "./../../services/QData";
import { FormattedMessage as String } from "react-intl";
import ReciterName from "./ReciterName";
import { ListReciters } from "./../../services/AudioData";
import Switch from "react-switch";
import { CommandButton } from "./../Modal/Commands";
import { VerseInfo } from "./../Widgets";

const AudioSettings = () => {
    const player = useContext(PlayerContext);
    const app = useContext(AppContext);

    let popupBody;
    let selectRepeat;

    const recitersList = ListReciters("ayaAudio");
    const [buttonWidth, outerMargin, scrollBarWidth] = [90, 30, 20];
    const recitersListWidth = app.popupWidth() - outerMargin - scrollBarWidth;
    const recitersPerRow = Math.floor(recitersListWidth / buttonWidth);
    const recitersRowsCount = Math.floor(
        (recitersList.length - 1) / recitersPerRow + 1
    );
    const recitersHeight = recitersRowsCount * buttonWidth + 15;
    const centerPadding =
        (recitersListWidth - recitersPerRow * buttonWidth) / 2;

    const onChangeRepeat = ({ currentTarget }) => {
        const repeat = currentTarget.value;
        player.setRepeat(parseInt(repeat));
    };

    const updateFollowPlayer = checked => {
        player.setFollowPlayer(checked);
    };

    const selectReciter = ({ currentTarget }) => {
        const reciter = currentTarget.getAttribute("reciter");
        player.changeReciter(reciter);
        popupBody.scrollTop = 0;
    };

    return (
        <>
            <div className="Title">
                <VerseInfo verse={player.playingAya} />
                {app.isNarrow ? <PlayerButtons showReciter={false} /> : ""}
            </div>
            <div
                ref={ref => {
                    popupBody = ref;
                }}
                className="PopupBody"
                style={{
                    height: app.appHeight - 80
                }}
            >
                <div className="OptionRow">
                    <label>
                        <String id="repeat" />
                        <select
                            ref={ref => {
                                selectRepeat = ref;
                            }}
                            onChange={onChangeRepeat}
                            value={player.repeat}
                        >
                            <String id="no_repeat">
                                {label => <option value={0}>{label}</option>}
                            </String>
                            <String id="selection">
                                {label => <option value={1}>{label}</option>}
                            </String>
                            <String id="page">
                                {label => <option value={2}>{label}</option>}
                            </String>
                            <String id="sura">
                                {label => <option value={3}>{label}</option>}
                            </String>
                            <String id="part">
                                {label => <option value={4}>{label}</option>}
                            </String>
                        </select>
                    </label>
                </div>
                <div className="OptionRow">
                    <label>
                        <span>
                            <String id="followPlayer" />
                        </span>
                        <Switch
                            height={22}
                            width={42}
                            onChange={updateFollowPlayer}
                            checked={player.followPlayer}
                            // disabled={player.repeat == 1}
                        />
                    </label>
                </div>
                <div
                    className="RecitersList"
                    style={{
                        height: recitersHeight
                    }}
                >
                    {recitersList.map((reciter, index) => {
                        const row = Math.floor(index / recitersPerRow);
                        const top = row * 90;
                        const col = index - row * recitersPerRow;
                        // const left = col * buttonWidth + centerPadding;
                        const left =
                            recitersListWidth -
                            (col * buttonWidth + centerPadding) -
                            buttonWidth;
                        return (
                            <button
                                reciter={reciter}
                                key={reciter}
                                className={
                                    "ReciterButton" +
                                    (player.reciter === reciter
                                        ? " Selected"
                                        : "")
                                }
                                onClick={selectReciter}
                                style={{
                                    top,
                                    left
                                }}
                            >
                                <img
                                    className="ReciterIcon"
                                    src={
                                        process.env.PUBLIC_URL +
                                        "/images/" +
                                        reciter +
                                        ".jpg"
                                    }
                                />
                                <div>
                                    <ReciterName id={reciter} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

const PlayerButtons = ({ showReciter, showLabels }) => {
    const player = useContext(PlayerContext);

    let playButton = null,
        stopBtn = null;

    if (player.audioState !== AudioState.stopped) {
        stopBtn = <CommandButton command="Stop" showLabel={showLabels} />;
    }

    switch (player.audioState) {
        case AudioState.paused:
            playButton = (
                <CommandButton
                    command="Pause"
                    className="blinking"
                    showLabel={showLabels}
                />
            );
            break;
        case AudioState.playing:
            playButton = (
                <CommandButton command="Pause" showLabel={showLabels} />
            );
            break;
        case AudioState.buffering:
            playButton = (
                <CommandButton
                    command="Downloading"
                    className="blinking"
                    showLabel={showLabels}
                />
            );
            break;
        default:
            playButton = (
                <CommandButton command="Play" showLabel={showLabels} />
            );
    }

    const reciterButton =
        showReciter === false || player.audioState === AudioState.stopped ? (
            ""
        ) : (
            <CommandButton command="AudioPlayer" showLabel={showLabels} />
        );

    return (
        <>
            {reciterButton}
            {playButton} {stopBtn}
        </>
    );
};

const PlayerStatus = () => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const { selectStart } = app;
    const { playingAya, audioState } = player;
    let ayaId = playingAya === -1 ? selectStart : playingAya;
    let { sura, aya } = QData.ayaIdInfo(ayaId);
    let stateId = "unknown";
    switch (audioState) {
        case AudioState.stopped:
            stateId = "stopped";
            break;
        case AudioState.buffering:
            stateId = "buffering";
            break;
        case AudioState.playing:
            stateId = "playing";
            break;
        case AudioState.paused:
            stateId = "paused";
            break;
        case AudioState.error:
            stateId = "error";
            break;
        default:
            break;
    }

    const gotoPlayingAya = e => {
        app.gotoAya(ayaId, { sel: true });
    };

    return (
        <button onClick={gotoPlayingAya} className="AudioStatusButton">
            <String id={stateId} />
            :&nbsp;
            <String id="sura_names">
                {sura_names => {
                    return sura_names.split(",")[sura] + " (" + (aya + 1) + ")";
                }}
            </String>
        </button>
    );
};

export { PlayerButtons, PlayerStatus, AudioSettings };

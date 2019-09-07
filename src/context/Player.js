import React, { Component } from "react";
import { AppConsumer } from "./App";
import QData from "./../services/QData";
import Utils from "./../services/utils";
import { GetAudioURL, ListReciters } from "./../services/AudioData";

const AudioState = {
    stopped: 0,
    playing: 1,
    paused: 2,
    buffering: 3,
    error: 4
};

const PlayerContextState = {
    visible: false,
    audioState: AudioState.stopped,
    playingAya: -1,
    followPlayer: JSON.parse(localStorage.getItem("followPlayer") || "true"),
    repeat: 0,
    rangeStart: -1,
    rangeEnd: -1,
    rangeType: 0,
    reciter: localStorage.getItem("reciter") || ListReciters()[0]
};

//Create the PlayerContext hash object {Provider, Consumer}
const PlayerContext = React.createContext(PlayerContextState);

//Define single provider component class
class PlayerProvider extends Component {
    state = PlayerContextState;

    show = show => {
        //this.setState({ visible: show !== false });
        this.props.app.setPopup("AudioPlayer");
    };

    setPlayingAya = playingAya => {
        this.setState({ playingAya });
        return playingAya;
    };

    setAudioState = audioState => {
        this.setState({ audioState });
        return audioState;
    };

    offsetPlayingAya = offset => {
        //TODO: validate aya
        const playingAya = this.state.playingAya + offset;
        this.setState({ playingAya });
        return playingAya;
    };

    audioSource = ayaId => {
        const { sura, aya } = QData.ayaIdInfo(
            ayaId !== undefined ? ayaId : this.state.playingAya
        );
        return GetAudioURL(this.state.reciter, sura + 1, aya + 1);
        // const fileName =
        //     Utils.num2string(sura + 1, 3) + Utils.num2string(aya + 1, 3);

        // return `http://www.everyayah.com/data/Abdul_Basit_Murattal_192kbps/${fileName}.mp3`;
    };

    play = () => {
        const { app } = this.props;
        const playingAya =
            this.state.playingAya == -1
                ? this.setPlayingAya(app.selectStart)
                : this.state.playingAya;

        this.audio.src = this.audioSource(playingAya);
        this.audio.play();
        document.title = "Reciting...";
        //this.show();
    };
    resume = () => {
        this.audio.play();
        document.title = "Reciting...";
        // this.show();
    };
    stop = event => {
        this.audio.pause();
        this.setAudioState(AudioState.stopped);
        this.setPlayingAya(-1);
        document.title = "";
    };

    pause = () => {
        document.title = "Paused";
        this.audio.pause();
    };

    changeReciter = reciter => {
        localStorage.setItem("reciter", reciter);
        this.setState({ reciter });
        const { state, audio, playingAya } = this;
        switch (state.audioState) {
            case AudioState.paused:
                this.stop();
                break;
            case AudioState.playing:
                setTimeout(() => {
                    this.play();
                }, 1);
                break;
            default:
                break;
        }

        let updated_reciters = ListReciters("ayaAudio").filter(
            r => r !== reciter
        );

        updated_reciters.splice(0, 0, reciter);
        localStorage.setItem(
            "reciters_ayaAudio",
            JSON.stringify(updated_reciters)
        );
    };

    setFollowPlayer = followPlayer => {
        this.setState({ followPlayer });
        localStorage.setItem("followPlayer", JSON.stringify(followPlayer));
    };

    setRepeat = repeat => {
        this.setState({ repeat });
    }

    methods = {
        show: this.show,
        setAudioState: this.setAudioState,
        setPlayingAya: this.setPlayingAya,
        offsetPlayingAya: this.offsetPlayingAya,
        play: this.play,
        pause: this.pause,
        resume: this.resume,
        stop: this.stop,
        changeReciter: this.changeReciter,
        setFollowPlayer: this.setFollowPlayer,
        setRepeat: this.setRepeat
    };

    componentDidMount() {
        const audio = (this.audio = document.createElement("audio"));
        audio.addEventListener("volumechange", this.onVolumeChange);
        audio.addEventListener("ended", this.onEnded);
        audio.addEventListener("playing", this.onPlaying);
        audio.addEventListener("waiting", this.onWaiting);
        audio.addEventListener("pause", this.onPaused);
        // document.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        const audio = this.audio;
        // document.removeEventListener("keydown", this.handleKeyDown);
        audio.removeEventListener("ended", this.onEnded);
        audio.removeEventListener("volumechange", this.onVolumeChange);
        audio.removeEventListener("playing", this.onPlaying);
        audio.removeEventListener("waiting", this.onWaiting);
        audio.removeEventListener("pause", this.onPaused);
    }

    onEnded = () => {
        const { app } = this.props;
        if (this.state.audioState !== AudioState.stopped) {
            const ayaId = this.offsetPlayingAya(1);
            this.play();
            if (this.state.followPlayer) {
                app.gotoAya(ayaId, { sel: true });
            }
        }
    };

    onVolumeChange = () => {
        // this.setVolume(audio.volume);
        // this.setMuted(audio.muted);
    };

    onPlaying = event => {
        this.setAudioState(AudioState.playing);
    };

    onWaiting = event => {
        this.setAudioState(AudioState.buffering);
    };

    onPaused = event => {
        if (AudioState.stopped !== this.state.audioState) {
            this.setAudioState(AudioState.paused);
        }
    };

    render() {
        return (
            <PlayerContext.Provider
                value={{
                    audio: this.audio,
                    ...this.props,
                    ...this.state,
                    ...this.methods
                }}
            >
                {this.props.children}
            </PlayerContext.Provider>
        );
    }
}

//define consumers generator function
const PlayerConsumer = Component =>
    function PlayerConsumerGen(props) {
        return (
            <PlayerContext.Consumer>
                {state => <Component {...props} player={state} />}
            </PlayerContext.Consumer>
        );
    };

export default AppConsumer(PlayerProvider);
export { PlayerConsumer, AudioState };
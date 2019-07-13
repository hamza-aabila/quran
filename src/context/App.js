import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import QData from "../services/QData";

let rc = localStorage.getItem("recentCommands");

const AppState = {
	isNarrow: false,
	pagesCount: 1,
	appWidth: 800,
	appHeight: 600,
	pagesCount: 2,
	showMenu: false,
	popup: null,
	selectStart: 0,
	selectEnd: 0,
	maskStart: -1,
	recentCommands: rc ? JSON.parse(rc) : ["Search", "Index", "Play"]
};

const AppContext = React.createContext(AppState);

class AppProvider extends Component {
	state = AppState;

	setTheme = theme => {
		this.setState({ theme });
		localStorage.setItem("theme", theme);
	};

	selectAya = ayaId => {
		if (ayaId >= 0 && ayaId < QData.ayatCount()) {
			this.setState({ selectStart: ayaId, selectEnd: ayaId });
			return ayaId;
		}
	};

	pushRecentCommand = command => {
		let recentCommands = [
			command,
			...this.state.recentCommands.filter(c => c !== command)
		];
		recentCommands.length = 5;
		this.setState({ recentCommands });
		localStorage.setItem("recentCommands", JSON.stringify(recentCommands));
	};

	extendSelection = ayaId => {
		if (ayaId < 0 || ayaId >= QData.ayatCount()) {
			return this.state.selectStart;
		}
		if (ayaId === this.state.selectStart) {
			this.selectAya(ayaId);
		} else {
			this.setState({ selectStart: ayaId });
		}
		return this.state.selectStart;
	};

	offsetSelection = offset => {
		let newSelectionId = this.selectAya(this.state.selectStart + offset);
		return newSelectionId !== undefined
			? newSelectionId
			: this.state.selectStart;
	};

	setSelectStart = selectStart => {
		this.setState({ selectStart });
	};

	setMaskStart = maskStart => {
		this.setState({ maskStart, selectStart: maskStart, selectEnd: maskStart });
	};

	hideMask = () => {
		this.setState({ maskStart: -1 });
	};

	setSelectEnd = selectEnd => {
		this.setState({ selectEnd });
	};

	offsetMask = offset => {
		let ms = parseInt(this.state.maskStart);
		if (ms !== -1) {
			let maskStart = ms + offset;
			if (maskStart >= 0 && maskStart < QData.ayatCount()) {
				this.setMaskStart(maskStart);
			}
		}
	};

	setIsNarrow = isNarrow => {
		this.setState({ isNarrow: isNarrow });
	};

	setShowMenu = showMenu => {
		this.setState({ showMenu });
	};

	toggleShowMenu = () => {
		this.setState({ showMenu: !this.state.showMenu });
	};

	setPopup = popup => {
		this.setState({ popup });
		if (popup !== null && popup !== "Commands") {
			this.pushRecentCommand(popup);
		}
	};

	nextPage = () => {
		this.offsetPage(1);
	};

	prevPage = () => {
		this.offsetPage(-1);
	};

	pageWidth = () => {
		let width = this.pageHeight() * 0.61; //aspect ratio
		if (width > this.state.appWidth) {
			return this.state.appWidth;
		}
		return width;
	};

	pageHeight = () => {
		return this.state.appHeight - 50;
	};

	pageMargin = () => {
		return this.state.isNarrow ? "0" : "0 20px";
	};

	offsetPage = shift => {
		const { location } = this.props;
		let match = location.pathname.match(/page\/(.+)/);
		let pageNumber = match ? match[1] : undefined;
		if (pageNumber !== undefined) {
			let nextPage = parseInt(pageNumber) + shift;
			this.gotoPage(nextPage, true);
		}
	};

	/**
	 * Change app state to page number
	 */
	gotoPage = (pageNum, replace) => {
		const { history } = this.props;
		if (pageNum <= 604 && pageNum >= 1) {
			let targetPath = `${process.env.PUBLIC_URL}/page/` + pageNum.toString();
			if (replace) {
				history.replace(targetPath);
			} else {
				history.push(targetPath);
			}
		}
	};

	gotoSura = index => {
		const page = QData.sura_info[index].sp;
		this.gotoPage(page);
		const ayaId = QData.ayaID(parseInt(index), 0);
		this.selectAya(ayaId);
	};

	gotoPart = index => {
		const partInfo = QData.parts[index];
		const page = partInfo.p;
		this.gotoPage(page);
		const ayaId = QData.ayaID(partInfo.s - 1, partInfo.a - 1);
		this.selectAya(ayaId);
	};

	gotoAya = ayaId => {
		this.selectAya(ayaId);
		const pageIndex = QData.ayaIdPage(ayaId);
		this.gotoPage(pageIndex + 1);
		this.hideMask();
	};

	methods = {
		setShowMenu: this.setShowMenu,
		toggleShowMenu: this.toggleShowMenu,
		setPopup: this.setPopup,
		nextPage: this.nextPage,
		prevPage: this.prevPage,
		offsetPage: this.offsetPage,
		gotoAya: this.gotoAya,
		gotoPage: this.gotoPage,
		gotoSura: this.gotoSura,
		gotoPart: this.gotoPart,
		pageWidth: this.pageWidth,
		pageHeight: this.pageHeight,
		setSelectStart: this.setSelectStart,
		setSelectEnd: this.setSelectEnd,
		setMaskStart: this.setMaskStart,
		hideMask: this.hideMask,
		offsetMask: this.offsetMask,
		pageMargin: this.pageMargin,
		setTheme: this.setTheme,
		setSelectStart: this.setSelectStart,
		setSelectEnd: this.setSelectEnd,
		offsetSelection: this.offsetSelection,
		selectAya: this.selectAya,
		extendSelection: this.extendSelection,
		pushRecentCommand: this.pushRecentCommand
	};

	onResize = e => {
		let { innerWidth, innerHeight } = e.target;
		let newSize = { width: innerWidth, height: innerHeight };
		this.updateAppSizes(newSize);
	};

	updateAppSizes({ width, height }) {
		this.setState({ appWidth: width, appHeight: height });
		let count = this.calcPagesCount({ width, height });
		this.setState({ pagesCount: count });
		let isNarrow = width / height < 0.7;
		this.setState({ isNarrow: isNarrow });
	}

	calcPagesCount({ width, height }) {
		return width > height * 1.35 ? 2 : 1;
	}

	componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.updateAppSizes({
			width: window.innerWidth,
			height: window.innerHeight
		});
	}

	render() {
		return (
			<AppContext.Provider
				value={{
					...this.props,
					...this.state,
					...this.methods
				}}
			>
				{this.props.children}
			</AppContext.Provider>
		);
	}
}

const withAppContext = Component =>
	function AppContextWrapper(props) {
		return (
			<AppContext.Consumer>
				{state => <Component {...props} appContext={state} />}
			</AppContext.Consumer>
		);
	};

export default withRouter(AppProvider);
export { withAppContext, AppContext };
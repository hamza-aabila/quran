import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import firebase from "firebase";
import { AppConsumer } from "./../../context/App";
import QData from "./../../services/QData";

const Favorites = ({ app }) => {
	const [hifzRanges, setHifzRanges] = useState([]);
	const { user } = app;

	useEffect(() => {
		if (!user) {
			return;
		}

		const hifzRef = firebase
			.database()
			.ref()
			.child(`data/${user.uid}/hifz`);

		const onHifzUpdate = hifzRef.on("value", snapshot => {
			const hifz = snapshot.val();
			const ranges = hifz
				? Object.keys(hifz)
						.sort((k1, k2) => (hifz[k1].ts < hifz[k2].ts ? -1 : 1))
						.map(k => {
							const sura = parseInt(k.substr(3, 3));
							const startPage = parseInt(k.substr(0, 3));
							const hifzInfo = hifz[k];
							const pages = hifzInfo.pages;
							const endPage = startPage + pages - 1;
							return {
								sura,
								startPage,
								pages,
								endPage,
								date: hifzInfo.ts
							};
						})
				: [];
			setHifzRanges(ranges);
		});

		return () => {
			hifzRef.off("value", onHifzUpdate);
		};
	}, []); //Passing [] is equivellant to componentDidMount, componentDidUnmount

	const gotoSuraPage = ({ target }) => {
		const sura = parseInt(target.getAttribute("sura"));
		const startPage = parseInt(target.getAttribute("startpage"));
		const endPage = parseInt(target.getAttribute("endpage"));
		const suraStartPage = QData.sura_info[sura].sp - 1;
		const suraEndPage = QData.sura_info[sura].ep - 1;
		const suraStartAya = QData.ayaID(sura, 0);
		app.gotoPage(startPage + 1);
		if (suraStartPage === startPage) {
			app.setSelectStart(suraStartAya);
		} else {
			app.setSelectStart(QData.pageAyaId(startPage));
		}
		if (suraEndPage === endPage) {
			app.setSelectEnd(suraStartAya + QData.sura_info[sura].ac - 1);
		} else {
			app.setSelectEnd(QData.pageAyaId(endPage + 1) - 1);
		}
	};

	const renderHifzRanges = () => {
		if (!hifzRanges.length) {
			return <div>Nothing recorded</div>;
		}
		return (
			<div
				style={{
					columnCount: Math.floor((app.popupWidth() - 50) / 240) //-50px margin
				}}
			>
				{hifzRanges.map(range => (
					<button
						key={"" + range.sura + range.startPage}
						sura={range.sura}
						startpage={range.startPage}
						endpage={range.endPage}
						onClick={gotoSuraPage}
						style={{
							width: "100%",
							textAlign: "inherit",
							padding: 10
						}}
					>
						<String id="sura_names">
							{sura_names => (
								<String id="pg">
									{pg =>
										sura_names.split(",")[range.sura] +
										" (" +
										pg +
										" " +
										(range.startPage + 1) +
										(range.pages > 1 ? "-" + (range.endPage + 1) : "") +
										")"
									}
								</String>
							)}
						</String>
					</button>
				))}
			</div>
		);
	};

	const renderLogin = () => {
		return (
			<div>
				<button onClick={e => app.setPopup("Profile")}>Please Login</button>
			</div>
		);
	};

	return (
		<>
			<div className="Title">
				<String id="favorites" />
			</div>
			<div className="PopupBody" style={{ maxHeight: app.appHeight - 85 }}>
				{user ? renderHifzRanges() : renderLogin()}
			</div>
		</>
	);
};

export default AppConsumer(Favorites);
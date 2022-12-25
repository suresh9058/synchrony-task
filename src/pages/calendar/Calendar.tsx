import { Fragment, FC, SyntheticEvent, useState, useEffect } from 'react';
import ApiCalendar from 'react-google-calendar-api';

type TextTransformType = 'uppercase';
type TextLineBreakType = 'anywhere';

const styles = {
	googleLoginButtons: {
		margin: 16,
		color: 'white',
		padding: 8,
		border: 0,
		borderRadius: 8,
		textTransform: 'uppercase' as TextTransformType,
		cursor: 'pointer',
	},
	table: {
		def_col: {
			flexBasis: '20%',
			maxWidth: '20%',
			margin: 16,
			lineBreak: 'anywhere' as TextLineBreakType,
		},
		col4: {
			flexBasis: '40%',
			maxWidth: '40%',
			margin: 16,
			lineBreak: 'anywhere' as TextLineBreakType,
		},
	},
};

interface Event {
	kind: string;
	etag: string;
	id: string;
	status: string;
	htmlLink: string;
	created: string;
	updated: string;
	summary: string;
	description: string;
	location: string;
	creator: {
		email: string;
		self: boolean;
	};
	organizer: {
		email: string;
		displayName: string;
	};
	start: {
		dateTime: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		timeZone: string;
	};
	iCalUID: string;
	sequence: number;
	attendees: Array<{
		email: string;
		responseStatus: string;
	}>;
	guestsCanInviteOthers: boolean;
	privateCopy: boolean;
	reminders: {
		useDefault: boolean;
	};
	attachments: Array<{
		fileUrl: string;
		title: string;
		iconLink: string;
	}>;
	eventType: string;
}

type WindowWithGAPI = Window &
	typeof globalThis & {
		gapi:
			| undefined
			| {
					client: {
						getToken: () => string | null;
					};
			  };
	};

const config = {
	clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '',
	apiKey: process.env.REACT_APP_GOOGLE_API_KEY ?? '',
	scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
	discoveryDocs: [
		'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
	],
};

const apiCalendar = new ApiCalendar(config);

export const Calendar: FC = () => {
	const [events, setEvents] = useState<Array<Event>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUserSignedIn, setIsUserSignedIn] = useState(false);

	const handleItemClick = (
		event: SyntheticEvent<HTMLButtonElement>,
		name: string
	): void => {
		if (name === 'sign-in') {
			apiCalendar.handleAuthClick();
		} else if (name === 'sign-out') {
			setEvents([]);
			setIsUserSignedIn(false);
			apiCalendar.handleSignoutClick();
		}
	};

	useEffect(() => {
		let S_I: NodeJS.Timer;
		if (!isUserSignedIn) {
			try {
				let count = 0;
				S_I = setInterval(() => {
					count += 1;
					if (count > 20) {
						clearInterval(S_I);
					}
					if ((window as WindowWithGAPI).gapi?.client?.getToken()) {
						setIsLoading(true);
						setIsUserSignedIn(true);
						try {
							apiCalendar
								.listEvents({
									timeMin: new Date(2022, 1, 1).toISOString(),
									// timeMax: new Date().addDays(10).toISOString(),
									// showDeleted: true,
									// maxResults: 10,
									// orderBy: 'updated',
								})
								.then(({ result }: { result: { items: Array<Event> } }) => {
									setEvents(result.items.reverse());
									setIsLoading(false);
								});
						} catch {
							setIsLoading(false);
						}
						clearInterval(S_I);
					} else if (!isUserSignedIn) {
						setIsUserSignedIn(false);
					}
				}, 3000);
			} catch (e: unknown) {
				console.error({ e });
			}
		}

		return () => {
			clearInterval(S_I);
		};
	}, [isUserSignedIn]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: '#000000e3',
				color: 'white',
				minHeight: '100vh',
				textAlign: 'center',
			}}
		>
			{!isUserSignedIn ? (
				<button
					style={{
						...styles.googleLoginButtons,
						backgroundColor: '#0b6be5',
					}}
					onClick={(e) => handleItemClick(e, 'sign-in')}
				>
					Google Sign in
				</button>
			) : (
				<button
					style={{
						...styles.googleLoginButtons,
						backgroundColor: '#f12626c7',
					}}
					onClick={(e) => handleItemClick(e, 'sign-out')}
				>
					Google Sign out
				</button>
			)}
			{isLoading ? <h3 style={{ margin: 16 }}>Loading...</h3> : <></>}
			<div
				style={{
					margin: 16,
					borderRadius: 16,
				}}
			>
				{events.length > 0 && (
					<div
						style={{
							display: 'flex',
							position: 'sticky',
							top: 0,
							borderBottom: '1px solid white',
							backgroundColor: 'black',
							borderTopLeftRadius: 16,
							borderTopRightRadius: 16,
							maxWidth: 'calc(100vw - 32px)',
							overflow: 'auto',
						}}
					>
						<div style={{ ...styles.table.def_col }}>
							<h4 style={{ textTransform: 'uppercase' }}>summary</h4>
						</div>
						<div style={{ ...styles.table.def_col }}>
							<h4 style={{ textTransform: 'uppercase' }}>updated</h4>
						</div>
						<div style={{ ...styles.table.def_col }}>
							<h4 style={{ textTransform: 'uppercase' }}>organizer</h4>
						</div>
						<div style={{ ...styles.table.col4 }}>
							<h4 style={{ whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
								description
							</h4>
						</div>
					</div>
				)}
				{events.map((eachEvent: Event, i: number) => (
					<Fragment key={eachEvent.id}>
						<div
							style={{
								display: 'flex',
								backgroundColor: i % 2 ? 'black' : '#131613',
								borderBottomLeftRadius: i === events.length - 1 ? 16 : 0,
								borderBottomRightRadius: i === events.length - 1 ? 16 : 0,
								maxWidth: 'calc(100vw - 32px)',
								overflow: 'auto',
							}}
						>
							<div style={{ ...styles.table.def_col }}>
								<p>{eachEvent.summary}</p>
							</div>
							<div style={{ ...styles.table.def_col }}>
								<p>{new Date(eachEvent.updated).toDateString()}</p>
							</div>
							<div style={{ ...styles.table.def_col }}>
								<p>
									{eachEvent.organizer.email} ({eachEvent.organizer.displayName}
									)
								</p>
							</div>
							<div
								style={{
									...styles.table.col4,
									overflow: 'auto',
									maxHeight: 400,
								}}
							>
								<p style={{ whiteSpace: 'break-spaces' }}>
									{eachEvent.description}
								</p>
							</div>
						</div>
					</Fragment>
				))}
			</div>
		</div>
	);
};

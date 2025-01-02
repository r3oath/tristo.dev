'use client';

import {useEffect, useState} from 'react';
import {Fira_Code} from 'next/font/google';

const firaCode = Fira_Code({subsets: ['latin']});

export default function Home() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setIsVisible((visible) => !visible);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="bg-neutral-950 h-screen flex items-center justify-center">
			<div className={`${firaCode.className} text-green-500 font-medium text-2xl`}>
				<span>Tristan lives here</span>
				<span style={{visibility: isVisible ? 'inherit' : 'hidden'}}>▐</span>
			</div>
		</div>
	);
}

'use client'

import AssurancesComponent from "../(protected)/_components/assurances";

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params }: Props) {

	return (
		<>
		<AssurancesComponent/>
		</>
	);
}

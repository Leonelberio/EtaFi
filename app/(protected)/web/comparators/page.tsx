'use client'

import { ComparatorsList } from "../../_components/comparators-list";

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params }: Props) {

	return (
		<>
			<ComparatorsList/>
		</>
	);
}

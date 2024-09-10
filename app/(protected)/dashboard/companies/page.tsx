'use client'

import { CompaniesList } from "../../_components/companies";

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params }: Props) {

	return (
		<>
			<CompaniesList/>
		</>
	);
}

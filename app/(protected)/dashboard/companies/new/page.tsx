'use client'

import NewCompany from "@/app/(protected)/_components/new-company";
import NewComparator from "@/app/(protected)/_components/new-comparator";

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params }: Props) {

	return (
		<div className="h-full w-full flex flex-col gap-y-10 items-center justify-center p-10">

			<NewCompany/>
		</div>
	);
}

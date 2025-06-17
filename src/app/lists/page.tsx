import { Suspense } from 'react';
import ResponseListClient from '../../components/ResponseListClient ';

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ResponseListClient />
		</Suspense>
	);
}

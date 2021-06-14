import { BASE_API_URL } from '$lib/Env';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';

export async function api(
	request: ServerRequest,
	resource: string,
	data?: Record<string, unknown>
): Promise<Response> {
	const { locals, method } = request;
	const { authenticated, accessToken, sessionId } = locals;

	const headers = new Headers({ 'Content-Type': 'application/json' });

	if (authenticated && accessToken && sessionId) {
		headers.append('Authorization', `Bearer ${accessToken}`);
	}

	return fetch(`${BASE_API_URL}/${resource}`, {
		method,
		headers,
		body: data && JSON.stringify(data)
	});
}

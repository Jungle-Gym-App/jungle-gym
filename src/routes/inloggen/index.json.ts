import type { Request, RequestHandler } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import * as cookie from 'cookie';
import sessionDB from '$lib/Utils/sessionDB';
import { api } from '../api/_api';

export const post: RequestHandler = async (request: Request) => {
	if (!sessionDB)
		return {
			status: 500,
			body: { message: 'SessionDB offline' }
		};

	try {
		const { username, password } = request.body;

		const { body: serverSession } = await api(request, 'auth/token', { username, password }); // TODO password hash

		const cookieId = uuidv4();
		const accessToken = typeof serverSession['access_token'] === 'string' ? serverSession['access_token'] : undefined;

		const sessionSuccess = await sessionDB.set(cookieId, accessToken);

		if (sessionSuccess !== 'OK')
			return {
				status: 500,
				body: { message: 'error' }
			};

		const headers = {
			'Set-Cookie': cookie.serialize('session_id', cookieId, {
				httpOnly: true,
				maxAge: serverSession['expires_in'] / 1000,
				sameSite: true,
				path: '/'
			}),
			'Content-Type': 'application/json'
		};

		return {
			status: 200,
			headers,
			body: { message: 'success' }
		};
	} catch (error) {
		console.error(error);

		const response = {
			status: 500,
			body: { message: 'Er is een onbekende fout opgetreden ' }
		};

		if (error.body?.type === 'INCORRECT_LOGIN') {
			(response.status = 401), (response.body.message = 'Verkeerde gebruikersnaam of wachtwoord');
		}

		return response;
	}
};

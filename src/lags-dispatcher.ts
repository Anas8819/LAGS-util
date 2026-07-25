import { HttpResponseInit, InvocationContext } from '@azure/functions';

import { Log, IRequest, ErrorHelper, ISessionPayload, IFeaturePayload, AbstractFeatureResponder } from '@viewdu/util-fxa-lib';

import { AuthError } from './errors.js';
import { Responder } from './responder.js';
import { IQueryLags } from './types.js';

/**
 * The shape lagsDispatcher needs from a responder type passed in via
 * ILagsOptions.responderType: a constructor plus the two static decode
 * methods, so it can dispatch to whichever concrete class the caller
 * provides instead of a class hardcoded here.
 */
export interface IFeatureResponderClass<T extends AbstractFeatureResponder = AbstractFeatureResponder> {
    new (request: IRequest, context: InvocationContext): T;
    decodeSessionToken(request: IRequest): ISessionPayload;
    decodeFeatureToken(request: IRequest): IFeaturePayload;
}

/**
 * Every LAGS handler shares this signature. featurePayload is only populated
 * for endpoints that validate the x-auth-feature token (validateFeatureToken),
 * and is undefined otherwise.
 */
export type LagsHandler = (
    request: IRequest,
    context: InvocationContext,
    sessionPayload: ISessionPayload,
    featurePayload: IFeaturePayload,
    query: IQueryLags
) => Promise<HttpResponseInit>;

export interface ILagsHandlers {
    list: LagsHandler;
    assay: LagsHandler;
    get: LagsHandler;
    save: LagsHandler;
}

export interface ILagsOptions<T extends AbstractFeatureResponder = AbstractFeatureResponder> {
    // The concrete AbstractFeatureResponder subclass for the calling project
    // (e.g. AbstractFeatureResponderViewduMarket), used to decode/validate
    // session and feature tokens.
    responderType: IFeatureResponderClass<T>;
    // p2p endpoints are host-level anonymous and instead force verification
    // of the x-auth-feature token in addition to the x-auth-session token.
    validateFeatureToken?: boolean;
}

/**
 * Shared dispatcher for LAGS (List / Assay / Get / Save) endpoints.
 *
 * Owns the boilerplate every LAGS api file used to copy: log setup, session
 * token decoding, `query` header parsing, method/operation routing, and the
 * single catch block that maps typed errors (./errors.js) to their HTTP
 * status and shapes the error envelope.
 *
 * `title` is the entity name used in error envelopes, e.g. 'Question'.
 */
export function lagsDispatcher<T extends AbstractFeatureResponder = AbstractFeatureResponder>(
    title: string,
    handlers: ILagsHandlers,
    options: ILagsOptions<T>
) {
    return async function (request: IRequest, context: InvocationContext): Promise<HttpResponseInit> {
        context.log(`>>> Http function processed request for url "${request.url}"`);
        await Log.setup(context);

        let operation: string;

        try {
            // Ensure we have an authenticated user via x-auth-session
            let sessionPayload: ISessionPayload;
            let featurePayload: IFeaturePayload;
            try {
                sessionPayload = options.responderType.decodeSessionToken(request);

                if (options.validateFeatureToken) {
                    // And force verification of x-auth-feature
                    const featureResponder = new options.responderType(request, context);
                    featurePayload = featureResponder.featurePayload;
                }
            } catch (ex: any) {
                throw new AuthError(ex?.message ?? 'Authentication failed');
            }

            const queryString = request.headers.get('query');
            const query: IQueryLags = JSON.parse(queryString);
            operation = query?.operation;

            switch (request.method) {
                case 'GET':

                    switch (operation) {
                        case 'list':
                            return await handlers.list(request, context, sessionPayload, featurePayload, query);
                        case 'get':
                            return await handlers.get(request, context, sessionPayload, featurePayload, query);
                        default:
                            return ErrorHelper.error404(request);
                    }

                case 'POST':

                    switch (operation) {
                        case 'assay':
                            return await handlers.assay(request, context, sessionPayload, featurePayload, query);
                        case 'save':
                            return await handlers.save(request, context, sessionPayload, featurePayload, query);
                        default:
                            return ErrorHelper.error404(request);
                    }

                default:
                    return ErrorHelper.error405(request);
            }
        } catch (error: any) {
            return Responder.error(title, operation ? operation.toUpperCase() : request.method, error);
        }
    };
}

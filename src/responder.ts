import { Log } from '@viewdu/util-fxa-lib';

import { ILogSpeed } from './types.js';

import { HttpError } from './errors.js';

export class Responder {

    static success(
        logSpeed: ILogSpeed,
        data: any) {

        // The following section needs to get a refreshed jwtToken from the server for each call.
        //
        // Use this for responding to requests
        //
        // Also we need to differentiate feature client to feature server speed in the data layer.
        //
        // Probably we just need to update the featureUuid, ProductUuid, licenseUuid and  send that through to be stored.
        //
        // It'll already get picked up by the Viewdu dashboard and get displayed correctly.

        /*
        const userController = new UserController(jwtPayload, models);
        const dbUser = await userController.getByUuid(jwtPayload.userUuid);

        // Verify user and msalToken claim against Entra.
        // NOTE: This asertion will throw an error if it fails.
        await AzureAADator.refreshUserToken(jwtPayload, dbUser, msalToken);

        // Feature payload is provided on initial signon, but all other application
        // data requests will fill that requirement here.
        if (!featurePayload) {
            featurePayload = await Authorizer.getViewduCoreFeaturePayload(models);
        }

        // The session object has all items required above and beyond just
        // resetting the timestamp of the token
        const session: any = await Authorizer.setupSession(models, dbUser, jwtPayload, featurePayload);
        */

        // Tag the speed performance object with a timestamp to indicate when the task
        // is done, and the response is sent

        if (logSpeed) {
            logSpeed.responseTime = new Date().valueOf();
        }

        return {
            status: 200,
            body: JSON.stringify({
                state: 'SUCCESS',
                data: data,
                logSpeed: logSpeed
            }, null, 2)
        };
    }

    static error(
        title: string,
        process: string,
        ex: any) {

        Log.error(`${title} ${process} failed`, ex);

        // Typed errors (see errors.ts) carry their own HTTP status;
        // anything unexpected is an internal server error.
        const status = ex instanceof HttpError ? ex.status : 500;

        return {
            status,
            body: JSON.stringify({
                title: title,
                process: process,
                state: 'FAILED',
                data: { message: ex?.message ?? String(ex) }
            }, null, 2)
        };
    }

}

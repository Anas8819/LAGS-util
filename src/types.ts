/**
 * Local copy of the LAGS query envelope shape (originally imported from
 * @viewdu/util-dto-lib's IQueryLags/ILagsParams) - anas-util only needs this
 * shape for routing, not the rest of that package.
 */
export interface IQueryLags {
    params?: ILagsParams;
    filter?: any;
    data?: any;
    operation: 'list' | 'assay' | 'get' | 'save';
}

export interface ILagsParams {
    pageNumber?: number;
    offset?: number;
    limit?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    type: 'paged' | 'slam';
}

/**
 * Local copy of @viewdu/util-dto-lib's ILogSpeed - anas-util only needs the
 * shape to stamp responseTime and pass it through in Responder.success.
 */
export interface ILogSpeed {
    uuid?: string;
    userUuid: string;
    licenseUuid: string;
    productUuid: string;
    featureUuid: string;
    logTime: Date;
    sendTime: number;
    requestTime?: number;
    responseTime?: number;
    receivedTime?: number;
    observedRoundTripTime?: number;
    route?: string;
}

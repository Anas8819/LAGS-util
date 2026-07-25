import { InvocationContext } from '@azure/functions';

import { AbstractFeatureResponder, IRequest } from '@viewdu/util-fxa-lib';

export class AbstractFeatureResponderViewduMarket extends AbstractFeatureResponder {
    constructor(request: IRequest, context: InvocationContext) {
        super(request, context);
    }
}

export class AbstractFeatureResponderViewduWorkForm extends AbstractFeatureResponder {
    constructor(request: IRequest, context: InvocationContext) {
        super(request, context);
    }
}

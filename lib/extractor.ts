import * as moment from 'moment';

export interface SubsriptionMap {
    id:string;
    subscriberPhoneNumber:string;
    referenceDate:string;
    typeOfSubscriber:string;
    metadata?: Array<{
        key:string;
        value:string;
    }>;
    others?: Array<{
        key:string;
        value:string;
    }>;
}

export interface UnsubscriptionMap {
    id:string;
    unsubscriptionType:string;
    householdPhonenumber:string;
}

export interface SubscriptionRequestBody {
    campaign: number;
    subscriber_type: string;
    subscriber_number: string;
    reference_date: string;
}

export interface UnsubscriptionRequestBody {
    unsubscribe_type: 'single' | 'multi';
    hh_number: string;
    campaign?: number;
}

export class DataExtractorLoader {

    private readonly validators = {
        'id': (val:string) => val && val !== '' && (typeof val === 'string' || typeof val === 'number'),
        'subscriberPhoneNumber': (val:string) => val && val !== '' && typeof val === 'string',
        'referenceDate': (val:string) => val && val !== '' && moment(val, 'YYYY-MM-DD').isValid(),
        'typeOfSubscriber': (val:string) => val && val !== '',
        'unsubscriptionType': (val:string) => val && val !== '',
        'householdPhonenumber': (val:string) => val && val !== '' && typeof val === 'string',
    };

    private _dataset:any[];

    private _requirements:SubsriptionMap & UnsubscriptionMap;

    set data(dataset:any[]) {
        this._dataset = dataset;
    }

    set dataRequirements(requirements:any) {
        this._requirements = requirements;
    }

    private constructor(
        public readonly apiCallType:'subscription' | 'unsubscription',
        public readonly apiCallId:string,
        private readonly campaign:number,
    ) { }


    private cleanSubscriptionData() {

        const dataset:SubsriptionMap[] = [];

        this._dataset.forEach(data => {
            Object.keys(this._requirements)
                .forEach(requirement => {
                    if (requirement !== 'metadata' && requirement !== 'others') {
                        const isValid = this.validators[requirement](data[ this._requirements[requirement] ]);
                        if (isValid) {
                            dataset.push(data);
                        }
                    }
                });
        });

        this._dataset = dataset; // update dataset with the cleaned data
    }

    private cleanUnsubscriptionData() {

        const dataset:UnsubscriptionMap[] = [];

        this._dataset.forEach((data) => {
            Object.keys(this._requirements)
                .forEach(requirement => {
                    const isValid = this.validators[requirement](data[ this._requirements[requirement] ]);
                    if (isValid) {
                        dataset.push(data);
                    }
                });
        });

        this._dataset = dataset as SubsriptionMap[] & UnsubscriptionMap[]; // update dataset with the cleaned data
    }

    transformSubscriptionData() {
        this.cleanSubscriptionData();

        const subscriptionPackets:{ url:string; packet:SubscriptionRequestBody; }[] = [] as any;

        for (let idx = 0; idx < this._dataset.length; idx++) {
            const data = this._dataset[idx];

            const others: any = {}, metadata: any = {};

            /**
             * others is being converted from { key:string; value:string|number; }[]
             * to { [key:string]: string|number; }
             */
            if (this._requirements.others) {
                this._requirements.others.forEach(
                    k => {
                        others[k.key] = data[k.value];
                    }
                );
            }

            /**
             * metadata is being converted from { key:string; value:string|number; }[]
             * to { [key:string]: string|number; }
             */
            if (this._requirements.metadata) {
                this._requirements.metadata.forEach(
                    k => {
                        metadata[k.key] = k.value;
                    }
                );
            }

            subscriptionPackets.push(
                {
                    packet: {
                        campaign: this.campaign,
                        reference_date: data[this._requirements.referenceDate],
                        subscriber_number: data[this._requirements.subscriberPhoneNumber],
                        subscriber_type: data[this._requirements.typeOfSubscriber],
                        metadata: { ...metadata },
                        ...others,
                    },
                    url: `subscription/save/?ref_id=${data[this._requirements.id]}&ref_key=${this.apiCallId}`
                }
            );
        }

        return ;
    }

    transformUnsubscriptionData() {
        this.cleanUnsubscriptionData();

/*         const unsubscriptionPackets:{ url:string; packet:UnsubscriptionRequestBody; }[] = [];

        for (let idx = 0; idx < this._dataset.length; idx++) {
            // const data = this._dataset[idx];

            unsubscriptionPackets.push(
                {
                    packet: {
                        campaign: this.campaign,
                        hh_number: data[this._requirements.householdPhonenumber],
                        unsubscribe_type: data[this._requirements.unsubscriptionType],
                    },
                    url: `unsubscription/save/?ref_id=${data[this._requirements.id]}&ref_key=${this.apiCallId}`
                }
            );
        }

        return unsubscriptionPackets; */
    }
}

export type Business={id:string;name:string;slug:string;category:string;shortDescription:string;description:string;address:string;phone:string;website:string;image:string;featured?:boolean;sponsored?:boolean;active?:boolean};
export type Attraction={id:string;name:string;slug:string;category:string;description:string;image:string;website?:string;costType:"Free"|"Paid"|"Varies";featured?:boolean};
export type Trail={id:string;name:string;slug:string;description:string;distance:string;difficulty:"Easy"|"Moderate"|"Difficult";duration:string;activityType:string;familyFriendly:boolean;image:string};
export type Event={id:string;name:string;slug:string;description:string;startDate:string;time:string;location:string;category:string;image:string};
export type Deal={id:string;businessId:string;title:string;description:string;code:string;expirationDate:string;terms:string;featured?:boolean};

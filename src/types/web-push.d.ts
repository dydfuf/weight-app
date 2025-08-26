declare module "web-push" {
  export interface PushSubscription {
    endpoint: string;
    expirationTime?: number | null;
    keys?: {
      p256dh: string;
      auth: string;
    };
  }

  export function setVapidDetails(
    mailto: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string,
    options?: any
  ): Promise<void>;

  const _default: {
    setVapidDetails: typeof setVapidDetails;
    sendNotification: typeof sendNotification;
  };

  export default _default;
}

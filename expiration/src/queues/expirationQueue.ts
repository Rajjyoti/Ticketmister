import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expirationCompletePublisher";
import { natsWrapper } from "../natsWrapper";

interface Payload {
    orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
})

expirationQueue.process(async (job) => {
    console.log('Publishing an expiration:omplete event for orderId', job.data.orderId)
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})

export {expirationQueue}
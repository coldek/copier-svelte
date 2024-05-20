import { writable, type Readable, type Writable } from "svelte/store";

type State = {
    checkoutId: Number
    plans: {
        id: Number
        features: Number[]
    }[]
}

export interface CheckoutStore extends Readable<State> {
    create: (meta: any) => Promise<void>
}

function createStore(): CheckoutStore {
    const { subscribe } = writable<State>()

    return {
        subscribe,
        create: async (meta) => {
            const res = await fetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    ...meta
                })
            })

            return await res.json()
        }
    }
}

export const checkoutStore = createStore()
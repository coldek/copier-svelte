import { get, writable, type Readable, type Writable } from "svelte/store";

type State = {
    checkoutId: number | null
    planId: number | null
    info: any,
    checkoutInfo: any
}

export interface CheckoutStore extends Writable<State> {
    addPlan: (planId: number) => Promise<any>
    load: () => Promise<void>
}

function createStore(): CheckoutStore {
    const { subscribe, set, update } = writable<State>()

    return {
        subscribe,
        set,
        update,
        // Add a plan to the checkout
        addPlan: (planId) => {
            return new Promise((resolve, err) => {
                const value = get(checkoutStore) // Gets checkout from state
                // Check if the checkout has been defined
                if(value.checkoutId === null) {
                    // Checkout has not been created, create a checkout
                    fetch(`/api/checkout`, {
                        method: 'POST',
                        body: JSON.stringify({
                            ip_address: localStorage.getItem('ip'),
                            plan_id: planId
                        })
                    }).then(async res => {
                        // Checkout has been created
                        const checkout = await res.json()
                        // If failed to insert properly
                        if(checkout?.id === undefined) resolve(null)
                        
                        // Update state & LocalStorage with new checkout info
                        update(value => ({...value, checkoutId: checkout.id, planId, checkoutInfo: {contact: null, ...checkout}}))
                        localStorage.setItem('checkoutId', checkout.id)
                        localStorage.setItem('planId', planId.toString())
                        // Return checkout
                        resolve(checkout)
                    }).catch(e => {
                        console.error('Failed to create checkout.')
                        resolve(null)
                    })
                } else {
                    // Checkout has been created, update checkout planId
                    fetch(`/api/checkout?id=${value.checkoutId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            plan_id: planId
                        })
                    }).then(async res => {
                        // Checkout was succesfully updated, get info
                        const checkout = await res.json()
                        // Update state
                        update(value => ({...value, planId, checkoutInfo: {...value.checkoutInfo, ...checkout}}))
                        localStorage.setItem('planId', planId.toString())
                        // Return checkout
                        resolve(checkout)
                    }).catch(e => {
                        console.error('Failed to create checkout')
                        resolve(null)
                    })
                }
            })
        },
        load: async () => {
            try {
                // Parse values from local storage
                let local = {
                    checkoutId: localStorage.getItem('checkoutId'),
                    planId: localStorage.getItem('planId'),
                    ip: localStorage.getItem('ip')
                }
                // Default state
                let state: State = {checkoutId: null, planId: null, info: "", checkoutInfo: {}} 
                
                // Get IP
                if(local.ip === null) {
                    // const { ip }: {ip: string} = await (await fetch(`https://api.ipify.org?format=json`)).json()
                    const ip = "127.0.0.1";
                    localStorage.setItem('ip', ip)
                    local.ip = ip
                }

                // If checkout ID is valid fetch the info
                if(local.checkoutId !== null && !isNaN(parseInt(local.checkoutId))) {
                    state.checkoutId = parseInt(local.checkoutId)
                    // Fetch request
                    const res = await (await fetch(`/api/checkout?id=${state.checkoutId}`)).json()
                    
                    if(res.id !== undefined) {
                        // Checkout was found
                        state.checkoutInfo = res

                        localStorage.setItem('checkoutId', res.id)
                        state.checkoutId = res.id
                        
                        if(res?.plan?.id !== undefined) {
                            // Plan has already been selected in checkout, update the state with the planId
                            const planId = parseInt(res.plan.id)

                            if(planId >= 1) {
                                localStorage.setItem('planId', res.plan.id.toString())
                                state.planId = planId
                            }
                        }
                    }
                }

                // Update the state
                set(state)
            } catch (e) {
                console.error("Failed to fetch credentials: ", e)
            }
        }
    }
}

export const checkoutStore = createStore()

<script lang="ts">
    import { checkoutStore } from "$lib/stores/CheckoutStore";
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    let checkout: any
    let planInfo: any
    let contactInfo: any = null

    let planOptions: any[] = []
    let selectedOptions: any[] = []

    let planId: string | null = null
    let checkoutId: string | null = null
    let isLoading = true
    
    let currentStep = 0
    let formData = {first_name: '', last_name: '', email: '', phone_number: '' }

    // Process next step i.e submitting contact form
    async function nextStep() {
        switch(currentStep) {
            case 0:
                // Contact information step

                // If contact info isn't defined, create contact
                if(contactInfo === null) {
                    await createContact()
                } else {
                    // Update contact info instead
                    await updateContact()
                }

                // Fetch Plan Options
                await fetchPlanOptions()
                if(planOptions.length == 0) {
                    currentStep++
                }
                break
            case 1:
                // Update checkout plan options step
                if(selectedOptions.length == 0) break

                await updatePlanOptions()
                break
        }

        currentStep++
    }

    async function updateContact() {
        const contact = await (await fetch(`/api/contact?contactId=${contactInfo.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...formData
            })
        })).json()

        contactInfo = contact
    }
    async function createContact() {
        // Request to create contact
        const contact = await (await fetch(`/api/contact?checkoutId=${checkoutId}`, {
            method: 'POST',
            body: JSON.stringify({
                ...formData
            })
        })).json()

        contactInfo = contact
    }

    async function updatePlanOptions() {
        const checkoutVal = get(checkoutStore)
        const checkout = await (await fetch(`/api/checkout?id=${checkoutVal.checkoutInfo.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                plan_options: selectedOptions.join(',')
            })
        })).json()

        checkoutStore.update(c => ({...c, checkoutInfo: checkout}))
    }

    async function fetchPlanOptions() {
        const plan = await (await fetch(`/api/plan?id=${planInfo.id}`)).json()

        planOptions = plan?.options || []
    }

    checkoutStore.subscribe(checkout => {
        // Checkout ID is found
        if(checkout !== undefined && checkout?.checkoutId !== null) {
            console.log(checkout.checkoutInfo)
            planInfo = checkout.checkoutInfo.plan
            contactInfo = checkout.checkoutInfo.contact

            if(contactInfo !== null && contactInfo !== undefined) {
                console.log({contactInfo})
                formData = {first_name: contactInfo.first_name, last_name: contactInfo.last_name, phone_number: contactInfo.phone_number, email: contactInfo.email}
            }

            // Already selected plan options, update state with select plan options
            if(checkout.checkoutInfo.plan_options !== null) {

                const optionsRaw: string = checkout.checkoutInfo.plan_options || ''
                const options = optionsRaw.split(',')

                selectedOptions.push(...options)
            }

            isLoading = false
        }
    })

    onMount(async () => {
        planId = localStorage.getItem('planId')
        checkoutId = localStorage.getItem('checkoutId')
    })

    
</script>

<div class="flex flex-col gap-4 max-w-[500px] mt-20 mx-auto p-4 rounded-xl bg-slate-50">
    {#if checkoutId !== null}
        {#if isLoading}
            <div>Loading...</div>
        {:else}
            <div><i>Your Selected Plan</i></div>
            <div>
                <span class="text-lg font-bold">{planInfo?.name}</span>
                <br />
                <span class="text-sm pl-2">{planInfo?.description}</span>
            </div>
            {#if currentStep == 0}
                <div><i>Personal Information</i></div>
                <input type="email" bind:value={formData.email} name="email" placeholder="Enter your email address" />
                <input type="text" bind:value={formData.first_name} name="first_name" placeholder="First Name" />
                <input type="text" bind:value={formData.last_name} name="last_name" placeholder="Last Name" />
                <input type="text" bind:value={formData.phone_number} name="phone_number" placeholder="Phone Number" />
            {:else if currentStep == 1}
                <div class="flex flex-col">
                    <div><i>Plan Options</i></div>
                    <div class="flex flex-col pl-4">
                        {#each planOptions as optionGroup}
                        <div>
                            {optionGroup.name}
                        </div>
                        <div class="pl-4 flex flex-col">
                            {#each optionGroup.options as option}
                            <input type="checkbox" value={option.id.toString()} bind:group={selectedOptions} /> {option.name}
                            {/each}
                        </div>
                        {/each}
                    </div>
                </div>
            {/if}
            <button on:click={nextStep} class="hover:cursor-pointer p-2 bg-slate-400 hover:bg-slate-500 rounded-lg text-white">NEXT STEP</button>
        {/if}
    {:else}
        <div>You have no selected plan!</div>
    {/if}
</div>
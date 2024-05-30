<script lang="ts">
    import type { PageData } from "./$types";
    import { checkoutStore } from "$lib/stores/CheckoutStore";
    import { goto } from "$app/navigation";

    export let data: PageData
</script>

{data.plan.name}

<button on:click={async () => {
    checkoutStore.update(value => ({
        ...value
    }))
    await checkoutStore.addPlan(data.plan.id)

    goto('/checkout')
}}>Add to cart</button>
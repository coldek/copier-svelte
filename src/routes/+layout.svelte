<script lang="ts">
    import { onMount } from "svelte";
    import "../app.css"
    import Header from "$lib/components/Header.svelte";
    import { checkoutStore } from "$lib/stores/CheckoutStore";
	

    // let plan_id

    onMount(async () => {
        await checkoutStore.load()
    })

    

</script>

<Header />

<main>
    <slot></slot>
</main>
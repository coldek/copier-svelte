<script lang="ts">
    import { onMount } from "svelte";
    import "../app.css"
    import Header from "$lib/components/Header.svelte";
	
</script>

<Header />

<main>
    <slot></slot>
</main>
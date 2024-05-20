<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData
</script>

<div class="flex flex-wrap justify-center gap-20 mx-auto mt-10">
    {#each data.plans as plan}
        <div class="flex flex-col justify-center basis-1/3 text-center border-blue-500 border-[1px] rounded p-2 gap-2">
            <span class="text-lg">{plan.name}</span>
            <img src={plan.picture} alt={plan.name} class="h-48 mx-auto" />
            <div>
                {plan.description}
                <br />
                <u>{plan.price} / month</u>
            </div>
            <a href={`/plans/${plan.id}`} class="bg-blue-500 rounded p-2 hover:text-white">View Plan</a>
        </div>
    {/each}
</div>
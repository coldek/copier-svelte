import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
    const planId = Number(params.planId)

    const res = await fetch(`/api/plan?id=${planId}`)
    const plan = await res.json()

    // Make request here

    return {
        ...plan
    }
}
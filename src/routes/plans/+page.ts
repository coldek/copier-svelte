import type { PageLoad } from "./$types";

export const load: PageLoad = async ({fetch}) => {
    const res = await fetch(`/api/plan`)
    const plans = await res.json()

    return { plans }
}
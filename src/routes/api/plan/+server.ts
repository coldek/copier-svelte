import { error, type RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const FETCH_OPTIONS = {
    headers: {
        'Authorization': `Bearer ${env.PAPERFEED_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
    }
}

export const GET = (async ({ fetch, url }) => {

    // Parse URL Paramater
    const id = Number(url.searchParams.get('id') ?? '0')

    if(id < 0) error(400, 'Invalid paramaters')

    if(id >= 1) {
        // Fetch individual plan
        const plan = await fetch(`${env.PAPERFEED_BASE_URL}/${id}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=plans`, FETCH_OPTIONS)

        // Get the plan groups
        const groupsRaw = await fetch(`${env.PAPERFEED_BASE_URL}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=plan_option_groups&filters[plan_id]=${id}`, FETCH_OPTIONS)

        let options: any[] = []

        // We wrap this just in case the API fails, it would cause an internal error otherwise
        try {
            const groups: any[] = await groupsRaw.json()

            // Loop through each group
            for(let i=0;i<groups.length;i++) {
                const group = groups[i]

                // Fetch options by group
                const optionsRaw = await fetch(`${env.PAPERFEED_BASE_URL}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=plan_options&filters[plan_option_group_id]=${group.id}`, FETCH_OPTIONS)

                // Push to the options array
                options.push({
                    ...group,
                    options: [...(await optionsRaw.json())]
                })
            }

            return new Response(JSON.stringify({
                plan: await plan.json(),
                options
            }), FETCH_OPTIONS)
        } catch (e) {
            error(400, 'Something went wrong')
        }
    } else {
        // Fetch all plans
        const res = await fetch(`${env.PAPERFEED_BASE_URL}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=plans`, FETCH_OPTIONS)

        return new Response(JSON.stringify(await res.json()), FETCH_OPTIONS)
    }

    
}) satisfies RequestHandler
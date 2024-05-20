import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request }) => {
    const meta = await request.json()

    console.log({meta})

    const res = await fetch(`${env.PAPERFEED_BASE_URL}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.PAPERFEED_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workspace_id: env.PAPERFEED_WORKSPACE_ID,
            container_type: "checkouts",
            container: {
                meta: {
                    ...meta
                }
            }
        })
    })

    const data = await res.json()

    console.log({data})

    return json(data)
}
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

const headers = {
    'Authorization': `Bearer ${env.PAPERFEED_BEARER_TOKEN}`,
    'Content-Type': 'application/json'
}

export const GET: RequestHandler = async({ fetch, url }) => {
    // Parse ID from URL
    const id = Number(url.searchParams.get('id') ?? '0')
    if(id <= 0) error(400, 'Invalid parameters')

    const res = await fetch(`${env.PAPERFEED_BASE_URL}/${id}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=checkouts`, {
        headers
    })

    const optionsRes = await fetch(`${env.PAPERFEED_BASE_URL}/?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=`)
    
    const checkout = await res.json()
    if(checkout.contact === undefined) checkout.contact = null

    return json({...checkout})
}

export const PUT: RequestHandler = async (event) => {
    const {fetch, url, request} = event
    // Parse ID from URL
    const id = Number(url.searchParams.get('id') ?? '0')
    if(id <= 0) error(400, 'Invalid parameters')

    const meta: any = await request.json()

    if(meta.plan_id === undefined && meta.plan_options === undefined) return error(400, "Invalid parameters")
    
    let metaArgs: any

    if(meta.plan_id !== undefined) {
        metaArgs = {
            plan_id: meta.plan_id
        }
    } else if(meta.plan_options !== undefined) {
        metaArgs = {
            plan_options: meta.plan_options
        }
    }

    const res = await fetch(`${env.PAPERFEED_BASE_URL}/${id}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=checkouts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            meta: metaArgs
        })
    })
    
    const data = await res.json()

    return json(data)
}

export const POST: RequestHandler = async (event) => {
    try {
        const { fetch, request } = event

        const meta: {ip_address: string, plan_id: number} = await request.json()
        
        if(meta.ip_address === undefined || meta.plan_id === undefined) return error(400, "Invalid parameters")
        /**
         * {
         *  ip_address
         *  plan_id
         * }
         */

        const res = await fetch(`${env.PAPERFEED_BASE_URL}`, {
            method: 'POST',
            headers,
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

        return json(data)
    } catch(e) {
        return error(400, 'Invalid parameters')
    }
    
}
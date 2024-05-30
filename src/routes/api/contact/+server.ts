import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

const headers = {
    'Authorization': `Bearer ${env.PAPERFEED_BEARER_TOKEN}`,
    'Content-Type': 'application/json'
}

// Create a contact from checkout id
export const POST: RequestHandler = async (event) => {
    const {request, url, fetch} = event
    // Parse ID from URL
    const checkoutId = Number(url.searchParams.get('checkoutId') ?? '0')
    if(checkoutId <= 0) error(400, 'Invalid parameters')

    const data: {
        first_name: string,
        last_name: string,
        email: string,
        phone_number: string
    } = await request.json()

    // TODO: Data Sanitization

    const res = await fetch(`${env.PAPERFEED_BASE_URL}/?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            meta: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
                checkout_id: checkoutId,
                verified: false
            }
        })
    })

    const contact = await res.json()
    // Update checkout with contact id
    await fetch(`${env.PAPERFEED_BASE_URL}/${checkoutId}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=checkouts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            meta: {
                contact_id: contact.id
            }
        })
    })

    return json(contact)
}

// Update contact info
export const PUT: RequestHandler = async (event) => {
    try {
        const {request, url, fetch} = event
        // Parse ID from URL
        const contactId = Number(url.searchParams.get('contactId') ?? '0')
        if(contactId <= 0) return error(400, 'Invalid parameters')
        
        const data: {
            first_name: string,
            last_name: string,
            email: string,
            phone_number: string
        } = await request.json()
    
        const contact = await fetch(`${env.PAPERFEED_BASE_URL}/${contactId}?workspace_id=${env.PAPERFEED_WORKSPACE_ID}&container_type=contacts`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                meta: {
                    ...data
                }
            })
        })
    
        return json(contact)
    } catch(e) {
        return error(400, 'Unable to update contact')
    }
}
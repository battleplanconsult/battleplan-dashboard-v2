import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // We'll add this
)

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Extract email data from Zapier
    const {
      from_email,
      from_name,
      subject,
      body_plain,
      to_email
    } = body

    // Find which client this email belongs to
    const { data: routing, error: routingError } = await supabase
      .from('email_routing')
      .select('client_id')
      .eq('email_address', to_email)
      .single()

    if (routingError || !routing) {
      return NextResponse.json({ error: 'Client not found for this email' }, { status: 404 })
    }

    // Use OpenAI to parse intent (optional - for now we'll use simple logic)
    const intent = extractIntent(subject, body_plain)
    const summary = body_plain.substring(0, 200)

    // Insert communication
    const { data: comm, error: commError } = await supabase
      .from('communications')
      .insert({
        client_id: routing.client_id,
        type: 'email',
        sender_name: from_name || from_email,
        sender_email: from_email,
        intent,
        message_text: body_plain,
        summary,
        status: 'new'
      })
      .select()
      .single()

    if (commError) throw commError

    // Create opportunity
    const { data: opp, error: oppError } = await supabase
      .from('opportunities')
      .insert({
        client_id: routing.client_id,
        lead_name: from_name || from_email,
        contact_info: from_email,
        source: 'email',
        stage: 'new',
        intent,
        notes: summary,
        value: 150 // Default value
      })

    return NextResponse.json({ success: true, communication_id: comm.id })
  } catch (error) {
    console.error('Error processing email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function extractIntent(subject, body) {
  const text = `${subject} ${body}`.toLowerCase()
  
  if (text.includes('trial') || text.includes('try')) return 'Trial Request'
  if (text.includes('price') || text.includes('cost') || text.includes('membership')) return 'Pricing Inquiry'
  if (text.includes('schedule') || text.includes('class') || text.includes('time')) return 'Schedule Question'
  if (text.includes('kid') || text.includes('child')) return 'Kids Program'
  
  return 'General Inquiry'
}
```

---

### **Phase 5: Add Service Key to Vercel**

1. In Supabase → Settings → API
2. Copy the `service_role` key (keep this SECRET!)
3. In Vercel → Settings → Environment Variables
4. Add:
   - Name: `SUPABASE_SERVICE_KEY`
   - Value: (paste service key)
   - Click "Add"

---

### **Phase 6: Complete Zapier Setup**

1. Back in Zapier, set the webhook URL to:
```
   https://your-dashboard.vercel.app/api/ingest-email

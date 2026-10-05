import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const step = url.searchParams.get('step') || 'welcome';

    // Parse form-data or query params from telecom providers (Twilio sends application/x-www-form-urlencoded)
    let digits = '';
    let callerPhone = '+919876543210';
    let speechResult = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      digits = (formData.get('Digits') as string) || '';
      callerPhone = (formData.get('From') as string) || callerPhone;
      speechResult = (formData.get('SpeechResult') as string) || '';
    } else {
      digits = url.searchParams.get('Digits') || '';
    }

    let twiml = '';

    if (step === 'welcome') {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/ivr/webhook?step=symptoms" method="POST" timeout="10">
    <Say language="hi-IN" voice="Polly.Aditi">
      नमस्ते! पशु रक्षक राष्ट्रीय आपातकालीन हेल्पलाइन में आपका स्वागत है।
      पशु की पहचान के लिए:
      गाय के लिए एक दबाएं।
      भैंस के लिए दो दबाएं।
      बकरी या भेड़ के लिए तीन दबाएं।
      अन्य पशु के लिए चार दबाएं।
    </Say>
  </Gather>
  <Say language="hi-IN">कोई बटन नहीं दबाया गया। पुनः प्रयास करें।</Say>
  <Redirect>/api/ivr/webhook?step=welcome</Redirect>
</Response>`;
    } else if (step === 'symptoms') {
      const animalChoice = digits || '1';
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/ivr/webhook?step=complete&amp;animal=${animalChoice}" method="POST" timeout="10">
    <Say language="hi-IN" voice="Polly.Aditi">
      बीमारी के मुख्य लक्षण बताएं:
      तेज़ बुखार और खुर या मुंह के छालों के लिए एक दबाएं।
      शरीर पर गांठें या लंपी त्वचा रोग के लिए दो दबाएं।
      गले में सूजन या सांस लेने में भारीपन के लिए तीन दबाएं।
      बोलकर लक्षण बताने के लिए चार दबाएं।
    </Say>
  </Gather>
  <Say language="hi-IN">इनपुट प्राप्त नहीं हुआ।</Say>
  <Redirect>/api/ivr/webhook?step=symptoms</Redirect>
</Response>`;
    } else if (step === 'complete') {
      const animalChoice = url.searchParams.get('animal') || '1';
      const symptomChoice = digits || '1';

      // Forward to local simulation intake to persist in DB
      try {
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost:3000';
        await fetch(`${protocol}://${host}/api/ivr/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callerPhone,
            animalChoice,
            symptomChoice,
            voiceNoteText: speechResult,
          }),
        });
      } catch (err) {
        console.error('Failed to auto-create case from webhook:', err);
      }

      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    धन्यवाद! आपका आपातकालीन केस नंबर सफलतापूर्वक दर्ज कर लिया गया है।
    आपके क्षेत्र के सरकारी पशु चिकित्सक को तुरंत अलर्ट संदेश भेज दिया गया है।
    तत्काल प्राथमिक उपचार: बीमार पशु को बाकी सभी जानवरों से अलग साफ स्थान पर रखें और ताजा पानी दें।
    पशु रक्षक सेवा में कॉल करने के लिए धन्यवाद।
  </Say>
  <Hangup/>
</Response>`;
    }

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('IVR Webhook error:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN">तकनीकी समस्या के कारण सेवा में व्यवधान हुआ है। कृपया कुछ समय बाद पुनः प्रयास करें।</Say>
</Response>`;
    return new NextResponse(errorTwiml, {
      status: 500,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

export async function GET(req: Request) {
  // Allow simple GET requests for webhooks or testing
  return POST(req);
}

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl, prompt } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }
    
    // Default prompt if not provided
    const analysisPrompt = prompt || 'Describe what you see in this image in detail.';
    
    // Using Anthropic API for image analysis
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl
                }
              },
              {
                type: 'text',
                text: analysisPrompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      analysis: data.content[0].text,
      model: 'claude-3-opus'
    });
    
  } catch (error) {
    console.error('Error in AI vision API:', error);
    return NextResponse.json(
      { error: 'Failed to process image analysis' },
      { status: 500 }
    );
  }
}

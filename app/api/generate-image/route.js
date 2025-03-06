import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Using Stability AI for image generation
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stability API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (!data.artifacts || data.artifacts.length === 0) {
      return NextResponse.json(
        { error: 'No image was generated' },
        { status: 500 }
      );
    }
    
    // Return base64 encoded image
    return NextResponse.json({
      imageBase64: `data:image/png;base64,${data.artifacts[0].base64}`,
      model: 'stable-diffusion-xl'
    });
    
  } catch (error) {
    console.error('Error in generate image API:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

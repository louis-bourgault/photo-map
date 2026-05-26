export async function POST({ request, params, locals }) {
    const { storyDetails, storyBlocks } = await request.json();
    console.log('Received story details:', storyDetails);
    return new Response(JSON.stringify({ message: 'Story saved successfully!' }), { status: 200 });
}
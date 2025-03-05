// Initialize WebSocket connection
const room = new WebsimSocket();

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Helper to extract cat name from description
function extractCatName(description) {
    const lines = description.split('\n');
    for (const line of lines) {
        if (line.toLowerCase().includes('name:')) {
            return line.split(':')[1].trim();
        }
    }
    
    // If no name found, extract first sentence and limit to 20 chars
    const firstSentence = description.split('.')[0];
    return firstSentence.length > 20 
        ? firstSentence.substring(0, 20) + '...' 
        : firstSentence;
}

// Check if text contains cat description
function isCatDescription(text) {
    const lowerText = text.toLowerCase();
    return lowerText.includes('cat') && 
        (lowerText.includes('name') || 
         lowerText.includes('breed') || 
         lowerText.includes('color') || 
         lowerText.includes('personality'));
}

// Helper to generate improved cat prompt based on user input
async function generateCatDescription(userPrompt) {
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a creative cat description generator. Create a detailed, imaginative, and whimsical description of a cat that does not exist based on the user's input. 
                    Include the following details:
                    - Name
                    - Breed or breed mix (be creative and can include fantasy elements)
                    - Physical appearance (fur pattern, color, eyes, size, distinctive features)
                    - Personality traits
                    - Fictional backstory or habits

                    Format your response as a descriptive paragraph that flows well together. Focus on creating a unique and visually distinctive cat that would make an interesting AI-generated image.`
                },
                {
                    role: "user",
                    content: userPrompt || "Generate a completely random fictional cat."
                }
            ]
        });
        
        return completion.content;
    } catch (error) {
        console.error("Error generating cat description:", error);
        throw error;
    }
}

// Helper to generate cat image based on description
async function generateCatImage(description) {
    try {
        // Create more specific prompt for the image generator
        const imagePromptCompletion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert at creating detailed image prompts for AI image generators. 
                    Take the provided cat description and convert it into a highly detailed prompt for generating a photorealistic cat image.
                    Your prompt should:
                    1. Focus on the visual aspects described
                    2. Add photography details like lighting, angle, and style
                    3. Include artistic style references
                    4. Mention that this is a "photorealistic cat"
                    
                    Your output should be ONLY the prompt text with no additional explanations or notes.`
                },
                {
                    role: "user",
                    content: description
                }
            ]
        });
        
        // Use the enhanced prompt to generate the image
        const imagePrompt = `${imagePromptCompletion.content}, photorealistic, detailed, 8k, high quality`;
        const result = await websim.imageGen({
            prompt: imagePrompt,
            aspect_ratio: "1:1"
        });
        
        return result.url;
    } catch (error) {
        console.error("Error generating cat image:", error);
        throw error;
    }
}


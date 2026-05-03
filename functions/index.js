const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const { VertexAI } = require("@google-cloud/vertexai");

admin.initializeApp();

/**
 * Automatically analyze sentiment and categorize voter feedback
 * using Vertex AI when a new feedback document is created.
 */
exports.processElectionSentiment = onDocumentCreated("feedback/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.info("No data associated with the event");
        return;
    }
    const data = snapshot.data();
    const feedbackText = data.text;

    logger.info(`Analyzing feedback: ${feedbackText}`);

    try {
        const vertexAI = new VertexAI({
            project: process.env.GCLOUD_PROJECT,
            location: "us-central1"
        });
        const generativeModel = vertexAI.getGenerativeModel({
            model: "gemini-2.0-flash-001",
        });

        const prompt = `Analyze the following voter feedback and return a JSON object with 'sentiment' (positive/negative/neutral) and 'category' (technical/legal/general). 
        Feedback: "${feedbackText}"`;

        const resp = await generativeModel.generateContent(prompt);
        const resultText = resp.response.candidates[0].content.parts[0].text;
        
        // Extract JSON from response (handling potential markdown formatting)
        const jsonMatch = resultText.match(/\{.*\}/s);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { sentiment: "unknown", category: "general" };

        logger.info("Analysis complete", analysis);

        // Update the original document with the AI analysis
        return snapshot.ref.update({
            aiAnalysis: analysis,
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        logger.error("Failed to analyze sentiment", error);
    }
});

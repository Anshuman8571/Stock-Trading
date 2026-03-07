const { embeddingsModel } = require("../config/langchain.config");
const { Document } = require("@langchain/core/documents");
const fs = require('fs');
const path = require('path');

// Pure JS In-Memory Vector Store
// This avoids native C++ dependency issues (like FAISS) on Docker Alpine environments.
// It also perfectly demonstrates how Vector Databases work under the hood!
let customVectorStore = [];

/**
 * Helper: Calculate Cosine Similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Process text snippets (like news) and store them in the Vector DB
 */
async function processAndStoreNews(newsText, metadata = {}) {
    try {
        console.log("Vectorizing news content...");

        // Due to extremely strict Google free-tier quotas (15 requests/minute),
        // we will NOT chunk the text into smaller pieces.
        // Instead, we will embed the entire news summary as 1 single chunk.
        // Gemini's embedding model easily supports thousands of tokens per request.

        const docs = [new Document({ pageContent: newsText, metadata: metadata })];

        console.log(`Created 1 monolithic document chunk. Generating embedding...`);

        // 2. Generate embedding (Only 1 API call used!)
        const res = await embeddingsModel.embedDocuments([newsText]);

        // 3. Store in our Custom Memory Vector Store immediately
        customVectorStore.push({
            content: newsText,
            metadata: metadata,
            embedding: res[0]
        });

        console.log("Vector DB updated successfully.");
        return true;
    } catch (error) {
        console.error("Error in vectorizing news:", error);
        throw error;
    }
}

/**
 * Perform Semantic Search on the Vector DB
 */
async function searchVectorStore(query, k = 3) {
    if (customVectorStore.length === 0) {
        console.warn("Vector store is empty. No news has been processed yet.");
        return [];
    }

    try {
        console.log(`Searching custom vector store for: "${query}"`);
        // 1. Get the embedding for the user's query
        const queryEmbedding = await embeddingsModel.embedQuery(query);

        // 2. Calculate Cosine Similarity across all stored chunks
        const scoredResults = customVectorStore.map(item => {
            return {
                ...item,
                score: cosineSimilarity(queryEmbedding, item.embedding)
            };
        });

        // 3. Sort by highest score descending and pick Top K
        scoredResults.sort((a, b) => b.score - a.score);
        const topK = scoredResults.slice(0, k);

        // Return formatted as Langchain Documents for the Agent
        return topK.map(res => new Document({
            pageContent: res.content,
            metadata: { ...res.metadata, score: res.score }
        }));
    } catch (error) {
        console.error("Error searching custom vector store:", error);
        throw error;
    }
}

/**
 * Clear the current vector store (useful between different queries/users)
 */
function clearVectorStore() {
    customVectorStore = [];
    console.log("Custom Vector store cleared.");
}

module.exports = {
    processAndStoreNews,
    searchVectorStore,
    clearVectorStore
};

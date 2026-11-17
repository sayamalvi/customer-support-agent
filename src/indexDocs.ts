import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

console.log("1. Initilazing embeddings");
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

console.log("2. Initializing pinecone");
const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY!
});
console.log("3. Getting pinecone index");

const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);

console.log("4. Connecting to existing vector store");
export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 2,
});

console.log("5. Vector store initialized");
export async function indexTheDocument(filePath: string) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const doc = await loader.load();
  console.log("7. PDF loaded");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const texts = await textSplitter.splitText(doc[0]?.pageContent!);
  console.log("8. Chunks generated:", texts.length);

  const documents = texts.map((chunk) => ({
    pageContent: chunk,
    metadata: doc[0]?.metadata,
  }));

  console.log("9. Uploading documents to Pinecone");

  console.log("Generating embeddings...");

  const vectors = await embeddings.embedDocuments(
    documents.map((doc) => doc.pageContent),
  );

  console.log("Embeddings generated:", vectors.length);

  console.log("Uploading to Pinecone...");

  try {
    console.log("Starting Pinecone upload...");

    const result = await vectorStore.addDocuments(documents);

    console.log("Upload successful:", result.length);
  } catch (error) {
    console.error("Pinecone upload failed:", error);
  }
  console.log("Upload completed");

  console.log("10. Indexing complete");
}

// indexTheDocument("./doc.pdf");

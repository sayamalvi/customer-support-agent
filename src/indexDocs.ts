import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY!
});

const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 2,
});

export async function indexTheDocument(filePath: string) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const doc = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const texts = await textSplitter.splitText(doc[0]?.pageContent!);

  const documents = texts.map((chunk) => ({
    pageContent: chunk,
    metadata: doc[0]?.metadata,
  }));

  const vectors = await embeddings.embedDocuments(
    documents.map((doc) => doc.pageContent),
  );

  try {
    const result = await vectorStore.addDocuments(documents);
  } catch (error) {
    console.error("Pinecone upload failed:", error);
  }
}

// indexTheDocument("./doc.pdf");

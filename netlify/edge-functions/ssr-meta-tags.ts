import type { Context } from "@netlify/edge-functions";
import admin from "firebase-admin";

// Helper para inicializar Firebase Admin solo una vez.
const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return;
  }
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
    );
     if (!serviceAccount.project_id) {
      throw new Error("Firebase service account key is missing or invalid in Netlify environment variables.");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
};

const generateMetaTags = (post: admin.firestore.DocumentData, url: string) => {
  const title = post.title ? post.title.replace(/"/g, '&quot;') : "Publicación en SaldeFiesta";
  const description = post.description ? post.description.substring(0, 150).replace(/"/g, '&quot;') : "Descubre esta publicación en SaldeFiesta.";
  
  return `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${post.mediaUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${post.mediaUrl}" />
  `;
};

export default async (request: Request, context: Context) => {
  const response = await context.next();
  const url = new URL(request.url);
  const userAgent = request.headers.get("User-Agent") || "";
  
  // Revertido a la lista original de bots de redes sociales
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|Pinterest|LinkedInBot|Discordbot/i.test(userAgent);

  const postPathRegex = /^\/post\/([a-zA-Z0-9]+)\/?$/;
  const match = url.pathname.match(postPathRegex);

  if (!isBot || !match) {
    return response;
  }

  const postId = match[1];
  if (!postId) {
    return response;
  }
  
  try {
    initializeFirebaseAdmin();
    if (admin.apps.length === 0) {
        console.error("Firebase Admin not initialized. Skipping meta tag generation.");
        return response;
    }
    const db = admin.firestore();
    
    const postDoc = await db.collection("posts").doc(postId).get();
    
    if (!postDoc.exists) {
      return response;
    }

    const post = postDoc.data();
    if (!post) {
      return response;
    }

    const html = await response.text();
    const dynamicTags = generateMetaTags(post, request.url);
    
    const newHtml = html.replace(
      "<!-- DYNAMIC_META_TAGS_PLACEHOLDER -->",
      dynamicTags
    );

    return new Response(newHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(`Edge function error for post ${postId}:`, error);
    return response;
  }
};

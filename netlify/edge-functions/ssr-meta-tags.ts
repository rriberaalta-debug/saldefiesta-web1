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
  const title = post.title.replace(/"/g, '&quot;');
  const description = post.description ? post.description.replace(/"/g, '&quot;') : "Descubre esta publicación en SaldeFiesta.";
  
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
  
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|Pinterest|LinkedInBot|Discordbot/i.test(userAgent);

  const postPathRegex = /^\/post\/([a-zA-Z0-9]+)\/?$/;
  const match = url.pathname.match(postPathRegex);

  // Si no es un bot o no es una URL de post, no hacemos nada.
  if (!isBot || !match) {
    return response;
  }

  const postId = match[1];
  if (!postId) {
    return response;
  }
  
  try {
    initializeFirebaseAdmin();
    // Comprueba si Firebase se inicializó correctamente
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
    const metaTags = generateMetaTags(post, request.url);
    
    const newHtml = html.replace(
      "<!-- DYNAMIC_META_TAGS_PLACEHOLDER -->",
      metaTags
    );

    return new Response(newHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(`Edge function error for post ${postId}:`, error);
    // En caso de error, devolvemos la página original sin modificar.
    return response;
  }
};

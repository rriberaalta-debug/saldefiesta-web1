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

const generateMetaAndSchema = (post: admin.firestore.DocumentData, url: string, user: admin.firestore.DocumentData | null) => {
  const title = post.title ? post.title.replace(/"/g, '&quot;') : "Publicación en SaldeFiesta";
  const description = post.description ? post.description.replace(/"/g, '&quot;') : "Descubre esta publicación en SaldeFiesta.";
  const postDate = post.timestamp?.toDate?.().toISOString() || new Date().toISOString();

  // Schema.org JSON-LD for structured data
  const schema = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.mediaUrl,
    "datePublished": postDate,
    "author": {
      "@type": "Person",
      "name": user?.username || "Usuario de SaldeFiesta",
      "url": `https://saldefiesta.es/profile/${post.userId}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "SaldeFiesta",
      "logo": {
        "@type": "ImageObject",
        "url": "https://saldefiesta.es/apple-touch-icon.png"
      }
    }
  };

  const dynamicContent = `
    <title>${title} - SaldeFiesta</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${post.mediaUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${post.mediaUrl}" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  `;
  return dynamicContent;
};

export default async (request: Request, context: Context) => {
  const response = await context.next();
  const url = new URL(request.url);
  const userAgent = request.headers.get("User-Agent") || "";
  
  const isBot = /googlebot|bingbot|yahoo|duckduckgo|facebookexternalhit|Twitterbot|WhatsApp|Pinterest|LinkedInBot|Discordbot/i.test(userAgent);

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
    
    const userDoc = await db.collection("users").doc(post.userId).get();
    const user = userDoc.exists ? userDoc.data() : null;

    const html = await response.text();
    const dynamicContent = generateMetaAndSchema(post, request.url, user);
    
    const newHtml = html
      .replace(/<title>.*?<\/title>/, "") // Remove existing title tag to avoid duplicates
      .replace(
        "<!-- DYNAMIC_META_TAGS_PLACEHOLDER -->",
        dynamicContent
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
